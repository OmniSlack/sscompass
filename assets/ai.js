/* AI platforms tab: one working model, several tools. Each platform has its own animated core (cores.js);
   this file wires the buttons, the state switch and the short, honest description of what each tool is used for. */
(function () {
  'use strict';
  var T = function (bg, en) { return { bg: bg, en: en }; };
  var AIS = [
    { id: 'claude', name: 'Claude Code', kind: T('Асистент за код', 'Coding assistant'),
      what: T('Пише код и автоматични тестове под мое ръководство. Аз задавам изискванията и критериите за приемане и преглеждам резултата.', 'Writes code and automated tests under my direction. I set the requirements and acceptance criteria and review the result.') },
    { id: 'codex', name: 'Codex', kind: T('Асистент за код', 'Coding assistant'),
      what: T('Втори асистент за код. Откритията му се приписват на него, не на мен, и резултатите му се проверяват със същите команди.', 'A second coding assistant. What it finds is attributed to it, not to me, and its results are checked with the same commands.') },
    { id: 'gpt', name: 'GPT', kind: T('Проучване и сравнение', 'Research and comparison'),
      what: T('Използвам го за проучване и за сравняване на отговори между модели. Твърденията се сверяват с първичните източници.', 'Used for research and for comparing answers across models. Claims are checked against primary sources.') },
    { id: 'gemini', name: 'Gemini', kind: T('Проучване и сравнение', 'Research and comparison'),
      what: T('Използвам го за проучване и за сравняване на отговори между модели. Твърденията се сверяват с първичните източници.', 'Used for research and for comparing answers across models. Claims are checked against primary sources.') }
  ];
  var STATES = [
    { id: 'idle', n: T('Покой', 'Idle') }, { id: 'listening', n: T('Слуша', 'Listening') }, { id: 'working', n: T('Работи', 'Working') },
    { id: 'speaking', n: T('Отговаря', 'Speaking') }, { id: 'error', n: T('Грешка', 'Error') }
  ];
  var UI = {
    pick: T('Платформа', 'Platform'), state: T('Състояние', 'State'),
    play: T('▶ Цикъл', '▶ Cycle'), pause: T('⏸ Пауза', '⏸ Pause'),
    rule: T('Съгласието между моделите не е независимо потвърждение. Проучването, критиката и синтезът се разпределят между модели, а първичните източници се сверяват.', 'Agreement between models is not independent confirmation. Research, critique and synthesis are split between models, and primary sources are checked.'),
    toolNote: T('Анимацията е само образ на платформата, не показва вътрешна работа на модела.', 'The animation is only an image of the platform. It does not show how the model works inside.')
  };
  var lang = 'bg', cur = 'claude', state = 'idle', timer = null, playing = false, root, ready = false;
  var motionOff = false;
  function tx(v) { return v[lang] || v.en; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function core() { return window.SSCCore; }

  function build() {
    root = document.getElementById('ai-root'); if (!root) return;
    root.appendChild(el('div', 'aipick'));
    root.appendChild(el('div', 'aistate'));
    var info = el('div', 'aiinfo'); info.setAttribute('role', 'status'); info.setAttribute('aria-live', 'polite'); root.appendChild(info);
    root.appendChild(el('p', 'note ai-rule'));
    ready = true;
  }
  function draw() {
    if (!root) return;
    var pick = root.querySelector('.aipick'), st = root.querySelector('.aistate'), info = root.querySelector('.aiinfo');
    pick.textContent = ''; pick.setAttribute('role', 'group'); pick.setAttribute('aria-label', tx(UI.pick));
    AIS.forEach(function (a) {
      var b = el('button', 'ai-b', a.name); b.type = 'button'; b.dataset.ai = a.id; b.setAttribute('aria-pressed', String(a.id === cur)); b.className += ' ai-' + a.id;
      b.addEventListener('click', function () { cur = a.id; if (core()) core().setAI(a.id); draw(); });
      pick.appendChild(b);
    });
    st.textContent = ''; st.setAttribute('role', 'group'); st.setAttribute('aria-label', tx(UI.state));
    STATES.forEach(function (s) {
      var b = el('button', 'st-b', tx(s.n)); b.type = 'button'; b.dataset.state = s.id; b.setAttribute('aria-pressed', String(s.id === state));
      b.addEventListener('click', function () { stopCycle(); setState(s.id); });
      st.appendChild(b);
    });
    var play = el('button', 'st-b st-play', playing ? tx(UI.pause) : tx(UI.play)); play.type = 'button'; play.addEventListener('click', function () { playing ? stopCycle() : startCycle(); });
    st.appendChild(play);
    var a = AIS.filter(function (x) { return x.id === cur; })[0];
    info.textContent = '';
    info.appendChild(el('b', null, a.name)); info.appendChild(el('span', 'mono ai-kind', tx(a.kind))); info.appendChild(el('p', null, tx(a.what)));
    root.querySelector('.ai-rule').textContent = tx(UI.rule) + ' ' + tx(UI.toolNote);
  }
  function setState(s) { state = s; if (core()) core().setState(s); draw(); }
  var order = ['listening', 'working', 'speaking', 'idle'], oi = 0;
  function startCycle() { playing = true; oi = 0; setState(order[0]); timer = setInterval(function () { oi = (oi + 1) % order.length; setState(order[oi]); }, 2400); draw(); }
  function stopCycle() { if (timer) { clearInterval(timer); timer = null; } if (playing) { playing = false; draw(); } }

  window.SSCAI = {
    render: function (l) { lang = l === 'en' ? 'en' : 'bg'; if (!ready) build(); draw(); },
    onShow: function (on) {
      if (!ready) return;
      if (!on) stopCycle();
      if (core()) core().setPaused(on ? motionOff : true);
    },
    platforms: AIS, states: STATES
  };
  if (document.getElementById('ai-root')) { build(); if (window.SSCCore) { motionOff = window.SSCCore.isPaused(); window.SSCCore.setAI(cur, true); window.SSCCore.setPaused(true); } draw(); }
})();
