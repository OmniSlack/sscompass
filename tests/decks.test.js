'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadDeck, loadDecks, read, exists, closeAll } = require('./helpers');
test.after(closeAll);

const DK = loadDecks();
const IDS = ['omniecho', 'coherence', 'dream'];
const COUNTS = { omniecho: 16, coherence: 21, dream: 16 };      // slides including the closing and the edition-notes slide
const CYR = /[Ѐ-ӿ]/;
const text = (deck) => JSON.stringify(deck);
const body = (id) => JSON.stringify(DK[id].slides.slice(0, -1));   // every slide except the edition notes
const strings = (o, out = []) => { if (typeof o === 'string') out.push(o); else if (o && typeof o === 'object') Object.values(o).forEach((v) => strings(v, out)); return out; };

/* ---------- data integrity ---------- */
test('three decks exist with the right ids and languages', () => {
  assert.deepEqual(Object.keys(DK), IDS);
  assert.equal(DK.omniecho.lang, 'en'); assert.equal(DK.coherence.lang, 'en'); assert.equal(DK.dream.lang, 'bg');
});
for (const id of IDS) {
  const d = DK[id];
  test(`${id}: ${COUNTS[id]} slides, titled, with a title slide first and edition notes last`, () => {
    assert.equal(d.slides.length, COUNTS[id]);
    assert.ok(d.title && d.sub);
    assert.ok(d.slides[0].hero, 'first slide is the title slide');
    assert.match(d.slides[d.slides.length - 1].title, /Edition notes|Бележки към изданието/);
  });
  test(`${id}: every slide has a title or is a closing slide, and no string is empty`, () => {
    for (const s of d.slides) assert.ok(s.title || s.closing, JSON.stringify(s).slice(0, 60));
    for (const x of strings(d)) assert.ok(x.trim() !== '', 'empty string');
  });
  test(`${id}: every card has a heading or a paragraph`, () => {
    for (const s of d.slides) for (const c of s.cards || []) assert.ok(c.h || c.p || c.items, JSON.stringify(c).slice(0, 60));
  });
  test(`${id}: tones are known`, () => {
    for (const s of d.slides) for (const c of s.cards || []) if (c.tone) assert.ok(['ok', 'warn', 'hold'].includes(c.tone), c.tone);
  });
  test(`${id}: exactly one closing slide at most and it carries lines`, () => {
    const cl = d.slides.filter((s) => s.closing); assert.ok(cl.length <= 1);
    for (const c of cl) assert.ok(c.lines.length >= 4);
  });
}
test('English decks contain no Cyrillic except the owner name', () => {
  for (const id of ['omniecho', 'coherence']) {
    const t = strings(DK[id]).join('\n').replace(/Мартин Урумов/g, '');
    assert.ok(!CYR.test(t), id);
  }
});
test('the Bulgarian deck is written in Bulgarian', () => {
  const t = strings(DK.dream).join(' '); assert.ok((t.match(/[Ѐ-ӿ]/g) || []).length > 1500);
});

/* ---------- corrections that were made to the source decks ---------- */
test('OmniEcho: no stray "Title:" / "Subtitle:" labels, no "Cyty", no "fere", no OPERATI', () => {
  const t = body('omniecho'); for (const bad of ['Title:', 'Subtitle:', 'Cyty', 'fere free', 'OPERATI', 'Automagentes', 'TBUSTED', 'Sosnorni']) assert.ok(!t.includes(bad), bad);
});
test('OmniEcho: the gate slide names gates 3, 4, 6 and 7 and says the others are not covered', () => {
  const s = DK.omniecho.slides.find((x) => /^10:/.test(x.title)); const t = text(s);
  for (const g of ['Gate 3', 'Gate 4', 'Gate 6', 'Gate 7']) assert.ok(t.includes(g), g);
  assert.match(s.note, /1, 2, 5, 8, 9 and 10/);
});
test('OmniEcho: there is a Gate 6 slide for the Dual Observer', () => {
  assert.ok(DK.omniecho.slides.some((s) => /Gate 6: The Dual Observer/.test(s.title)));
});
test('OmniEcho: "16 methods" and "16 rules" are now "16 invariants"', () => {
  const t = body('omniecho'); assert.ok(!/16 methods|16 rules/.test(t)); assert.ok(/16 invariants/.test(t));
});
test('OmniEcho: the five numbers are 16, 10, 8, 5 and 4 on the title slide', () => {
  assert.deepEqual(Array.from(DK.omniecho.slides[0].stats, (x) => x.n), ['16', '10', '8', '5', '4']);
});
test('OmniEcho: "8 nodes" is used consistently (not "8+" or "Ten-Towns")', () => {
  const t = body('omniecho'); assert.ok(!/8\+|Ten-Towns/.test(t));
});
test('OmniEcho: "Universal Engine" became "Synthesis"', () => {
  assert.ok(!/Universal Engine/.test(body('omniecho'))); assert.ok(DK.omniecho.slides.some((s) => s.title === 'Synthesis'));
});
test('OmniEcho: the contradictory formula slide is withdrawn and the notes say why', () => {
  const t = text(DK.omniecho); assert.ok(!/Excitement\s*\]|Excitement −/.test(t.replace(/Withdrawn[\s\S]*$/, '')));
  assert.match(t, /Gap Pressure = Expectation \+ Insistence − Possibility/);
});
test('Coherence: the PostgreSQL evidence is stated correctly (24/24 PostgreSQL, 53/53 unit)', () => {
  const t = text(DK.coherence); assert.match(t, /53 of 53 unit tests and 24 of 24 PostgreSQL tests/);
  assert.ok(!/PostgreSQL atomicity \(53\/53 tests\)/.test(t.replace(/The R4 gate slide said[^"]*/, '')));
});
test('Coherence: the title slide no longer claims "GO / OPERATIONAL"', () => {
  const first = text(DK.coherence.slides[0]); assert.ok(!/OPERATIONAL/.test(first)); assert.match(first, /Prototype/);
});
test('Coherence: "Theory of Everything", "quantum atom" and "NEVER … ONLY" overreach are gone from the slides', () => {
  const slides = text({ s: DK.coherence.slides.slice(0, -1) });
  for (const bad of ['Theory of Everything', 'quantum atom', 'NEVER achieved', 'guaranteed ONLY']) assert.ok(!slides.includes(bad), bad);
});
test('Coherence: contested science is labelled as a working assumption or an analogy', () => {
  const t = text(DK.coherence); assert.match(t, /debated idea in cognitive science/); assert.match(t, /An analogy, not a claim about neuroscience/);
});
test('Coherence: the formula slide uses no numeric formula for Pure Flow', () => {
  const s = DK.coherence.slides.find((x) => x.title === 'Pure Flow'); assert.ok(s); assert.ok(!/[−-]\s*\[/.test(text(s)));
});
test('Coherence: the model slide lists all eight symbols', () => {
  const s = DK.coherence.slides.find((x) => /^The model/.test(x.title)); assert.equal(s.cards.length, 8);
});
test('Coherence: A_t to A_t+1 has six steps', () => {
  const s = DK.coherence.slides.find((x) => /A_t → A_t\+1/.test(x.title)); assert.equal(s.cards.length, 6);
});
test('Coherence: the closing slide keeps the four authority lines and the three invariants', () => {
  const c = DK.coherence.slides.find((x) => x.closing); const t = c.lines.join(' ');
  for (const l of ['PURE FLOW MAY MOVE', 'NAVIGATOR MAY PROPOSE', 'KOMPAS MAY CLEAR', 'ONLY THE HUMAN MAY AUTHORIZE', 'UNKNOWN MUST REMAIN UNKNOWN', 'TRUTH BEFORE SELF-CONSISTENCY', 'NEVER MELT']) assert.ok(t.includes(l), l);
});
test('Dream: "Akami" is now "Akamai" everywhere', () => {
  const t = body('dream'); assert.ok(!/Akami\b/.test(t)); assert.ok((t.match(/Akamai/g) || []).length >= 3);
});
test('Dream: the violent or garbled phrases are gone', () => {
  const t = text({ s: DK.dream.slides.slice(0, -1) });
  for (const bad of ['Kill on sight', 'гниещата', 'терминиране на място', '60% amygdala', '60%', 'Голямата Коза', 'хермитично', '1 = ±1']) assert.ok(!t.includes(bad), bad);
});
test('Dream: both Observers A and B are named on the Zero Trust slide', () => {
  const s = DK.dream.slides.find((x) => /Интегрираната киберзащита/.test(x.title)); const t = text(s);
  assert.ok(t.includes('Наблюдател А') && t.includes('Наблюдател Б'));
});
test('Dream: the Gap timeline has four phases at 6-7, 8-9, 10 and 11 seconds', () => {
  const s = DK.dream.slides.find((x) => /Времевата линия/.test(x.title)); assert.equal(s.cards.length, 4);
  const t = text(s); for (const x of ['6–7 сек', '8–9 сек', '10 сек', '11 сек']) assert.ok(t.includes(x), x);
});
test('Dream: the two recovery levels L1 and L3 and the 4-of-4 rule are present', () => {
  const t = text(DK.dream); assert.ok(t.includes('Ниво L1') && t.includes('Ниво L3')); assert.match(t, /4 от 4/);
});
test('Dream: the 99% / 1% figures are labelled as model parameters', () => {
  const t = text(DK.dream); assert.match(t, /параметри на модела, не измервания/);
});
test('Dream: the notes slide lists what remains for the author to decide', () => {
  const s = DK.dream.slides[DK.dream.slides.length - 1]; assert.ok(s.cards.some((c) => c.h === 'Остава за преценка'));
});
test('every edition-notes slide has a "Fixed"/"corrected" section', () => {
  for (const id of IDS) { const s = DK[id].slides[DK[id].slides.length - 1]; assert.ok(s.cards.length >= 2, id); }
});

/* ---------- the viewer ---------- */
test('the viewer loads the first slide of the first deck without errors', () => {
  const p = loadDeck(''); assert.deepEqual(p.errors, []);
  assert.equal(p.doc.getElementById('dtitle').textContent, 'The OmniEcho Architecture');
  assert.match(p.doc.getElementById('count').textContent, /Slide 1 of 16/);
});
for (const id of IDS) {
  test(`#${id}/1 opens the ${id} deck`, () => {
    const p = loadDeck('#' + id + '/1'); assert.equal(p.doc.getElementById('dtitle').textContent, DK[id].title);
    assert.equal(p.doc.querySelector('#decknav [aria-current=page]').dataset.d, id);
  });
}
test('a hash with a slide number opens that slide', () => {
  const p = loadDeck('#coherence/6'); assert.match(p.doc.getElementById('count').textContent, /Slide 6 of 21/);
  assert.match(p.doc.getElementById('stage').textContent, /Ψ\(t\)/);
});
test('an invalid hash falls back to the first deck and slide', () => {
  const p = loadDeck('#nope/99'); assert.match(p.doc.getElementById('count').textContent, /Slide 1 of 16/);
  const q = loadDeck('#coherence/999'); assert.match(q.doc.getElementById('count').textContent, /Slide 1 of 21/);
});
test('Next and Previous move one slide and are disabled at the ends', () => {
  const p = loadDeck('#omniecho/1'); assert.equal(p.doc.getElementById('prev').disabled, true);
  p.click(p.doc.getElementById('next')); assert.match(p.doc.getElementById('count').textContent, /Slide 2 of 16/);
  p.click(p.doc.getElementById('prev')); assert.match(p.doc.getElementById('count').textContent, /Slide 1 of 16/);
  p.w.SSCDecks.go(15); assert.equal(p.doc.getElementById('next').disabled, true);
});
test('arrow keys, Home and End navigate', () => {
  const p = loadDeck('#omniecho/1'); p.key('ArrowRight'); p.key('ArrowRight'); assert.match(p.doc.getElementById('count').textContent, /Slide 3/);
  p.key('ArrowLeft'); assert.match(p.doc.getElementById('count').textContent, /Slide 2/);
  p.key('End'); assert.match(p.doc.getElementById('count').textContent, /Slide 16/);
  p.key('Home'); assert.match(p.doc.getElementById('count').textContent, /Slide 1 of/);
});
test('navigation cannot go past either end', () => {
  const p = loadDeck('#omniecho/1'); p.key('ArrowLeft'); assert.match(p.doc.getElementById('count').textContent, /Slide 1 of/);
  p.w.SSCDecks.go(999); assert.match(p.doc.getElementById('count').textContent, /Slide 16 of 16/);
  p.key('ArrowRight'); assert.match(p.doc.getElementById('count').textContent, /Slide 16 of 16/);
});
test('the URL hash follows the slide', () => {
  const p = loadDeck('#dream/1'); p.click(p.doc.getElementById('next')); assert.equal(p.w.location.hash, '#dream/2');
});
test('the overview lists every slide and jumps to the chosen one', () => {
  const p = loadDeck('#coherence/1'); const items = p.doc.querySelectorAll('#overview button'); assert.equal(items.length, 21);
  p.click(p.doc.getElementById('over')); assert.equal(p.doc.getElementById('overview').hidden, false);
  p.click(items[9]); assert.match(p.doc.getElementById('count').textContent, /Slide 10 of 21/);
  assert.equal(p.doc.querySelector('#overview [aria-current=true]').dataset.i, '9');
});
test('the viewer UI is Bulgarian in Bulgarian mode and English otherwise', () => {
  const bg = loadDeck('#dream/1', { lang: 'bg-BG' }); assert.equal(bg.doc.getElementById('next').textContent, 'Напред →');
  assert.match(bg.doc.getElementById('count').textContent, /Слайд 1 от 16/);
  const en = loadDeck('#dream/1', { lang: 'en-US' }); assert.equal(en.doc.getElementById('next').textContent, 'Next →');
});
test('switching language updates the buttons, the document language and the stored choice', () => {
  const p = loadDeck('#omniecho/1'); p.click(p.doc.querySelector('#lang [data-lang=bg]'));
  assert.equal(p.doc.documentElement.lang, 'bg'); assert.equal(p.doc.getElementById('prev').textContent, '← Назад');
  assert.equal(p.w.localStorage.getItem('ssc-lang'), 'bg');
});
test('the language chosen on the main site carries over to the deck viewer', () => {
  const p = loadDeck('#omniecho/1', { lang: 'en-US', storage: { 'ssc-lang': 'bg' } }); assert.equal(p.doc.documentElement.lang, 'bg');
});
test('the stage is announced politely and can receive focus after a move', () => {
  const p = loadDeck('#omniecho/1'); assert.equal(p.doc.getElementById('stage').getAttribute('aria-live'), 'polite');
  p.click(p.doc.getElementById('next')); assert.equal(p.doc.activeElement, p.doc.getElementById('stage'));
});
test('the page title names the deck and the owner', () => {
  const p = loadDeck('#coherence/1'); assert.match(p.doc.title, /The Coherence Protocol · SSC Compass · Martin Urumov/);
});
test('slide text is escaped (markup in deck data cannot run)', () => {
  const p = loadDeck('#omniecho/1'); p.w.DECKS.omniecho.slides[1].title = '<img src=x onerror=window.__x=1>';
  p.w.SSCDecks.go(1); assert.equal(p.doc.querySelectorAll('#stage img').length, 0); assert.equal(p.w.__x, undefined);
});
test('the title slide renders its five numbers', () => {
  const p = loadDeck('#omniecho/1'); assert.equal(p.doc.querySelectorAll('#stage .stats div').length, 5);
});
test('a closing slide renders its lines in large type', () => {
  const p = loadDeck('#omniecho/15'); assert.ok(p.doc.querySelector('#stage .closing')); assert.equal(p.doc.querySelectorAll('#stage .closing p').length, 4);
});
test('every slide of every deck renders without errors', () => {
  for (const id of IDS) { const p = loadDeck('#' + id + '/1'); for (let i = 0; i < DK[id].slides.length; i++) { p.w.SSCDecks.go(i); assert.ok(p.doc.getElementById('stage').innerHTML.length > 40, id + ' ' + i); } assert.deepEqual(p.errors, []); }
});

/* ---------- files and security ---------- */
test('the deck page has a CSP, no inline scripts and no third-party requests', () => {
  const h = read('decks/index.html'); assert.match(h, /Content-Security-Policy/); assert.match(h, /script-src 'self'/);
  assert.ok(!/<script(?![^>]*src)/.test(h)); assert.deepEqual(h.match(/https?:\/\/[^"'\s)]+/g) || [], []);
});
test('all files the deck page loads exist', () => {
  for (const f of ['decks/deck.css', 'decks/deck.js', 'decks/data/omniecho.js', 'decks/data/coherence.js', 'decks/data/dream.js', 'assets/style.css', 'assets/fonts.css']) assert.ok(exists(f), f);
});
test('the deck scripts compile and use no eval or document.write', () => {
  const vm = require('vm');
  for (const f of ['decks/deck.js', 'decks/data/omniecho.js', 'decks/data/coherence.js', 'decks/data/dream.js']) { assert.doesNotThrow(() => new vm.Script(read(f))); assert.ok(!/\beval\(|document\.write\(/.test(read(f)), f); }
});
test('the main site links to all three decks', () => {
  const d = read('assets/data.js'); for (const id of IDS) assert.ok(d.includes('decks/index.html#' + id + '/1'), id);
});
