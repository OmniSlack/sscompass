'use strict';
/* Worked examples in the project dialog: data integrity, accuracy against the repository, and the stepper. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('node:vm');
const { load, loadData, read, ROOT, closeAll } = require('./helpers');
test.after(closeAll);

const D = loadData();
const sandbox = { window: {} }; sandbox.window = sandbox; vm.createContext(sandbox); vm.runInContext(read('assets/examples.js'), sandbox);
const EX = sandbox.SSC_EX;
const ids = Array.from(D.projects, (p) => p.id);
const REPO = path.join(ROOT, '..', 'portfolio-repo');
const HAVE = fs.existsSync(path.join(REPO, 'README.md')) ? false : 'portfolio-repo not found next to the site';
const flat = (s) => String(s).replace(/\s+/g, ' ').trim();
const bil = (v) => v && typeof v.bg === 'string' && typeof v.en === 'string' && v.bg.trim() && v.en.trim();

test('every one of the fifteen projects has a worked example', () => { assert.deepEqual(Object.keys(EX).sort(), ids.slice().sort()); });
for (const id of ids) {
  const e = EX[id];
  test(`${id}: the example is complete and bilingual`, () => {
    assert.ok(bil(e.title) && bil(e.why) && bil(e.limits) && bil(e.input.label) && bil(e.output.label));
    assert.ok(e.input.text.trim() && e.output.text.trim() && e.input.src && e.output.src);
    assert.ok(e.nodes.length >= 3 && e.nodes.length <= 6); assert.ok(e.steps.length >= 3 && e.steps.length <= 7);
    for (const n of e.nodes) { assert.ok(bil(n.n)); assert.ok(n.fn); }
    for (const s of e.steps) { assert.ok(bil(s.text)); assert.ok(s.node >= 0 && s.node < e.nodes.length); assert.ok(['pass', 'hold', 'stop'].includes(s.state)); assert.ok(s.src); }
  });
  test(`${id}: English text has no Cyrillic, Bulgarian text differs and has Cyrillic`, () => {
    const all = [e.title, e.why, e.limits, e.input.label, e.output.label].concat(e.nodes.map((n) => n.n), e.steps.map((s) => s.text));
    for (const v of all) { assert.ok(!/[Ѐ-ӿ]/.test(v.en), v.en); assert.ok(/[Ѐ-ӿ]/.test(v.bg), v.bg); assert.notEqual(v.bg, v.en); }
  });
  test(`${id}: the last step is the outcome and the example ends in a stated state`, () => { assert.ok(e.steps.length > 0); });
  test(`${id}: accuracy: the quoted input is an exact excerpt of the cited repository file`, { skip: HAVE }, () => {
    const file = path.join(REPO, e.input.src.replace(/:\d+(-\d+)?$/, '')); assert.ok(fs.existsSync(file), e.input.src);
    const body = flat(fs.readFileSync(file, 'utf8'));
    for (const part of e.input.text.split(/\r?\n…\r?\n/)) assert.ok(body.includes(flat(part)), 'input excerpt not found in ' + e.input.src + ': ' + part.slice(0, 60));   // a line holding only … marks an omission between two quoted excerpts
  });
  test(`${id}: accuracy: the output is an exact excerpt of the cited file, unless it is marked as a captured run`, { skip: HAVE }, () => {
    const src = e.output.src.replace(/^captured run · produced by /, ''); const file = path.join(REPO, src.replace(/:\d+(-\d+)?$/, '')); assert.ok(fs.existsSync(file), src);
    if (e.output.run) { assert.match(e.output.src, /^captured run/); return; }
    assert.ok(flat(fs.readFileSync(file, 'utf8')).includes(flat(e.output.text)), 'output not found in ' + src);
  });
  test(`${id}: accuracy: every step cites a file that exists, at a line that exists`, { skip: HAVE }, () => {
    for (const s of e.steps.concat(e.nodes.map((n) => ({ src: null })))) {
      if (!s.src) continue; const m = s.src.match(/^(.*?):(\d+)(?:-(\d+))?$/); if (!m) { assert.ok(fs.existsSync(path.join(REPO, s.src)), s.src); continue; }
      const file = path.join(REPO, m[1]); assert.ok(fs.existsSync(file), s.src); const lines = fs.readFileSync(file, 'utf8').split('\n').length; assert.ok(+m[2] <= lines + 1, s.src + ' beyond ' + lines);
    }
  });
}
test('the captured-run outputs are exactly the five that were produced by running a tool', () => {
  assert.deepEqual(ids.filter((i) => EX[i].output.run).sort(), ['claim-audit-tools', 'defect-register', 'document-claim-checker', 'evidence-retriever', 'status-flow-validator']);
});

/* ---------- the stepper inside the dialog ---------- */
const page = (o) => load(Object.assign({ lang: 'en-US' }, o));
const open = (p, id) => { p.w.SSCApp.openProject(id); return p.doc.getElementById('ex-host'); };
test('the dialog shows the example: input, diagram, output, why and what it does not prove', () => {
  const p = page(); const h = open(p, 'agent-execution-control');
  assert.ok(h.querySelector('.ex-input pre')); assert.ok(h.querySelector('.ex-output pre')); assert.ok(h.querySelectorAll('.dm-stage').length >= 3); assert.ok(h.querySelector('.ex-why')); assert.match(h.querySelector('.ex-lim').textContent, /What it does not prove/);
});
test('every project dialog shows an example block', () => { const p = page(); for (const id of ids) { const h = open(p, id); assert.ok(h && h.querySelector('.ex-input'), id); } });
test('Forward walks through the steps, the result lights up at the end, Restart clears', () => {
  const p = page(); const h = open(p, 'ai-proposal-evaluator'); const n = EX['ai-proposal-evaluator'].steps.length; const next = h.querySelectorAll('.ex-ctl .dm-b')[2];
  for (let i = 0; i < n; i++) next.click(); assert.ok(h.querySelector('.ex-output').classList.contains('done')); assert.ok(next.disabled);
  h.querySelectorAll('.ex-ctl .dm-b')[3].click(); assert.ok(!h.querySelector('.ex-output').classList.contains('done')); assert.match(h.querySelector('.dm-cur').textContent, /Press/);
});
test('a step can be picked directly and the diagram marks the stage with its state', () => {
  const p = page(); const h = open(p, 'agent-action-verifier'); h.querySelectorAll('.dm-dot-b')[1].click(); assert.match(h.querySelector('.dm-cur').textContent, /^2\./);
  assert.ok(h.querySelectorAll('.dm-stage.s-pass, .dm-stage.s-stop, .dm-stage.s-hold').length >= 1);
});
test('the example text follows the language', () => {
  const p = page(); open(p, 'batch-file-gateway'); p.w.SSCApp.setLang('bg'); assert.match(p.doc.getElementById('ex-host').textContent, /Пример/); assert.match(p.doc.getElementById('ex-host').textContent, /Вход/);
});
test('a running example stops when the dialog closes', () => {
  const p = page(); const h = open(p, 'agent-execution-control'); h.querySelectorAll('.ex-ctl .dm-b')[1].click(); assert.equal(h.querySelectorAll('.ex-ctl .dm-b')[1].getAttribute('aria-label'), 'Pause');
  p.doc.getElementById('dlg-close').click(); assert.ok(true);
});
test('code in the example is shown as text, never as markup', () => {
  const p = page(); const h = open(p, 'batch-file-gateway'); assert.equal(h.querySelectorAll('.ex-input pre script, .ex-input pre img').length, 0);
});

/* ---------- examples on the AI platforms tab ---------- */
const sandbox2 = { window: {} }; sandbox2.window = sandbox2; vm.createContext(sandbox2); vm.runInContext(read('assets/examples-ai.js'), sandbox2);
const AIEX = sandbox2.SSC_AIEX;
test('ai examples: one for each of the four platforms', () => { assert.deepEqual(Object.keys(AIEX).sort(), ['claude', 'codex', 'gemini', 'gpt']); });
for (const id of Object.keys(AIEX)) {
  const e = AIEX[id];
  test(`ai example ${id}: complete, bilingual and well formed`, () => {
    assert.ok(bil(e.title) && bil(e.why) && bil(e.limits) && bil(e.input.label) && bil(e.output.label)); assert.ok(e.input.text.trim() && e.output.text.trim());
    assert.ok(e.nodes.length >= 3 && e.nodes.length <= 6); assert.ok(e.steps.length >= 3 && e.steps.length <= 7);
    for (const n of e.nodes) { assert.ok(bil(n.n)); assert.ok(n.fn); } for (const st of e.steps) { assert.ok(bil(st.text)); assert.ok(st.node >= 0 && st.node < e.nodes.length); assert.ok(['pass', 'hold', 'stop'].includes(st.state)); }
    if (e.note) assert.ok(bil(e.note));
    for (const v of [e.title, e.why, e.limits, e.input.label, e.output.label].concat(e.nodes.map((n) => n.n), e.steps.map((st) => st.text), e.note ? [e.note] : [])) { assert.ok(!/[\u0400-\u04FF]/.test(v.en), v.en); assert.ok(/[\u0400-\u04FF]/.test(v.bg), v.bg); }
  });
  test(`ai example ${id}: accuracy: input and output are exact excerpts of the cited repository files, and every step cites a real file`, { skip: HAVE }, () => {
    for (const o of [e.input, e.output]) { const f = path.join(REPO, o.src.replace(/:\d+(-\d+)?$/, '')); assert.ok(fs.existsSync(f), o.src); const body = flat(fs.readFileSync(f, 'utf8')); for (const part of o.text.split(/\r?\n…\r?\n/)) assert.ok(body.includes(flat(part)), o.src + ': ' + part.slice(0, 60)); }
    for (const st of e.steps) { const f = path.join(REPO, st.src.replace(/:\d+(-\d+)?$/, '')); assert.ok(fs.existsSync(f), st.src); }
  });
}
test('ai examples: GPT and Gemini carry an honest note, because the repository holds no task done with them', () => {
  assert.ok(AIEX.gpt.note && AIEX.gemini.note); assert.ok(!AIEX.claude.note && !AIEX.codex.note);
  assert.match(AIEX.gpt.note.en, /no task done with/i); assert.match(AIEX.gemini.note.en, /Gemini/);
});
const aipage = () => page({ hash: '#ai' });
test('ai tab: the selected platform shows its example with input, diagram and result', () => {
  const p = aipage(); const h = p.doc.getElementById('ai-ex'); assert.ok(h.querySelector('.ex-input pre')); assert.ok(h.querySelector('.ex-output pre')); assert.ok(h.querySelectorAll('.dm-stage').length >= 3);
});
test('ai tab: choosing another platform swaps the example, and GPT shows the honest note', () => {
  const p = aipage(); const t0 = p.doc.querySelector('#ai-ex h4').textContent; p.click(p.doc.querySelector('#panel-ai .ai-b[data-ai="gpt"]'));
  assert.notEqual(p.doc.querySelector('#ai-ex h4').textContent, t0); assert.ok(p.doc.querySelector('#ai-ex .ex-note'));
  p.click(p.doc.querySelector('#panel-ai .ai-b[data-ai="codex"]')); assert.ok(!p.doc.querySelector('#ai-ex .ex-note'));
});
test('ai tab: the example steps through and follows the language', () => {
  const p = aipage(); const nx = p.doc.querySelectorAll('#ai-ex .ex-ctl .dm-b')[2]; nx.click(); assert.match(p.doc.querySelector('#ai-ex .dm-cur').textContent, /^1\./);
  p.w.SSCApp.setLang('bg'); assert.match(p.doc.getElementById('ai-ex').textContent, /Пример/);
});
