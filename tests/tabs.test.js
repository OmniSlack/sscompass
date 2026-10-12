'use strict';
/* Public tabs (Architecture, Skills, Projects, Contact) and the Personal tab: switching, keyboard, hash, locking. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { load, closeAll } = require('./helpers');
test.after(closeAll);

const TABS = ['architecture', 'skills', 'projects', 'contact', 'personal'];
const page = (o) => load(Object.assign({ lang: 'en-US' }, o));
const visible = (p) => TABS.filter((t) => !p.doc.getElementById('panel-' + t).hasAttribute('hidden'));
const wait = (ms = 20) => new Promise((r) => setTimeout(r, ms));
const key = (p, el, k) => el.dispatchEvent(new p.w.KeyboardEvent('keydown', { key: k, bubbles: true }));

test('the page opens on Architecture, public view, nothing else visible', () => {
  const p = page(); assert.deepEqual(visible(p), ['architecture']); assert.equal(p.doc.body.getAttribute('data-view'), 'public');
  assert.equal(p.w.SSCApp.tab(), 'architecture');
});
for (const t of TABS) {
  test(`clicking the ${t} tab shows only its panel and selects the tab`, () => {
    const p = page(); p.click(p.doc.getElementById('tab-' + t));
    assert.deepEqual(visible(p), [t]);
    for (const x of TABS) assert.equal(p.doc.getElementById('tab-' + x).getAttribute('aria-selected'), String(x === t));
    for (const x of TABS) assert.equal(p.doc.getElementById('tab-' + x).tabIndex, x === t ? 0 : -1);
    assert.equal(p.w.location.hash, '#' + t);
    assert.equal(p.doc.body.getAttribute('data-view'), t === 'personal' ? 'personal' : 'public');
  });
}
test('ArrowRight and ArrowLeft move between tabs and wrap around', () => {
  const p = page(); const t0 = p.doc.getElementById('tab-architecture');
  key(p, t0, 'ArrowRight'); assert.equal(p.w.SSCApp.tab(), 'skills');
  key(p, p.doc.getElementById('tab-skills'), 'ArrowLeft'); assert.equal(p.w.SSCApp.tab(), 'architecture');
  key(p, t0, 'ArrowLeft'); assert.equal(p.w.SSCApp.tab(), 'personal');
  key(p, p.doc.getElementById('tab-personal'), 'ArrowRight'); assert.equal(p.w.SSCApp.tab(), 'architecture');
});
test('Home and End jump to the first and last tab', () => {
  const p = page(); key(p, p.doc.getElementById('tab-architecture'), 'End'); assert.equal(p.w.SSCApp.tab(), 'personal');
  key(p, p.doc.getElementById('tab-personal'), 'Home'); assert.equal(p.w.SSCApp.tab(), 'architecture');
});
test('keyboard navigation moves focus to the new tab', () => {
  const p = page(); p.doc.getElementById('tab-architecture').focus(); key(p, p.doc.getElementById('tab-architecture'), 'ArrowRight');
  assert.equal(p.doc.activeElement, p.doc.getElementById('tab-skills'));
});
for (const [hash, want] of [['#projects', 'projects'], ['#contact', 'contact'], ['#skills', 'skills'], ['#memory', 'architecture'], ['#personal', 'personal'], ['#personal/news', 'personal'], ['#nonsense', 'architecture'], ['', 'architecture']]) {
  test(`opening the site at "${hash}" shows the ${want} tab`, () => {
    const p = page({ hash }); assert.equal(p.w.SSCApp.tab(), want); assert.deepEqual(visible(p), [want]);
  });
}
test('changing the hash while the page is open switches the tab', async () => {
  const p = page(); p.w.location.hash = '#projects'; await wait(60);
  assert.equal(p.w.SSCApp.tab(), 'projects'); assert.deepEqual(visible(p), ['projects']);
});
test('the hero quick links switch tabs instead of scrolling', () => {
  const p = page(); p.click(p.doc.querySelector('.quick a[href="#projects"]')); assert.equal(p.w.SSCApp.tab(), 'projects');
  p.click(p.doc.querySelector('.quick a[href="#contact"]')); assert.equal(p.w.SSCApp.tab(), 'contact');
});
test('the skip link opens the first public tab', () => {
  const p = page(); p.w.SSCApp.showTab('contact'); p.click(p.doc.querySelector('a.skip')); assert.equal(p.w.SSCApp.tab(), 'architecture');
});
test('the Personal tab hides the hero; public tabs show it', () => {
  const p = page(); p.click(p.doc.getElementById('tab-personal')); assert.equal(p.doc.body.getAttribute('data-view'), 'personal');
  p.click(p.doc.getElementById('tab-skills')); assert.equal(p.doc.body.getAttribute('data-view'), 'public');
});
test('the active tab survives a language change', () => {
  const p = page(); p.click(p.doc.getElementById('tab-projects')); p.w.SSCApp.setLang('bg');
  assert.equal(p.w.SSCApp.tab(), 'projects'); assert.deepEqual(visible(p), ['projects']);
});
test('tab labels are translated', () => {
  const p = page(); const names = TABS.map((t) => p.doc.getElementById('tab-' + t).textContent.trim());
  assert.deepEqual(names, ['Architecture', 'Skills', 'Projects', 'Contact', 'Personal']);
  p.w.SSCApp.setLang('bg');
  assert.deepEqual(TABS.map((t) => p.doc.getElementById('tab-' + t).textContent.trim()), ['Архитектура', 'Умения', 'Проекти', 'Контакти', 'Личен контрол']);
});
test('every public tab has real content', () => {
  const p = page();
  for (const t of ['architecture', 'skills', 'projects', 'contact']) assert.ok(p.doc.getElementById('panel-' + t).textContent.trim().length > 200, t);
});
test('Projects shows only finished work: five cards', () => {
  const p = page(); assert.equal(p.doc.querySelectorAll('#panel-projects .proj').length, 5);
});
test('Contact shows five live platform links and the CV button', () => {
  const p = page(); assert.equal(p.doc.querySelectorAll('#panel-contact #socials a').length, 5); assert.ok(p.doc.querySelector('#panel-contact #cv-link'));
});
test('the Architecture tab carries both the diagram and the memory section', () => {
  const p = page(); assert.ok(p.doc.querySelector('#panel-architecture .arch svg')); assert.ok(p.doc.querySelector('#panel-architecture #memory .vflow'));
});
test('the unresolved NotebookLM question is no longer on the public Architecture tab', () => {
  const p = page(); const t = p.doc.getElementById('panel-architecture').textContent;
  assert.ok(!/notebooklm-py|Colab|undocumented/i.test(t));
});
test('leaving the Personal tab empties it, so nothing stays in the page', async () => {
  const p = page(); p.click(p.doc.getElementById('tab-personal')); await wait(40);
  assert.ok(p.doc.getElementById('p-root').innerHTML.length > 0);
  p.click(p.doc.getElementById('tab-skills')); assert.equal(p.doc.getElementById('p-root').innerHTML, '');
});
test('switching tabs raises no script errors', () => {
  const p = page(); for (const t of TABS.concat(TABS)) p.click(p.doc.getElementById('tab-' + t)); assert.deepEqual(p.errors, []);
});
