'use strict';
/* Test helpers: load the real index.html + assets into jsdom, with a recording fake canvas. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const exists = (f) => fs.existsSync(path.join(ROOT, f));

/** data.js evaluated on its own, no DOM needed */
function loadData() {
  const sandbox = {}; sandbox.window = sandbox; vm.createContext(sandbox);
  vm.runInContext(read('assets/data.js'), sandbox);
  return sandbox.SSC;
}

function makeCtx() {
  const log = { arcs: [], strokes: 0, clears: 0, fills: 0 };
  const store = {};
  const ctx = new Proxy(store, {
    get(t, k) {
      if (k === '__log') return log;
      if (k === 'arc') return (...a) => { log.arcs.push(a); };
      if (k === 'stroke') return () => { log.strokes++; };
      if (k === 'clearRect') return () => { log.clears++; };
      if (k === 'fill') return () => { log.fills++; };
      return k in t ? t[k] : () => {};
    },
    set(t, k, v) { t[k] = v; return true; }
  });
  return ctx;
}

/** Page without scripts (structure tests). */
function loadStatic() {
  const html = read('index.html');
  return new JSDOM(html, { url: 'http://localhost/' });
}

/** Full page with all three scripts executed, as a browser would. */
function load(opts = {}) {
  const { lang = 'bg-BG', storage = {}, reduce = false, width = 1200 } = opts;
  const html = read('index.html').replace(/<script src="[^"]*"><\/script>/g, '');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
  const w = dom.window;
  Object.defineProperty(w.navigator, 'language', { value: lang, configurable: true });
  const ctx = makeCtx();
  w.HTMLCanvasElement.prototype.getContext = function () { return ctx; };
  Object.defineProperty(w.HTMLElement.prototype, 'clientWidth', { get() { return 500; }, configurable: true });
  Object.defineProperty(w.HTMLElement.prototype, 'clientHeight', { get() { return 460; }, configurable: true });
  w.matchMedia = (q) => ({ matches: !!reduce && /reduced-motion/.test(q), addEventListener() {}, removeEventListener() {} });
  Object.defineProperty(w, 'innerWidth', { value: width, configurable: true });
  Object.entries(storage).forEach(([k, v]) => w.localStorage.setItem(k, v));
  const errors = [];
  w.addEventListener('error', (e) => errors.push(e.message));
  for (const f of ['assets/data.js', 'assets/cores.js', 'assets/app.js']) {
    try { w.eval(read(f)); } catch (e) { errors.push(f + ': ' + e.message); }
  }
  opened.push(w);
  const click = (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  return { dom, w, doc: w.document, ctx, errors, click, close: () => w.close() };
}

const opened = [];
const closeAll = () => { while (opened.length) { try { opened.pop().close(); } catch (e) {} } };
const CYRILLIC = /[Ѐ-ӿ]/;

module.exports = { closeAll, ROOT, read, exists, loadData, loadStatic, load, CYRILLIC };
