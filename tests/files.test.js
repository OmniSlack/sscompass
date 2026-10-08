'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { read, exists, ROOT } = require('./helpers');

for (const f of ['index.html', 'assets/style.css', 'assets/app.js', 'assets/cores.js', 'assets/data.js', 'cv/Martin_Urumov_CV.pdf', 'package.json', 'LICENSE', 'README.md']) {
  test(`file exists: ${f}`, () => assert.ok(exists(f)));
}
for (const f of ['assets/app.js', 'assets/cores.js', 'assets/data.js']) {
  test(`${f} compiles as JavaScript`, () => { assert.doesNotThrow(() => new vm.Script(read(f), { filename: f })); });
  test(`${f} has no console.log, debugger or TODO left behind`, () => {
    assert.ok(!/console\.log|debugger|TODO|FIXME/.test(read(f)));
  });
}
test('the stylesheet has balanced braces', () => {
  const s = read('assets/style.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.equal((s.match(/{/g) || []).length, (s.match(/}/g) || []).length);
});
test('the stylesheet defines the accent variables the scripts set', () => {
  const s = read('assets/style.css'); assert.match(s, /--accent-rgb/); assert.match(s, /--accent2-rgb/);
});
test('the stylesheet respects reduced motion', () => assert.match(read('assets/style.css'), /prefers-reduced-motion/));
test('the stylesheet makes the page usable at phone width', () => assert.match(read('assets/style.css'), /@media \(max-width: 6\d\dpx\)/));
test('index.html has no placeholder text', () => assert.ok(!/lorem ipsum|TODO|FIXME/i.test(read('index.html'))));
test('index.html stays small (under 40 KB)', () => assert.ok(read('index.html').length < 40000));
test('no shipped asset is larger than 100 KB except the CV', () => {
  for (const f of fs.readdirSync(path.join(ROOT, 'assets'))) assert.ok(fs.statSync(path.join(ROOT, 'assets', f)).size < 100000, f);
});
test('the CV is a real PDF under 1 MB', () => {
  const b = fs.readFileSync(path.join(ROOT, 'cv/Martin_Urumov_CV.pdf'));
  assert.equal(b.slice(0, 5).toString(), '%PDF-'); assert.ok(b.length < 1e6);
});
test('package.json is valid and keeps the site dependency-free', () => {
  const j = JSON.parse(read('package.json')); assert.ok(!j.dependencies); assert.ok(j.devDependencies.jsdom);
});
test('node_modules is ignored by git', () => assert.match(read('.gitignore'), /^node_modules\/?$/m));
test('the dependency lock file is committed', () => assert.ok(exists('package-lock.json')));
test('the scripts do not use eval, document.write or inline HTML from user input', () => {
  for (const f of ['assets/app.js', 'assets/cores.js', 'assets/data.js']) assert.ok(!/\beval\(|document\.write\(/.test(read(f)), f);
});
test('every dynamic string goes through the escape helper before innerHTML', () => {
  const s = read('assets/app.js');
  assert.match(s, /function esc\(/);
  assert.ok((s.match(/esc\(/g) || []).length > 30);
});
