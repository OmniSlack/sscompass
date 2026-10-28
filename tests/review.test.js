'use strict';
/* Portfolio tab, Future patch tab, rain button, and what must never be on the site. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { load, closeAll } = require('./helpers');
test.after(closeAll);

const page = (o) => load(Object.assign({ lang: 'en-US' }, o));
const CYR = /[Ѐ-ӿ]/;

test('the Portfolio tab renders four gate scenes, each with a stopping check and a final verdict', () => {
  const p = page(); p.click(p.doc.getElementById('tab-review'));
  assert.equal(p.doc.getElementById('panel-review').hasAttribute('hidden'), false);
  const scenes = p.doc.querySelectorAll('#review-root .rv-scene'); assert.equal(scenes.length, 4);
  for (const s of scenes) {
    assert.equal(s.querySelectorAll('.rv-pc').length, 1, 'one portcullis per scene');
    assert.equal(s.querySelectorAll('.rv-st.stop').length, 1); assert.ok(s.classList.contains('over'));
    assert.ok(s.querySelector('.rv-end').textContent.length > 20);
  }
  assert.deepEqual(p.errors, []);
});

test('Replay restarts a scene from step 1 and clears the verdict', () => {
  const p = page(); const s = p.doc.querySelector('#review-root .rv-scene');
  p.click(s.querySelector('.rv-btn'));
  assert.match(s.querySelector('.rv-line').textContent, /^1 \//); assert.equal(s.classList.contains('over'), false);
  assert.ok(s.querySelector('.rv-tk').classList.contains('rv-sup'), 'the mark is uncertain while it travels');
});

test('with reduced motion a scene shows its finished state at once', () => {
  const p = page({ reduce: true }); const s = p.doc.querySelector('#review-root .rv-scene');
  p.click(s.querySelector('.rv-btn')); assert.ok(s.classList.contains('over')); assert.equal(s.querySelectorAll('.rv-st.stop').length, 1);
});

test('Portfolio: the three forms, 14 coverage areas, 5 cases with a role, a number table with an address for each number', () => {
  const p = page(); const r = p.doc.getElementById('review-root');
  assert.equal(r.querySelectorAll('.rv-form').length, 3);
  const tables = r.querySelectorAll('table');
  assert.equal(tables[0].querySelectorAll('tbody tr').length, 3, 'three measured numbers');
  for (const tr of tables[0].querySelectorAll('tbody tr')) { assert.match(tr.children[3].textContent, /validation-vs-authority\//); assert.ok(tr.children[2].textContent.length > 5); }
  assert.equal(tables[1].querySelectorAll('tbody tr').length, 14);
  assert.equal(tables[2].querySelectorAll('tbody tr').length, 5);
  for (const tr of tables[2].querySelectorAll('tbody tr')) assert.ok(tr.querySelector('.rv-role'));
  const txt = r.textContent;
  assert.ok(/90/.test(txt) && /10 \/ 10/.test(txt)); assert.ok(!/\b(proved|proven|guarantee[sd]?|solves)\b/i.test(txt), 'no strong claims');
  assert.ok(r.querySelectorAll('.rv-limits li').length >= 8, 'honest limits are shown');
});

test('Portfolio and Future patch: English view has no Cyrillic; Bulgarian view has', () => {
  const p = page();
  for (const id of ['review-root', 'patch-root']) assert.ok(!CYR.test(p.doc.getElementById(id).textContent), id);
  p.w.SSCApp.setLang('bg');
  for (const id of ['review-root', 'patch-root']) assert.ok(CYR.test(p.doc.getElementById(id).textContent), id);
});

test('Future patch holds the two rules and the two corrections, each with who does it', () => {
  const p = page(); const a = p.doc.querySelectorAll('#patch-root .rv-patch'); assert.equal(a.length, 4);
  assert.deepEqual([...a].map((x) => x.querySelector('.rv-no').textContent), ['A-1', 'A-2', 'V-1', 'V-2']);
  for (const x of a) assert.match(x.querySelector('.rv-who').textContent, /Who:/);
  assert.ok(!/sidecar_validator_v3\.py.*line/i.test(p.doc.getElementById('patch-root').textContent), 'code holes are not published');
});

const rainPage = (o) => { const p = page(o); p.w.eval(fs.readFileSync(path.join(__dirname, '..', 'assets', 'rain.js'), 'utf8')); return p; };
test('rain button: on by default, off with reduced motion, toggles and remembers', () => {
  const p = rainPage(); const b = p.doc.querySelector('.rain-btn'); assert.ok(b);
  assert.equal(b.getAttribute('aria-pressed'), 'true'); p.click(b); assert.equal(b.getAttribute('aria-pressed'), 'false');
  assert.equal(p.w.localStorage.getItem('ssc-rain'), 'off'); p.click(b); assert.equal(p.w.localStorage.getItem('ssc-rain'), 'on');
  const q = rainPage({ reduce: true }); assert.equal(q.doc.querySelector('.rain-btn').getAttribute('aria-pressed'), 'false');
  p.w.SSCApp.setLang('bg'); assert.match(b.textContent, /Дъжд/);
  const first = p.doc.querySelector('.top .wrap').firstElementChild; assert.equal(first, b, 'the button sits at the top left');
});

test('no bat shape, no hanko marks and no wave patterns remain', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8'), demo = fs.readFileSync(path.join(__dirname, '..', 'assets', 'demo.js'), 'utf8');
  assert.ok(!/hanko|url\(#(sea|uro|chk)\)/.test(html)); assert.ok(!/прилеп|\bbat\b/i.test(demo));
});

test('nothing private is published in the new files', () => {
  const root = path.join(__dirname, '..');
  const text = ['assets/review.js', 'index.html'].map((f) => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
  for (const bad of [/omnivorous/i, /mEandonlyme/i, /REZULTAT_001/, /KOMPAS_YADRO/, /SREDITE/, /\b(192\.168|10\.\d+\.\d+)\.\d+\b/, /\bpassword\b/i, /\\Users\\/]) assert.ok(!bad.test(text), String(bad));
});
