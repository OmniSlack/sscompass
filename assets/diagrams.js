/* Interactive diagrams: tap or hover a box to see what it does, or walk through the whole loop.
   The descriptions come from the text lists next to each diagram, so there is one source of truth. */
(function () {
  'use strict';
  var STR = {
    hint: { bg: 'Натисни кутия, за да видиш какво прави, или пусни обиколката.', en: 'Tap a box to see what it does, or start the walk-through.' },
    play: { bg: '▶ Обиколка', en: '▶ Walk through' }, pause: { bg: '⏸ Пауза', en: '⏸ Pause' },
    next: { bg: 'Следваща ›', en: 'Next ›' }, clear: { bg: '✕ Изчисти', en: '✕ Clear' },
    step: { bg: 'Стъпка', en: 'Step' }, of: { bg: 'от', en: 'of' }
  };
  var lang = 'bg', cards = [];
  function tx(k) { return STR[k][lang] || STR[k].en; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function build(card) {
    var svg = card.querySelector('svg'), lis = Array.prototype.slice.call(card.querySelectorAll('ol.steps li'));
    var rects = Array.prototype.slice.call(svg.querySelectorAll('rect.node')), groups = [];
    rects.forEach(function (r, k) {
      var g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'nd');
      r.parentNode.insertBefore(g, r); g.appendChild(r);
      var n = g.nextSibling;
      while (n && !(n.nodeType === 1 && ((n.tagName === 'rect' && n.classList.contains('node')) || n.tagName === 'path' || n.tagName === 'circle'))) {
        var next = n.nextSibling; if (n.nodeType === 1) g.appendChild(n); n = next;
      }
      g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button');
      g.style.animationDelay = '-' + (k * 0.8).toFixed(1) + 's'; r.style.animationDelay = '-' + (k * 0.8).toFixed(1) + 's';
      groups.push(g);
    });
    var st = { card: card, svg: svg, lis: lis, groups: groups, sel: -1, timer: null, playing: false };
    var bar = el('div', 'dg-bar'), info = el('div', 'dg-info'); info.setAttribute('role', 'status'); info.setAttribute('aria-live', 'polite');
    var play = el('button', 'btn'), next = el('button', 'btn'), clear = el('button', 'btn'), count = el('span', 'mono dg-count');
    [play, next, clear].forEach(function (b) { b.type = 'button'; bar.appendChild(b); }); bar.appendChild(count);
    card.parentNode.insertBefore(bar, card); card.parentNode.insertBefore(info, card.nextSibling);
    st.bar = { play: play, next: next, clear: clear, count: count }; st.info = info;
    function total() { return Math.max(groups.length, lis.length); }
    st.select = function (k) { st.sel = k; draw(st); };
    st.stop = function () { if (st.timer) { clearInterval(st.timer); st.timer = null; } st.playing = false; };
    st.advance = function () { st.sel = (st.sel + 1) % total(); draw(st); };
    play.addEventListener('click', function () { if (st.playing) { st.stop(); draw(st); return; } st.playing = true; st.advance(); st.timer = setInterval(st.advance, 2600); });
    next.addEventListener('click', function () { st.stop(); st.advance(); });
    clear.addEventListener('click', function () { st.stop(); st.select(-1); });
    groups.forEach(function (g, k) {
      g.addEventListener('click', function () { st.stop(); st.select(k === st.sel ? -1 : k); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); st.stop(); st.select(k === st.sel ? -1 : k); } });
      g.addEventListener('mouseenter', function () { if (!st.playing && st.sel < 0) infoFor(st, k, true); });
      g.addEventListener('mouseleave', function () { if (!st.playing && st.sel < 0) draw(st); });
    });
    lis.forEach(function (li, k) {
      li.setAttribute('tabindex', '0'); li.setAttribute('role', 'button');
      li.addEventListener('click', function () { st.stop(); st.select(k === st.sel ? -1 : k); });
      li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); st.stop(); st.select(k === st.sel ? -1 : k); } });
    });
    cards.push(st); draw(st);
  }
  function infoFor(st, k, hover) {
    var li = st.lis[k], title, body;
    if (li) { title = li.querySelector('b').textContent; body = li.querySelector('span').textContent; }
    else { var g = st.groups[k], t = g ? g.querySelectorAll('text') : []; title = t.length ? t[0].textContent : ''; body = Array.prototype.slice.call(t, 1).map(function (x) { return x.textContent; }).join(' · '); }
    st.info.textContent = '';
    st.info.appendChild(el('b', null, title)); st.info.appendChild(el('span', null, body));
    st.info.classList.toggle('on', true); st.info.classList.toggle('hover', !!hover);
  }
  function draw(st) {
    var n = Math.max(st.groups.length, st.lis.length);
    st.groups.forEach(function (g, k) { g.classList.toggle('sel', k === st.sel); });
    st.lis.forEach(function (li, k) { li.classList.toggle('sel', k === st.sel); li.setAttribute('aria-pressed', String(k === st.sel)); });
    st.card.classList.toggle('has-sel', st.sel >= 0);
    st.bar.play.textContent = st.playing ? tx('pause') : tx('play'); st.bar.next.textContent = tx('next'); st.bar.clear.textContent = tx('clear');
    st.bar.count.textContent = st.sel >= 0 ? tx('step') + ' ' + (st.sel + 1) + ' ' + tx('of') + ' ' + n : '';
    if (st.sel >= 0) infoFor(st, st.sel, false);
    else { st.info.textContent = tx('hint'); st.info.classList.remove('on', 'hover'); }
  }
  function init() {
    var found = document.querySelectorAll('.arch');
    Array.prototype.forEach.call(found, function (c) { if (c.querySelector('svg') && c.querySelector('ol.steps')) build(c); });
  }
  window.SSCDiagrams = {
    render: function (l) { lang = l === 'en' ? 'en' : 'bg'; cards.forEach(draw); },
    stop: function () { cards.forEach(function (s) { if (s.playing) { s.stop(); draw(s); } }); }
  };
  init(); // the script sits at the end of body, so the diagrams already exist
})();
