/* SSC Compass — поведение на страницата / page behaviour:
   език BG/EN, избор на AI, състояния, умения, проекти, контакти. */
(function () {
  'use strict';
  var D = window.SSC, core = window.SSCCore || null;
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : String(s); return d.innerHTML; }
  function safeUrl(u) { return /^https?:\/\//i.test(u || '') ? u : ''; }

  /* ---------- език / language ---------- */
  var lang = 'bg';
  function detectLang() {
    var s = null; try { s = localStorage.getItem('ssc-lang'); } catch (e) {}
    if (s === 'bg' || s === 'en') return s;
    return /^bg/i.test(navigator.language || '') ? 'bg' : 'en';
  }
  function tx(v) { return v && typeof v === 'object' ? (v[lang] != null ? v[lang] : v.bg) : (v == null ? '' : v); }
  var UI = {
    states: [['idle', { bg: 'Покой', en: 'Idle' }], ['listening', { bg: 'Слуша', en: 'Listening' }], ['working', { bg: 'Работи', en: 'Working' }], ['speaking', { bg: 'Говори', en: 'Speaking' }], ['error', { bg: 'Грешка', en: 'Error' }]],
    auto: { bg: 'Авто', en: 'Auto' }, pause: { bg: 'Пауза на движението', en: 'Pause motion' },
    mode: { bg: 'Режим', en: 'Mode' }, autoWord: { bg: 'авто', en: 'auto' },
    filters: [['all', { bg: 'Всички', en: 'All' }], ['ai', { bg: 'AI и документи', en: 'AI and documents' }], ['java', { bg: 'Java', en: 'Java' }], ['unity', { bg: 'Unity', en: 'Unity' }], ['learn', { bg: 'Учене', en: 'Learning' }]],
    kind: { time: { bg: 'по график', en: 'on a schedule' }, event: { bg: 'при събитие', en: 'when something happens' }, manual: { bg: 'ръчно', en: 'manual' } },
    task: { bg: 'задача', en: 'task' }, skill: { bg: 'умение', en: 'skill' }, auto2: { bg: 'автоматизация', en: 'automation' },
    more: { bg: 'Подробности →', en: 'Details →' }, open: { bg: 'Отвори →', en: 'Open →' }, profile: { bg: 'профил', en: 'profile' }, soon: { bg: 'линк скоро', en: 'link soon' },
    title: { bg: 'SSC Compass · Мартин Урумов', en: 'SSC Compass · Martin Urumov' },
    desc: { bg: 'SSC Compass (Shadow Somiyo Compass): личен команден център, изграден около работата ми с AI. Мартин Урумов / Martin Urumov.', en: 'SSC Compass (Shadow Somiyo Compass): a personal command centre built around my work with AI. Martin Urumov / Мартин Урумов.' },
    routes: [
      { q: { bg: 'Покажи ми приоритетите за днес', en: 'Show me my priorities for today' }, p: [94, 5, 1], why: { bg: 'Отговорът вече е записан. Не е нужен модел, затова минава на ниво 1.', en: 'The answer is already saved. No model is needed, so it goes to tier 1.' } },
      { q: { bg: 'Обобщи новините в AI днес', en: "Summarise today's AI news" }, p: [6, 84, 10], why: { bg: 'Нужно е кратко мислене, но не истинска работа. Малък бърз модел стига.', en: 'It needs a little thinking, but not real work. A small quick model is enough.' } },
      { q: { bg: 'Направи обяснителен доклад за разликата между два модела', en: 'Write an explainer on the difference between two models' }, p: [2, 8, 90], why: { bg: 'Дълга работа с файлове. Отваря се терминал с Claude, Codex или Gemini.', en: 'Long work with files. A terminal opens with Claude, Codex or Gemini.' } }
    ],
    tiers: [{ bg: 'Ниво 1 · правила', en: 'Tier 1 · rules' }, { bg: 'Ниво 2 · малък модел', en: 'Tier 2 · small model' }, { bg: 'Ниво 3 · истинска работа', en: 'Tier 3 · real work' }]
  };

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
  $('ai-switch').addEventListener('click', function (e) { if (e.target.dataset.ai) setAI(e.target.dataset.ai); });

  /* ---------- състояния на ядрото ---------- */
  var state = 'idle', auto = true, autoTimer = null, autoIdx = 0;
  function renderStates() {
    $('states').innerHTML = UI.states.map(function (s) { return '<button data-s="' + s[0] + '" aria-pressed="' + (s[0] === state) + '">' + esc(tx(s[1])) + '</button>'; }).join('') +
      '<span class="sep"></span><button id="auto" aria-pressed="' + auto + '">' + esc(tx(UI.auto)) + '</button><button id="pause" aria-pressed="' + !!(core && core.isPaused()) + '">' + esc(tx(UI.pause)) + '</button>';
  }
  function readout() {
    var label = tx(UI.states.filter(function (s) { return s[0] === state; })[0][1]);
    $('readout').textContent = tx(UI.mode) + ' ' + current.name + ' · ' + label.toLowerCase() + (auto ? ' · ' + tx(UI.autoWord) : '');
  }
  function setState(s) {
    state = s; if (core) core.setState(s);
    Array.prototype.forEach.call($('states').querySelectorAll('[data-s]'), function (b) { b.setAttribute('aria-pressed', b.dataset.s === s); });
    readout();
  }
  function setAuto(on) {
    auto = on; var b = $('auto'); if (b) b.setAttribute('aria-pressed', on);
    clearInterval(autoTimer);
    if (on) autoTimer = setInterval(function () {
      var order = ['idle', 'listening', 'working', 'speaking']; autoIdx = (autoIdx + 1) % order.length; setState(order[autoIdx]);
    }, 4500);
    readout();
  }
  $('states').addEventListener('click', function (e) {
    var t = e.target;
    if (t.dataset.s) { setAuto(false); setState(t.dataset.s); }
    else if (t.id === 'auto') setAuto(!auto);
    else if (t.id === 'pause') { var p = !(core && core.isPaused()); if (core) core.setPaused(p); t.setAttribute('aria-pressed', p); }
  });

  /* ---------- рутиране: илюстративен пример ---------- */
  var routeIdx = 0;
  function renderPicks() {
    $('picks').innerHTML = UI.routes.map(function (r, i) { return '<button data-r="' + i + '" aria-pressed="' + (i === routeIdx) + '">„' + esc(tx(r.q)) + '“</button>'; }).join('');
  }
  function showRoute(i) {
    routeIdx = i; var r = UI.routes[i], win = r.p.indexOf(Math.max.apply(null, r.p));
    renderPicks();
    $('bars').innerHTML = UI.tiers.map(function (n, k) {
      return '<div class="bar' + (k === win ? ' win' : '') + '"><span>' + esc(tx(n)) + '</span><span class="tr"><i data-w="' + r.p[k] + '"></i></span><span>' + r.p[k] + '%</span></div>';
    }).join('');
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      Array.prototype.forEach.call($('bars').querySelectorAll('i'), function (el) { el.style.width = el.dataset.w + '%'; });
    }); });
    $('verdict').innerHTML = '<b>' + esc(tx(UI.tiers[win])) + '.</b> ' + esc(tx(r.why));
  }
  $('picks').addEventListener('click', function (e) { if (e.target.dataset.r !== undefined) showRoute(+e.target.dataset.r); });

  /* ---------- умения ---------- */
  function renderDomains() {
    var on = Array.prototype.map.call($('domains').children, function (c) { return c.classList.contains('on'); });
    $('domains').innerHTML = D.domains.map(function (d) {
      return '<div class="card dom" tabindex="0">' +
        '<div class="row">' + esc(tx(d.name)) + '</div>' +
        '<div class="row"><small>' + tx(UI.task) + '</small>' + esc(tx(d.task)) + '</div>' +
        '<div class="row"><small>' + tx(UI.skill) + '</small><span class="sk">' + esc(d.skill) + '<em>' + esc(tx(d.note)) + '</em></span></div>' +
        '<div class="row"><small>' + tx(UI.auto2) + ' · ' + tx(UI.kind[d.kind]) + '</small><span class="au ' + d.kind + '">' + esc(tx(d.auto)) + '</span></div></div>';
    }).join('');
    on.forEach(function (v, i) { if (v && $('domains').children[i]) $('domains').children[i].classList.add('on'); });
  }
  $('domains').addEventListener('click', function (e) {
    var c = e.target.closest('.dom'); if (!c) return;
    Array.prototype.forEach.call($('domains').children, function (x) { x.classList.toggle('on', x === c && !x.classList.contains('on')); });
  });
  $('domains').addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('dom')) { e.preventDefault(); e.target.click(); }
  });

  /* ---------- проекти ---------- */
  var filter = 'all';
  function renderFilters() {
    $('filters').innerHTML = UI.filters.map(function (f) { return '<button data-f="' + f[0] + '" aria-pressed="' + (f[0] === filter) + '">' + esc(tx(f[1])) + '</button>'; }).join('');
  }
  function renderProjects() {
    $('projects-grid').innerHTML = D.projects.filter(function (p) { return filter === 'all' || p.tags.indexOf(filter) > -1; }).map(function (p) {
      return '<button class="card proj" data-p="' + esc(p.id) + '"><div class="chips"><span class="chip st">' + esc(tx(p.status)) + '</span></div>' +
        '<h3>' + esc(p.name) + '</h3><p>' + esc(tx(p.summary)) + '</p>' +
        '<div class="chips">' + p.chips.map(function (c) { return '<span class="chip">' + esc(tx(c)) + '</span>'; }).join('') + '</div><span class="more">' + esc(tx(UI.more)) + '</span></button>';
    }).join('');
  }
  $('filters').addEventListener('click', function (e) {
    if (!e.target.dataset.f) return; filter = e.target.dataset.f; renderFilters(); renderProjects();
  });
  var dlg = $('dlg'), lastFocus = null, openProject = null;
  function renderDialog() {
    var p = D.projects.filter(function (x) { return x.id === openProject; })[0]; if (!p) return;
    $('dlg-body').innerHTML = '<div class="chips" style="margin-bottom:10px"><span class="chip st">' + esc(tx(p.status)) + '</span>' +
      p.chips.map(function (c) { return '<span class="chip">' + esc(tx(c)) + '</span>'; }).join('') + '</div>' +
      '<h3 id="dlg-title">' + esc(p.name) + '</h3><p>' + esc(tx(p.summary)) + '</p>' +
      (p.details.length ? '<ul>' + p.details.map(function (d) { return '<li>' + esc(tx(d)) + '</li>'; }).join('') + '</ul>' : '') +
      (p.links ? '<p>' + p.links.filter(function (l) { return safeUrl(l.url); }).map(function (l) { return '<a class="btn" target="_blank" rel="noopener noreferrer" href="' + esc(l.url) + '">' + esc(tx(l.label)) + '</a>'; }).join(' ') + '</p>' : '');
  }
  $('projects-grid').addEventListener('click', function (e) {
    var b = e.target.closest('[data-p]'); if (!b) return;
    lastFocus = b; openProject = b.dataset.p; renderDialog();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  });
  function closeDlg() { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); if (lastFocus) lastFocus.focus(); }
  $('dlg-close').addEventListener('click', closeDlg);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDlg(); });

  /* ---------- контакти ---------- */
  function renderSocials() {
    $('socials').innerHTML = D.socials.map(function (s) {
      var u = safeUrl(s.url);
      if (u) return '<a class="card soc" target="_blank" rel="noopener noreferrer" href="' + esc(u) + '"><h3>' + esc(s.name) + '</h3><span class="mono">' + esc(s.handle || tx(UI.profile)) + '</span><span class="go">' + esc(tx(UI.open)) + '</span></a>';
      return '<div class="card soc off"><h3>' + esc(s.name) + '</h3><span class="mono">' + esc(tx(UI.soon)) + '</span></div>';
    }).join('');
  }
  $('cv-link').setAttribute('href', D.cv.url); $('cv-note').textContent = '';

  /* ---------- езикът се прилага навсякъде / apply language everywhere ---------- */
  function applyLang(l) {
    lang = l; document.documentElement.lang = l;
    Array.prototype.forEach.call(document.querySelectorAll('[data-en]'), function (el) {
      if (el.dataset.bg === undefined) el.dataset.bg = el.textContent;
      el.textContent = l === 'en' ? el.dataset.en : el.dataset.bg;
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-en-aria]'), function (el) {
      if (el.dataset.bgAria === undefined) el.dataset.bgAria = el.getAttribute('aria-label') || '';
      el.setAttribute('aria-label', l === 'en' ? el.dataset.enAria : el.dataset.bgAria);
    });
    document.title = tx(UI.title);
    var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', tx(UI.desc));
    Array.prototype.forEach.call($('lang').children, function (b) { b.setAttribute('aria-pressed', b.dataset.lang === l); });
    $('cv-note').textContent = tx(D.cv.note);
    renderStates(); readout(); renderFilters(); renderProjects(); renderDomains(); renderSocials(); showRoute(routeIdx);
    if (dlg.open) renderDialog();
    try { localStorage.setItem('ssc-lang', l); } catch (e) {}
  }
  $('lang').addEventListener('click', function (e) { if (e.target.dataset.lang) applyLang(e.target.dataset.lang); });

  /* ---------- часовник, година, старт ---------- */
  var clock = $('clock');
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function tick() { var d = new Date(); clock.textContent = two(d.getHours()) + ':' + two(d.getMinutes()) + ':' + two(d.getSeconds()); }
  tick(); setInterval(tick, 1000);
  $('year').textContent = new Date().getFullYear();

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saved = null; try { saved = localStorage.getItem('ssc-ai'); } catch (e) {}
  applyLang(detectLang());
  if (reduce && core) core.setPaused(true);
  renderStates();
  setAI(saved && D.ais.some(function (a) { return a.id === saved; }) ? saved : D.ais[0].id);
  setState('idle'); setAuto(!reduce);

  /* ---------- плавно появяване ---------- */
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .08 });
    els.forEach(function (el) { io.observe(el); });
  } else els.forEach(function (el) { el.classList.add('in'); });

  window.SSCApp = { setLang: applyLang, getLang: function () { return lang; }, setAI: setAI, setState: setState };
})();
