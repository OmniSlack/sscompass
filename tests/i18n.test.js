'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load, loadData, closeAll, CYRILLIC } = require('./helpers');
test.after(closeAll);

const D = loadData();
const page = (opts) => load(opts);

test('Bulgarian browser gets Bulgarian by default', () => {
  const p = page({ lang: 'bg-BG' });
  assert.equal(p.doc.documentElement.lang, 'bg'); assert.equal(p.w.SSCApp.getLang(), 'bg');
});
test('English browser gets English by default', () => {
  const p = page({ lang: 'en-US' });
  assert.equal(p.doc.documentElement.lang, 'en'); assert.equal(p.w.SSCApp.getLang(), 'en');
});
test('a stored choice beats the browser language', () => {
  const p = page({ lang: 'bg-BG', storage: { 'ssc-lang': 'en' } });
  assert.equal(p.w.SSCApp.getLang(), 'en');
});
test('an invalid stored value is ignored', () => {
  const p = page({ lang: 'bg-BG', storage: { 'ssc-lang': 'xx' } });
  assert.equal(p.w.SSCApp.getLang(), 'bg');
});
test('clicking EN switches the page and remembers it', () => {
  const p = page({ lang: 'bg-BG' });
  p.click(p.doc.querySelector('#lang [data-lang=en]'));
  assert.equal(p.doc.documentElement.lang, 'en');
  assert.equal(p.w.localStorage.getItem('ssc-lang'), 'en');
  assert.equal(p.doc.querySelector('#lang [data-lang=en]').getAttribute('aria-pressed'), 'true');
  assert.equal(p.doc.querySelector('#lang [data-lang=bg]').getAttribute('aria-pressed'), 'false');
});
test('English: every translatable element shows its English text', () => {
  const p = page({ lang: 'en-US' });
  for (const e of p.doc.querySelectorAll('[data-en]')) assert.equal(e.textContent, e.dataset.en);
});
test('switching to English and back restores the exact Bulgarian text', () => {
  const p = page({ lang: 'bg-BG' });
  const before = [...p.doc.querySelectorAll('[data-en]')].map((e) => e.textContent);
  p.w.SSCApp.setLang('en'); p.w.SSCApp.setLang('bg');
  const after = [...p.doc.querySelectorAll('[data-en]')].map((e) => e.textContent);
  assert.deepEqual(after, before);
});
test('page title and description follow the language', () => {
  const p = page({ lang: 'en-US' });
  assert.equal(p.doc.title, 'SSC Compass · Martin Urumov');
  assert.match(p.doc.querySelector('meta[name=description]').content, /personal command centre/);
  p.w.SSCApp.setLang('bg');
  assert.equal(p.doc.title, 'SSC Compass · Мартин Урумов');
});
test('aria-labels are translated', () => {
  const p = page({ lang: 'en-US' });
  assert.equal(p.doc.getElementById('ai-switch').getAttribute('aria-label'), 'Choose an AI');
  p.w.SSCApp.setLang('bg');
  assert.equal(p.doc.getElementById('ai-switch').getAttribute('aria-label'), 'Избор на AI');
});
test('English: skill cards, filters, states and routes are translated', () => {
  const p = page({ lang: 'en-US' });
  assert.equal(p.doc.querySelector('.dom .row').textContent, 'Memory');
  assert.equal(p.doc.querySelector('#filters button').textContent, 'All');
  assert.equal(p.doc.querySelector('#states button').textContent, 'Idle');
  assert.match(p.doc.querySelector('#picks button').textContent, /Show me my priorities for today/);
});
test('English: project cards show English status and summary', () => {
  const p = page({ lang: 'en-US' });
  const first = p.doc.querySelector('#projects-grid .proj');
  assert.equal(first.querySelector('.chip.st').textContent, D.projects[0].status.en);
  assert.equal(first.querySelector('p').textContent, D.projects[0].summary.en);
});
test('English: platform cards say "link soon" for missing links', () => {
  const p = page({ lang: 'en-US' });
  assert.equal(p.doc.querySelector('.soc.off .mono').textContent, 'link soon');
  p.w.SSCApp.setLang('bg');
  assert.equal(p.doc.querySelector('.soc.off .mono').textContent, 'линк скоро');
});
test('an open project dialog is re-rendered when the language changes', () => {
  const p = page({ lang: 'bg-BG' });
  p.click(p.doc.querySelector('[data-p=omnimax]'));
  assert.match(p.doc.getElementById('dlg-body').textContent, /Гласово приложение/);
  p.w.SSCApp.setLang('en');
  assert.match(p.doc.getElementById('dlg-body').textContent, /A voice app/);
});
test('English mode has no Cyrillic outside the owner name lines', () => {
  const p = page({ lang: 'en-US' });
  const allowed = new Set([...p.doc.querySelectorAll('.owner, .owner-both, footer')]);
  const walker = p.doc.createTreeWalker(p.doc.body, p.w.NodeFilter.SHOW_TEXT);
  let n; const bad = [];
  while ((n = walker.nextNode())) {
    const el = n.parentElement;
    if (!CYRILLIC.test(n.nodeValue)) continue;
    let ok = false; for (let e = el; e; e = e.parentElement) if (allowed.has(e)) ok = true;
    if (!ok && !['SCRIPT', 'STYLE'].includes(el.tagName)) bad.push(n.nodeValue.trim().slice(0, 50));
  }
  assert.deepEqual(bad, []);
});
test('Bulgarian mode shows Bulgarian navigation', () => {
  const p = page({ lang: 'bg-BG' });
  assert.equal(p.doc.querySelector('nav a').textContent, 'Архитектура');
});
test('the language can be switched ten times without errors or drift', () => {
  const p = page({ lang: 'bg-BG' });
  for (let i = 0; i < 10; i++) p.w.SSCApp.setLang(i % 2 ? 'bg' : 'en');
  p.w.SSCApp.setLang('bg');
  assert.equal(p.doc.querySelector('nav a').textContent, 'Архитектура');
  assert.deepEqual(p.errors, []);
});
test('the clock uses the page language locale without breaking', () => {
  const p = page({ lang: 'en-US' });
  assert.match(p.doc.getElementById('clock').textContent, /\d\d:\d\d:\d\d/);
});
test('the owner name line stays bilingual in both languages', () => {
  const p = page({ lang: 'en-US' });
  assert.match(p.doc.querySelector('.owner').textContent, /Мартин Урумов · Martin Urumov/);
  p.w.SSCApp.setLang('bg');
  assert.match(p.doc.querySelector('.owner').textContent, /Мартин Урумов · Martin Urumov/);
});
