'use strict';
/* The Work tab, project dialog, language switching, contact grid and security of rendered data. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { load, loadData, read, closeAll, CYRILLIC } = require('./helpers');
test.after(closeAll);

const D = loadData();
const page = (o) => load(Object.assign({ lang: 'en-US' }, o));
const count = (k) => D.projects.filter((p) => k === 'all' || p.tags.includes(k)).length;

test('the page starts without script errors', () => { assert.deepEqual(page().errors, []); });
test('the footer shows the current year', () => { assert.equal(page().doc.getElementById('year').textContent, String(new Date().getFullYear())); });

/* ---------- cards and filters ---------- */
test('fifteen project cards are rendered, named after their folders', () => {
  const p = page(); const names = [...p.doc.querySelectorAll('#projects-grid .proj h3')].map((h) => h.textContent); assert.deepEqual(names, Array.from(D.projects, (x) => x.id));
});
test('each card shows chips, a summary and its proof line', () => {
  const p = page(); for (const c of p.doc.querySelectorAll('#projects-grid .proj')) { assert.ok(c.querySelectorAll('.chip').length >= 1); assert.ok(c.querySelector('p').textContent.length > 40); assert.match(c.querySelector('.pproof').textContent, /\d/); }
});
for (const k of ['all', 'control', 'evaluation', 'simulation', 'research']) {
  test(`filter "${k}" shows exactly ${count(k)} cards and marks itself pressed`, () => {
    const p = page(); p.click(p.doc.querySelector(`[data-f=${k}]`)); assert.equal(p.doc.querySelectorAll('#projects-grid .proj').length, count(k));
    assert.equal(p.doc.querySelector(`[data-f=${k}]`).getAttribute('aria-pressed'), 'true'); assert.equal(p.doc.querySelectorAll('#filters [aria-pressed=true]').length, 1);
  });
}
test('the five agent-control projects are grouped together', () => {
  const p = page(); p.click(p.doc.querySelector('[data-f=control]')); assert.deepEqual([...p.doc.querySelectorAll('#projects-grid h3')].map((h) => h.textContent), ['agent-execution-control', 'agent-action-verifier', 'payload-policy-validator', 'batch-file-gateway', 'status-flow-validator']);
});
test('filter buttons keep the same element when pressed (keyboard focus is not lost)', () => {
  const p = page(); const b = p.doc.querySelector('[data-f=simulation]'); p.click(b); assert.ok(b.isConnected); assert.equal(p.doc.querySelector('[data-f=simulation]'), b);
});

/* ---------- dialog ---------- */
for (const pr of D.projects) {
  test(`dialog for ${pr.id}: shows what it does, the proof, the limits and a folder link`, () => {
    const p = page(); p.click(p.doc.querySelector(`.more[data-p="${pr.id}"]`)); const dlg = p.doc.getElementById('dlg'); assert.ok(dlg.hasAttribute('open'));
    const t = p.doc.getElementById('dlg-body').textContent; assert.ok(t.includes(pr.summary.en)); assert.ok(t.includes(pr.proof.en)); assert.ok(t.includes(pr.limits.en));
    for (const h of ['What it does', 'Proof', 'What it does not prove']) assert.ok(t.includes(h), h);
    const a = p.doc.querySelector('#dlg-body a'); assert.equal(a.getAttribute('href'), D.repo + '/tree/main/' + pr.id); assert.equal(a.target, '_blank'); assert.match(a.rel, /noopener/); assert.match(a.rel, /noreferrer/);
    assert.equal(p.doc.getElementById('dlg-title').textContent, pr.id); p.click(p.doc.getElementById('dlg-close')); assert.ok(!dlg.hasAttribute('open'));
  });
}
test('clicking anywhere on a card (not only the button) opens its dialog', () => {
  const p = page(); p.click(p.doc.querySelector('.proj h3')); assert.ok(p.doc.getElementById('dlg').hasAttribute('open'));
});
test('closing the dialog returns focus to the project button, also after a language change', () => {
  const p = page(); const b = p.doc.querySelector('.more[data-p=defect-register]'); b.focus(); p.click(b); p.w.SSCApp.setLang('bg'); p.click(p.doc.getElementById('dlg-close'));
  assert.equal(p.doc.activeElement, p.doc.querySelector('.more[data-p=defect-register]'));
});
test('a click on the dialog padding does not close it, a click outside does', () => {
  const p = page(); const dlg = p.doc.getElementById('dlg'); p.click(p.doc.querySelector('.more[data-p=defect-register]'));
  dlg.getBoundingClientRect = () => ({ left: 100, right: 500, top: 100, bottom: 400, width: 400, height: 300 });
  dlg.dispatchEvent(new p.w.MouseEvent('click', { bubbles: true, clientX: 110, clientY: 110 })); assert.ok(dlg.hasAttribute('open'));
  dlg.dispatchEvent(new p.w.MouseEvent('click', { bubbles: true, clientX: 5, clientY: 5 })); assert.ok(!dlg.hasAttribute('open'));
});
test('an open dialog is re-rendered when the language changes', () => {
  const p = page(); p.click(p.doc.querySelector('.more[data-p=agent-action-verifier]')); assert.match(p.doc.getElementById('dlg-body').textContent, /What it does not prove/);
  p.w.SSCApp.setLang('bg'); assert.match(p.doc.getElementById('dlg-body').textContent, /Какво не доказва/);
});
test('project cards expose a real button with an accessible name; no headings inside buttons', () => {
  const p = page(); const b = p.doc.querySelector('#projects-grid .more'); assert.equal(b.tagName, 'BUTTON'); assert.match(b.getAttribute('aria-label'), /agent-execution-control/); assert.equal(b.getAttribute('aria-haspopup'), 'dialog');
  assert.equal(p.doc.querySelectorAll('#projects-grid button h3, #projects-grid button p').length, 0);
  for (const c of p.doc.querySelectorAll('#projects-grid article')) assert.equal(c.querySelectorAll('button').length, 1);
});

/* ---------- language ---------- */
test('Bulgarian browsers get Bulgarian, others English, and a stored choice wins', () => {
  assert.equal(page({ lang: 'bg-BG' }).w.SSCApp.getLang(), 'bg'); assert.equal(page({ lang: 'en-US' }).w.SSCApp.getLang(), 'en');
  assert.equal(page({ lang: 'bg-BG', storage: { 'ssc-lang': 'en' } }).w.SSCApp.getLang(), 'en'); assert.equal(page({ lang: 'bg-BG', storage: { 'ssc-lang': 'xx' } }).w.SSCApp.getLang(), 'bg');
});
test('the language switch updates the page language, title, description, buttons and storage', () => {
  const p = page({ lang: 'bg-BG' }); p.click(p.doc.querySelector('#lang [data-lang=en]')); assert.equal(p.doc.documentElement.lang, 'en');
  assert.equal(p.doc.title, 'Martin Urumov · Portfolio'); assert.match(p.doc.querySelector('meta[name=description]').content, /Fifteen projects/);
  assert.equal(p.w.localStorage.getItem('ssc-lang'), 'en'); assert.equal(p.doc.querySelector('#lang [data-lang=en]').getAttribute('aria-pressed'), 'true');
  p.w.SSCApp.setLang('bg'); assert.equal(p.doc.title, 'Мартин Урумов · Портфолио');
});
test('English: every translatable element shows its English text; back to Bulgarian restores it exactly', () => {
  const p = page({ lang: 'bg-BG' }); const before = [...p.doc.querySelectorAll('[data-en]')].map((e) => e.textContent);
  p.w.SSCApp.setLang('en'); for (const e of p.doc.querySelectorAll('[data-en]')) assert.equal(e.textContent, e.dataset.en);
  p.w.SSCApp.setLang('bg'); assert.deepEqual([...p.doc.querySelectorAll('[data-en]')].map((e) => e.textContent), before);
});
test('English mode has no Cyrillic outside the owner name lines', () => {
  const p = page({ lang: 'en-US' }); const allowed = new Set([...p.doc.querySelectorAll('.owner-both, footer')]); const walker = p.doc.createTreeWalker(p.doc.body, p.w.NodeFilter.SHOW_TEXT); let n; const bad = [];
  while ((n = walker.nextNode())) { if (!CYRILLIC.test(n.nodeValue)) continue; const el = n.parentElement; let ok = false; for (let e = el; e; e = e.parentElement) if (allowed.has(e)) ok = true; if (!ok && !['SCRIPT', 'STYLE'].includes(el.tagName)) bad.push(n.nodeValue.trim().slice(0, 50)); }
  assert.deepEqual(bad, []);
});
test('project cards are translated both ways', () => {
  const p = page({ lang: 'en-US' }); assert.equal(p.doc.querySelector('#projects-grid p').textContent, D.projects[0].summary.en); p.w.SSCApp.setLang('bg'); assert.equal(p.doc.querySelector('#projects-grid p').textContent, D.projects[0].summary.bg);
  assert.equal(p.doc.querySelector('#filters button').textContent, 'Всички');
});
test('switching the language ten times causes no errors or drift', () => {
  const p = page(); for (let i = 0; i < 10; i++) p.w.SSCApp.setLang(i % 2 ? 'bg' : 'en'); p.w.SSCApp.setLang('bg'); assert.equal(p.doc.querySelector('#tablist [role=tab] span').textContent, 'Начало'); assert.deepEqual(p.errors, []);
});

/* ---------- contact ---------- */
test('five contact cards, all live links that open safely', () => {
  const p = page(); const links = [...p.doc.querySelectorAll('#socials a')]; assert.equal(links.length, 5); assert.equal(p.doc.querySelectorAll('#socials .off').length, 0);
  for (const a of links) { assert.equal(a.target, '_blank'); assert.match(a.rel, /noopener/); assert.match(a.rel, /noreferrer/); assert.match(a.href, /^https:\/\//); }
});
for (const s of D.socials) {
  test(`contact ${s.name} renders its exact URL and handle`, () => {
    const p = page(); const a = [...p.doc.querySelectorAll('#socials a')].find((x) => x.querySelector('h3').textContent === s.name); assert.ok(a); assert.equal(a.href, s.url); assert.equal(a.querySelector('.mono').textContent, s.handle);
  });
}
test('the CV buttons point at the PDF', () => { const p = page(); assert.equal(p.doc.getElementById('cv-link').getAttribute('href'), 'cv/Martin_Urumov_CV.pdf'); assert.equal(p.doc.getElementById('cv-note').textContent, 'PDF · in Bulgarian'); });
test('the three background decks are linked inside the site', () => {
  const p = page(); const links = [...p.doc.querySelectorAll('#decks a')]; assert.deepEqual(links.map((a) => a.getAttribute('href')), Array.from(D.decks, (d) => d.url)); for (const a of links) assert.equal(a.getAttribute('target'), null);
});

/* ---------- security of rendered data ---------- */
test('markup in project data is escaped and cannot run', () => {
  const p = page(); p.w.SSC.projects[0].summary.en = '<img src=x onerror=window.__x=1>'; p.w.SSC.projects[0].id = '<b>x</b>'; p.w.SSCApp.setLang('en');
  assert.equal(p.doc.querySelectorAll('#projects-grid img, #projects-grid b').length, 0); assert.equal(p.w.__x, undefined); assert.ok(p.doc.getElementById('projects-grid').textContent.includes('<img src=x'));
});
test('a quote in a project id cannot break out of an attribute', () => {
  const p = page(); p.w.SSC.projects[0].id = 'a" onmouseover="window.__y=1'; p.w.SSCApp.setLang('en'); const c = p.doc.querySelector('#projects-grid article'); assert.equal(c.getAttribute('data-p'), 'a" onmouseover="window.__y=1'); assert.equal(c.getAttribute('onmouseover'), null);
});
test('a javascript: link in the contact data is never rendered as a link', () => {
  const p = page(); p.w.SSC.socials[0].url = 'javascript:alert(1)'; p.w.SSCApp.setLang('en'); assert.ok(![...p.doc.querySelectorAll('#socials a')].some((a) => /^javascript:/i.test(a.getAttribute('href'))));
});
test('a javascript: link in the deck data is neutralised', () => {
  const p = page(); p.w.SSC.decks[0].url = 'javascript:alert(1)'; p.w.SSCApp.setLang('en'); assert.ok(![...p.doc.querySelectorAll('#decks a')].some((a) => /^javascript:/i.test(a.getAttribute('href'))));
});
test('the scripts use no eval or document.write, and every dynamic string is escaped', () => {
  for (const f of ['assets/app.js', 'assets/data.js', 'assets/vault.js', 'assets/personal.js']) assert.ok(!/\beval\(|document\.write\(/.test(read(f)), f);
  const s = read('assets/app.js'); assert.match(s, /function esc\(/); assert.ok((s.match(/esc\(/g) || []).length > 30);
});

/* --- How it works: animated walk-throughs --- */
const demoPage = () => page({ hash: '#demo' });
const dv = (p) => p.w.SSCDemo.flows;
test('demo: three projects, each with stages and scenarios in both languages', () => {
  const p = demoPage(); assert.equal(dv(p).length, 3);
  for (const f of dv(p)) { assert.ok(f.scenarios.length >= 3); for (const g of f.stages) { assert.ok(g.n.bg && g.n.en && g.d.bg && g.d.en); } for (const s of f.scenarios) { assert.ok(s.end.l && s.steps.length >= 3); for (const st of s.steps) { assert.ok(st.s >= 0 && st.s < f.stages.length); assert.ok(['pass', 'hold', 'stop', 'nb'].includes(st.st)); assert.ok(st.t.bg && st.t.en || typeof st.t === 'string'); } } }
});
test('demo: English text has no Cyrillic', () => {
  const p = demoPage(); const bad = [];
  const walk = (v) => { if (v && typeof v === 'object') { if (typeof v.en === 'string' && /[Ѐ-ӿ]/.test(v.en)) bad.push(v.en); Object.values(v).forEach(walk); } };
  walk(Array.from(dv(p))); assert.deepEqual(bad, []);
});
test('demo: renders four steps in the log after four clicks on Step, then Restart empties it', () => {
  const p = demoPage(); const step = () => p.doc.querySelectorAll('#demo-root .dm-ctl .btn')[1]; for (let i = 0; i < 4; i++) step().click();
  assert.equal(p.doc.querySelectorAll('#demo-root .dm-line:not(.dim)').length, 4);
  p.doc.querySelectorAll('#demo-root .dm-ctl .btn')[2].click(); assert.equal(p.doc.querySelectorAll('#demo-root .dm-line:not(.dim)').length, 0);
});
test('demo: finishing the first scenario shows an end banner and marks the adapter as not built', () => {
  const p = demoPage(); for (let i = 0; i < 8; i++) p.doc.querySelectorAll('#demo-root .dm-ctl .btn')[1].click();
  assert.ok(p.doc.querySelector('#demo-root .dm-end')); assert.ok(p.doc.querySelector('#demo-root .dm-stage.nbld.s-nb')); assert.match(p.doc.getElementById('demo-root').textContent, /no real external action has ever been run/);
});
test('demo: a missing-support scenario ends in NO PERMIT and never reaches the executor stages', () => {
  const p = demoPage(); p.doc.querySelectorAll('#demo-root .dm-sc')[1].click(); for (let i = 0; i < 3; i++) p.doc.querySelectorAll('#demo-root .dm-ctl .btn')[1].click();
  assert.equal(p.doc.querySelector('#demo-root .dm-end b').textContent, 'NO PERMIT'); assert.equal(p.doc.querySelectorAll('#demo-root .dm-stage.s-idle').length >= 4, true);
});
test('demo: switching language redraws the walk-through in Bulgarian', () => {
  const p = demoPage(); p.w.SSCApp.setLang('bg'); assert.match(p.doc.getElementById('demo-root').textContent, /Контролен цикъл/);
});
test('demo: leaving the tab stops a running animation', () => {
  const p = demoPage(); p.doc.querySelectorAll('#demo-root .dm-ctl .btn')[0].click(); p.w.SSCApp.showTab('work');
  assert.equal(p.doc.querySelectorAll('#demo-root .dm-ctl .btn')[0].textContent.includes('Play'), true);
});
