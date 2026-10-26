'use strict';
/* The Personal tab: lock screen, create / unlock, platforms, news, notes, unfinished work, vault controls. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { load, closeAll } = require('./helpers');
test.after(closeAll);

const PASS = 'correct horse battery';
const SEED = {
  v: 1,
  platforms: [{ name: 'YouTube', url: 'https://www.youtube.com/@x', handle: '@x', status: 'live', metric: '', note: '' }, { name: 'Twitch', url: '', handle: '', status: 'soon', metric: '', note: '' }],
  news: [], notes: [],
  projects: [{ id: 'nomnom', name: 'NomNom', tags: [], chips: [{ bg: 'Java', en: 'Java' }], status: { bg: 'Проект', en: 'Project' }, summary: { bg: 'Java проект.', en: 'A Java project.' }, details: [{ bg: 'Описанието ще се допълни.', en: 'A description will follow.' }] }],
  openItems: [{ title: { bg: 'Как се свързват', en: 'How they connect' }, items: [{ bg: 'Не е проверено.', en: 'Not tested yet.' }], note: { bg: 'Ръчно.', en: 'Manual.' } }]
};
const page = (o) => load(Object.assign({ lang: 'en-US' }, o));
const wait = (ms = 15) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms = 4000) { const t0 = Date.now(); for (;;) { const v = fn(); if (v) return v; if (Date.now() - t0 > ms) throw new Error('timeout waiting for: ' + fn); await wait(10); } }
const $ = (p, id) => p.doc.getElementById(id);
const setv = (p, id, v) => { $(p, id).value = v; };
const submit = (p, id) => $(p, id).dispatchEvent(new p.w.Event('submit', { bubbles: true, cancelable: true }));
async function openGate(o) { const p = page(o); p.click($(p, 'tab-personal')); await until(() => $(p, 'p-form')); return p; }
async function createVault(p, seed) {
  setv(p, 'p-name', 'omnivorous'); setv(p, 'p-pass', PASS); setv(p, 'p-pass2', PASS);
  if (seed) { const f = new p.w.File([JSON.stringify(seed)], 'vault.json', { type: 'application/json' }); Object.defineProperty($(p, 'p-seed'), 'files', { value: [f] }); }
  submit(p, 'p-form'); await until(() => $(p, 'pmenu'));
}
async function openApp(seed) { const p = await openGate(); await createVault(p, seed === undefined ? SEED : seed); return p; }
const section = async (p, s) => { p.click(p.doc.querySelector(`#pmenu [data-s=${s}]`)); await until(() => $(p, 'pview').innerHTML.length > 0); };
const text = (p) => $(p, 'p-root').textContent;

/* ---------- the lock screen ---------- */
test('without a vault the Personal tab offers to create one', async () => {
  const p = await openGate(); assert.match(text(p), /Create your personal vault/); assert.ok($(p, 'p-pass2')); assert.ok($(p, 'p-seed'));
});
test('the lock screen shows no personal data', async () => {
  const p = await openGate(); assert.ok(!/NomNom|YouTube|Twitch|notes/i.test(text(p).replace(/personal|notes to/gi, '')));
});
test('a weak passphrase is refused with a message', async () => {
  const p = await openGate(); setv(p, 'p-name', 'omnivorous'); setv(p, 'p-pass', 'short'); setv(p, 'p-pass2', 'short'); submit(p, 'p-form'); await until(() => $(p, 'p-msg').textContent);
  assert.match($(p, 'p-msg').textContent, /at least 8/); assert.ok(!$(p, 'pmenu'));
});
test('two different passphrases are refused', async () => {
  const p = await openGate(); setv(p, 'p-name', 'omnivorous'); setv(p, 'p-pass', PASS); setv(p, 'p-pass2', PASS + 'x'); submit(p, 'p-form'); await until(() => $(p, 'p-msg').textContent);
  assert.match($(p, 'p-msg').textContent, /do not match/); assert.ok(!$(p, 'pmenu'));
});
test('creating a vault opens the five-section personal menu', async () => {
  const p = await openApp(null); const names = [...p.doc.querySelectorAll('#pmenu button')].map((b) => b.textContent);
  assert.deepEqual(names, ['Platforms', 'News', 'Notes', 'In progress', 'Vault']); assert.equal(p.doc.querySelector('#pmenu [aria-current=true]').dataset.s, 'platforms');
});
test('loading vault.json while creating fills the platforms and the unfinished work', async () => {
  const p = await openApp(); assert.equal(p.doc.querySelectorAll('#pview .pf').length, 2); await section(p, 'progress'); assert.match(text(p), /NomNom/);
});
test('a broken starter file is refused', async () => {
  const p = await openGate(); setv(p, 'p-name', 'omnivorous'); setv(p, 'p-pass', PASS); setv(p, 'p-pass2', PASS);
  Object.defineProperty($(p, 'p-seed'), 'files', { value: [new p.w.File(['{not json'], 'vault.json')] }); submit(p, 'p-form'); await until(() => $(p, 'p-msg').textContent);
  assert.match($(p, 'p-msg').textContent, /not valid JSON/); assert.ok(!$(p, 'pmenu'));
});
test('with a vault on the device the screen asks for the passphrase, and a wrong one is refused', async () => {
  const a = await openApp(); const stored = a.w.localStorage.getItem('ssc-vault');
  const b = await openGate({ storage: { 'ssc-vault': stored } }); assert.match(text(b), /Unlock personal control/); assert.ok(!$(b, 'p-pass2'));
  setv(b, 'p-name', 'omnivorous'); setv(b, 'p-pass', 'wrong wrong wrong'); submit(b, 'p-form'); await until(() => $(b, 'p-msg').textContent); assert.match($(b, 'p-msg').textContent, /Wrong passphrase/); assert.ok(!$(b, 'pmenu'));
});
test('the right passphrase unlocks and shows the saved data', async () => {
  const a = await openApp(); const stored = a.w.localStorage.getItem('ssc-vault');
  const b = await openGate({ storage: { 'ssc-vault': stored } }); setv(b, 'p-name', 'omnivorous'); setv(b, 'p-pass', PASS); submit(b, 'p-form'); await until(() => $(b, 'pmenu'));
  assert.equal(b.doc.querySelectorAll('#pview .pf').length, 2);
});
test('leaving the tab locks it; coming back asks for the passphrase again', async () => {
  const p = await openApp(); p.click($(p, 'tab-method')); assert.equal($(p, 'p-root').innerHTML, ''); p.click($(p, 'tab-personal')); await until(() => $(p, 'p-form'));
  assert.match(text(p), /Unlock/); assert.ok(!$(p, 'pmenu'));
});
test('forgetting the device needs two presses', async () => {
  const p = await openApp(); await section(p, 'vault'); p.click($(p, 'v-forget')); assert.ok(p.w.SSCVault.hasLocal()); assert.match($(p, 'p-msg').textContent, /Press again/);
  p.click($(p, 'v-forget')); await until(() => $(p, 'p-form')); assert.equal(p.w.SSCVault.hasLocal(), false);
});
test('Lock now returns to the lock screen', async () => {
  const p = await openApp(); await section(p, 'vault'); p.click($(p, 'v-lock')); await until(() => $(p, 'p-form')); assert.equal(p.w.SSCVault.isOpen(), false);
});
test('export produces a sealed file with no readable data', async () => {
  const p = await openApp(); await section(p, 'vault'); p.click($(p, 'v-export')); await until(() => p.w.SSCPersonal._lastExport);
  const t = p.w.SSCPersonal._lastExport; assert.ok(!t.includes('NomNom') && !t.includes('youtube')); assert.ok(JSON.parse(t).data);
});

/* ---------- platforms ---------- */
test('platforms: all eight can be kept, the live and the unfinished ones included', async () => {
  const eight = { platforms: ['GitHub', 'LinkedIn', 'YouTube', 'TikTok', 'Facebook', 'X / Twitter', 'Snapchat', 'Twitch'].map((n, i) => ({ name: n, url: i < 5 ? 'https://x.test/' + i : '', handle: '', status: i < 5 ? 'live' : 'soon', metric: '', note: '' })) };
  const p = await openApp(eight); assert.equal(p.doc.querySelectorAll('#pview .pf').length, 8);
  const soon = [...p.doc.querySelectorAll('#pview .pf select')].filter((s) => s.value === 'soon').length; assert.equal(soon, 3);
});
test('editing a handle is saved in the vault', async () => {
  const p = await openApp(); const inp = p.doc.querySelector('#pview [data-pf="0"][data-f="handle"]'); inp.value = '@changed';
  inp.dispatchEvent(new p.w.Event('change', { bubbles: true })); await wait(40); assert.equal(p.w.SSCVault.get().platforms[0].handle, '@changed');
});
test('a non-https link typed into a platform is dropped', async () => {
  const p = await openApp(); const inp = p.doc.querySelector('#pview [data-pf="0"][data-f="url"]'); inp.value = 'javascript:alert(1)';
  inp.dispatchEvent(new p.w.Event('change', { bubbles: true })); await wait(40); assert.equal(p.w.SSCVault.get().platforms[0].url, '');
});
test('changing the status of a platform is saved', async () => {
  const p = await openApp(); const sel = p.doc.querySelector('#pview [data-pf="1"][data-f="status"]'); sel.value = 'live'; sel.dispatchEvent(new p.w.Event('change', { bubbles: true })); await wait(40);
  assert.equal(p.w.SSCVault.get().platforms[1].status, 'live');
});

/* ---------- notes ---------- */
test('notes: add, mark done, delete', async () => {
  const p = await openApp(); await section(p, 'notes'); assert.match(text(p), /No notes yet/);
  setv(p, 'n-text', 'call the bank'); submit(p, 'n-form'); await until(() => p.doc.querySelector('[data-ndone]')); assert.match(text(p), /call the bank/);
  const cb = p.doc.querySelector('[data-ndone]'); cb.checked = true; cb.dispatchEvent(new p.w.Event('change', { bubbles: true })); await until(() => p.doc.querySelector('.pitem.done'));
  p.click(p.doc.querySelector('[data-ndel]')); await until(() => /No notes yet/.test(text(p)));
});
test('an empty note is not added', async () => {
  const p = await openApp(); await section(p, 'notes'); setv(p, 'n-text', '   '); submit(p, 'n-form'); await wait(40); assert.equal(p.w.SSCVault.get().notes.length, 0);
});
test('notes survive locking and unlocking', async () => {
  const p = await openApp(); await section(p, 'notes'); setv(p, 'n-text', 'remember this'); submit(p, 'n-form'); await until(() => p.doc.querySelector('[data-ndone]'));
  const stored = p.w.localStorage.getItem('ssc-vault'); const q = await openGate({ storage: { 'ssc-vault': stored } }); setv(q, 'p-name', 'omnivorous'); setv(q, 'p-pass', PASS); submit(q, 'p-form'); await until(() => $(q, 'pmenu'));
  await section(q, 'notes'); assert.match(text(q), /remember this/);
});
test('note text is shown as text, never as markup', async () => {
  const p = await openApp(); await section(p, 'notes'); setv(p, 'n-text', '<img src=x onerror=window.__n=1>'); submit(p, 'n-form'); await until(() => p.doc.querySelector('[data-ndone]'));
  assert.equal(p.doc.querySelectorAll('#pview img').length, 0); assert.equal(p.w.__n, undefined); assert.match(text(p), /<img src=x/);
});
test('unfinished notes sort above finished ones', async () => {
  const p = await openApp(); await section(p, 'notes');
  for (const t of ['first', 'second']) { setv(p, 'n-text', t); submit(p, 'n-form'); await wait(30); }
  await until(() => p.doc.querySelectorAll('[data-ndone]').length === 2);
  const cbs = [...p.doc.querySelectorAll('[data-ndone]')]; const topId = cbs[0].dataset.ndone; cbs[0].checked = true; cbs[0].dispatchEvent(new p.w.Event('change', { bubbles: true })); await wait(60);
  const after = [...p.doc.querySelectorAll('[data-ndone]')]; assert.notEqual(after[0].dataset.ndone, topId); assert.equal(after[1].dataset.ndone, topId);
});

/* ---------- news ---------- */
test('news: add an item with a link, newest first, delete', async () => {
  const p = await openApp(); await section(p, 'news'); assert.match(text(p), /No news yet/);
  setv(p, 'w-title', 'Older'); submit(p, 'w-form'); await until(() => p.doc.querySelector('[data-wdel]')); await wait(5);
  setv(p, 'w-title', 'Newer'); setv(p, 'w-source', 'Claude'); setv(p, 'w-url', 'https://news.test/a'); setv(p, 'w-text', 'summary'); submit(p, 'w-form'); await until(() => p.doc.querySelectorAll('[data-wdel]').length === 2);
  const heads = [...p.doc.querySelectorAll('#pview article h3')].map((h) => h.textContent); assert.deepEqual(heads, ['Newer', 'Older']);
  const a = p.doc.querySelector('#pview article a'); assert.equal(a.getAttribute('href'), 'https://news.test/a'); assert.match(a.rel, /noopener/); assert.equal(a.target, '_blank');
  p.click(p.doc.querySelector('[data-wdel]')); await until(() => p.doc.querySelectorAll('[data-wdel]').length === 1);
});
test('news: a javascript: link is dropped and markup is escaped', async () => {
  const p = await openApp(); await section(p, 'news'); setv(p, 'w-title', '<b>bold</b>'); setv(p, 'w-url', 'javascript:alert(1)'); setv(p, 'w-text', '<script>window.__s=1</script>'); submit(p, 'w-form'); await until(() => p.doc.querySelector('[data-wdel]'));
  assert.equal(p.doc.querySelectorAll('#pview article a').length, 0); assert.equal(p.doc.querySelectorAll('#pview article b').length, 0); assert.equal(p.w.__s, undefined);
});
test('news: an item needs a title', async () => {
  const p = await openApp(); await section(p, 'news'); setv(p, 'w-text', 'no title'); submit(p, 'w-form'); await wait(40); assert.equal(p.w.SSCVault.get().news.length, 0);
});

/* ---------- unfinished work ---------- */
test('In progress shows the unfinished projects and the open questions', async () => {
  const p = await openApp(); await section(p, 'progress'); const t = text(p);
  assert.match(t, /NomNom/); assert.match(t, /A description will follow/); assert.match(t, /Open questions/); assert.match(t, /How they connect/);
});
test('In progress follows the page language', async () => {
  const p = await openApp(); await section(p, 'progress'); p.w.SSCApp.setLang('bg'); await until(() => /Описанието ще се допълни/.test(text(p)));
  assert.match(text(p), /Недовършено|Проект/);
});
test('an empty In progress says so', async () => {
  const p = await openApp(null); await section(p, 'progress'); assert.match(text(p), /Nothing in progress/);
});

/* ---------- language and separation ---------- */
test('the lock screen and the app follow the language switch', async () => {
  const p = await openGate(); p.w.SSCApp.setLang('bg'); await until(() => /Създай личния/.test(text(p)));
  setv(p, 'p-name', 'omnivorous'); setv(p, 'p-pass', PASS); setv(p, 'p-pass2', PASS); submit(p, 'p-form'); await until(() => $(p, 'pmenu'));
  assert.deepEqual([...p.doc.querySelectorAll('#pmenu button')].map((b) => b.textContent), ['Платформи', 'Новини', 'Бележки', 'Недовършено', 'Vault']);
});
test('personal data never appears on the public tabs, even while the vault is open', async () => {
  const p = await openApp(); await section(p, 'progress'); assert.match(text(p), /NomNom/);
  for (const t of ['work', 'architecture', 'method', 'about']) { p.click($(p, 'tab-' + t)); assert.ok(!/NomNom/.test($(p, 'panel-' + t).textContent), t); }
});
test('the public Work tab lists the fifteen portfolio projects while the unfinished sits in the vault', async () => {
  const p = await openApp(); p.click($(p, 'tab-work')); const names = [...p.doc.querySelectorAll('#panel-work .proj h3')].map((h) => h.textContent);
  assert.equal(names.length, 15); assert.ok(!names.includes('NomNom')); assert.equal(names[0], 'agent-execution-control');
});
test('menu sections can be reached by the hash', async () => {
  const p = page({ hash: '#personal/notes' }); await until(() => $(p, 'p-form')); assert.equal(p.w.SSCPersonal.section(), 'notes');
});
test('nothing throws while moving through every section', async () => {
  const p = await openApp(); for (const s of ['news', 'notes', 'progress', 'vault', 'platforms']) await section(p, s); assert.deepEqual(p.errors, []);
});

/* ---------- the name field ---------- */
test('the lock screen asks for a name and a passphrase', async () => {
  const p = await openGate(); assert.ok($(p, 'p-name')); assert.equal($(p, 'p-name').getAttribute('autocomplete'), 'username');
});
test('an empty name is refused', async () => {
  const p = await openGate(); setv(p, 'p-pass', PASS); setv(p, 'p-pass2', PASS); setv(p, 'p-name', ''); submit(p, 'p-form'); await until(() => $(p, 'p-msg').textContent);
  assert.match($(p, 'p-msg').textContent, /Enter a name/); assert.ok(!$(p, 'pmenu'));
});
test('the name is part of the key: a different name with the right passphrase is refused', async () => {
  const a = await openApp(); const stored = a.w.localStorage.getItem('ssc-vault');
  const b = await openGate({ storage: { 'ssc-vault': stored } }); setv(b, 'p-name', 'someone'); setv(b, 'p-pass', PASS); submit(b, 'p-form'); await until(() => $(b, 'p-msg').textContent);
  assert.match($(b, 'p-msg').textContent, /Wrong passphrase/); assert.ok(!$(b, 'pmenu'));
});
test('the name ignores capitals and surrounding spaces', async () => {
  const a = await openApp(); const stored = a.w.localStorage.getItem('ssc-vault');
  const b = await openGate({ storage: { 'ssc-vault': stored } }); setv(b, 'p-name', '  OmniVorous '); setv(b, 'p-pass', PASS); submit(b, 'p-form'); await until(() => $(b, 'pmenu'));
});
test('the passphrase stays case-sensitive', async () => {
  const a = await openApp(); const stored = a.w.localStorage.getItem('ssc-vault');
  const b = await openGate({ storage: { 'ssc-vault': stored } }); setv(b, 'p-name', 'omnivorous'); setv(b, 'p-pass', PASS.toUpperCase()); submit(b, 'p-form'); await until(() => $(b, 'p-msg').textContent);
  assert.match($(b, 'p-msg').textContent, /Wrong passphrase/);
});
