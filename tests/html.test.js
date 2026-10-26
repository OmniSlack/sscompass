'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadStatic, read, exists } = require('./helpers');

const dom = loadStatic();
const doc = dom.window.document;
test.after(() => dom.window.close());
const TABS = ['home', 'work', 'architecture', 'demo', 'method', 'about', 'personal'];

test('document declares HTML5, Bulgarian language, charset and viewport', () => {
  assert.match(read('index.html'), /^<!doctype html>/i); assert.equal(doc.documentElement.lang, 'bg');
  assert.equal(doc.querySelector('meta[charset]').getAttribute('charset').toLowerCase(), 'utf-8'); assert.match(doc.querySelector('meta[name=viewport]').content, /width=device-width/);
});
test('title and description name the owner in both languages', () => {
  assert.match(doc.title, /Мартин Урумов/); const d = doc.querySelector('meta[name=description]').content; assert.match(d, /Мартин Урумов/); assert.match(d, /Martin Urumov/);
});
test('all element ids are unique', () => { const ids = [...doc.querySelectorAll('[id]')].map((e) => e.id); assert.equal(new Set(ids).size, ids.length); });
for (const id of TABS) {
  test(`tab "${id}" has a panel wired with aria-controls and aria-labelledby`, () => {
    const tab = doc.getElementById('tab-' + id), panel = doc.getElementById('panel-' + id);
    assert.ok(tab && panel); assert.equal(tab.getAttribute('role'), 'tab'); assert.equal(panel.getAttribute('role'), 'tabpanel');
    assert.equal(tab.getAttribute('aria-controls'), 'panel-' + id); assert.equal(panel.getAttribute('aria-labelledby'), 'tab-' + id);
  });
}
test('Home is the selected, focusable tab at the start; the other panels start hidden', () => {
  assert.equal(doc.querySelectorAll('[role=tab][aria-selected=true]').length, 1); assert.equal(doc.getElementById('tab-home').getAttribute('aria-selected'), 'true');
  assert.equal(doc.querySelectorAll('[role=tab][tabindex="0"]').length, 1);
  for (const id of TABS.slice(1)) assert.ok(doc.getElementById('panel-' + id).hasAttribute('hidden'), id);
});
test('the Personal tab comes last and is marked apart', () => {
  const tabs = [...doc.querySelectorAll('#tablist [role=tab]')]; assert.deepEqual(tabs.map((t) => t.dataset.tab), TABS); assert.ok(tabs[6].classList.contains('tab-personal'));
});
test('the old command-centre concept is gone from the page', () => {
  const h = read('index.html');
  for (const bad of ['SSC/COMPASS', 'Somiyo', 'NotebookLM', 'Obsidian', 'ai-switch', 'id="core"', 'Skills', 'Умения']) assert.ok(!h.includes(bad), bad);
});
test('one h1 carries the owner name', () => { assert.equal(doc.querySelectorAll('h1').length, 1); assert.match(doc.querySelector('h1').textContent, /Мартин Урумов/); });
test('the hero states the four headline numbers', () => {
  assert.deepEqual([...doc.querySelectorAll('.stats b')].map((b) => b.textContent), ['15', '16', '165', '24']);
});
test('the hero has three calls to action: work, CV and the repository', () => {
  assert.ok(doc.getElementById('cta-work')); assert.equal(doc.getElementById('cv-hero').getAttribute('href'), 'cv/Martin_Urumov_CV.pdf');
  const r = doc.getElementById('repo-link'); assert.equal(r.getAttribute('href'), 'https://github.com/OmniSlack/martin-urumov-portfolio'); assert.match(r.rel, /noopener/); assert.equal(r.target, '_blank');
});
test('the AI-assistance disclosure is on the front page', () => { assert.match(doc.querySelector('.honest').textContent, /AI/); });

test('every translatable element has non-empty English and Bulgarian text and no child elements', () => {
  const els = [...doc.querySelectorAll('[data-en]')]; assert.ok(els.length >= 120, 'found ' + els.length);
  for (const e of els) { assert.ok(e.dataset.en.trim() !== '', e.outerHTML.slice(0, 80)); assert.ok(e.textContent.trim() !== '', e.outerHTML.slice(0, 80)); assert.equal(e.children.length, 0, e.outerHTML.slice(0, 80)); }
});
test('English text contains no Cyrillic and Bulgarian originals differ from it', () => {
  for (const e of doc.querySelectorAll('[data-en]')) { assert.ok(!/[Ѐ-ӿ]/.test(e.dataset.en), e.dataset.en); if (/[Ѐ-ӿ]/.test(e.textContent)) assert.notEqual(e.dataset.en, e.textContent.trim()); }
});
test('aria-labels that have a translation have an English version', () => { for (const e of doc.querySelectorAll('[data-en-aria]')) { assert.ok(e.getAttribute('aria-label')); assert.ok(e.dataset.enAria.trim()); } });

test('the architecture diagram is an accessible image with a text alternative', () => {
  const svg = doc.querySelector('#panel-architecture .arch svg'); assert.equal(svg.getAttribute('role'), 'img'); assert.ok(svg.getAttribute('aria-label'));
  assert.equal(doc.querySelectorAll('#panel-architecture .arch ol.steps li').length, 9); assert.equal(doc.querySelectorAll('#panel-architecture .arch svg rect.node').length, 10);
});
test('the diagram names the folders that implement each box', () => {
  const t = doc.querySelector('#panel-architecture .arch svg').textContent; for (const f of ['ai-proposal-evaluator', 'agent-execution-control', 'agent-action-verifier / envelope.js', 'agent-action-verifier / verifier.js']) assert.ok(t.includes(f), f);
});
test('the diagram and the table agree that the planner and the adapter are not built', () => {
  const t = doc.getElementById('panel-architecture').textContent; assert.match(t, /ПЛАНИРОВЧИК|PLANNER/); assert.match(t, /само дизайн/); assert.match(t, /не е построен/); assert.match(t, /не е направено/);
});
test('the "every way not to act" table lists four outcomes', () => {
  assert.deepEqual([...doc.querySelectorAll('#panel-architecture .tbl')[0].querySelectorAll('td.k')].map((x) => x.textContent), ['NO PERMIT', 'REJECTED', 'CANCELLED', 'UNKNOWN']);
});
test('the verdict table maps four verdicts to gate states', () => {
  const rows = [...doc.querySelectorAll('#panel-architecture .tbl')[1].querySelectorAll('tbody tr')].map((r) => [...r.children].map((c) => c.textContent.trim()).join(' '));
  assert.deepEqual(rows, ['VERIFIED OPEN', 'CONTRADICTED STOP', 'PARTIAL HOLD', 'UNKNOWN HOLD']);
});
test('the method tab lists five rules and a who-did-what table with six rows', () => {
  assert.equal(doc.querySelectorAll('#panel-method .rules li').length, 5); assert.equal(doc.querySelectorAll('#panel-method .who tbody tr').length, 6);
});
test('the method tab shows the commands to check the numbers', () => {
  const c = doc.querySelector('#panel-method .code').textContent; for (const x of ['sha256sum -c SHA256SUMS', 'node --test', 'node test.js']) assert.ok(c.includes(x), x);
});
test('the method tab keeps corrections on record (four items)', () => { assert.equal(doc.querySelectorAll('#panel-method .plain-list li').length, 4); });
test('the method tab states limits and that the framework is a working model', () => {
  const t = doc.getElementById('panel-method').textContent; assert.match(t, /работен модел/); assert.match(t, /прототипи/);
});
test('the about tab shows the CV button, the languages and the contact grid container', () => {
  assert.ok(doc.getElementById('cv-link')); assert.ok(doc.getElementById('socials')); assert.match(doc.getElementById('panel-about').textContent, /Български: роден/);
});
test('the owner name appears in both languages in the about tab and the footer', () => {
  assert.match(doc.querySelector('.owner-both').textContent, /Мартин Урумов.*Martin Urumov/); assert.match(doc.querySelector('footer').textContent, /Мартин Урумов.*Martin Urumov/);
});
test('the personal panel is empty markup until unlocked: no data in the HTML', () => {
  assert.equal(doc.getElementById('p-root').innerHTML.trim(), ''); assert.ok(!/NomNom|GapInTheGap|Kompas|Selenium|Snapchat|Twitch|The Game/.test(read('index.html')));
});
test('public panels contain no form controls', () => { for (const id of ['work', 'architecture', 'method', 'about']) assert.equal(doc.querySelectorAll('#panel-' + id + ' input, #panel-' + id + ' textarea').length, 0, id); });
test('the dialog has a labelled close button', () => { assert.ok(doc.querySelector('dialog#dlg #dlg-close[aria-label]')); });

test('the page loads exactly seven local scripts in the right order, no inline scripts or handlers', () => {
  const srcs = [...doc.querySelectorAll('script[src]')].map((s) => s.getAttribute('src')); assert.deepEqual(srcs, ['assets/data.js', 'assets/vault.js', 'assets/personal.js', 'assets/demo.js', 'assets/diagrams.js', 'assets/app.js', 'assets/rain.js']);
  for (const s of srcs) assert.ok(exists(s), s); assert.equal(doc.querySelectorAll('script:not([src])').length, 0); assert.ok(!/\son[a-z]+\s*=/i.test(read('index.html')));
});
test('the page makes no third-party requests (fonts are self-hosted)', () => { assert.deepEqual(read('index.html').match(/https?:\/\/[^"'\s)]+/g) || [], ['https://github.com/OmniSlack/martin-urumov-portfolio']); });
test('both stylesheets exist and every font file they name exists', () => {
  assert.ok(exists('assets/style.css')); assert.ok(exists('assets/fonts.css')); const files = read('assets/fonts.css').match(/url\(fonts\/[^)]+\)/g) || [];
  assert.ok(files.length >= 12); for (const f of files) assert.ok(exists('assets/' + f.slice(4, -1)), f);
});
test('a skip link and a no-script fallback exist', () => { assert.ok(doc.querySelector('a.skip[href="#home"]')); assert.match(read('index.html'), /<noscript><style>\.panel\[hidden\]/); });
test('the Content-Security-Policy forbids third-party and inline scripts', () => {
  const c = doc.querySelector('meta[http-equiv="Content-Security-Policy"]').content; assert.match(c, /script-src 'self'/); assert.match(c, /object-src 'none'/); assert.match(c, /connect-src 'self'/);
  assert.ok(!/unsafe-eval/.test(c)); assert.ok(!/script-src[^;]*unsafe-inline/.test(c));
});
test('the method tab has a working-loop diagram with five steps, an accessible label and a mobile text version', () => {
  const svg = doc.querySelector('#panel-method .mdg svg'); assert.equal(svg.getAttribute('role'), 'img'); assert.ok(svg.getAttribute('aria-label')); assert.equal(svg.querySelectorAll('rect.node').length, 5);
  assert.equal(doc.querySelectorAll('#panel-method .mdg ol.steps li').length, 5); assert.match(svg.textContent, /Мартин Урумов|МАРТИН УРУМОВ/); assert.match(svg.textContent, /AI АСИСТЕНТИ/);
});

/* --- interactive diagrams (need the scripts, so they load the full page) --- */
const { load, closeAll } = require('./helpers');
test.after(closeAll);
const dpage = () => load({ lang: 'en-US' });
test('diagrams: every box of the architecture and method diagrams is a focusable button', () => {
  const p = dpage(); assert.equal(p.doc.querySelectorAll('#panel-architecture .nd').length, 10); assert.equal(p.doc.querySelectorAll('#panel-method .nd').length, 5);
  for (const g of p.doc.querySelectorAll('.nd')) { assert.equal(g.getAttribute('role'), 'button'); assert.equal(g.getAttribute('tabindex'), '0'); }
});
test('diagrams: clicking a box selects it and shows what it does; clicking again clears', () => {
  const p = dpage(); const g = p.doc.querySelectorAll('#panel-architecture .nd')[1]; p.click(g);
  assert.ok(g.classList.contains('sel')); assert.match(p.doc.querySelector('#panel-architecture .dg-info').textContent, /EVALUATOR/i); p.click(g); assert.ok(!g.classList.contains('sel'));
});
test('diagrams: Enter on a box selects it', () => {
  const p = dpage(); const g = p.doc.querySelectorAll('#panel-method .nd')[2]; g.dispatchEvent(new p.w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); assert.ok(g.classList.contains('sel'));
});
test('diagrams: tapping a step in the phone list selects the same box', () => {
  const p = dpage(); p.click(p.doc.querySelectorAll('#panel-method ol.steps li')[3]); assert.ok(p.doc.querySelectorAll('#panel-method .nd')[3].classList.contains('sel'));
});
test('diagrams: Next walks through the boxes and wraps around', () => {
  const p = dpage(); const nxt = p.doc.querySelectorAll('#panel-method .dg-bar .btn')[1]; for (let i = 0; i < 5; i++) nxt.click(); assert.ok(p.doc.querySelectorAll('#panel-method .nd')[4].classList.contains('sel')); nxt.click(); assert.ok(p.doc.querySelectorAll('#panel-method .nd')[0].classList.contains('sel'));
});
test('diagrams: the description follows the language', () => {
  const p = dpage(); p.click(p.doc.querySelectorAll('#panel-method .nd')[0]); p.w.SSCApp.setLang('bg'); assert.match(p.doc.querySelector('#panel-method .dg-info').textContent, /Мартин/);
});
test('diagrams: leaving the tab stops a running walk-through', () => {
  const p = dpage(); p.doc.querySelectorAll('#panel-method .dg-bar .btn')[0].click(); p.w.SSCApp.showTab('home'); assert.match(p.doc.querySelectorAll('#panel-method .dg-bar .btn')[0].textContent, /Walk/);
});
