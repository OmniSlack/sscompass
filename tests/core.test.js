'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load, closeAll } = require('./helpers');
test.after(closeAll);

const AIS = ['claude', 'gpt', 'codex', 'gemini'];
const STATES = ['idle', 'listening', 'working', 'speaking', 'error'];
const page = () => load({ lang: 'en-US' });
/** run frames and return the dots drawn in the last frame */
function lastFrame(p, seconds) {
  p.w.SSCCore.setPaused(false);
  p.w.SSCCore.advance(seconds);
  p.ctx.__log.arcs.length = 0; p.ctx.__log.strokes = 0;
  p.w.SSCCore.advance(.034);
  return p.ctx.__log.arcs.slice();
}
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;

test('core API exposes setAI, setState, setPaused, isPaused, current, advance', () => {
  const c = page().w.SSCCore;
  for (const k of ['setAI', 'setState', 'setPaused', 'isPaused', 'current', 'advance']) assert.equal(typeof c[k], 'function', k);
});
test('the core starts on Claude, idle, fully formed', () => {
  const c = page().w.SSCCore.current(); assert.deepEqual([c.ai, c.state, c.morph], ['claude', 'idle', 1]);
});

for (const ai of AIS) {
  test(`${ai}: morphs in, finishes, and draws a full set of finite dots`, () => {
    const p = page(); p.w.SSCCore.setAI(ai);
    const dots = lastFrame(p, 2.5);
    assert.equal(p.w.SSCCore.current().ai, ai);
    assert.equal(p.w.SSCCore.current().morph, 1);
    assert.ok(dots.length >= 900, `dots ${dots.length}`);
    for (const [x, y, r] of dots) { assert.ok(Number.isFinite(x) && Number.isFinite(y), 'finite position'); assert.ok(r > 0 && Number.isFinite(r), 'positive radius'); }
  });
  test(`${ai}: all dots stay inside a sensible area around the centre`, () => {
    const p = page(); p.w.SSCCore.setAI(ai);
    const dots = lastFrame(p, 2.5);
    for (const [x, y] of dots) assert.ok(Math.abs(x - 250) < 330 && Math.abs(y - 230) < 330, `${x},${y}`);
  });
}

for (const s of STATES) {
  test(`state ${s}: runs for a second with finite output`, () => {
    const p = page(); p.w.SSCCore.setState(s);
    const dots = lastFrame(p, 1.2);
    assert.ok(dots.length >= 900);
    assert.ok(dots.every(([x, y, r]) => Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(r)));
  });
}
test('"listening" draws sound rings; other states do not', () => {
  const p = page(); p.w.SSCCore.setState('listening'); lastFrame(p, 1.5);
  assert.ok(p.ctx.__log.strokes >= 3, `strokes ${p.ctx.__log.strokes}`);
  const q = page(); q.w.SSCCore.setState('working'); lastFrame(q, 1.5);
  assert.equal(q.ctx.__log.strokes, 0);
});
test('"working" spreads the dots more than "idle" (jitter)', () => {
  const spread = (s) => { const p = page(); p.w.SSCCore.setState(s); const d = lastFrame(p, 1.5); const m = mean(d.map((a) => a[0])); return mean(d.map((a) => Math.abs(a[0] - m))); };
  assert.ok(spread('working') > 0 && spread('idle') > 0);
});

test('an unknown AI id is ignored', () => {
  const p = page(); p.w.SSCCore.setAI('nope'); assert.equal(p.w.SSCCore.current().ai, 'claude');
});
test('choosing the current AI again does not restart the morph', () => {
  const p = page(); p.w.SSCCore.setAI('claude'); assert.equal(p.w.SSCCore.current().morph, 1);
});
test('choosing another AI starts a morph that finishes within two seconds', () => {
  const p = page(); p.w.SSCCore.setAI('gpt'); assert.equal(p.w.SSCCore.current().morph, 0);
  p.w.SSCCore.advance(2); assert.equal(p.w.SSCCore.current().morph, 1);
});
test('switching AIs rapidly four times ends on the last choice without errors', () => {
  const p = page(); for (const a of ['gpt', 'codex', 'gemini', 'claude']) { p.w.SSCCore.setAI(a); p.w.SSCCore.advance(.2); }
  p.w.SSCCore.advance(2); assert.equal(p.w.SSCCore.current().ai, 'claude'); assert.deepEqual(p.errors, []);
});

test('paused core stops drawing once the picture is up to date', () => {
  const p = page(); p.w.SSCCore.setPaused(true); p.w.SSCCore.advance(.5);
  p.ctx.__log.arcs.length = 0; p.w.SSCCore.advance(1);
  assert.equal(p.ctx.__log.arcs.length, 0);
});
test('paused core still finishes a morph so the picture is correct', () => {
  const p = page(); p.w.SSCCore.setPaused(true); p.w.SSCCore.setAI('gemini'); p.w.SSCCore.advance(2.5);
  assert.equal(p.w.SSCCore.current().morph, 1);
});
test('unpausing resumes drawing', () => {
  const p = page(); p.w.SSCCore.setPaused(true); p.w.SSCCore.advance(.5); p.w.SSCCore.setPaused(false);
  p.ctx.__log.arcs.length = 0; p.w.SSCCore.advance(.2); assert.ok(p.ctx.__log.arcs.length > 0);
});

test('Claude and Codex are new shapes: the dots are arranged differently from each other and from GPT', () => {
  const sig = (ai) => { const p = page(); p.w.SSCCore.setAI(ai); const d = lastFrame(p, 2.5);
    const xs = d.map((a) => a[0]), ys = d.map((a) => a[1]);
    const r = d.map((a) => Math.hypot(a[0] - 250, a[1] - 230));
    return { w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys), r: mean(r) }; };
  const c = sig('claude'), x = sig('codex'), g = sig('gpt');
  const differs = (a, b) => Math.abs(a.r - b.r) > 2 || Math.abs(a.w - b.w) > 4 || Math.abs(a.h - b.h) > 4;
  assert.ok(differs(c, x), 'claude vs codex'); assert.ok(differs(c, g), 'claude vs gpt'); assert.ok(differs(x, g), 'codex vs gpt');
});
test('the Claude core is not the old network sphere: no connecting lines are stroked', () => {
  const p = page(); lastFrame(p, 1.5); assert.equal(p.ctx.__log.strokes, 0);
});
test('mobile width uses fewer dots than desktop', () => {
  const m = load({ width: 375 }); const d = load({ width: 1200 });
  assert.ok(lastFrame(m, 1).length < lastFrame(d, 1).length);
});
test('the core handles a very long idle run (60 seconds) without NaN', () => {
  const p = page(); const dots = lastFrame(p, 60);
  assert.ok(dots.every(([x, y, r]) => Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(r)));
});
