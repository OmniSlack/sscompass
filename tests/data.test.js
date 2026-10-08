'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { loadData, read, ROOT } = require('./helpers');

const D = loadData();
const bilingual = (v) => v && typeof v.bg === 'string' && typeof v.en === 'string' && v.bg.trim() !== '' && v.en.trim() !== '';

test('owner name exists in Bulgarian and English', () => {
  assert.equal(D.owner.bg, 'Мартин Урумов');
  assert.equal(D.owner.en, 'Martin Urumov');
});

test('CV file is referenced, exists and is a PDF', () => {
  assert.equal(D.cv.url, 'cv/Martin_Urumov_CV.pdf');
  const buf = fs.readFileSync(path.join(ROOT, D.cv.url));
  assert.equal(buf.slice(0, 5).toString(), '%PDF-');
  assert.ok(buf.length > 10000);
});

test('CV note is bilingual', () => assert.ok(bilingual(D.cv.note)));

test('exactly four AIs with unique ids', () => {
  assert.deepEqual(Array.from(D.ais, (a) => a.id), ['claude', 'gpt', 'codex', 'gemini']);
});

for (const a of ['claude', 'gpt', 'codex', 'gemini']) {
  test(`AI ${a}: accent colours are three 0-255 integers`, () => {
    const ai = D.ais.find((x) => x.id === a);
    for (const key of ['accent', 'accent2']) {
      const parts = ai[key].split(' ').map(Number);
      assert.equal(parts.length, 3);
      parts.forEach((n) => assert.ok(Number.isInteger(n) && n >= 0 && n <= 255, `${a}.${key}`));
    }
    assert.ok(ai.name && ai.sub);
  });
}

test('Claude and Codex use different accent colours', () => {
  const g = (id) => D.ais.find((a) => a.id === id).accent;
  assert.notEqual(g('claude'), g('codex'));
});

test('project ids are unique', () => {
  const ids = D.projects.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('there are ten projects and none is the employer project', () => {
  assert.equal(D.projects.length, 10);
  assert.ok(!D.projects.some((p) => /dzjin|dzhin|broadcapp/i.test(p.id + p.name)));
});

test('JDK and automation tool folders are not listed as projects', () => {
  assert.ok(!D.projects.some((p) => /jdk/i.test(p.name) || p.name === 'automation'));
});

const TAGS = ['ai', 'java', 'unity', 'learn'];
for (const p of D.projects) {
  test(`project ${p.id}: required fields exist and are bilingual`, () => {
    assert.ok(p.name && p.name.trim());
    assert.ok(bilingual(p.status), 'status');
    assert.ok(bilingual(p.summary), 'summary');
    assert.ok(p.chips.length >= 1 && p.chips.every(bilingual), 'chips');
    assert.ok(p.details.length >= 1 && p.details.every(bilingual), 'details');
  });
  test(`project ${p.id}: tags valid and English differs from Bulgarian`, () => {
    assert.ok(p.tags.length >= 1 && p.tags.every((t) => TAGS.includes(t)));
    assert.notEqual(p.summary.bg, p.summary.en);
    assert.ok(!/[\u0400-\u04FF]/.test(p.summary.en), 'English summary has no Cyrillic');
    p.details.forEach((d) => assert.ok(!/[\u0400-\u04FF]/.test(d.en), 'English detail has no Cyrillic'));
  });
}

test('only sk15_automation has an outgoing project link, and it is on the owner GitHub', () => {
  const withLinks = D.projects.filter((p) => p.links);
  assert.deepEqual(Array.from(withLinks, (p) => p.id), ['sk15']);
  assert.ok(withLinks[0].links.every((l) => l.url.startsWith('https://github.com/OmniSlack/') && bilingual(l.label)));
});

test('GapInTheGap states its content is not published', () => {
  const p = D.projects.find((x) => x.id === 'gapinthegap');
  assert.ok(p.details.some((d) => /не се публикува/.test(d.bg) && /not published/.test(d.en)));
});

test('OmniEcho Core is described without a link (repository is not public)', () => {
  const p = D.projects.find((x) => x.id === 'omniecho-core');
  assert.ok(p && !p.links);
  assert.ok(/STOP > HOLD > CLEAR/.test(p.summary.en));
});

test('eight skill domains', () => assert.equal(D.domains.length, 8));
D.domains.forEach((d, i) => {
  test(`domain #${i + 1} (${d.name.en}): bilingual fields and valid kind`, () => {
    for (const k of ['name', 'task', 'note', 'auto']) assert.ok(bilingual(d[k]), k);
    assert.match(d.skill, /^\/[a-z-]+$/);
    assert.ok(['time', 'event', 'manual'].includes(d.kind));
  });
});
test('domain skill commands are unique', () => {
  assert.equal(new Set(D.domains.map((d) => d.skill)).size, D.domains.length);
});
test('exactly one domain is manual on purpose (Clients)', () => {
  const m = D.domains.filter((d) => d.kind === 'manual');
  assert.equal(m.length, 1); assert.equal(m[0].name.en, 'Clients');
});

test('eight platform entries with unique names', () => {
  assert.equal(D.socials.length, 8);
  assert.equal(new Set(D.socials.map((s) => s.name)).size, 8);
});

const EXPECT = {
  'GitHub': ['github.com', 'OmniSlack'],
  'LinkedIn': ['www.linkedin.com', 'martin-urumov'],
  'YouTube': ['www.youtube.com', 'OmniEcho26'],
  'TikTok': ['www.tiktok.com', 'omniecho26'],
  'Facebook': ['www.facebook.com', 'martin.urumov.7']
};
for (const [name, [host, slug]] of Object.entries(EXPECT)) {
  test(`${name}: https link to the right host with the right profile`, () => {
    const s = D.socials.find((x) => x.name === name);
    const u = new URL(s.url);
    assert.equal(u.protocol, 'https:');
    assert.equal(u.hostname, host);
    assert.ok(s.url.includes(slug));
    assert.ok(s.handle.replace(/^@/, '') === slug);
  });
}
test('X, Snapchat and Twitch have no link yet', () => {
  for (const n of ['X / Twitter', 'Snapchat', 'Twitch']) assert.equal(D.socials.find((s) => s.name === n).url, '');
});

/* --- privacy: nothing personal or employer-related ships in the public files --- */
const SHIPPED = ['index.html', 'assets/app.js', 'assets/cores.js', 'assets/data.js', 'assets/style.css'];
for (const [label, re] of [
  ['a phone number', /\+?359[\s-]?8\d/],
  ['a personal e-mail', /@gmail\.com/i],
  ['the employer repository host', /visualstudio\.com|iboris/i],
  ['a home address marker', /\bVarna\b|Варна/],
  ['local disk paths', /[A-Z]:\\\\|D:\\Users|C:\\Users/]
]) {
  test(`shipped files contain no ${label}`, () => {
    for (const f of SHIPPED) assert.ok(!re.test(read(f)), `${f} matches ${re}`);
  });
}
