/* How it works — step-by-step animated walk-throughs of three projects.
   These are illustrations of the designs described in the repository READMEs, not recordings of real runs. */
(function () {
  'use strict';
  var T = function (bg, en) { return { bg: bg, en: en }; };

  var FLOWS = [
    {
      id: 'loop', tok: T('плик', 'envelope'), name: T('Контролен цикъл', 'Control loop'), repo: 'agent-execution-control + agent-action-verifier',
      intro: T('Как едно AI предложение стига (или не стига) до действие. Мислене, предлагане, разрешаване, изпълнение и проверка са пет различни неща и никое не може да създаде друго.',
               'How one AI proposal reaches an action, or does not. Thinking, proposing, permitting, executing and verifying are five different things, and none of them can create another.'),
      stages: [
        { n: T('Цел', 'Goal'), d: T('човек решава', 'a person decides') },
        { n: T('Оценител', 'Evaluator'), d: T('CLEAR · HOLD · STOP', 'CLEAR · HOLD · STOP') },
        { n: T('Плик', 'Envelope'), d: T('точно, хеширано', 'exact, hashed') },
        { n: T('Два ключа', 'Two keys'), d: T('CLEAR + човешко разрешение', 'CLEAR + human permit') },
        { n: T('Контрол', 'Control'), d: T('еднократно искане', 'single-use claim') },
        { n: T('Бариера', 'Barrier'), d: T('повторна проверка', 're-check') },
        { n: T('Адаптер', 'Adapter'), d: T('не е построен', 'not built'), nb: true },
        { n: T('Проверяващ', 'Verifier'), d: T('независимо четене', 'independent reading') }
      ],
      scenarios: [
        { id: 'ok', name: T('Всичко е наред', 'Everything checks out'), steps: [
          { s: 0, st: 'pass', t: T('Човек задава цел.', 'A person states the goal.') },
          { s: 1, st: 'pass', t: T('Оценителят връща CLEAR: има доказателства и обозначен източник.', 'The evaluator returns CLEAR: evidence is present and the source is labelled.') },
          { s: 2, st: 'pass', t: T('Предложението се запечатва в плик: точно и неизменно.', 'The proposal is sealed in an envelope: exact and immutable.') },
          { s: 3, st: 'pass', t: T('CLEAR за точно този плик и човешко разрешение за него: вратата е отворена.', 'CLEAR for this exact envelope and a human permit for it: the gate is open.') },
          { s: 4, st: 'pass', t: T('Контролът приема едно искане. Едно разрешение дава точно едно искане.', 'Execution control accepts one claim. One permit gives exactly one claim.') },
          { s: 5, st: 'pass', t: T('Бариерата проверява отново срок, задържане и отмяна: нищо не се е променило.', 'The barrier re-checks expiry, hold and revoke: nothing has changed.') },
          { s: 6, st: 'nb', t: T('Тук би се извикал адаптер. Той не е построен: никога не е изпълнено реално външно действие.', 'An adapter would be called here. It is not built: no real external action has ever been run.') },
          { s: 7, st: 'pass', t: T('Проверяващият би прочел резултата независимо: VERIFIED → OPEN.', 'The verifier would read the result independently: VERIFIED → OPEN.') }
        ], end: { k: 'pass', l: T('Пътят по замисъл', 'The designed path'), t: T('Разходка по дизайна, не реален изпълнен случай.', 'A walk through the design, not a real executed case.') } },
        { id: 'hold', name: T('Твърдение без подкрепа', 'Claim without support'), steps: [
          { s: 0, st: 'pass', t: T('Човек задава цел.', 'A person states the goal.') },
          { s: 1, st: 'hold', t: T('Оценителят не намира подкрепа за твърдението и затваря входа: HOLD.', 'The evaluator finds no support for the claim and fails closed: HOLD.') },
          { s: 3, st: 'stop', t: T('Няма CLEAR, значи няма разрешение: NO PERMIT.', 'No CLEAR means no permit: NO PERMIT.') }
        ], end: { k: 'hold', l: 'NO PERMIT', t: T('Нищо след това не се стига. Липсата на информация не се третира като съгласие.', 'Nothing after this is reached. Missing information is never treated as consent.') } },
        { id: 'stop', name: T('Противоречие', 'A contradiction'), steps: [
          { s: 0, st: 'pass', t: T('Човек задава цел.', 'A person states the goal.') },
          { s: 1, st: 'stop', t: T('Оценителят открива противоречие: STOP. STOP е краен, никоя по-късна проверка не може да го понижи.', 'The evaluator finds a contradiction: STOP. STOP is terminal: no later gate can lower it.') },
          { s: 3, st: 'stop', t: T('Няма разрешение: NO PERMIT.', 'No permit is issued: NO PERMIT.') }
        ], end: { k: 'stop', l: 'NO PERMIT', t: T('Предложението спира веднага и остава спряно.', 'The proposal stops immediately and stays stopped.') } },
        { id: 'changed', name: T('Променен плик', 'A changed envelope'), steps: [
          { s: 0, st: 'pass', t: T('Човек задава цел.', 'A person states the goal.') },
          { s: 1, st: 'pass', t: T('Оценителят връща CLEAR за плик A.', 'The evaluator returns CLEAR for envelope A.') },
          { s: 2, st: 'pass', t: T('Някой подава плик B с едно променено поле.', 'Someone submits envelope B with one field changed.') },
          { s: 3, st: 'stop', t: T('CLEAR важи само за точно A. Хешът не съвпада: NO PERMIT.', 'CLEAR covers exactly A. The hash does not match: NO PERMIT.') }
        ], end: { k: 'stop', l: 'NO PERMIT', t: T('Ново действие изисква нов плик, нов CLEAR и ново разрешение.', 'A new action needs a new envelope, a new CLEAR and a new permit.') } },
        { id: 'reuse', name: T('Повторно използване', 'Reusing a permit'), steps: [
          { s: 0, st: 'pass', t: T('Човек задава цел.', 'A person states the goal.') },
          { s: 1, st: 'pass', t: T('Оценителят връща CLEAR.', 'The evaluator returns CLEAR.') },
          { s: 2, st: 'pass', t: T('Предложението е запечатано в плик.', 'The proposal is sealed in an envelope.') },
          { s: 3, st: 'pass', t: T('Издадено е разрешение.', 'A permit is issued.') },
          { s: 4, st: 'pass', t: T('Първото искане е прието.', 'The first claim is accepted.') },
          { s: 4, st: 'stop', t: T('Второ искане със същото разрешение: разрешението вече е използвано. REJECTED.', 'A second claim with the same permit: the permit is already used. REJECTED.') }
        ], end: { k: 'stop', l: 'REJECTED', t: T('Едно разрешение дава точно едно искане.', 'One permit gives exactly one claim.') } },
        { id: 'cancel', name: T('Промяна преди изпълнение', 'Change before dispatch'), steps: [
          { s: 0, st: 'pass', t: T('Човек задава цел.', 'A person states the goal.') },
          { s: 1, st: 'pass', t: T('Оценителят връща CLEAR.', 'The evaluator returns CLEAR.') },
          { s: 2, st: 'pass', t: T('Предложението е запечатано в плик.', 'The proposal is sealed in an envelope.') },
          { s: 3, st: 'pass', t: T('Издадено е разрешение.', 'A permit is issued.') },
          { s: 4, st: 'pass', t: T('Искането е прието.', 'The claim is accepted.') },
          { s: 5, st: 'stop', t: T('Преди изпълнение разрешението е отменено. Бариерата го хваща: CANCELLED.', 'Before dispatch the permit is revoked. The barrier catches it: CANCELLED.') }
        ], end: { k: 'stop', l: 'CANCELLED', t: T('Адаптерът не е извикан.', 'The adapter was not called.') } },
        { id: 'unknown', name: T('Неясен резултат', 'An unclear outcome'), steps: [
          { s: 0, st: 'pass', t: T('Човек задава цел.', 'A person states the goal.') },
          { s: 1, st: 'pass', t: T('Оценителят връща CLEAR.', 'The evaluator returns CLEAR.') },
          { s: 2, st: 'pass', t: T('Предложението е запечатано в плик.', 'The proposal is sealed in an envelope.') },
          { s: 3, st: 'pass', t: T('Издадено е разрешение.', 'A permit is issued.') },
          { s: 4, st: 'pass', t: T('Искането е прието.', 'The claim is accepted.') },
          { s: 5, st: 'pass', t: T('Бариерата пуска.', 'The barrier lets it through.') },
          { s: 6, st: 'nb', t: T('Адаптерът не е построен; тук опитът би бил направен.', 'The adapter is not built; the attempt would be made here.') },
          { s: 7, st: 'hold', t: T('Проверяващият не може да определи резултата: UNKNOWN → HOLD.', 'The verifier cannot tell the result: UNKNOWN → HOLD.') }
        ], end: { k: 'hold', l: 'UNKNOWN', t: T('Никога не се повтаря автоматично.', 'It is never retried automatically.') } }
      ]
    },
    {
      id: 'eval', tok: T('предложение', 'proposal'), name: T('Оценител на предложения', 'Proposal evaluator'), repo: 'ai-proposal-evaluator',
      intro: T('Как оценителят решава дали едно AI предложение може да продължи. При липсваща информация затваря входа.',
               'How the evaluator decides whether one AI proposal may go ahead. It fails closed on missing information.'),
      stages: [
        { n: T('Наблюдава', 'Observe'), d: T('какво е подадено', 'what was given') },
        { n: T('Източник', 'Classify source'), d: T('откъде идва', 'where it comes from') },
        { n: T('За и против', 'For and against'), d: T('и двете страни', 'both sides') },
        { n: T('Контра-модел', 'Counter-model'), d: T('опит за опровержение', 'try to refute') },
        { n: T('Проверки', 'Gates'), d: T('16 могат да откажат', '16 can refuse') },
        { n: T('Решение', 'Verdict'), d: T('CLEAR · HOLD · STOP', 'CLEAR · HOLD · STOP') }
      ],
      scenarios: [
        { id: 'clear', name: T('Подкрепено предложение', 'A supported proposal'), steps: [
          { s: 0, st: 'pass', t: T('Предложението и доказателствата му са прочетени.', 'The proposal and its evidence are read.') },
          { s: 1, st: 'pass', t: T('Източникът е обозначен и класифициран.', 'The source is labelled and classified.') },
          { s: 2, st: 'pass', t: T('Аргументите за и против са изложени.', 'The arguments for and against are set out.') },
          { s: 3, st: 'pass', t: T('Контра-моделът не намира опровержение.', 'The counter-model finds no refutation.') },
          { s: 4, st: 'pass', t: T('Нито една от проверките не отказва.', 'No gate refuses.') },
          { s: 5, st: 'pass', t: 'CLEAR' }
        ], end: { k: 'pass', l: 'CLEAR', t: T('Само такова решение, издадено от оценителя, може да вземе ключа за действие. Ръчно написано {decision: "CLEAR"} не може.', 'Only a verdict this evaluator issued can take the action lock. A hand-written {decision: "CLEAR"} cannot.') } },
        { id: 'hold', name: T('Липсваща информация', 'Missing information'), steps: [
          { s: 0, st: 'pass', t: T('Предложението е прочетено, но доказателствата липсват.', 'The proposal is read, but the evidence is missing.') },
          { s: 1, st: 'hold', t: T('Източникът не може да бъде класифициран.', 'The source cannot be classified.') },
          { s: 5, st: 'hold', t: 'HOLD' }
        ], end: { k: 'hold', l: 'HOLD', t: T('Чака човек или повече информация. Не е съгласие.', 'It waits for a human or more information. It is not consent.') } },
        { id: 'stop', name: T('Открито противоречие', 'A contradiction found'), steps: [
          { s: 0, st: 'pass', t: T('Предложението и доказателствата му са прочетени.', 'The proposal and its evidence are read.') },
          { s: 1, st: 'pass', t: T('Източникът е обозначен.', 'The source is labelled.') },
          { s: 2, st: 'pass', t: T('Аргументите за и против са изложени.', 'The arguments for and against are set out.') },
          { s: 3, st: 'stop', t: T('Контра-моделът открива противоречие с подадените доказателства.', 'The counter-model finds a contradiction with the given evidence.') },
          { s: 5, st: 'stop', t: 'STOP' }
        ], end: { k: 'stop', l: 'STOP', t: T('STOP е краен: никоя по-късна проверка не може да го понижи.', 'STOP is terminal: no later gate can lower it.') } }
      ]
    },
    {
      id: 'claims', tok: T('твърдение', 'claim'), name: T('Проверка на твърдения', 'Claim checker'), repo: 'document-claim-checker',
      intro: T('Как документ се сверява с файловете на диска. Документът не доказва сам себе си.',
               'How a document is checked against the files on disk. A document does not prove itself.'),
      stages: [
        { n: T('Чете', 'Read'), d: T('Markdown документ', 'a Markdown document') },
        { n: T('Намира', 'Find claims'), d: T('SHA-256 · file:line · брой тестове', 'SHA-256 · file:line · test counts') },
        { n: T('Сверява', 'Compare'), d: T('с файловете на диска', 'with the files on disk') },
        { n: T('Докладва', 'Report'), d: T('статус за всяко', 'a status for each') }
      ],
      scenarios: [
        { id: 'match', name: T('Хешът съвпада', 'A digest matches'), steps: [
          { s: 0, st: 'pass', t: T('Документът е прочетен.', 'The document is read.') },
          { s: 1, st: 'pass', t: T('Намерено е твърдение: файл X има даден SHA-256.', 'A claim is found: file X has a given SHA-256.') },
          { s: 2, st: 'pass', t: T('Файлът X е хеширан и хешът съвпада.', 'File X is hashed and the digest matches.') },
          { s: 3, st: 'pass', t: T('Твърдението е отчетено като потвърдено.', 'The claim is reported as confirmed.') }
        ], end: { k: 'pass', l: T('Потвърдено', 'Confirmed'), t: T('Чист доклад не значи, че документът е верен: проверени са само разпознатите видове твърдения.', 'A clean report does not mean the document is true: only the recognised kinds of claim are checked.') } },
        { id: 'diff', name: T('Хешът се различава', 'A digest differs'), steps: [
          { s: 0, st: 'pass', t: T('Документът е прочетен.', 'The document is read.') },
          { s: 1, st: 'pass', t: T('Намерено е твърдение за SHA-256 на файл X.', 'A claim is found about the SHA-256 of file X.') },
          { s: 2, st: 'stop', t: T('Файлът X е променен след написването на документа: хешът не съвпада.', 'File X changed after the document was written: the digest does not match.') },
          { s: 3, st: 'stop', t: T('Несъответствието е докладвано, не скрито в общ резултат.', 'The mismatch is reported, not hidden in an overall score.') }
        ], end: { k: 'stop', l: T('Несъответствие', 'Mismatch'), t: T('Статусите никога не се сливат в едно „прието“.', 'Statuses are never merged into a single "pass".') } },
        { id: 'count', name: T('„42 теста минават“', '"42 tests pass"'), steps: [
          { s: 0, st: 'pass', t: T('Документът е прочетен.', 'The document is read.') },
          { s: 1, st: 'pass', t: T('Намерено е твърдение за брой тестове.', 'A claim about a test count is found.') },
          { s: 2, st: 'hold', t: T('Броят не може да се провери от самия документ или файловете: само повторното пускане на тестовете го доказва.', 'The count cannot be checked from the document or the files: only running the tests again proves it.') },
          { s: 3, st: 'hold', t: T('Докладвано като „непроверимо“.', 'Reported as "uncheckable".') }
        ], end: { k: 'hold', l: T('Непроверимо', 'Uncheckable'), t: T('Честно е да се каже „не знам“, вместо да се покаже зелено.', 'Saying "cannot tell" is more honest than showing green.') } }
      ]
    }
  ];

  var root, lang = 'bg', S = { f: 0, sc: 0, i: 0, timer: null, playing: false }, E = null;
  var UI = {
    title: T('Избери проект', 'Choose a project'),
    scen: T('Сценарий', 'Scenario'),
    play: T('▶', '▶'), pause: T('⏸', '⏸'), prev: T('‹', '‹'), next: T('›', '›'), reset: T('↺', '↺'),
    playL: T('Пусни', 'Play'), pauseL: T('Пауза', 'Pause'), prevL: T('Назад', 'Back'), nextL: T('Напред', 'Forward'), resetL: T('Отначало', 'Restart'),
    ready: T('Натисни ▶ или › или избери стъпка по-горе.', 'Press ▶ or ›, or pick a step above.'),
    stepOf: T('Стъпка', 'Step'), of: T('от', 'of'),
    legend: T('Зелено: премина · Жълто: задържа · Червено: спира · Пунктир: не е построено', 'Green: passed · Amber: holds · Red: stops · Dashed: not built'),
    note: T('Прилепът е пакетът: пътува по етапите и сменя цвят според решението. Това е илюстрация на дизайна по README-тата на проектите, не запис на реално изпълнение.', 'The bat is the packet: it travels through the stages and changes colour with the verdict. This illustrates the design described in the project READMEs. It is not a recording of a real run.'),
    skipped: T('не се достига', 'not reached'), jump: T('Към стъпка', 'Go to step')
  };
  function tx(v) { return typeof v === 'string' ? v : (v[lang] || v.en); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function btn(cls, label, aria, fn) { var b = el('button', cls, label); b.type = 'button'; if (aria) b.setAttribute('aria-label', aria); b.addEventListener('click', fn); return b; }
  function flow() { return FLOWS[S.f]; }
  function scen() { return flow().scenarios[S.sc]; }
  function setHdr() { var h = document.querySelector('.top'); if (h) document.documentElement.style.setProperty('--hdr', h.offsetHeight + 'px'); }

  function stageStates() {
    var st = [], sc = scen(), i;
    for (i = 0; i < flow().stages.length; i++) st.push('idle');
    for (i = 0; i < S.i; i++) st[sc.steps[i].s] = sc.steps[i].st;
    return st;
  }
  function halt() { if (S.timer) { clearInterval(S.timer); S.timer = null; } S.playing = false; }
  function goto(i) { halt(); S.i = Math.max(0, Math.min(scen().steps.length, i)); update(); }
  function advance() { if (S.i < scen().steps.length) S.i++; if (S.i >= scen().steps.length) halt(); update(); }
  function toggle() {
    if (S.playing) { halt(); update(); return; }
    if (S.i >= scen().steps.length) S.i = 0;
    S.playing = true; advance();
    if (S.playing) S.timer = setInterval(advance, 1500);
  }

  /* The skeleton is built only when the project, scenario or language changes. Steps only update it in place,
     so the page never jumps and the controls keep focus. */
  function build() {
    if (!root) return;
    var f = flow(), sc = scen(), keep = root.offsetHeight;
    if (keep) root.style.minHeight = keep + 'px';
    root.textContent = ''; E = {};
    var tabs = el('div', 'dm-flows'); tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', tx(UI.title));
    FLOWS.forEach(function (x, k) { var b = btn('dm-flow', tx(x.name), null, function () { halt(); S.f = k; S.sc = 0; S.i = 0; build(); }); b.setAttribute('aria-pressed', String(k === S.f)); tabs.appendChild(b); });
    root.appendChild(tabs);
    root.appendChild(el('p', 'lead dm-intro', tx(f.intro)));
    root.appendChild(el('p', 'mono dm-repo', 'repo / ' + f.repo));
    var scs = el('div', 'dm-scen'); scs.setAttribute('role', 'group'); scs.setAttribute('aria-label', tx(UI.scen));
    scs.appendChild(el('span', 'mono', tx(UI.scen)));
    f.scenarios.forEach(function (x, k) { var b = btn('dm-sc', tx(x.name), null, function () { halt(); S.sc = k; S.i = 0; build(); }); b.setAttribute('aria-pressed', String(k === S.sc)); scs.appendChild(b); });
    root.appendChild(scs);

    var stick = el('div', 'dm-stick');
    var ctl = el('div', 'dm-ctl');
    E.prev = btn('dm-b', tx(UI.prev), tx(UI.prevL), function () { goto(S.i - 1); });
    E.play = btn('dm-b dm-play', '', null, toggle);
    E.next = btn('dm-b', tx(UI.next), tx(UI.nextL), function () { halt(); advance(); });
    E.reset = btn('dm-b', tx(UI.reset), tx(UI.resetL), function () { goto(0); });
    E.dots = el('div', 'dm-dots'); E.dots.setAttribute('role', 'group'); E.dots.setAttribute('aria-label', tx(UI.jump));
    E.dotEls = sc.steps.map(function (s, k) { var d = btn('dm-dot-b', String(k + 1), tx(UI.jump) + ' ' + (k + 1), function () { goto(k + 1); }); E.dots.appendChild(d); return d; });
    E.count = el('span', 'mono dm-count');
    ctl.appendChild(E.prev); ctl.appendChild(E.play); ctl.appendChild(E.next); ctl.appendChild(E.reset); ctl.appendChild(E.dots); ctl.appendChild(E.count);
    stick.appendChild(ctl);

    var ol = el('ol', 'dm-pipe'); ol.style.setProperty('--n', f.stages.length); E.pipe = ol; E.stages = [];
    f.stages.forEach(function (g, k) {
      var li = el('li', 'dm-stage' + (g.nb ? ' nbld' : '')); li.tabIndex = 0; li.setAttribute('role', 'button');
      li.appendChild(el('span', 'dm-num', String(k + 1))); li.appendChild(el('b', null, tx(g.n))); E.stages.push({ li: li, d: li.appendChild(el('span', 'dm-d')) });
      var first = -1; sc.steps.some(function (s, j) { if (s.s === k) { first = j; return true; } return false; });
      if (first >= 0) { li.addEventListener('click', function () { goto(first + 1); }); li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goto(first + 1); } }); }
      else li.removeAttribute('role');
      ol.appendChild(li);
    });
    E.tok = makeToken(tx(f.tok)); E.tok.classList.add('hidden'); ol.appendChild(E.tok);
    stick.appendChild(ol);
    E.cur = el('div', 'dm-cur'); E.cur.setAttribute('role', 'status'); E.cur.setAttribute('aria-live', 'polite'); stick.appendChild(E.cur);
    root.appendChild(stick);

    E.log = el('div', 'dm-log'); root.appendChild(E.log);
    root.appendChild(el('p', 'note', tx(UI.legend) + '. ' + tx(UI.note)));
    E.placed = false;
    setHdr(); update();
    requestAnimationFrame(function () { root.style.minHeight = ''; });
  }
  function makeToken(label) {
    var d = el('div', 'dm-tok t-idle'); d.setAttribute('aria-hidden', 'true'); d.title = label;
    d.innerHTML = '<svg viewBox="0 0 30 18" fill="currentColor"><path d="M15 1.5 13.3 5C11.6 3.8 9 3.5 6.5 4.6 4.5 5.5 2.6 7.5 1 11c2.4-1.4 4-1.2 5.3.4.9-1.8 2.7-2 4.3-.6 1.1 1.4 2.3 4 4.4 6.2 2.1-2.2 3.3-4.8 4.4-6.2 1.6-1.4 3.4-1.2 4.3.6 1.3-1.6 2.9-1.8 5.3-.4-1.6-3.5-3.5-5.5-5.5-6.4C21 3.5 18.4 3.8 16.7 5z"/></svg>';
    d.appendChild(el('span', 'dm-tok-l', label)); return d;
  }
  function update() {
    if (!E) return;
    var f = flow(), sc = scen(), n = sc.steps.length, done = S.i >= n, states = stageStates();
    var current = S.i > 0 ? sc.steps[S.i - 1].s : -1;
    E.stages.forEach(function (o, k) {
      o.li.className = 'dm-stage s-' + states[k] + (k === current && !done ? ' on' : '') + (f.stages[k].nb ? ' nbld' : '');
      o.d.textContent = states[k] === 'idle' && S.i > 0 ? tx(UI.skipped) : tx(f.stages[k].d);
    });
    E.play.textContent = S.playing ? tx(UI.pause) : tx(UI.play); E.play.setAttribute('aria-label', S.playing ? tx(UI.pauseL) : tx(UI.playL));
    E.prev.disabled = S.i === 0; E.next.disabled = done; E.reset.disabled = S.i === 0;
    E.dotEls.forEach(function (d, k) { var st = k < S.i ? sc.steps[k].st : 'idle'; d.className = 'dm-dot-b d-' + st + (k + 1 === S.i ? ' cur' : ''); d.setAttribute('aria-pressed', String(k + 1 === S.i)); });
    E.count.textContent = tx(UI.stepOf) + ' ' + S.i + ' ' + tx(UI.of) + ' ' + n;
    if (S.i === 0) { E.tok.classList.add('hidden'); E.placed = false; }
    else {
      var last = sc.steps[S.i - 1].st, li = E.stages[current].li;
      var x = li.offsetLeft + li.offsetWidth - E.tok.offsetWidth - 6, y = li.offsetTop + li.offsetHeight - E.tok.offsetHeight - 6;
      E.tok.className = 'dm-tok t-' + (last === 'pass' && done ? 'pass' : last);
      if (!E.placed) { E.tok.style.transition = 'none'; E.tok.style.transform = 'translate(' + x + 'px,' + y + 'px)'; void E.tok.offsetWidth; E.tok.style.transition = ''; E.placed = true; }
      else { E.tok.classList.add('fly'); E.tok.style.transform = 'translate(' + x + 'px,' + y + 'px)'; }
    }
    E.cur.textContent = '';
    if (S.i === 0) { E.cur.className = 'dm-cur dim'; E.cur.textContent = tx(UI.ready); }
    else {
      var s = sc.steps[S.i - 1]; E.cur.className = 'dm-cur c-' + s.st;
      E.cur.appendChild(el('b', null, S.i + '. ' + tx(f.stages[s.s].n) + ' — ')); E.cur.appendChild(document.createTextNode(tx(s.t)));
      if (done) { var end = el('div', 'dm-end e-' + sc.end.k); end.appendChild(el('b', null, tx(sc.end.l))); end.appendChild(el('span', null, tx(sc.end.t))); E.cur.appendChild(end); }
    }
    E.log.textContent = '';
    for (var i = 0; i < S.i; i++) {
      var q = sc.steps[i], p = el('p', 'dm-line l-' + q.st);
      p.appendChild(el('b', null, (i + 1) + '. ' + tx(f.stages[q.s].n) + ' — ')); p.appendChild(document.createTextNode(tx(q.t))); E.log.appendChild(p);
    }
  }

  window.addEventListener('resize', function () { setHdr(); if (E && root && root.offsetParent) { E.placed = false; update(); } });
  window.SSCDemo = {
    render: function (l) { lang = l === 'en' ? 'en' : 'bg'; root = root || document.getElementById('demo-root'); build(); },
    stop: function () { halt(); if (E) update(); },
    flows: FLOWS
  };
  document.addEventListener('DOMContentLoaded', function () { root = document.getElementById('demo-root'); if (root && !E) build(); });
})();
