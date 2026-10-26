/* A worked example inside the project dialog: the real input, a small diagram that the example walks through step by step,
   and the real output. Data comes from assets/examples.js, taken from the portfolio repository files. */
(function () {
  'use strict';
  var UI = {
    title: { bg: 'Пример', en: 'Example' }, input: { bg: 'Вход', en: 'Input' }, output: { bg: 'Резултат', en: 'Result' },
    play: { bg: 'Пусни', en: 'Play' }, pause: { bg: 'Пауза', en: 'Pause' }, back: { bg: 'Назад', en: 'Back' }, next: { bg: 'Напред', en: 'Forward' }, reset: { bg: 'Отначало', en: 'Restart' },
    jump: { bg: 'Към стъпка', en: 'Go to step' }, step: { bg: 'Стъпка', en: 'Step' }, of: { bg: 'от', en: 'of' },
    ready: { bg: 'Натисни ▶ или › и гледай как примерът минава през етапите.', en: 'Press ▶ or › and watch the example pass through the stages.' },
    where: { bg: 'Къде в репото', en: 'Where in the repository' }, honest: { bg: 'Какво показва репото', en: 'What the repository shows' }, not: { bg: 'Какво не доказва', en: 'What it does not prove' }
  };
  var timer = null;
  function tx(v, lang) { return v == null ? '' : typeof v === 'string' ? v : (v[lang] || v.en || ''); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function btn(cls, label, aria, fn) { var b = el('button', cls, label); b.type = 'button'; if (aria) b.setAttribute('aria-label', aria); b.addEventListener('click', fn); return b; }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  function mount(host, ex, lang) {
    stop(); host.textContent = '';
    if (!ex) return;
    var T = function (k) { return UI[k][lang] || UI[k].en; }, S = { i: 0, playing: false }, E = {};
    host.appendChild(el('h4', null, T('title') + ': ' + tx(ex.title, lang)));
    if (ex.note) { var nt = el('p', 'ex-note'); nt.appendChild(el('b', null, T('honest') + ': ')); nt.appendChild(document.createTextNode(tx(ex.note, lang))); host.appendChild(nt); }
    function code(kind, o) {
      var box = el('div', 'ex-code ex-' + kind); box.appendChild(el('div', 'ex-lbl', T(kind) + ' · ' + tx(o.label, lang)));
      box.appendChild(el('pre', null, o.text)); box.appendChild(el('div', 'ex-src mono', o.src)); return box;
    }
    host.appendChild(code('input', ex.input));

    var ctl = el('div', 'dm-ctl ex-ctl');
    E.prev = btn('dm-b', '‹', T('back'), function () { go(S.i - 1); });
    E.play = btn('dm-b dm-play', '▶', T('play'), toggle);
    E.next = btn('dm-b', '›', T('next'), function () { halt(); advance(); });
    E.reset = btn('dm-b', '↺', T('reset'), function () { go(0); });
    E.dots = el('div', 'dm-dots'); E.dots.setAttribute('role', 'group'); E.dots.setAttribute('aria-label', T('jump'));
    E.dotEls = ex.steps.map(function (s, k) { var d = btn('dm-dot-b', String(k + 1), T('jump') + ' ' + (k + 1), function () { go(k + 1); }); E.dots.appendChild(d); return d; });
    E.count = el('span', 'mono dm-count');
    [E.prev, E.play, E.next, E.reset, E.dots, E.count].forEach(function (n) { ctl.appendChild(n); });
    host.appendChild(ctl);

    var pipe = el('ol', 'dm-pipe ex-pipe'); E.stages = [];
    ex.nodes.forEach(function (n, k) {
      var li = el('li', 'dm-stage'); li.appendChild(el('span', 'dm-num', String(k + 1))); li.appendChild(el('b', null, tx(n.n, lang)));
      li.appendChild(el('span', 'dm-d mono', n.fn)); E.stages.push(li); pipe.appendChild(li);
    });
    host.appendChild(pipe);
    E.cur = el('div', 'dm-cur'); E.cur.setAttribute('role', 'status'); E.cur.setAttribute('aria-live', 'polite'); host.appendChild(E.cur);
    var out = code('output', ex.output); E.out = out; host.appendChild(out);
    host.appendChild(el('p', 'ex-why', tx(ex.why, lang)));
    var lim = el('p', 'ex-lim'); lim.appendChild(el('b', null, T('not') + ': ')); lim.appendChild(document.createTextNode(tx(ex.limits, lang))); host.appendChild(lim);

    function halt() { stop(); S.playing = false; }
    function go(i) { halt(); S.i = Math.max(0, Math.min(ex.steps.length, i)); update(); }
    function advance() { if (S.i < ex.steps.length) S.i++; if (S.i >= ex.steps.length) halt(); update(); }
    function toggle() { if (S.playing) { halt(); update(); return; } if (S.i >= ex.steps.length) S.i = 0; S.playing = true; advance(); if (S.playing) timer = setInterval(advance, 1700); }
    function update() {
      var n = ex.steps.length, done = S.i >= n, st = ex.nodes.map(function () { return 'idle'; }), i;
      for (i = 0; i < S.i; i++) st[ex.steps[i].node] = ex.steps[i].state;
      var cur = S.i > 0 ? ex.steps[S.i - 1].node : -1;
      E.stages.forEach(function (li, k) { li.className = 'dm-stage s-' + st[k] + (k === cur && !done ? ' on' : ''); });
      E.play.textContent = S.playing ? '⏸' : '▶'; E.play.setAttribute('aria-label', S.playing ? T('pause') : T('play'));
      E.prev.disabled = S.i === 0; E.next.disabled = done; E.reset.disabled = S.i === 0;
      E.dotEls.forEach(function (d, k) { d.className = 'dm-dot-b d-' + (k < S.i ? ex.steps[k].state : 'idle') + (k + 1 === S.i ? ' cur' : ''); d.setAttribute('aria-pressed', String(k + 1 === S.i)); });
      E.count.textContent = T('step') + ' ' + S.i + ' ' + T('of') + ' ' + n;
      E.cur.textContent = '';
      if (S.i === 0) { E.cur.className = 'dm-cur dim'; E.cur.textContent = T('ready'); }
      else { var s = ex.steps[S.i - 1]; E.cur.className = 'dm-cur c-' + s.state; E.cur.appendChild(el('b', null, S.i + '. ' + tx(ex.nodes[s.node].n, lang) + ' — ')); E.cur.appendChild(document.createTextNode(tx(s.text, lang))); if (s.src) E.cur.appendChild(el('div', 'ex-src mono', T('where') + ': ' + s.src)); }
      E.out.classList.toggle('done', done);
    }
    update();
  }
  window.SSCExample = { mount: mount, stop: stop };
})();
