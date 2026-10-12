'use strict';
/* The sealed vault: AES-GCM with a key derived from the passphrase (PBKDF2). */
const test = require('node:test');
const assert = require('node:assert/strict');
const { load, closeAll } = require('./helpers');
test.after(closeAll);

const page = (o) => load(Object.assign({ lang: 'en-US' }, o));
const PASS = 'correct horse battery';
const SEED = { platforms: [{ name: 'YouTube', url: 'https://youtube.test', handle: '@x', status: 'live' }], news: [], notes: [{ id: 'n1', text: 'secret-note-text', done: false, at: 1 }], projects: [{ id: 'p1', name: 'SecretProject', tags: [] }], openItems: [] };
const rejects = async (promise, msg) => { let err = null; try { await promise; } catch (e) { err = e; } assert.ok(err, 'should reject'); if (msg) assert.equal(err.message, msg); };

test('encryption is available in the test browser', () => { assert.equal(page().w.SSCVault.supported(), true); });
test('a new vault needs a passphrase of at least 8 characters', async () => {
  const V = page().w.SSCVault; await rejects(V.create('short', SEED), 'weak-passphrase'); await rejects(V.create('', SEED), 'weak-passphrase');
  assert.equal(V.isOpen(), false);
});
test('create opens the vault and normalises the starter data', async () => {
  const V = page().w.SSCVault; const s = await V.create(PASS, { notes: [{ id: 'a' }], junk: 1, platforms: 'nope' });
  assert.equal(V.isOpen(), true); assert.deepEqual(Object.keys(s).sort(), ['news', 'notes', 'openItems', 'platforms', 'projects', 'v']);
  assert.equal(s.notes.length, 1); assert.deepEqual(Array.from(s.platforms), []);
});
test('create without starter data gives an empty vault', async () => {
  const V = page().w.SSCVault; const s = await V.create(PASS); assert.deepEqual([s.platforms.length, s.news.length, s.notes.length, s.projects.length], [0, 0, 0, 0]);
});
test('what is stored on the device is ciphertext: none of the data or the passphrase is readable', async () => {
  const p = page(); await p.w.SSCVault.create(PASS, SEED);
  const raw = p.w.localStorage.getItem('ssc-vault');
  for (const needle of ['secret-note-text', 'SecretProject', 'youtube.test', PASS]) assert.ok(!raw.includes(needle), needle);
  const blob = JSON.parse(raw); assert.deepEqual(Object.keys(blob).sort(), ['data', 'iter', 'iv', 'kdf', 'salt', 'v']);
  assert.equal(blob.kdf, 'PBKDF2-SHA256'); assert.ok(blob.iter >= 250000);
});
test('the passphrase is not kept anywhere in storage', async () => {
  const p = page(); await p.w.SSCVault.create(PASS, SEED);
  for (let i = 0; i < p.w.localStorage.length; i++) assert.ok(!p.w.localStorage.getItem(p.w.localStorage.key(i)).includes(PASS));
});
test('lock clears the data from memory', async () => {
  const V = page().w.SSCVault; await V.create(PASS, SEED); V.lock(); assert.equal(V.isOpen(), false); assert.equal(V.get(), null);
});
test('unlock with the right passphrase restores the data, with the wrong one it fails', async () => {
  const p = page(); await p.w.SSCVault.create(PASS, SEED); p.w.SSCVault.lock();
  await rejects(p.w.SSCVault.unlock('wrong passphrase'), 'bad-passphrase'); assert.equal(p.w.SSCVault.isOpen(), false);
  const s = await p.w.SSCVault.unlock(PASS); assert.equal(s.notes[0].text, 'secret-note-text'); assert.equal(s.projects[0].name, 'SecretProject');
});
test('an empty passphrase never unlocks', async () => {
  const p = page(); await p.w.SSCVault.create(PASS, SEED); p.w.SSCVault.lock(); await rejects(p.w.SSCVault.unlock(''), 'bad-passphrase');
});
test('changes are saved: a new visit with the same storage sees them', async () => {
  const p = page(); const V = p.w.SSCVault; const s = await V.create(PASS, SEED); s.notes.push({ id: 'n2', text: 'added later', done: false, at: 2 }); await V.save();
  const q = page({ storage: { 'ssc-vault': p.w.localStorage.getItem('ssc-vault') } }); const t = await q.w.SSCVault.unlock(PASS);
  assert.deepEqual(Array.from(t.notes, (n) => n.id), ['n1', 'n2']);
});
test('every save uses a fresh IV, so the same data never produces the same ciphertext', async () => {
  const p = page(); const V = p.w.SSCVault; await V.create(PASS, SEED); const a = JSON.parse(p.w.localStorage.getItem('ssc-vault')); await V.save(); const b = JSON.parse(p.w.localStorage.getItem('ssc-vault'));
  assert.notEqual(a.iv, b.iv); assert.notEqual(a.data, b.data); assert.equal(a.salt, b.salt);
});
test('a tampered ciphertext is rejected', async () => {
  const p = page(); await p.w.SSCVault.create(PASS, SEED); const blob = JSON.parse(p.w.localStorage.getItem('ssc-vault'));
  const bytes = Buffer.from(blob.data, 'base64'); bytes[5] ^= 1; blob.data = bytes.toString('base64');
  const q = page({ storage: { 'ssc-vault': JSON.stringify(blob) } }); await rejects(q.w.SSCVault.unlock(PASS), 'bad-passphrase');
});
test('a damaged vault file is rejected, not crashed on', async () => {
  const q = page({ storage: { 'ssc-vault': '{"v":1}' } }); let e = null; try { await q.w.SSCVault.unlock(PASS); } catch (x) { e = x; } assert.ok(e);
});
test('unlock without any vault says there is none', async () => { await rejects(page().w.SSCVault.unlock(PASS), 'no-vault'); });
test('export gives a sealed file that opens on another device with the same passphrase', async () => {
  const a = page(); await a.w.SSCVault.create(PASS, SEED); const sealed = await a.w.SSCVault.exportSealed();
  assert.ok(!sealed.includes('secret-note-text'));
  const b = page({ fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve(JSON.parse(sealed)) }) });
  assert.equal(b.w.SSCVault.hasLocal(), false);
  const s = await b.w.SSCVault.unlock(PASS); assert.equal(s.notes[0].text, 'secret-note-text'); assert.equal(b.w.SSCVault.hasLocal(), true);
});
test('the uploaded file refuses a wrong passphrase', async () => {
  const a = page(); await a.w.SSCVault.create(PASS, SEED); const sealed = JSON.parse(await a.w.SSCVault.exportSealed());
  const b = page({ fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve(sealed) }) }); await rejects(b.w.SSCVault.unlock('not it at all'), 'bad-passphrase');
  assert.equal(b.w.SSCVault.hasLocal(), false);
});
test('a missing uploaded file is handled quietly', async () => {
  const b = page({ fetch: () => Promise.resolve({ ok: false }) }); assert.equal(await b.w.SSCVault.remote(), null);
  const c = page({ fetch: () => Promise.reject(new Error('offline')) }); assert.equal(await c.w.SSCVault.remote(), null);
});
test('forget removes the vault from this device', async () => {
  const p = page(); await p.w.SSCVault.create(PASS, SEED); p.w.SSCVault.forget(); assert.equal(p.w.SSCVault.hasLocal(), false); assert.equal(p.w.SSCVault.isOpen(), false);
});
test('save while locked is refused', async () => { await rejects(page().w.SSCVault.save(), 'locked'); });
test('the vault code makes no network request of its own except the optional sealed file', () => {
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'assets', 'vault.js'), 'utf8');
  assert.ok(!/XMLHttpRequest|WebSocket|sendBeacon/.test(src)); assert.equal((src.match(/fetch\(/g) || []).length, 1); assert.match(src, /assets\/vault\.enc\.json/);
});
test('the key is never exported (non-extractable)', () => {
  const src = require('fs').readFileSync(require('path').join(__dirname, '..', 'assets', 'vault.js'), 'utf8');
  assert.match(src, /false, \['encrypt', 'decrypt'\]/); assert.ok(!/exportKey/.test(src));
});
