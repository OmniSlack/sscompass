'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadStatic, read, exists } = require('./helpers');

const dom = loadStatic();
const doc = dom.window.document;
test.after(() => dom.window.close());

test('document declares HTML5 doctype, Bulgarian language, charset and viewport', () => {
  assert.match(read('index.html'), /^<!doctype html>/i);
  assert.equal(doc.documentElement.lang, 'bg');
  assert.equal(doc.querySelector('meta[charset]').getAttribute('charset').toLowerCase(), 'utf-8');
  assert.match(doc.querySelector('meta[name=viewport]').content, /width=device-width/);
});

test('title contains the owner name in both languages', () => {
  assert.match(doc.title, /Мартин Урумов/); assert.match(doc.title, /SSC Compass/);
});
test('meta description names the owner in both languages', () => {
  const d = doc.querySelector('meta[name=description]').content;
  assert.match(d, /Мартин Урумов/); assert.match(d, /Martin Urumov/);
});

test('all element ids are unique', () => {
  const ids = [...doc.querySelectorAll('[id]')].map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length);
});

for (const id of ['architecture', 'skills', 'projects', 'contact', 'personal']) {
  test(`tab "${id}" has a panel and is wired with aria-controls / aria-labelledby`, () => {
    const tab = doc.getElementById('tab-' + id), panel = doc.getElementById('panel-' + id);
    assert.ok(tab && panel);
    assert.equal(tab.getAttribute('role'), 'tab'); assert.equal(panel.getAttribute('role'), 'tabpanel');
    assert.equal(tab.getAttribute('aria-controls'), 'panel-' + id); assert.equal(panel.getAttribute('aria-labelledby'), 'tab-' + id);
  });
}
test('the memory part lives inside the Architecture panel', () => {
  assert.ok(doc.querySelector('#panel-architecture #memory'));
});
test('exactly one tab is selected and focusable at the start (roving tabindex)', () => {
  const sel = doc.querySelectorAll('[role=tab][aria-selected=true]'); assert.equal(sel.length, 1);
  assert.equal(doc.querySelectorAll('[role=tab][tabindex="0"]').length, 1);
  assert.equal(doc.getElementById('tab-architecture').getAttribute('aria-selected'), 'true');
});
test('all panels except the first start hidden', () => {
  for (const id of ['skills', 'projects', 'contact', 'personal']) assert.ok(doc.getElementById('panel-' + id).hasAttribute('hidden'), id);
  assert.ok(!doc.getElementById('panel-architecture').hasAttribute('hidden'));
});
test('the Personal tab comes last and is marked apart from the public tabs', () => {
  const tabs = [...doc.querySelectorAll('#tablist [role=tab]')];
  assert.equal(tabs[tabs.length - 1].id, 'tab-personal'); assert.ok(tabs[tabs.length - 1].classList.contains('tab-personal'));
  assert.equal(tabs.length, 5);
});
test('public panels contain no personal controls', () => {
  for (const id of ['architecture', 'skills', 'projects', 'contact']) assert.equal(doc.querySelectorAll('#panel-' + id + ' input, #panel-' + id + ' textarea').length, 0, id);
});
test('the personal panel is empty markup until unlocked (no data in the HTML)', () => {
  const p = doc.getElementById('p-root'); assert.equal(p.innerHTML.trim(), '');
  assert.ok(!/NomNom|GapInTheGap|Kompas|Selenium|Snapchat|Twitch|The Game/.test(read('index.html')));
});

test('every in-page link points at a tab', () => {
  for (const a of doc.querySelectorAll('a[href^="#"]')) {
    const id = a.getAttribute('href').slice(1).split('/')[0];
    assert.ok(['top', 'memory', 'architecture', 'skills', 'projects', 'contact', 'personal'].includes(id), a.getAttribute('href'));
  }
});
test('there is a #top target for the brand link', () => assert.ok(doc.getElementById('top')));

test('every translatable element has a non-empty English text', () => {
  const els = [...doc.querySelectorAll('[data-en]')];
  assert.ok(els.length >= 100, `found ${els.length}`);
  for (const e of els) assert.ok(e.dataset.en.trim() !== '', e.outerHTML.slice(0, 80));
});
test('every translatable element has Bulgarian text and no child elements', () => {
  for (const e of doc.querySelectorAll('[data-en]')) {
    assert.ok(e.textContent.trim() !== '', e.outerHTML.slice(0, 80));
    assert.equal(e.children.length, 0, e.outerHTML.slice(0, 80));
  }
});
test('English text is never identical to Bulgarian text for Cyrillic originals', () => {
  for (const e of doc.querySelectorAll('[data-en]')) {
    if (/[Ѐ-ӿ]/.test(e.textContent)) assert.notEqual(e.dataset.en, e.textContent.trim());
  }
});
test('English text contains no Cyrillic', () => {
  for (const e of doc.querySelectorAll('[data-en]')) assert.ok(!/[Ѐ-ӿ]/.test(e.dataset.en), e.dataset.en);
});
test('every aria-label that has a translation has an English version', () => {
  for (const e of doc.querySelectorAll('[data-en-aria]')) {
    assert.ok(e.getAttribute('aria-label')); assert.ok(e.dataset.enAria.trim());
  }
});

test('language switch offers BG and EN', () => {
  const b = [...doc.querySelectorAll('#lang button')].map((x) => x.dataset.lang);
  assert.deepEqual(b, ['bg', 'en']);
});
test('Bulgarian is the initially pressed language', () => {
  assert.equal(doc.querySelector('#lang [data-lang=bg]').getAttribute('aria-pressed'), 'true');
});

test('the owner name appears in both languages in hero, contact and footer', () => {
  assert.match(doc.querySelector('.owner').textContent, /Мартин Урумов.*Martin Urumov/);
  assert.match(doc.querySelector('.owner-both').textContent, /Мартин Урумов.*Martin Urumov/);
  assert.match(doc.querySelector('footer').textContent, /Мартин Урумов.*Martin Urumov/);
});

test('architecture diagram is an accessible image with a text alternative for phones', () => {
  const svg = doc.querySelector('.arch svg');
  assert.equal(svg.getAttribute('role'), 'img'); assert.ok(svg.getAttribute('aria-label'));
  assert.equal(doc.querySelectorAll('.arch ol.steps li').length, 9);
});
test('the diagram has all eleven nodes (you, 2 doors, speech, bridge, router, 3 tiers, connectors, vault)', () => {
  assert.equal(doc.querySelectorAll('.arch svg rect.node, .arch svg ellipse.node').length, 11);
});

test('the canvas has a role and label', () => {
  const c = doc.getElementById('core'); assert.equal(c.getAttribute('role'), 'img'); assert.ok(c.getAttribute('aria-label'));
});
test('the dialog has a labelled close button', () => {
  assert.ok(doc.querySelector('dialog#dlg #dlg-close[aria-label]'));
});

test('the page loads exactly five local scripts in the right order', () => {
  const srcs = [...doc.querySelectorAll('script[src]')].map((s) => s.getAttribute('src'));
  assert.deepEqual(srcs, ['assets/data.js', 'assets/cores.js', 'assets/vault.js', 'assets/personal.js', 'assets/app.js']);
  srcs.forEach((s) => assert.ok(exists(s), s));
});
test('there are no inline scripts and no inline event handlers', () => {
  assert.equal([...doc.querySelectorAll('script:not([src])')].length, 0);
  assert.ok(!/\son[a-z]+\s*=/i.test(read('index.html')));
});
test('the page makes no third-party requests (fonts are self-hosted)', () => {
  const urls = read('index.html').match(/https?:\/\/[^"'\s)]+/g) || [];
  assert.deepEqual(urls, []);
});
test('both stylesheets exist and every font file they name exists', () => {
  assert.ok(exists('assets/style.css')); assert.ok(exists('assets/fonts.css'));
  const files = read('assets/fonts.css').match(/url\(fonts\/[^)]+\)/g) || [];
  assert.ok(files.length >= 12);
  for (const f of files) assert.ok(exists('assets/' + f.slice(4, -1)), f);
});

test('contact section links the CV as a PDF opening safely', () => {
  const a = doc.getElementById('cv-link');
  assert.equal(a.getAttribute('href'), 'cv/Martin_Urumov_CV.pdf');
  assert.match(a.rel, /noopener/); assert.equal(a.target, '_blank');
});
test('headings follow a sensible order (one h1, h2 per section)', () => {
  assert.equal(doc.querySelectorAll('h1').length, 1);
  assert.ok(doc.querySelectorAll('section h2').length >= 5);
});
