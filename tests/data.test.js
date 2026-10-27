'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadData, read, exists, ROOT } = require('./helpers');

const D = loadData();
const bilingual = (v) => v && typeof v.bg === 'string' && typeof v.en === 'string' && v.bg.trim() !== '' && v.en.trim() !== '';
const FOLDERS = ['agent-execution-control', 'ai-proposal-evaluator', 'agent-action-verifier', 'payload-policy-validator', 'batch-file-gateway', 'status-flow-validator', 'defect-register', 'claim-audit-tools', 'document-claim-checker', 'evidence-retriever', 'agent-threat-model', 'observer-gated-control-sim', 'source-monitoring-pilot-sim', 'keynes-beauty-contest-sim', 'p-vs-np-gap-measurement'];
const KINDS = ['control', 'evaluation', 'simulation', 'research'];

test('owner name exists in Bulgarian and English', () => { assert.equal(D.owner.bg, 'Мартин Урумов'); assert.equal(D.owner.en, 'Martin Urumov'); });
test('CV is referenced, exists and is a PDF', () => {
  assert.equal(D.cv.url, 'cv/Martin_Urumov_CV.pdf'); const b = fs.readFileSync(path.join(ROOT, D.cv.url));
  assert.equal(b.slice(0, 5).toString(), '%PDF-'); assert.ok(b.length > 10000); assert.ok(bilingual(D.cv.note));
});
test('the portfolio repository link points at the owner GitHub', () => { assert.equal(D.repo, 'https://github.com/OmniSlack/martin-urumov-portfolio'); });
test('exactly the fifteen project folders of the portfolio repository are listed, in order', () => {
  assert.deepEqual(Array.from(D.projects, (p) => p.id), FOLDERS);
});
test('project ids are unique', () => { const ids = D.projects.map((p) => p.id); assert.equal(new Set(ids).size, ids.length); });

for (const p of D.projects) {
  test(`project ${p.id}: summary, proof and limits exist in both languages`, () => {
    for (const k of ['summary', 'proof', 'limits']) assert.ok(bilingual(p[k]), k);
  });
  test(`project ${p.id}: tags, chips and points are valid`, () => {
    assert.ok(p.tags.length >= 1 && p.tags.every((t) => KINDS.includes(t)));
    assert.ok(p.chips.length >= 1 && p.chips.every((c) => (typeof c === 'string' && c.trim()) || bilingual(c)));
    assert.ok(Array.isArray(p.points) && p.points.every(bilingual));
  });
  test(`project ${p.id}: English text has no Cyrillic and differs from the Bulgarian`, () => {
    for (const k of ['summary', 'proof', 'limits']) { assert.ok(!/[\u0400-\u04FF]/.test(p[k].en), k); assert.notEqual(p[k].en, p[k].bg, k); }
    for (const x of p.points) assert.ok(!/[\u0400-\u04FF]/.test(x.en));
  });
  test(`project ${p.id}: proof contains at least one number`, () => { assert.match(p.proof.en, /\d/); assert.match(p.proof.bg, /\d/); });
}
test('every kind used by a project appears as a filter, and "all" comes first', () => {
  assert.equal(D.kinds[0].id, 'all'); const ids = D.kinds.map((k) => k.id);
  for (const p of D.projects) for (const t of p.tags) assert.ok(ids.includes(t), t);
  for (const k of D.kinds) assert.ok(bilingual(k.label));
});
test('every filter other than "all" has at least one project', () => {
  for (const k of D.kinds.slice(1)) assert.ok(D.projects.some((p) => p.tags.includes(k.id)), k.id);
});
test('there are three background decks and their pages exist', () => {
  assert.equal(D.decks.length, 3); for (const d of D.decks) { assert.ok(/^decks\/index\.html#(omniecho|coherence|dream)\/1$/.test(d.url)); assert.ok(bilingual(d.note)); }
  assert.ok(exists('decks/index.html'));
});
test('five platform entries, all live https links to the right hosts', () => {
  assert.equal(D.socials.length, 5); const hosts = { GitHub: 'github.com', LinkedIn: 'www.linkedin.com', YouTube: 'www.youtube.com', TikTok: 'www.tiktok.com', Facebook: 'www.facebook.com' };
  for (const s of D.socials) { const u = new URL(s.url); assert.equal(u.protocol, 'https:'); assert.equal(u.hostname, hosts[s.name], s.name); assert.ok(s.handle); }
});
test('nothing unfinished, personal or employer-related is in the public data', () => {
  const t = JSON.stringify(D);
  for (const bad of ['gapinthegap', 'GapInTheGap', 'Kompas', 'NomNom', 'The Game', 'sk15', 'Selenium', 'Snapchat', 'Twitch', 'Dzjin', 'will follow', 'link soon']) assert.ok(!t.includes(bad), bad);
});

/* --- privacy: nothing personal or employer-related ships in the public files --- */
const SHIPPED = ['index.html', 'assets/app.js', 'assets/data.js', 'assets/style.css', 'assets/vault.js', 'assets/personal.js'];
for (const [label, re] of [
  ['a phone number', /\+?359[\s-]?8\d/], ['a personal e-mail', /@gmail\.com/i], ['the employer repository host', /visualstudio\.com|iboris/i],
  ['a home address marker', /\bVarna\b|Варна/], ['local disk paths', /[A-Z]:\\\\|D:\\Users|C:\\Users/], ['the sealed-vault passphrase', /Omnivorous123/]
]) {
  test(`shipped files contain no ${label}`, () => { for (const f of SHIPPED) assert.ok(!re.test(read(f)), `${f} matches ${re}`); });
}

/* --- accuracy: every number in a project's proof appears in that project's own README or evidence.
       Runs only when the portfolio repository sits next to this site (it is private, so CI cannot see it). --- */
const REPO = path.join(ROOT, '..', 'portfolio-repo');
const HAVE = fs.existsSync(path.join(REPO, 'README.md'));
const SKIP = HAVE ? false : 'portfolio-repo not found next to the site';
const numbers = (s) => (s.match(/\d[\d,.]*/g) || []).map((x) => x.replace(/[,.]+$/, '')).filter((x) => x.replace(/[,.]/g, '').length >= 2);
function corpus(folder) {
  let t = ''; const walk = (d, depth) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory() && depth < 3 && f.name !== 'node_modules') walk(p, depth + 1); else if (/\.(md|txt)$/i.test(f.name)) t += fs.readFileSync(p, 'utf8') + '\n'; } };
  walk(path.join(REPO, folder), 0); return t.replace(/(\d),(\d{3})/g, '$1$2');
}
const IGNORE = new Set(['2026', '10', '26', '08', '17', '25']);
for (const p of D.projects) {
  test(`accuracy: every number in the proof of ${p.id} is found in its README or evidence`, { skip: SKIP }, () => {
    const c = corpus(p.id).replace(/(\d)\s(\d{3})\b/g, '$1$2'); const missing = [];
    for (const n of numbers(p.proof.en)) { const plain = n.replace(/,/g, ''); if (IGNORE.has(plain)) continue; if (!c.includes(plain) && !c.includes(n)) missing.push(n); }
    assert.deepEqual(missing, []);
  });
}
test('accuracy: the portfolio repository has all fifteen folders with a README', { skip: SKIP }, () => { for (const f of FOLDERS) assert.ok(fs.existsSync(path.join(REPO, f, 'README.md')), f); });
test('accuracy: the headline numbers on the page match the repository', { skip: SKIP }, () => {
  const readme = fs.readFileSync(path.join(REPO, 'README.md'), 'utf8'); assert.ok(/165/.test(corpus('defect-register'))); assert.ok(/16 gates return a refusal/.test(corpus('ai-proposal-evaluator')));
  assert.ok(/24 \/ 24|24\/24|24 PostgreSQL/.test(corpus('agent-execution-control'))); assert.ok(readme.includes('`ai-proposal-evaluator/`'));
  
});
