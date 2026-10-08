/* SSC Compass — поведение на страницата: избор на AI, състояния, умения, проекти, платформи. */
(function () {
  'use strict';
  var D = window.SSC, core = window.SSCCore || null;
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function safeUrl(u) { return /^https?:\/\//i.test(u || '') ? u : ''; }

  /* часовник + година */
  var clock = $('clock');
  function tick() { clock.textContent = new Date().toLocaleTimeString('bg-BG', { hour12: false }); }
  tick(); setInterval(tick, 1000);
  $('year').textContent = new Date().getFullYear();

  /* ---------- избор на AI ---------- */
  var current = D.ais[0];
  $('ai-switch').innerHTML = D.ais.map(function (a, i) {
    return '<button role="tab" data-ai="' + a.id + '" aria-selected="' + (i === 0) + '">' + esc(a.name) + '</button>';
  }).join('');
  function setAI(id) {
    var a = D.ais.filter(function (x) { return x.id === id; })[0]; if (!a) return;
    current = a;
    var root = document.documentElement.style;
    root.setProperty('--accent-rgb', a.accent); root.setProperty('--accent2-rgb', a.accent2);
    $('ai-name').textContent = a.name; $('ai-sub').textContent = a.sub;
    Array.prototype.forEach.call($('ai-switch').children, function (b) { b.setAttribute('aria-selected', b.dataset.ai === id); });
    if (core) core.setAI(id);
    readout();
    try { localStorage.setItem('ssc-ai', id); } catch (e) {}
  }
  $('ai-switch').addEventListener('click', function (e) { if (e.target.dataset.ai) { setAI(e.target.dataset.ai); } });

  /* ---------- състояния на ядрото ---------- */
  var STATES = [['idle', 'Покой'], ['listening', 'Слуша'], ['working', 'Работи'], ['speaking', 'Говори'], ['error', 'Грешка']];
  var state = 'idle', auto = true, autoTimer = null, autoIdx = 0;
  $('states').innerHTML = STATES.map(function (s) { return '<button data-s="' + s[0] + '" aria-pressed="false">' + s[1] + '</button>'; }).join('') +
    '<span class="sep"></span><button id="auto" aria-pressed="true">Авто</button><button id="pause" aria-pressed="false">Пауза на движението</button>';
  function readout() {
    var label = STATES.filter(function (s) { return s[0] === state; })[0][1];
    $('readout').textContent = 'Режим ' + current.name + ' · ' + label.toLowerCase() + (auto ? ' · авто' : '');
  }
  function setState(s) {
    state = s; if (core) core.setState(s);
    Array.prototype.forEach.call($('states').querySelectorAll('[data-s]'), function (b) { b.setAttribute('aria-pressed', b.dataset.s === s); });
    readout();
  }
  function setAuto(on) {
    auto = on; $('auto').setAttribute('aria-pressed', on);
    clearInterval(autoTimer);
    if (on) autoTimer = setInterval(function () {
      var order = ['idle', 'listening', 'working', 'speaking']; autoIdx = (autoIdx + 1) % order.length; setState(order[autoIdx]);
    }, 4500);
    readout();
  }
  $('states').addEventListener('click', function (e) {
    var t = e.target;
    if (t.dataset.s) { setAuto(false); setState(t.dataset.s); }
    else if (t.id === 'auto') { setAuto(!auto); }
    else if (t.id === 'pause') {
      var p = !(core && core.isPaused()); if (core) core.setPaused(p); t.setAttribute('aria-pressed', p);
    }
  });
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) $('pause').setAttribute('aria-pressed', 'true');
  setState('idle'); setAuto(!reduce);

  var saved = null; try { saved = localStorage.getItem('ssc-ai'); } catch (e) {}
  if (saved && saved !== current.id) setAI(saved);

  /* ---------- рутиране: илюстративен пример ---------- */
  var ROUTES = [
    { q: 'Покажи ми приоритетите за днес', p: [94, 5, 1], why: 'Отговорът вече е записан. Не е нужен модел, затова минава на ниво 1.' },
    { q: 'Обобщи новините в AI днес', p: [6, 84, 10], why: 'Нужно е кратко мислене, но не истинска работа. Малък бърз модел стига.' },
    { q: 'Направи обяснителен доклад за разликата между два модела', p: [2, 8, 90], why: 'Дълга работа с файлове. Отваря се терминал с Claude, Codex или Gemini.' }
  ];
  var TIERS = ['Ниво 1 · правила', 'Ниво 2 · малък модел', 'Ниво 3 · истинска работа'];
  $('picks').innerHTML = ROUTES.map(function (r, i) { return '<button data-r="' + i + '" aria-pressed="' + (i === 0) + '">„' + esc(r.q) + '“</button>'; }).join('');
  function showRoute(i) {
    var r = ROUTES[i], win = r.p.indexOf(Math.max.apply(null, r.p));
    Array.prototype.forEach.call($('picks').children, function (b, k) { b.setAttribute('aria-pressed', k === i); });
    $('bars').innerHTML = TIERS.map(function (n, k) {
      return '<div class="bar' + (k === win ? ' win' : '') + '"><span>' + n + '</span><span class="tr"><i data-w="' + r.p[k] + '"></i></span><span>' + r.p[k] + '%</span></div>';
    }).join('');
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      Array.prototype.forEach.call($('bars').querySelectorAll('i'), function (el) { el.style.width = el.dataset.w + '%'; });
    }); });
    $('verdict').innerHTML = '<b>' + TIERS[win] + '.</b> ' + esc(r.why);
  }
  $('picks').addEventListener('click', function (e) { if (e.target.dataset.r !== undefined) showRoute(+e.target.dataset.r); });
  showRoute(0);

  /* ---------- умения ---------- */
  var KIND = { time: 'по график', event: 'при събитие', manual: 'ръчно' };
  $('domains').innerHTML = D.domains.map(function (d) {
    return '<div class="card dom" tabindex="0">' +
      '<div class="row">' + esc(d.name) + '</div>' +
      '<div class="row"><small>задача</small>' + esc(d.task) + '</div>' +
      '<div class="row"><small>умение</small><span class="sk">' + esc(d.skill) + '<em>' + esc(d.skillNote) + '</em></span></div>' +
      '<div class="row"><small>автоматизация · ' + KIND[d.kind] + '</small><span class="au ' + d.kind + '">' + esc(d.auto) + '</span></div></div>';
  }).join('');
  $('domains').addEventListener('click', function (e) {
    var c = e.target.closest('.dom'); if (!c) return;
    Array.prototype.forEach.call($('domains').children, function (x) { x.classList.toggle('on', x === c && !x.classList.contains('on')); });
  });

  /* ---------- проекти ---------- */
  var FILTERS = [['all', 'Всички'], ['ai', 'AI и документи'], ['java', 'Java'], ['unity', 'Unity'], ['learn', 'Учене']];
  var filter = 'all';
  $('filters').innerHTML = FILTERS.map(function (f, i) { return '<button data-f="' + f[0] + '" aria-pressed="' + (i === 0) + '">' + f[1] + '</button>'; }).join('');
  function renderProjects() {
    $('projects-grid').innerHTML = D.projects.filter(function (p) { return filter === 'all' || p.tags.indexOf(filter) > -1; }).map(function (p) {
      return '<button class="card proj" data-p="' + esc(p.id) + '"><div class="chips"><span class="chip st">' + esc(p.status) + '</span></div>' +
        '<h3>' + esc(p.name) + '</h3><p>' + esc(p.summary) + '</p>' +
        '<div class="chips">' + p.chips.map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('') + '</div><span class="more">Подробности →</span></button>';
    }).join('');
  }
  $('filters').addEventListener('click', function (e) {
    if (!e.target.dataset.f) return; filter = e.target.dataset.f;
    Array.prototype.forEach.call($('filters').children, function (b) { b.setAttribute('aria-pressed', b.dataset.f === filter); });
    renderProjects();
  });
  var dlg = $('dlg'), lastFocus = null;
  $('projects-grid').addEventListener('click', function (e) {
    var b = e.target.closest('[data-p]'); if (!b) return;
    var p = D.projects.filter(function (x) { return x.id === b.dataset.p; })[0]; if (!p) return;
    lastFocus = b;
    $('dlg-body').innerHTML = '<div class="chips" style="margin-bottom:10px"><span class="chip st">' + esc(p.status) + '</span>' +
      p.chips.map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('') + '</div>' +
      '<h3 id="dlg-title">' + esc(p.name) + '</h3><p>' + esc(p.summary) + '</p>' +
      (p.details.length ? '<ul>' + p.details.map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ul>' : '');
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  });
  function closeDlg() { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); if (lastFocus) lastFocus.focus(); }
  $('dlg-close').addEventListener('click', closeDlg);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDlg(); });
  renderProjects();

  /* ---------- платформи ---------- */
  $('socials').innerHTML = D.socials.map(function (s) {
    var u = safeUrl(s.url);
    if (u) return '<a class="card soc" target="_blank" rel="noopener noreferrer" href="' + esc(u) + '"><h3>' + esc(s.name) + '</h3><span class="mono">' + esc(s.handle || 'профил') + '</span><span class="go">Отвори →</span></a>';
    return '<div class="card soc off"><h3>' + esc(s.name) + '</h3><span class="mono">линк скоро</span></div>';
  }).join('');

  /* ---------- плавно появяване ---------- */
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .08 });
    els.forEach(function (el) { io.observe(el); });
  } else els.forEach(function (el) { el.classList.add('in'); });
})();
