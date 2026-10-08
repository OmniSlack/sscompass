'use strict';
/* Regression tests for the findings of the independent reviews (code, accessibility, security). */
const test = require('node:test');
const assert = require('node:assert/strict');
const { load, loadStatic, read, exists, closeAll } = require('./helpers');
test.after(closeAll);
const page = (o) => load(Object.assign({ lang: 'en-US' }, o));

/* ---- security ---- */
test('a quote in a project id cannot break out of an attribute', () => {
  const p = page(); p.w.SSC.projects[0].id = 'a" onmouseover="window.__x=1';
  p.w.SSCApp.setLang('en');
  const card = p.doc.querySelector('#projects-grid article');
  assert.equal(card.getAttribute('data-p'), 'a" onmouseover="window.__x=1');
  assert.equal(card.getAttribute('onmouseover'), null);
});
test('a quote in a profile link cannot add attributes', () => {
  const p = page(); p.w.SSC.socials[0].url = 'https://x.test/"onclick="window.__y=1';
  p.w.SSCApp.setLang('en');
  const a = p.doc.querySelector('#socials a'); assert.equal(a.getAttribute('onclick'), null);
});
test('the CV link keeps its relative PDF path', () => {
  const p = page(); assert.equal(p.doc.getElementById('cv-link').getAttribute('href'), 'cv/Martin_Urumov_CV.pdf');
});
test('a Content-Security-Policy meta tag forbids third-party and inline scripts', () => {
  const d = loadStatic().window.document;
  const c = d.querySelector('meta[http-equiv="Content-Security-Policy"]').content;
  assert.match(c, /script-src 'self'/); assert.match(c, /connect-src 'none'/); assert.match(c, /object-src 'none'/);
  assert.ok(!/unsafe-eval/.test(c)); assert.ok(!/script-src[^;]*unsafe-inline/.test(c));
});
test('the CSP lets the page load its own fonts and styles', () => {
  const c = loadStatic().window.document.querySelector('meta[http-equiv="Content-Security-Policy"]').content;
  assert.match(c, /font-src 'self'/); assert.match(c, /style-src 'self'/);
});

/* ---- focus and keyboard ---- */
test('clicking a filter keeps the same button element (keyboard focus is not lost)', () => {
  const p = page(); const btn = p.doc.querySelector('[data-f=java]');
  p.click(btn); assert.ok(btn.isConnected); assert.equal(p.doc.querySelector('[data-f=java]'), btn);
});
test('clicking a routing example keeps the same button element', () => {
  const p = page(); const btn = p.doc.querySelectorAll('#picks button')[1];
  p.click(btn); assert.ok(btn.isConnected);
});
test('project cards expose a real button with an accessible name', () => {
  const p = page(); const b = p.doc.querySelector('#projects-grid .more');
  assert.equal(b.tagName, 'BUTTON'); assert.match(b.getAttribute('aria-label'), /OmniMax/); assert.equal(b.getAttribute('aria-haspopup'), 'dialog');
});
test('project cards no longer nest headings inside buttons', () => {
  const p = page(); assert.equal(p.doc.querySelectorAll('#projects-grid button h3, #projects-grid button p').length, 0);
});
test('every project card has exactly one button', () => {
  const p = page();
  for (const c of p.doc.querySelectorAll('#projects-grid article')) assert.equal(c.querySelectorAll('button').length, 1);
});
test('closing the dialog returns focus to the project button', () => {
  const p = page(); const b = p.doc.querySelector('.more[data-p=nomnom]'); b.focus();
  p.click(b); p.click(p.doc.getElementById('dlg-close'));
  assert.equal(p.doc.activeElement, b);
});
test('closing the dialog after a language change still finds the button', () => {
  const p = page(); p.click(p.doc.querySelector('.more[data-p=nomnom]')); p.w.SSCApp.setLang('bg');
  p.click(p.doc.getElementById('dlg-close')); assert.equal(p.doc.activeElement, p.doc.querySelector('.more[data-p=nomnom]'));
});
test('a click on the dialog padding does not close it, a click outside does', () => {
  const p = page(); const dlg = p.doc.getElementById('dlg');
  p.click(p.doc.querySelector('.more[data-p=nomnom]'));
  dlg.getBoundingClientRect = () => ({ left: 100, right: 500, top: 100, bottom: 400, width: 400, height: 300 });
  dlg.dispatchEvent(new p.w.MouseEvent('click', { bubbles: true, clientX: 110, clientY: 110 }));
  assert.ok(dlg.hasAttribute('open'));
  dlg.dispatchEvent(new p.w.MouseEvent('click', { bubbles: true, clientX: 5, clientY: 5 }));
  assert.ok(!dlg.hasAttribute('open'));
});
test('the AI choice is a group of pressed-buttons, not a tablist without panels', () => {
  const p = page(); assert.equal(p.doc.getElementById('ai-switch').getAttribute('role'), 'group');
  assert.equal(p.doc.querySelectorAll('#ai-switch [role=tab]').length, 0);
});
test('the readout does not announce every automatic change', () => {
  const p = page(); assert.equal(p.doc.getElementById('readout').getAttribute('aria-live'), 'off');
});
test('a skip link and one real h1 exist', () => {
  const p = page(); assert.ok(p.doc.querySelector('a.skip[href="#architecture"]'));
  assert.equal(p.doc.querySelectorAll('h1').length, 1); assert.match(p.doc.querySelector('h1').textContent, /Martin Urumov/);
});
test('the AI name is no longer a heading', () => {
  const p = page(); assert.notEqual(p.doc.getElementById('ai-name').tagName, 'H1');
});
test('the architecture list stays in the DOM for assistive technology', () => {
  const d = loadStatic().window.document; assert.equal(d.querySelectorAll('.arch ol.steps li').length, 9);
});

/* ---- automatic state cycling ---- */
test('Auto continues from the state you picked, not from a stale position', () => {
  const p = page(); p.click(p.doc.querySelector('[data-s=speaking]')); p.click(p.doc.getElementById('auto'));
  assert.equal(p.w.SSCCore.current().state, 'speaking');
});

/* ---- translations ---- */
test('English quotes are curly, Bulgarian quotes are low-high', () => {
  const p = page(); assert.match(p.doc.querySelector('#picks button').textContent, /^“.*”$/);
  p.w.SSCApp.setLang('bg'); assert.match(p.doc.querySelector('#picks button').textContent, /^„.*“$/);
});
test('reviewed Bulgarian wording is in place', () => {
  const h = read('index.html'); assert.ok(h.includes('за да не се размества с времето'));
  assert.ok(h.includes('Уменията и автоматизациите са примерни')); assert.ok(!h.includes('за да не се разместя'));
});
test('reviewed data wording is in place (scale, new video, questions)', () => {
  const d = read('assets/data.js');
  assert.ok(d.includes('Решава по подредена скала')); assert.ok(d.includes('When a new video is published'));
  assert.ok(d.includes("answer members' questions"));
});

/* ---- animation core ---- */
test('a second AI click during a morph is queued, not applied instantly', () => {
  const p = page(); p.w.SSCCore.setAI('gpt'); p.w.SSCCore.advance(.3); p.w.SSCCore.setAI('gemini');
  assert.equal(p.w.SSCCore.current().ai, 'gemini'); assert.ok(p.w.SSCCore.current().morph < 1);
  p.w.SSCCore.advance(3); const c = p.w.SSCCore.current(); assert.equal(c.ai, 'gemini'); assert.equal(c.morph, 1);
});
test('the last queued choice wins', () => {
  const p = page(); p.w.SSCCore.setAI('gpt'); p.w.SSCCore.setAI('codex'); p.w.SSCCore.setAI('gemini'); p.w.SSCCore.setAI('claude');
  p.w.SSCCore.advance(4); assert.equal(p.w.SSCCore.current().ai, 'claude');
});
test('starting on a remembered AI is instant (no morph on load)', () => {
  const p = page({ storage: { 'ssc-ai': 'gemini' } }); assert.equal(p.w.SSCCore.current().ai, 'gemini'); assert.equal(p.w.SSCCore.current().morph, 1);
});
test('with Pause on, a morph still completes and then nothing is redrawn', () => {
  const p = page(); p.w.SSCCore.setPaused(true); p.w.SSCCore.setAI('gpt');
  p.w.SSCCore.advance(2);
  assert.equal(p.w.SSCCore.current().morph, 1);
  p.ctx.__log.arcs.length = 0; p.w.SSCCore.advance(1);
  assert.equal(p.ctx.__log.arcs.length, 0);
});

/* ---- styles and files ---- */
test('the stylesheet hides inert dialogs and honours reduced motion for hover effects', () => {
  const c = read('assets/style.css');
  assert.match(c, /dialog:not\(\[open\]\)\s*\{\s*display: none/); assert.match(c, /\.proj:hover, a\.soc:hover \{ transform: none/);
});
test('small mono labels are at least 12px (0.75rem)', () => {
  assert.match(read('assets/style.css'), /\.mono \{[^}]*font-size: \.75rem/);
});
test('the header wraps on phones so the navigation is fully reachable', () => {
  assert.match(read('assets/style.css'), /\.top nav \{ order: 3; flex: 1 1 100%/);
});
test('the diagram switches to the readable list below 1000px', () => {
  assert.match(read('assets/style.css'), /@media \(max-width: 1000px\) \{ \.arch svg \{ display: none/);
});
test('the NoScript fallback keeps sections visible', () => assert.match(read('index.html'), /<noscript><style>\.reveal\{opacity:1/));
test('fonts are self-hosted: no Google requests anywhere', () => {
  for (const f of ['index.html', 'assets/style.css', 'assets/fonts.css']) assert.ok(!/googleapis|gstatic/.test(read(f)), f);
  assert.ok(exists('assets/fonts/ibm-plex-mono-400-cyrillic.woff2'));
});
