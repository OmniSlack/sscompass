'use strict';
/* Public tabs (Work, Architecture, Method, About) and the Personal tab: switching, keyboard, hash, locking. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { load, closeAll } = require('./helpers');
test.after(closeAll);

const TABS = ['work', 'architecture', 'method', 'about', 'personal'];
const page = (o) => load(Object.assign({ lang: 'en-US' }, o));
const visible = (p) => TABS.filter((t) => !p.doc.getElementById('panel-' + t).hasAttribute('hidden'));
const wait = (ms = 20) => new Promise((r) => setTimeout(r, ms));
const key = (p, el, k) => el.dispatchEvent(new p.w.KeyboardEvent('keydown', { key: k, bubbles: true }));

test('the page opens on Work, public view, nothing else visible', () => {
  const p = page(); assert.deepEqual(visible(p), ['work']); assert.equal(p.doc.body.getAttribute('data-view'), 'public'); assert.equal(p.w.SSCApp.tab(), 'work');
});
for (const t of TABS) {
  test(`clicking the ${t} tab shows only its panel and selects the tab`, () => {
    const p = page(); p.click(p.doc.getElementById('tab-' + t)); assert.deepEqual(visible(p), [t]);
    for (const x of TABS) { assert.equal(p.doc.getElementById('tab-' + x).getAttribute('aria-selected'), String(x === t)); assert.equal(p.doc.getElementById('tab-' + x).tabIndex, x === t ? 0 : -1); }
    assert.equal(p.w.location.hash, '#' + t); assert.equal(p.doc.body.getAttribute('data-view'), t === 'personal' ? 'personal' : 'public');
  });
}
test('ArrowRight and ArrowLeft move between tabs and wrap around', () => {
  const p = page(); const t0 = p.doc.getElementById('tab-work');
  key(p, t0, 'ArrowRight'); assert.equal(p.w.SSCApp.tab(), 'architecture'); key(p, p.doc.getElementById('tab-architecture'), 'ArrowLeft'); assert.equal(p.w.SSCApp.tab(), 'work');
  key(p, t0, 'ArrowLeft'); assert.equal(p.w.SSCApp.tab(), 'personal'); key(p, p.doc.getElementById('tab-personal'), 'ArrowRight'); assert.equal(p.w.SSCApp.tab(), 'work');
});
test('Home and End jump to the first and last tab', () => {
  const p = page(); key(p, p.doc.getElementById('tab-work'), 'End'); assert.equal(p.w.SSCApp.tab(), 'personal'); key(p, p.doc.getElementById('tab-personal'), 'Home'); assert.equal(p.w.SSCApp.tab(), 'work');
});
test('keyboard navigation moves focus to the new tab', () => {
  const p = page(); p.doc.getElementById('tab-work').focus(); key(p, p.doc.getElementById('tab-work'), 'ArrowRight'); assert.equal(p.doc.activeElement, p.doc.getElementById('tab-architecture'));
});
for (const [hash, want] of [['#work', 'work'], ['#architecture', 'architecture'], ['#method', 'method'], ['#about', 'about'], ['#projects', 'work'], ['#contact', 'about'], ['#skills', 'method'], ['#memory', 'architecture'], ['#personal', 'personal'], ['#personal/news', 'personal'], ['#nonsense', 'work'], ['', 'work']]) {
  test(`opening the site at "${hash}" shows the ${want} tab`, () => { const p = page({ hash }); assert.equal(p.w.SSCApp.tab(), want); assert.deepEqual(visible(p), [want]); });
}
test('changing the hash while the page is open switches the tab', async () => {
  const p = page(); p.w.location.hash = '#method'; await wait(60); assert.equal(p.w.SSCApp.tab(), 'method'); assert.deepEqual(visible(p), ['method']);
});
test('the hero buttons switch tabs instead of scrolling', () => {
  const p = page(); p.w.SSCApp.showTab('about'); p.click(p.doc.getElementById('cta-work')); assert.equal(p.w.SSCApp.tab(), 'work');
});
test('the skip link opens the first tab', () => {
  const p = page(); p.w.SSCApp.showTab('about'); p.click(p.doc.querySelector('a.skip')); assert.equal(p.w.SSCApp.tab(), 'work');
});
test('the brand link goes to the first tab', () => {
  const p = page(); p.w.SSCApp.showTab('method'); p.click(p.doc.querySelector('a.brand')); assert.equal(p.w.SSCApp.tab(), 'work');
});
test('the Personal tab hides the hero; public tabs show it', () => {
  const p = page(); p.click(p.doc.getElementById('tab-personal')); assert.equal(p.doc.body.getAttribute('data-view'), 'personal'); p.click(p.doc.getElementById('tab-method')); assert.equal(p.doc.body.getAttribute('data-view'), 'public');
});
test('the active tab survives a language change', () => {
  const p = page(); p.click(p.doc.getElementById('tab-method')); p.w.SSCApp.setLang('bg'); assert.equal(p.w.SSCApp.tab(), 'method'); assert.deepEqual(visible(p), ['method']);
});
test('tab labels are translated', () => {
  const p = page(); assert.deepEqual(TABS.map((t) => p.doc.getElementById('tab-' + t).textContent.trim()), ['Work', 'Architecture', 'Method', 'About', 'Personal']);
  p.w.SSCApp.setLang('bg'); assert.deepEqual(TABS.map((t) => p.doc.getElementById('tab-' + t).textContent.trim()), ['Проекти', 'Архитектура', 'Метод', 'За мен', 'Личен контрол']);
});
test('every public tab has real content', () => {
  const p = page(); for (const t of ['work', 'architecture', 'method', 'about']) assert.ok(p.doc.getElementById('panel-' + t).textContent.trim().length > 300, t);
});
test('Work shows all fifteen projects; About shows five links and the CV button', () => {
  const p = page(); assert.equal(p.doc.querySelectorAll('#panel-work .proj').length, 15); assert.equal(p.doc.querySelectorAll('#panel-about #socials a').length, 5); assert.ok(p.doc.querySelector('#panel-about #cv-link'));
});
test('the Method tab lists the three background decks', () => { const p = page(); assert.equal(p.doc.querySelectorAll('#panel-method #decks a').length, 3); });
test('the public tabs contain none of the old command-centre text or the unresolved memory question', () => {
  const p = page(); const t = [...p.doc.querySelectorAll('.panel:not(#panel-personal)')].map((e) => e.textContent).join(' ');
  assert.ok(!/NotebookLM|Colab|Obsidian|Somiyo|skill backbone/i.test(t));
});
test('leaving the Personal tab empties it, so nothing stays in the page', async () => {
  const p = page(); p.click(p.doc.getElementById('tab-personal')); await wait(40); assert.ok(p.doc.getElementById('p-root').innerHTML.length > 0);
  p.click(p.doc.getElementById('tab-method')); assert.equal(p.doc.getElementById('p-root').innerHTML, '');
});
test('switching tabs raises no script errors', () => { const p = page(); for (const t of TABS.concat(TABS)) p.click(p.doc.getElementById('tab-' + t)); assert.deepEqual(p.errors, []); });
