'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { load, loadData, closeAll } = require('./helpers');
test.after(closeAll);

const D = loadData();
const page = (o) => load(Object.assign({ lang: 'en-US' }, o));

test('the page starts without script errors', () => {
  const p = page(); assert.deepEqual(p.errors, []);
});
test('the clock shows hh:mm:ss', () => {
  const p = page(); assert.match(p.doc.getElementById('clock').textContent, /^\d\d:\d\d:\d\d$/);
});
test('the footer shows the current year', () => {
  const p = page(); assert.equal(p.doc.getElementById('year').textContent, String(new Date().getFullYear()));
});

/* ---------- AI switch ---------- */
test('four AI buttons are rendered, Claude selected first', () => {
  const p = page(); const b = [...p.doc.querySelectorAll('#ai-switch button')];
  assert.deepEqual(b.map((x) => x.textContent), ['CLAUDE', 'GPT', 'CODEX', 'GEMINI']);
  assert.equal(b[0].getAttribute('aria-pressed'), 'true');
});
for (const ai of D.ais) {
  test(`choosing ${ai.name} updates title, subtitle, selection and accent colours`, () => {
    const p = page();
    p.click(p.doc.querySelector(`[data-ai=${ai.id}]`));
    assert.equal(p.doc.getElementById('ai-name').textContent, ai.name);
    assert.equal(p.doc.getElementById('ai-sub').textContent, ai.sub);
    assert.equal(p.doc.querySelector(`[data-ai=${ai.id}]`).getAttribute('aria-pressed'), 'true');
    assert.equal(p.doc.querySelectorAll('#ai-switch [aria-pressed=true]').length, 1);
    assert.equal(p.doc.documentElement.style.getPropertyValue('--accent-rgb'), ai.accent);
    assert.equal(p.doc.documentElement.style.getPropertyValue('--accent2-rgb'), ai.accent2);
    assert.equal(p.w.SSCCore.current().ai, ai.id);
  });
}
test('the chosen AI is remembered', () => {
  const p = page(); p.click(p.doc.querySelector('[data-ai=gemini]'));
  assert.equal(p.w.localStorage.getItem('ssc-ai'), 'gemini');
});
test('a remembered AI is restored on the next visit', () => {
  const p = page({ storage: { 'ssc-ai': 'codex' } });
  assert.equal(p.doc.getElementById('ai-name').textContent, 'CODEX');
});
test('an unknown remembered AI falls back to Claude', () => {
  const p = page({ storage: { 'ssc-ai': 'nope' } });
  assert.equal(p.doc.getElementById('ai-name').textContent, 'CLAUDE');
});

/* ---------- states ---------- */
test('five state buttons plus Auto and Pause', () => {
  const p = page(); assert.equal(p.doc.querySelectorAll('#states button').length, 7);
});
for (const s of ['idle', 'listening', 'working', 'speaking', 'error']) {
  test(`state ${s}: pressed, others released, readout and core updated, auto switched off`, () => {
    const p = page();
    p.click(p.doc.querySelector(`[data-s=${s}]`));
    assert.equal(p.doc.querySelector(`[data-s=${s}]`).getAttribute('aria-pressed'), 'true');
    assert.equal(p.doc.querySelectorAll('#states [data-s][aria-pressed=true]').length, 1);
    assert.equal(p.w.SSCCore.current().state, s);
    assert.match(p.doc.getElementById('readout').textContent, new RegExp(p.doc.querySelector(`[data-s=${s}]`).textContent.toLowerCase()));
    assert.equal(p.doc.getElementById('auto').getAttribute('aria-pressed'), 'false');
  });
}
test('Auto is on by default and can be toggled', () => {
  const p = page(); const a = p.doc.getElementById('auto');
  assert.equal(a.getAttribute('aria-pressed'), 'true');
  p.click(a); assert.equal(p.doc.getElementById('auto').getAttribute('aria-pressed'), 'false');
  p.click(p.doc.getElementById('auto')); assert.equal(p.doc.getElementById('auto').getAttribute('aria-pressed'), 'true');
});
test('Pause toggles the core', () => {
  const p = page(); const before = p.w.SSCCore.isPaused();
  p.click(p.doc.getElementById('pause'));
  assert.equal(p.w.SSCCore.isPaused(), !before);
  assert.equal(p.doc.getElementById('pause').getAttribute('aria-pressed'), String(!before));
});
test('reduced-motion users get a paused core and no auto cycling', () => {
  const p = page({ reduce: true });
  assert.equal(p.w.SSCCore.isPaused(), true);
  assert.equal(p.doc.getElementById('auto').getAttribute('aria-pressed'), 'false');
});
test('the state buttons are still pressed correctly after a language change', () => {
  const p = page(); p.click(p.doc.querySelector('[data-s=working]')); p.w.SSCApp.setLang('bg');
  assert.equal(p.doc.querySelector('[data-s=working]').getAttribute('aria-pressed'), 'true');
});

/* ---------- routing example ---------- */
test('three example requests are offered, the first selected', () => {
  const p = page(); const b = p.doc.querySelectorAll('#picks button');
  assert.equal(b.length, 3); assert.equal(b[0].getAttribute('aria-pressed'), 'true');
});
for (let i = 0; i < 3; i++) {
  test(`example ${i + 1}: three bars, shares add up to 100, the winner is the largest`, () => {
    const p = page(); p.click(p.doc.querySelectorAll('#picks button')[i]);
    const bars = [...p.doc.querySelectorAll('#bars .bar')];
    assert.equal(bars.length, 3);
    const vals = bars.map((b) => Number(b.querySelector('i').dataset.w));
    assert.equal(vals.reduce((a, b) => a + b, 0), 100);
    const win = vals.indexOf(Math.max(...vals));
    bars.forEach((b, k) => assert.equal(b.classList.contains('win'), k === win));
    assert.match(p.doc.getElementById('verdict').textContent, /Tier/);
    assert.equal(p.doc.querySelectorAll('#picks [aria-pressed=true]').length, 1);
  });
}
test('the three examples go to three different tiers', () => {
  const p = page(); const wins = [];
  for (let i = 0; i < 3; i++) {
    p.click(p.doc.querySelectorAll('#picks button')[i]);
    wins.push([...p.doc.querySelectorAll('#bars .bar')].findIndex((b) => b.classList.contains('win')));
  }
  assert.deepEqual(wins, [0, 1, 2]);
});

/* ---------- skills ---------- */
test('eight skill cards with four rows each', () => {
  const p = page(); const c = p.doc.querySelectorAll('#domains .dom');
  assert.equal(c.length, 8); c.forEach((x) => assert.equal(x.querySelectorAll('.row').length, 4));
});
test('a skill card highlights on click and releases on the second click', () => {
  const p = page(); const c = () => p.doc.querySelectorAll('#domains .dom')[2];
  p.click(c().querySelector('.row')); assert.ok(c().classList.contains('on'));
  p.click(c().querySelector('.row')); assert.ok(!c().classList.contains('on'));
});
test('only one skill card is highlighted at a time', () => {
  const p = page(); const cs = p.doc.querySelectorAll('#domains .dom');
  p.click(cs[0]); p.click(cs[1]);
  assert.equal(p.doc.querySelectorAll('#domains .dom.on').length, 1);
});
test('skill cards are not tab stops (they are not controls)', () => {
  const p = page();
  for (const c of p.doc.querySelectorAll('#domains .dom')) assert.equal(c.getAttribute('tabindex'), null);
});
test('the highlighted skill card survives a language change', () => {
  const p = page(); p.click(p.doc.querySelectorAll('#domains .dom')[3]); p.w.SSCApp.setLang('bg');
  assert.ok(p.doc.querySelectorAll('#domains .dom')[3].classList.contains('on'));
});

/* ---------- projects ---------- */
const count = (tag) => D.projects.filter((x) => tag === 'all' || x.tags.includes(tag)).length;
for (const tag of ['all', 'ai', 'java', 'unity', 'learn']) {
  test(`filter "${tag}" shows exactly ${count(tag)} project cards`, () => {
    const p = page(); p.click(p.doc.querySelector(`[data-f=${tag}]`));
    assert.equal(p.doc.querySelectorAll('#projects-grid .proj').length, count(tag));
    assert.equal(p.doc.querySelector(`[data-f=${tag}]`).getAttribute('aria-pressed'), 'true');
  });
}
test('each filter shows at least one project', () => {
  for (const t of ['ai', 'java', 'unity', 'learn']) assert.ok(count(t) >= 1);
});
for (const pr of D.projects) {
  test(`project ${pr.name}: opens a dialog with its name, status and summary; closes again`, () => {
    const p = page();
    p.click(p.doc.querySelector(`[data-p="${pr.id}"]`));
    const dlg = p.doc.getElementById('dlg');
    assert.ok(dlg.hasAttribute('open'));
    const body = p.doc.getElementById('dlg-body').textContent;
    assert.ok(body.includes(pr.name)); assert.ok(body.includes(pr.status.en)); assert.ok(body.includes(pr.summary.en));
    assert.equal(p.doc.getElementById('dlg-title').textContent, pr.name);
    p.click(p.doc.getElementById('dlg-close'));
    assert.ok(!dlg.hasAttribute('open'));
  });
}
test('sk15_automation dialog links to GitHub safely; OmniMax has no outgoing link', () => {
  const p = page();
  p.click(p.doc.querySelector('[data-p=sk15]'));
  const a = p.doc.querySelector('#dlg-body a');
  assert.equal(a.href, 'https://github.com/OmniSlack/sk15_automation');
  assert.match(a.rel, /noopener/); assert.match(a.rel, /noreferrer/); assert.equal(a.target, '_blank');
  p.click(p.doc.getElementById('dlg-close'));
  p.click(p.doc.querySelector('[data-p=omnimax]'));
  assert.equal(p.doc.querySelectorAll('#dlg-body a').length, 0);
});
test('clicking the dialog backdrop closes it', () => {
  const p = page(); p.click(p.doc.querySelector('[data-p=nomnom]'));
  p.click(p.doc.getElementById('dlg')); assert.ok(!p.doc.getElementById('dlg').hasAttribute('open'));
});
test('project text is escaped, so markup in data cannot run', () => {
  const p = page();
  p.w.SSC.projects[0].name = '<img src=x onerror=window.__x=1>';
  p.w.SSC.projects[0].summary.en = '<b>bold</b>';
  p.w.SSCApp.setLang('en');
  assert.equal(p.doc.querySelectorAll('#projects-grid img').length, 0);
  assert.equal(p.doc.querySelectorAll('#projects-grid p b').length, 0);
  assert.ok(p.doc.querySelector('#projects-grid').textContent.includes('<img src=x'));
  assert.equal(p.w.__x, undefined);
});

/* ---------- contact ---------- */
test('eight platform cards: five live links and three "soon"', () => {
  const p = page();
  assert.equal(p.doc.querySelectorAll('#socials a.soc').length, 5);
  assert.equal(p.doc.querySelectorAll('#socials .soc.off').length, 3);
});
test('every live platform link opens in a new tab with noopener noreferrer', () => {
  const p = page();
  for (const a of p.doc.querySelectorAll('#socials a')) {
    assert.equal(a.target, '_blank'); assert.match(a.rel, /noopener/); assert.match(a.rel, /noreferrer/);
    assert.match(a.href, /^https:\/\//);
  }
});
for (const s of D.socials.filter((x) => x.url)) {
  test(`platform ${s.name} renders its exact URL and handle`, () => {
    const p = page();
    const a = [...p.doc.querySelectorAll('#socials a')].find((x) => x.querySelector('h3').textContent === s.name);
    assert.ok(a); assert.equal(a.href, s.url); assert.equal(a.querySelector('.mono').textContent, s.handle);
  });
}
test('a non-http link in data is never rendered as a link', () => {
  const p = page();
  p.w.SSC.socials[0].url = 'javascript:alert(1)';
  p.w.SSCApp.setLang('en');
  assert.ok(![...p.doc.querySelectorAll('#socials a')].some((a) => /^javascript:/i.test(a.getAttribute('href'))));
});
test('the CV button points to the PDF', () => {
  const p = page(); assert.equal(p.doc.getElementById('cv-link').getAttribute('href'), 'cv/Martin_Urumov_CV.pdf');
  assert.equal(p.doc.getElementById('cv-note').textContent, 'PDF · in English');
});
