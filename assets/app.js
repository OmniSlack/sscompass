/* Martin Urumov — портфолио: език BG/EN, табове, проекти, контакти.
   Личният таб е в personal.js и vault.js. */
(function () {
  'use strict';
  var D = window.SSC;
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function safeUrl(u) { return /^https?:\/\/.+/i.test(u || '') ? u : ''; }
  function safeLink(u) { return /^(https?:\/\/.+|decks\/[\w\-.\/]+(#[\w\/-]+)?)$/i.test(u || '') ? u : ''; }
  function safeFile(u) { return /^(https?:\/\/|[\w\-\/.]+\.pdf$)/i.test(u || '') ? u : ''; }

  /* ---------- език / language ---------- */
  var lang = 'bg';
  function detectLang() {
    var s = null; try { s = localStorage.getItem('ssc-lang'); } catch (e) {}
    if (s === 'bg' || s === 'en') return s;
    return /^bg/i.test(navigator.language || '') ? 'bg' : 'en';
  }
  function tx(v) { return v && typeof v === 'object' ? (v[lang] != null ? v[lang] : v.bg) : (v == null ? '' : v); }
  var UI = {
    title: { bg: 'SS Compass · OmniEcho · Мартин Урумов', en: 'SS Compass · OmniEcho · Martin Urumov' },
    desc: { bg: 'Мартин Урумов / Martin Urumov: оценка на поведението на AI, контрол на работните процеси на агенти и проверка на правила в софтуера. Петнайсет проекта с доказателства, които могат да се повторят.', en: 'Martin Urumov / Мартин Урумов: AI behaviour evaluation, agent workflow controls and software rule checks. Fifteen projects with evidence you can re-run.' },
    proof: { bg: 'Доказателство', en: 'Proof' }, limits: { bg: 'Какво не доказва', en: 'What it does not prove' }, why: { bg: 'Какво прави', en: 'What it does' },
    points: { bg: 'Ключови неща', en: 'Key points' }, folder: { bg: 'Папка в хранилището', en: 'Folder in the repository' },
    more: { bg: 'Отвори', en: 'Open' }, open: { bg: 'Отвори →', en: 'Open →' }, profile: { bg: 'профил', en: 'profile' },
    newTab: { bg: '(отваря се в нов таб)', en: '(opens in a new tab)' },
    private: { bg: 'Хранилището още не е публично.', en: 'The repository is not public yet.' },
    deckBtn: { bg: 'Отвори', en: 'Open' }
  };

  /* ---------- проекти ---------- */
  var filter = 'all', openProject = null;
  function renderFilters() {
    $('filters').innerHTML = D.kinds.map(function (k) { return '<button data-f="' + esc(k.id) + '" aria-pressed="' + (k.id === filter) + '">' + esc(tx(k.label)) + '</button>'; }).join('');
  }
  function chipHtml(c) { return '<span class="chip">' + esc(tx(c)) + '</span>'; }
  function renderProjects() {
    $('projects-grid').innerHTML = D.projects.filter(function (p) { return filter === 'all' || p.tags.indexOf(filter) > -1; }).map(function (p) {
      return '<article class="card proj" data-p="' + esc(p.id) + '"><div class="chips">' + p.chips.map(chipHtml).join('') + '</div>' +
        '<h3>' + esc(p.id) + '</h3><p>' + esc(tx(p.summary)) + '</p>' +
        '<div class="pproof">' + esc(tx(p.proof)) + '</div>' +
        '<button class="more" data-p="' + esc(p.id) + '" aria-haspopup="dialog" aria-label="' + esc(tx(UI.more) + ': ' + p.id) + '">' + esc(tx(UI.more)) + '</button></article>';
    }).join('');
  }
  var dlg = $('dlg');
  function renderDialog() {
    var p = D.projects.filter(function (x) { return x.id === openProject; })[0]; if (!p) return;
    var url = safeUrl(D.repo) ? D.repo + '/tree/main/' + encodeURIComponent(p.id) : '';
    $('dlg-body').innerHTML = '<div class="chips" style="margin-bottom:10px">' + p.chips.map(chipHtml).join('') + '</div>' +
      '<h3 id="dlg-title">' + esc(p.id) + '</h3>' +
      '<h4>' + esc(tx(UI.why)) + '</h4><p>' + esc(tx(p.summary)) + '</p>' +
      '<div class="ex-host" id="ex-host"></div>' +
      '<h4>' + esc(tx(UI.proof)) + '</h4><p>' + esc(tx(p.proof)) + '</p>' +
      (p.points && p.points.length ? '<h4>' + esc(tx(UI.points)) + '</h4><ul>' + p.points.map(function (x) { return '<li>' + esc(tx(x)) + '</li>'; }).join('') + '</ul>' : '') +
      '<h4>' + esc(tx(UI.limits)) + '</h4><p>' + esc(tx(p.limits)) + '</p>' +
      (url ? '<p><a class="btn" target="_blank" rel="noopener noreferrer" href="' + esc(url) + '">' + esc(tx(UI.folder)) + ': ' + esc(p.id) + '<span class="sr"> ' + esc(tx(UI.newTab)) + '</span></a></p>' : '');
    mountExample();
  }
  function mountExample() {
    var h = $('ex-host'); if (!h || !window.SSCExample) return;
    window.SSCExample.mount(h, window.SSC_EX && window.SSC_EX[openProject], lang);
  }
  $('filters').addEventListener('click', function (e) {
    if (!e.target.dataset.f) return; filter = e.target.dataset.f;
    Array.prototype.forEach.call($('filters').children, function (b) { b.setAttribute('aria-pressed', b.dataset.f === filter); });
    renderProjects();
  });
  function openProj(id) {
    openProject = id; renderDialog();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }
  $('projects-grid').addEventListener('click', function (e) {
    var b = e.target.closest('[data-p]'); if (!b) return;
    openProj(b.dataset.p);
  });
  function closeDlg() {
    if (window.SSCExample) window.SSCExample.stop();
    if (dlg.close) dlg.close(); else dlg.removeAttribute('open');
    var b = openProject && document.querySelector('.more[data-p="' + openProject + '"]'); if (b) b.focus();
  }
  $('dlg-close').addEventListener('click', closeDlg);
  dlg.addEventListener('click', function (e) {
    if (e.target !== dlg) return;
    var r = dlg.getBoundingClientRect();     // клик в падинга на прозореца не затваря; само върху фона
    var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside || (r.width === 0 && r.height === 0)) closeDlg();
  });

  /* ---------- фонови презентации и контакти ---------- */
  var decksHtml = '';
  function renderDecks() {
    var html = D.decks.map(function (d) {
      return '<a class="card deck" href="' + esc(safeLink(d.url)) + '"><h3>' + esc(d.title) + '</h3><span class="mono">' + esc(tx(d.note)) + '</span><span class="go">' + esc(tx(UI.deckBtn)) + ' →</span></a>';
    }).join('');
    $('decks').innerHTML = html; decksHtml = html;
  }
  function renderSocials() {
    $('socials').innerHTML = D.socials.map(function (s) {
      var u = safeUrl(s.url);
      if (u) return '<a class="pill" target="_blank" rel="noopener noreferrer" href="' + esc(u) + '" title="' + esc(s.handle || tx(UI.profile)) + '"><span class="n">' + esc(s.name) + '</span><span class="sr"> ' + esc(tx(UI.newTab)) + '</span></a>';
      return '<span class="pill off"><span class="n">' + esc(s.name) + '</span></span>';
    }).join('');
  }
  $('cv-link').setAttribute('href', safeFile(D.cv.url) || '#');  $('repo-link').setAttribute('href', safeUrl(D.repo) || '#');

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
    renderFilters(); renderProjects(); renderDecks(); renderSocials();
    if (dlg.hasAttribute('open')) renderDialog();
    if (window.SSCPersonal) window.SSCPersonal.render(l);
    if (window.SSCDemo) window.SSCDemo.render(l);
    if (window.SSCGate) window.SSCGate.render(l);
    if (window.SSCReview) window.SSCReview.render(l);
    if (window.SSCRain) window.SSCRain.setLang(l);
    if (window.SSCDiagrams) window.SSCDiagrams.render(l);
    if (window.SSCAI) window.SSCAI.render(l);
    if (window.SSCMaps) window.SSCMaps.render(l);
    try { localStorage.setItem('ssc-lang', l); } catch (e) {}
  }
  $('lang').addEventListener('click', function (e) { if (e.target.dataset.lang) applyLang(e.target.dataset.lang); });
  $('year').textContent = new Date().getFullYear();
  applyLang(detectLang());

  /* ---------- табове: публична част и личен контрол ---------- */
  var TABS = ['home', 'review', 'work', 'architecture', 'demo', 'ai', 'method', 'patch', 'about', 'personal'];
  var ALIAS = { top: 'home', start: 'home', projects: 'work', contact: 'about', memory: 'architecture', skills: 'method', animation: 'demo', animations: 'demo', live: 'demo', platforms: 'ai', tools: 'ai', models: 'ai' };
  var tabEls = Array.prototype.slice.call(document.querySelectorAll('#tablist [role="tab"]'));
  var current = 'home';
  function parseHash() {
    var h = (location.hash || '').replace('#', '').split('/');
    var id = ALIAS[h[0]] || h[0];
    return { tab: TABS.indexOf(id) > -1 ? id : null, sub: h[1] || '' };
  }
  function showTab(id, opts) {
    opts = opts || {};
    if (TABS.indexOf(id) < 0) id = 'home';
    current = id;
    tabEls.forEach(function (t) {
      var on = t.dataset.tab === id;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      var panel = $('panel-' + t.dataset.tab); if (panel) panel.hidden = !on;
    });
    if (id !== 'demo' && window.SSCDemo) window.SSCDemo.stop();
    if (window.SSCReview) { if (id === 'review') window.SSCReview.onShow(true); else window.SSCReview.stop(); }
    if (window.SSCDiagrams) window.SSCDiagrams.stop();
    if (window.SSCAI) window.SSCAI.onShow(id === 'ai');
    document.body.setAttribute('data-view', id === 'personal' ? 'personal' : 'public');
    if (id === 'personal' && window.SSCPersonal) window.SSCPersonal.onShow(opts.sub);
    else if (window.SSCPersonal) window.SSCPersonal.lockNow();          // личното се заключва, когато го напуснеш
    if (!opts.keepHash) { try { var nh = '#' + id + (opts.sub ? '/' + opts.sub : ''); if (location.hash !== nh) history.pushState(null, '', nh); } catch (e) {} }   // всеки таб е стъпка в историята, за да работи бутонът назад
    if (opts.focus) { var p = $('panel-' + id); if (p) p.focus({ preventScroll: false }); }
    if (opts.scroll) { var top = $('tablist'); if (top && top.scrollIntoView) top.scrollIntoView({ block: 'start' }); }
  }
  tabEls.forEach(function (t, i) {
    t.addEventListener('click', function () { showTab(t.dataset.tab, { scroll: true }); });
    t.addEventListener('keydown', function (e) {
      var n = null;
      if (e.key === 'ArrowRight') n = (i + 1) % tabEls.length; else if (e.key === 'ArrowLeft') n = (i - 1 + tabEls.length) % tabEls.length;
      else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = tabEls.length - 1;
      if (n !== null) { e.preventDefault(); showTab(tabEls[n].dataset.tab, {}); tabEls[n].focus(); }
    });
  });
  window.addEventListener('hashchange', function () { var h = parseHash(); var t = h.tab || 'home'; if (t !== current) showTab(t, { sub: h.sub, keepHash: true, scroll: true }); });
  // връзките в страницата (бутоните в началото, „към съдържанието“) сменят таба
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]'); if (!a) return;
    var h = a.getAttribute('href').slice(1).split('/')[0]; var id = ALIAS[h] || h;
    if (TABS.indexOf(id) > -1) { e.preventDefault(); showTab(id, { scroll: true, focus: true }); }
  });
  var h0 = parseHash(); showTab(h0.tab || 'home', { sub: h0.sub, keepHash: !h0.tab });

  // малка анимация при натискане на всяко копче, таб и плочка
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('button, a.btn, a.tile, a.brand'); if (!b) return;
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    setTimeout(function () { b.classList.remove('pop'); }, 520);
  });

  window.SSCApp = { decks: function () { return decksHtml; }, openProject: openProj, setLang: applyLang, getLang: function () { return lang; }, showTab: showTab, tab: function () { return current; } };
})();
