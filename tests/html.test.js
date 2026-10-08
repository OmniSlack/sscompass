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

for (const id of ['architecture', 'skills', 'memory', 'projects', 'contact']) {
  test(`section #${id} exists and is reachable from the navigation`, () => {
    assert.ok(doc.getElementById(id));
    assert.ok(doc.querySelector(`nav a[href="#${id}"]`));
  });
}
test('every in-page link points at an existing id', () => {
  for (const a of doc.querySelectorAll('a[href^="#"]')) {
    const id = a.getAttribute('href').slice(1);
    assert.ok(id === 'top' || doc.getElementById(id), a.getAttribute('href'));
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

test('the page loads exactly three local scripts in the right order', () => {
  const srcs = [...doc.querySelectorAll('script[src]')].map((s) => s.getAttribute('src'));
  assert.deepEqual(srcs, ['assets/data.js', 'assets/cores.js', 'assets/app.js']);
  srcs.forEach((s) => assert.ok(exists(s), s));
});
test('there are no inline scripts and no inline event handlers', () => {
  assert.equal([...doc.querySelectorAll('script:not([src])')].length, 0);
  assert.ok(!/\son[a-z]+\s*=/i.test(read('index.html')));
});
test('the only external hosts are Google Fonts', () => {
  const urls = read('index.html').match(/https?:\/\/[^"'\s)]+/g) || [];
  for (const u of urls) assert.ok(/^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|www\.w3\.org)/.test(u), u);
});
test('the stylesheet exists', () => assert.ok(exists('assets/style.css')));

test('contact section links the CV as a PDF opening safely', () => {
  const a = doc.getElementById('cv-link');
  assert.equal(a.getAttribute('href'), 'cv/Martin_Urumov_CV.pdf');
  assert.match(a.rel, /noopener/); assert.equal(a.target, '_blank');
});
test('headings follow a sensible order (one h1, h2 per section)', () => {
  assert.equal(doc.querySelectorAll('h1').length, 1);
  assert.ok(doc.querySelectorAll('section h2').length >= 5);
});
