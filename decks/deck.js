/* SSC Compass — deck viewer. Renders the slide data in data/*.js. */
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

  function slideHtml(s) {
    if (s.closing) return '<div class="closing' + (s.mono ? ' mono' : '') + '">' + s.lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '</div>';
    var h = '<div' + (s.hero ? ' class="hero-slide"' : '') + '>';
    if (s.kicker) h += '<div class="kicker">' + esc(s.kicker) + '</div>';
    h += '<h2>' + esc(s.title) + '</h2>';
    if (s.lead) h += '<p class="lead">' + esc(s.lead) + '</p>';
    if (s.stats) h += '<div class="stats">' + s.stats.map(function (x) { return '<div><b>' + esc(x.n) + '</b><span>' + esc(x.l) + '</span></div>'; }).join('') + '</div>';
    if (s.cards) h += '<div class="cards">' + s.cards.map(cardHtml).join('') + '</div>';
    if (s.note) h += '<p class="snote">' + esc(s.note) + '</p>';
    return h + '</div>';
  }

  function slideName(s, i) { return s.title || (s.closing ? (lang === 'bg' ? 'Финал' : 'Closing') : 'Slide ' + (i + 1)); }

  function render(focus) {
    var d = DECKS[deckId], u = UI[lang], s = d.slides[idx];
    document.documentElement.lang = lang;
    document.title = d.title + ' · SSC Compass · ' + (lang === 'bg' ? 'Мартин Урумов' : 'Martin Urumov');
    $('dtitle').textContent = d.title; $('dsub').textContent = d.sub;
    $('decknav').innerHTML = ORDER.map(function (k) { return '<a href="#' + k + '/1" data-d="' + k + '"' + (k === deckId ? ' aria-current="page"' : '') + '>' + esc(DECKS[k].title) + '</a>'; }).join('');
    $('stage').innerHTML = slideHtml(s);
    $('prev').textContent = u.prev; $('next').textContent = u.next; $('over').textContent = u.over;
    $('back').textContent = u.back; $('skip').textContent = u.skip;
    $('prev').disabled = idx === 0; $('next').disabled = idx === d.slides.length - 1;
    $('count').textContent = u.slide + ' ' + (idx + 1) + ' ' + u.of + ' ' + d.slides.length;
    Array.prototype.forEach.call($('lang').children, function (b) { b.setAttribute('aria-pressed', b.dataset.lang === lang); });
    $('overview').innerHTML = d.slides.map(function (x, i) { return '<button data-i="' + i + '"' + (i === idx ? ' aria-current="true"' : '') + '><span>' + (i + 1) + '</span>' + esc(slideName(x, i)) + '</button>'; }).join('');
    setHash();
    if (focus) $('stage').focus({ preventScroll: true });
  }

  function go(n) { var max = DECKS[deckId].slides.length - 1; idx = Math.max(0, Math.min(max, n)); render(true); }
  $('prev').addEventListener('click', function () { go(idx - 1); });
  $('next').addEventListener('click', function () { go(idx + 1); });
  $('over').addEventListener('click', function () { $('overview').hidden = !$('overview').hidden; });
  $('overview').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { go(+b.dataset.i); } });
  $('lang').addEventListener('click', function (e) { if (e.target.dataset.lang) { lang = e.target.dataset.lang; try { localStorage.setItem('ssc-lang', lang); } catch (x) {} render(false); } });
  window.addEventListener('hashchange', function () { fromHash(); render(false); });
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
