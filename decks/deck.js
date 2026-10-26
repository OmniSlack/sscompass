/* Deck viewer. Renders the slide data in data/*.js. */
(function () {
  'use strict';
  var DECKS = window.DECKS, ORDER = ['omniecho', 'coherence', 'dream'];
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

  var UI = {
    bg: { prev: '← Назад', next: 'Напред →', over: 'Всички слайдове', back: 'Обратно към сайта', skip: 'Към слайда', slide: 'Слайд', of: 'от', lang: 'bg' },
    en: { prev: '← Previous', next: 'Next →', over: 'All slides', back: 'Back to the site', skip: 'Skip to the slide', slide: 'Slide', of: 'of', lang: 'en' }
  };
  var lang = 'en', deckId = 'omniecho', idx = 0;

  function readLang() {
    var s = null; try { s = localStorage.getItem('ssc-lang'); } catch (e) {}
    return s === 'bg' || s === 'en' ? s : (/^bg/i.test(navigator.language || '') ? 'bg' : 'en');
  }
  function fromHash() {
    var h = (location.hash || '').replace('#', '').split('/');
    if (DECKS[h[0]]) deckId = h[0];
    var n = parseInt(h[1], 10); idx = n >= 1 && n <= DECKS[deckId].slides.length ? n - 1 : 0;
  }
  function setHash() { try { history.replaceState(null, '', '#' + deckId + '/' + (idx + 1)); } catch (e) {} }

  function cardHtml(c) {
    return '<div class="c ' + esc(c.tone || '') + '">' +
      (c.k ? '<div class="k">' + esc(c.k) + '</div>' : '') +
      (c.h ? '<h3>' + esc(c.h) + '</h3>' : '') +
      (c.p ? '<p>' + esc(c.p) + '</p>' : '') +
      (c.items ? '<ul>' + c.items.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>' : '') +
      (c.note ? '<div class="cn">' + esc(c.note) + '</div>' : '') + '</div>';
  }

  /* ---------- architecture blueprint (first OmniEcho slide) ---------- */
  var BP = { g: null, i: null };
  var BPUI = { bg: { hint: 'Натисни число върху чертежа или едно от петте общи числа над него.' }, en: { hint: 'Tap a number on the blueprint, or one of the five totals above it.' } };
  function pol(r, deg) { var a = deg * Math.PI / 180; return [400 + r * Math.cos(a), 400 + r * Math.sin(a)]; }
  function f1(x) { return Math.round(x * 10) / 10; }
  function bpSvg(groups) {
    var s = '<svg class="bpsvg" viewBox="0 0 800 800" role="group" aria-label="Architecture blueprint">';
    s += '<defs><radialGradient id="bpg" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#0b2a4a"/><stop offset="1" stop-color="#030812"/></radialGradient>' +
      '<pattern id="bpgrid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#4fd1e6" stroke-opacity=".09"/></pattern>' +
      '<linearGradient id="bpsweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4fd1e6" stop-opacity="0"/><stop offset="1" stop-color="#4fd1e6" stop-opacity=".28"/></linearGradient></defs>';
    s += '<rect x="0" y="0" width="800" height="800" rx="26" fill="url(#bpg)"/><rect x="0" y="0" width="800" height="800" rx="26" fill="url(#bpgrid)"/>';
    s += '<rect class="bpframe" x="14" y="14" width="772" height="772" rx="18"/>';
    [[14, 14, 1, 1], [786, 14, -1, 1], [14, 786, 1, -1], [786, 786, -1, -1]].forEach(function (c) { s += '<path class="bpbr" d="M' + c[0] + ' ' + (c[1] + c[3] * 70) + 'V' + c[1] + 'H' + (c[0] + c[2] * 70) + '"/>'; });
    for (var t = 0; t < 72; t++) { var p1 = pol(372, t * 5), p2 = pol(t % 6 === 0 ? 358 : 365, t * 5); s += '<line class="bptick" x1="' + f1(p1[0]) + '" y1="' + f1(p1[1]) + '" x2="' + f1(p2[0]) + '" y2="' + f1(p2[1]) + '"/>'; }
    [372, 285, 195, 105].forEach(function (r, k) { s += '<circle class="bpring' + (k === 0 ? ' outer' : '') + '" cx="400" cy="400" r="' + r + '"/>'; });
    s += '<g class="bpsweep"><path d="M400 400 L400 28 A372 372 0 0 1 560 62 Z" fill="url(#bpsweep)"/></g>';
    for (var q = 0; q < 8; q++) { var a1 = pol(62, -90 + q * 45), a2 = pol(330, -90 + q * 45); s += '<line class="bpspoke" x1="' + f1(a1[0]) + '" y1="' + f1(a1[1]) + '" x2="' + f1(a2[0]) + '" y2="' + f1(a2[1]) + '"/>'; }
    var pent = groups[3].items.map(function (_, k) { var p = pol(62, -90 + k * 72); return f1(p[0]) + ',' + f1(p[1]); }).join(' ');
    s += '<polygon class="bppent" points="' + pent + '"/>';
    s += '<text class="bpc" x="400" y="410" text-anchor="middle">Δt</text>';
    function marker(g, k, x, y, shape, label) {
      var it = g.items[k], sh = '';
      if (shape === 'circle') sh = '<circle r="22"/>';
      else if (shape === 'square') sh = '<rect x="-22" y="-22" width="44" height="44" rx="5"/>';
      else if (shape === 'hex') { var pts = []; for (var h = 0; h < 6; h++) { pts.push(f1(27 * Math.cos(h * Math.PI / 3)) + ',' + f1(27 * Math.sin(h * Math.PI / 3))); } sh = '<polygon points="' + pts.join(' ') + '"/>'; }
      else if (shape === 'diamond') sh = '<polygon points="0,-25 25,0 0,25 -25,0"/>';
      else sh = '<rect x="-25" y="-25" width="50" height="50" rx="9"/>';
      sh = '<circle class="hit" r="32"/>' + sh;
      return '<g class="bpm ' + g.color + '" data-bpg="' + g.id + '" data-bpi="' + k + '" transform="translate(' + f1(x) + ' ' + f1(y) + ')" tabindex="0" role="button" aria-label="' + esc(g.label + ' ' + label + ': ' + it.h) + '">' + sh + '<text text-anchor="middle" y="6">' + esc(label) + '</text></g>';
    }
    groups[0].items.forEach(function (it, k) { var p = pol(330, -90 + k * 22.5); s += marker(groups[0], k, p[0], p[1], 'circle', it.n); });
    groups[1].items.forEach(function (it, k) { var p = pol(240, -90 + k * 36); s += marker(groups[1], k, p[0], p[1], 'square', it.n); });
    groups[2].items.forEach(function (it, k) { var p = pol(150, -67.5 + k * 45); s += marker(groups[2], k, p[0], p[1], 'hex', it.n); });
    groups[3].items.forEach(function (it, k) { var p = pol(62, -90 + k * 72); s += marker(groups[3], k, p[0], p[1], 'diamond', it.n); });
    [[56, 56], [744, 56], [744, 744], [56, 744]].forEach(function (c, k) { s += marker(groups[4], k, c[0], c[1], 'rounded', groups[4].items[k].n); });
    s += '<text class="bpcap" x="400" y="40" text-anchor="middle">OMNIECHO · ARCHITECTURE BLUEPRINT</text><text class="bpcap" x="400" y="774" text-anchor="middle">CONCEPTUAL MODEL · NOT A CERTIFIED STANDARD</text>';
    return s + '</svg>';
  }
  function bpHtml(b) {
    return '<div class="bp"><div class="bp-fig">' + bpSvg(b.groups) + '</div><div class="bp-side"><div class="bp-detail" role="status" aria-live="polite"></div><div class="bp-list" role="group"></div></div></div>';
  }
  function bpUpdate() {
    var st = $('stage'), s = DECKS[deckId].slides[idx], b = s.blueprint; if (!b || !st.querySelector('.bp')) return;
    var u = BPUI[lang], g = null, it = null, k;
    for (k = 0; k < b.groups.length; k++) if (b.groups[k].id === BP.g) g = b.groups[k];
    if (g && BP.i != null) it = g.items[BP.i];
    Array.prototype.forEach.call(st.querySelectorAll('.stat'), function (x) { x.setAttribute('aria-pressed', String(x.dataset.bpg === BP.g)); });
    Array.prototype.forEach.call(st.querySelectorAll('.bpm'), function (m) {
      m.classList.toggle('grp', m.dataset.bpg === BP.g);
      m.classList.toggle('sel', m.dataset.bpg === BP.g && BP.i != null && +m.dataset.bpi === BP.i);
      m.setAttribute('aria-pressed', String(m.classList.contains('sel')));
    });
    st.querySelector('.bp').classList.toggle('has-sel', !!g);
    var det = st.querySelector('.bp-detail'), list = st.querySelector('.bp-list'); det.textContent = ''; list.textContent = '';
    function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
    if (!g) { det.className = 'bp-detail idle'; det.appendChild(el('p', null, u.hint)); return; }
    det.className = 'bp-detail ' + g.color;
    if (it) { det.appendChild(el('div', 'k', it.k)); det.appendChild(el('h3', null, it.h)); det.appendChild(el('p', null, it.p)); det.appendChild(el('div', 'bp-crumb', g.n + ' ' + g.label + ' · ' + g.layer)); }
    else { det.appendChild(el('div', 'k', g.layer)); det.appendChild(el('h3', null, g.n + ' ' + g.label)); det.appendChild(el('p', null, g.blurb)); if (g.extra) det.appendChild(el('p', 'bp-extra', g.extra)); }
    g.items.forEach(function (x, j) {
      var bt = el('button', 'bp-item ' + g.color, null); bt.type = 'button'; bt.dataset.bpg = g.id; bt.dataset.bpi = String(j); bt.setAttribute('aria-pressed', String(j === BP.i));
      bt.appendChild(el('span', 'n', x.n)); bt.appendChild(el('span', 't', x.h)); list.appendChild(bt);
    });
  }
  function bpPick(g, i) {
    if (g === BP.g && i == null) { BP.g = null; BP.i = null; }
    else if (g === BP.g && i === BP.i) { BP.i = null; }
    else { BP.g = g; BP.i = i == null ? null : i; }
    bpUpdate();
  }

  function slideHtml(s) {
    if (s.closing) return '<div class="closing' + (s.mono ? ' mono' : '') + '">' + s.lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '</div>';
    var h = '<div' + (s.hero ? ' class="hero-slide"' : '') + '>';
    if (s.kicker) h += '<div class="kicker">' + esc(s.kicker) + '</div>';
    h += '<h2>' + esc(s.title) + '</h2>';
    if (s.lead) h += '<p class="lead">' + esc(s.lead) + '</p>';
    if (s.stats) h += '<div class="stats">' + s.stats.map(function (x) { return s.blueprint ? '<button type="button" class="stat" data-bpg="' + esc(x.n) + '" aria-pressed="false"><b>' + esc(x.n) + '</b><span>' + esc(x.l) + '</span></button>' : '<div><b>' + esc(x.n) + '</b><span>' + esc(x.l) + '</span></div>'; }).join('') + '</div>';
    if (s.cards) h += '<div class="cards">' + s.cards.map(cardHtml).join('') + '</div>';
    if (s.note) h += '<p class="snote">' + esc(s.note) + '</p>';
    if (s.blueprint) h += bpHtml(s.blueprint);
    return h + '</div>';
  }

  function slideName(s, i) { return s.title || (s.closing ? (lang === 'bg' ? 'Финал' : 'Closing') : 'Slide ' + (i + 1)); }

  function render(focus) {
    var d = DECKS[deckId], u = UI[lang], s = d.slides[idx];
    document.documentElement.lang = lang;
    document.title = d.title + ' · ' + (lang === 'bg' ? 'Мартин Урумов' : 'Martin Urumov');
    $('dtitle').textContent = d.title; $('dsub').textContent = d.sub;
    $('decknav').innerHTML = ORDER.map(function (k) { return '<a href="#' + k + '/1" data-d="' + k + '"' + (k === deckId ? ' aria-current="page"' : '') + '>' + esc(DECKS[k].title) + '</a>'; }).join('');
    $('stage').innerHTML = slideHtml(s);
    $('prev').textContent = u.prev; $('next').textContent = u.next; $('over').textContent = u.over;
    $('back').textContent = u.back; $('skip').textContent = u.skip;
    $('prev').disabled = idx === 0; $('next').disabled = idx === d.slides.length - 1;
    $('count').textContent = u.slide + ' ' + (idx + 1) + ' ' + u.of + ' ' + d.slides.length;
    Array.prototype.forEach.call($('lang').children, function (b) { b.setAttribute('aria-pressed', b.dataset.lang === lang); });
    $('overview').innerHTML = d.slides.map(function (x, i) { return '<button data-i="' + i + '"' + (i === idx ? ' aria-current="true"' : '') + '><span>' + (i + 1) + '</span>' + esc(slideName(x, i)) + '</button>'; }).join('');
    setHash(); bpUpdate();
    if (focus) $('stage').focus({ preventScroll: true });
  }

  function go(n) { BP.g = null; BP.i = null; var max = DECKS[deckId].slides.length - 1; idx = Math.max(0, Math.min(max, n)); render(true); }
  $('prev').addEventListener('click', function () { go(idx - 1); });
  $('next').addEventListener('click', function () { go(idx + 1); });
  $('over').addEventListener('click', function () { $('overview').hidden = !$('overview').hidden; });
  $('overview').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { go(+b.dataset.i); } });
  $('lang').addEventListener('click', function (e) { if (e.target.dataset.lang) { lang = e.target.dataset.lang; try { localStorage.setItem('ssc-lang', lang); } catch (x) {} render(false); } });
  window.addEventListener('hashchange', function () { BP.g = null; BP.i = null; fromHash(); render(false); });
  $('stage').addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-bpg]'); if (!t) return;
    bpPick(t.dataset.bpg, t.dataset.bpi == null ? null : +t.dataset.bpi);
  });
  $('stage').addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var t = e.target.closest && e.target.closest('.bpm'); if (!t) return;
    e.preventDefault(); e.stopPropagation(); bpPick(t.dataset.bpg, +t.dataset.bpi);
  });
  document.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('input, textarea, select')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { go(idx + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { go(idx - 1); }
    else if (e.key === 'Home') { go(0); }
    else if (e.key === 'End') { go(DECKS[deckId].slides.length - 1); }
  });

  lang = readLang(); fromHash(); render(false);
  window.SSCDecks = { go: go, state: function () { return { deck: deckId, index: idx, lang: lang }; }, setLang: function (l) { lang = l; render(false); } };
})();
