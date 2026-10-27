/* Permit check simulator: a permit request moves through the same checks as the execution-control rules of Navigator R4,
   in order, stopping at the first check that fails. Every step cites the file and line of the rule it models.
   It is a simulation of those rules, not the database itself. Built once; only text is replaced when the language changes. */
(function () {
  'use strict';
  var root = document.getElementById('gate-root'); if (!root) return;
  var lang = 'en';
  function L(en, bg) { return { en: en, bg: bg }; }
  function tx(o) { return o == null ? '' : typeof o === 'string' ? o : (o[lang] || o.en || ''); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function pad(n) { return String(n).padStart(2, '0'); }
  function dt(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  var NOW = new Date(2026, 8, 7, 17, 0);
  function off(m) { return dt(new Date(NOW.getTime() + m * 60000)); }

  var T = {
    title: L('Try the permit check', 'Опитай проверката на разрешение'),
    lead: L('A permit is a one-time key that lets an AI agent do one protected action. Change the request or load a scenario and see which check refuses it. The checks run in order and stop at the first one that fails.',
      'Разрешението е ключ за еднократно ползване, който позволява на AI агент да извърши едно защитено действие. Промени заявката или избери сценарий и виж коя проверка я отказва. Проверките вървят по ред и спират на първата, която не мине.'),
    source: L('Models the execution-control rules of Navigator R4, which a database enforces. File and line numbers point to its SQL files. This simulates the rules; it is not the database.',
      'Моделира правилата за контрол на изпълнението на Navigator R4, които се налагат от база данни. Номерата на файл и ред сочат към неговите SQL файлове. Това симулира правилата; не е самата база.'),
    request: L('Request', 'Заявка'), trace: L('Check by check', 'Проверка по проверка'),
    paste: L('Paste the request as JSON', 'Постави заявката като JSON'), apply: L('Apply to form', 'Приложи във формата'), badJson: L('Invalid JSON: ', 'Невалиден JSON: '),
    g1: L('Identity: is it the same request?', 'Самоличност: същата ли е заявката?'), g2: L('Two approvals', 'Две одобрения'), g3: L('Permit', 'Разрешение'),
    envE: L('envelope_digest, expected', 'envelope_digest, очакван'), envP: L('envelope_digest, presented', 'envelope_digest, представен'),
    verE: L('version, expected', 'version, очаквана'), verP: L('version, presented', 'version, представена'),
    depE: L('dependency_digest, expected', 'dependency_digest, очакван'), depP: L('dependency_digest, presented', 'dependency_digest, представен'),
    gate: L('execution switch state', 'състояние на превключвателя за изпълнение'), hold: L('an active hold is on the switch', 'има активно задържане на превключвателя'),
    clear: L('a matching Core CLEAR risk decision exists', 'има съответстващо решение за риск Core CLEAR'),
    clearHint: L('A risk decision is kept in a separate table. It is not a permission by itself.', 'Решението за риск е в отделна таблица. То само по себе си не е разрешение.'),
    claimed: L('the permit was already claimed by another process', 'разрешението вече е взето от друг процес'),
    tClaim: L('claim time', 'време на вземане'), tDisp: L('dispatch time', 'време на изпращане'), tExp: L('permit expiry', 'изтичане на разрешението'),
    notEval: L('NOT EVALUATED', 'НЕ Е ПРОВЕРЕНО'), pass: L('PASS', 'МИНАВА'), fail: L('FAIL', 'НЕ МИНАВА'), exc: L('EXCEPTION', 'ИЗКЛЮЧЕНИЕ'),
    evTitle: L('Executed is not verified', 'Изпълнено не значи проверено'), evOut: L('outcome reported by the adapter', 'резултат, обявен от адаптера'),
    evInd: L('an independent verifier confirms the real result', 'независим проверител потвърждава реалния резултат'),
    evNote: L('The only way into VERIFIED is from COMPLETED. There is no path from ATTEMPTED to VERIFIED, so an adapter reporting success is not a verified result.', 'Единственият път към VERIFIED е от COMPLETED. От ATTEMPTED към VERIFIED няма път, затова обявен от адаптера успех не е проверен резултат.'),
    evA: L('STAYS ATTEMPTED: no path to VERIFIED', 'ОСТАВА ATTEMPTED: няма път към VERIFIED'), evC: L('STAYS COMPLETED: not verified', 'ОСТАВА COMPLETED: не е проверено'), evV: L('VERIFIED', 'VERIFIED'),
    refs: L('What is verified, what is not, and the gaps', 'Какво е проверено, какво не е и къде има празноти'),
    h1: L('Verified: enforced and tested', 'Проверено: наложено и тествано'),
    h1n: L('53 unit tests pass and 24 tests pass against a real PostgreSQL: 77 in total, 0 failures. Verification is local; it is not evidence of a production deployment.', '53 модулни теста минават и 24 теста минават срещу реален PostgreSQL: общо 77, 0 неуспешни. Проверката е локална; не е доказателство за внедряване в производство.'),
    h2: L('Not verified', 'Не е проверено'),
    h2n: L('The earlier Phase 1 claim of 44 tests has a recorded hash but the evidence file is missing. A separate project line has unconfirmed test counts. One design is documents only, with no code. The ten checks of KOMPAS are described in canon documents and none is enforced in code: Navigator is enforced, KOMPAS is not.',
      'По-ранното твърдение за 44 теста от Фаза 1 има записан хеш, но файлът с доказателството липсва. Отделна линия проекти има непотвърдени брой тестове. Един дизайн е само документи, без код. Десетте проверки на KOMPAS са описани в документи на канона и никоя не се налага в код: Navigator е наложен, KOMPAS не е.'),
    h3: L('Open gaps', 'Отворени празноти'),
    gaps: [L('Independence is recorded but decides nothing: the field exists, the evaluation never reads it and no test covers it. The fix is one condition and one test.', 'Независимостта се записва, но нищо не решава: полето съществува, оценката никога не го чете и никой тест не го покрива. Поправката е едно условие и един тест.'),
      L('There is no idea of a terminating action: a temporary mitigation and a permanent closure look the same in the data. Nothing exists yet.', 'Няма понятие за действие, което приключва: временната мярка и окончателното затваряне изглеждат еднакво в данните. Още няма нищо.'),
      L('Limits count time, not use: permits expire on a clock, and there is no counter for limits set in cycles or operations. Nothing exists yet.', 'Границите броят време, не употреба: разрешенията изтичат по часовник и няма брояч за граници в цикли или операции. Още няма нищо.')],
    h4: L('In one paragraph', 'В един абзац'),
    para: L('I have worked as an aviation maintenance technician since June 2026, where a fault is closed by an approved procedure and a functional test, never by a plausible explanation. I built the same rule into software: a database-enforced execution layer for AI agents. A protected action needs an exact identity match, a risk decision that is not itself a permission, and an unexpired single-use permit, checked again at dispatch. An adapter reporting success does not make a result verified. 77 tests pass, 24 of them against a real PostgreSQL.',
      'От юни 2026 работя като техник по поддръжка на авиационна техника, където повредата се затваря с одобрена процедура и функционален тест, никога с правдоподобно обяснение. Вградих същото правило в софтуер: слой за изпълнение за AI агенти, наложен от база данни. Защитено действие иска точно съвпадение на самоличността, решение за риск, което само по себе си не е разрешение, и неизтекло разрешение за еднократно ползване, проверено отново при изпращане. Адаптер, който обявява успех, не прави резултата проверен. 77 теста минават, 24 от тях срещу реален PostgreSQL.'),
    table: [[L('Exact identity match', 'Точно съвпадение на самоличността'), '004:36-41, 79-84', L('All three of envelope_digest, version and dependency_digest must match. One mismatch raises an exception.', 'И трите: envelope_digest, version и dependency_digest трябва да съвпадат. Едно несъвпадение предизвиква изключение.')],
      [L('Two approvals before a permit', 'Две одобрения преди разрешение'), '004:24-26, 45-47', L('The switch is OPEN with no active hold, and a matching Core CLEAR exists. A risk decision is not a permission.', 'Превключвателят е OPEN без активно задържане и има съответстващо Core CLEAR. Решението за риск не е разрешение.')],
      [L('Expiry, checked twice', 'Изтичане, проверено два пъти'), '004:93-100, 157-166', L('Checked at claim and again at dispatch. Expiry writes an audit event.', 'Проверява се при вземане и отново при изпращане. Изтичането записва събитие за одит.')],
      [L('UNKNOWN is not safe', 'UNKNOWN не е безопасно'), '004:74', L('A missing or unknown state raises an exception instead of going on.', 'Липсващо или неизвестно състояние предизвиква изключение вместо продължаване.')],
      [L('Drift blocks execution', 'Отклонението блокира изпълнението'), '004:75-77', L('A changed version or dependency digest stops the action.', 'Променена версия или dependency digest спира действието.')],
      [L('Single use, safe under concurrency', 'Еднократно, безопасно при паралелност'), '004:89-91, 66/72/86', L('A claimed permit cannot be claimed again; locks stop two processes winning the same permit.', 'Взето разрешение не може да се вземе пак; ключалки не позволяват на два процеса да спечелят едно разрешение.')],
      [L('Executed is not verified', 'Изпълнено не значи проверено'), '001:119-123, CHECK 63', L('The only way into VERIFIED is from COMPLETED. No path from ATTEMPTED.', 'Единственият път към VERIFIED е от COMPLETED. Няма път от ATTEMPTED.')],
      [L('Append-only audit trail', 'Одитен запис само за добавяне'), '004:96, 111, 163', L('Every action that changes state writes an audit event.', 'Всяко действие, което променя състояние, записва събитие за одит.')]],
    thCtl: L('Control', 'Контрол'), thWhere: L('Where', 'Къде'), thDoes: L('What it does', 'Какво прави')
  };

  var BASE = { envExpected: 'a3f9c2e1d84b7605', envPresented: 'a3f9c2e1d84b7605', verExpected: '2.4.1', verPresented: '2.4.1', depExpected: 'sha256:9e1c7f...44f0', depPresented: 'sha256:9e1c7f...44f0', gateState: 'OPEN', activeHold: false, coreClear: true, permitClaimed: false, claimTime: off(0), dispatchTime: off(5), permitExpiry: off(120) };
  function mk(o) { var r = {}, k; for (k in BASE) r[k] = BASE[k]; for (k in o) r[k] = o[k]; return r; }
  var PRESETS = [
    { n: L('Clean permit', 'Чисто разрешение'), s: mk({}) },
    { n: L('Drift detected', 'Открито отклонение'), s: mk({ depPresented: 'sha256:b21ae0...77c3' }) },
    { n: L('No Core CLEAR', 'Няма Core CLEAR'), s: mk({ coreClear: false }) },
    { n: L('Active hold', 'Активно задържане'), s: mk({ activeHold: true }) },
    { n: L('Already claimed', 'Вече взето'), s: mk({ permitClaimed: true }) },
    { n: L('Expired at dispatch', 'Изтекло при изпращане'), s: mk({ dispatchTime: off(60), permitExpiry: off(30) }) },
    { n: L('Unknown switch state', 'Неизвестно състояние'), s: mk({ gateState: 'UNKNOWN' }) }
  ];
  var FIELDS = ['envExpected', 'envPresented', 'verExpected', 'verPresented', 'depExpected', 'depPresented', 'gateState', 'activeHold', 'coreClear', 'permitClaimed', 'claimTime', 'dispatchTime', 'permitExpiry'];
  var E = {}, labels = [];

  function lab(parent, key, forId) { var l = el('label'); l.htmlFor = forId; labels.push([l, key]); parent.appendChild(l); return l; }
  function input(id, type) { var i = el('input'); i.type = type || 'text'; i.id = 'g-' + id; E[id] = i; i.addEventListener('input', run); i.addEventListener('change', run); return i; }
  function field(id, key, type) { var f = el('div', 'g-f'); lab(f, key, 'g-' + id); f.appendChild(input(id, type)); return f; }
  function check(id, key) { var r = el('div', 'g-chk'), i = input(id, 'checkbox'); r.appendChild(i); lab(r, key, 'g-' + id); return r; }
  function legend(fs, key) { var l = el('legend'); labels.push([l, key]); fs.appendChild(l); }
  function pairRow(a, b) { var r = el('div', 'g-row'); r.appendChild(a); r.appendChild(b); return r; }

  function build() {
    var h = el('h3', 'sh'); labels.push([h, 'title']); root.appendChild(h);
    var p = el('p', 'plain'); labels.push([p, 'lead']); root.appendChild(p);
    var src = el('p', 'note'); labels.push([src, 'source']); root.appendChild(src);
    var grid = el('div', 'g-grid'), left = el('div', 'g-panel'), right = el('div', 'g-panel');
    var lh = el('div', 'g-head'); labels.push([lh, 'request']); left.appendChild(lh);
    E.presets = el('div', 'g-presets'); left.appendChild(E.presets);
    var body = el('div', 'g-body'); left.appendChild(body);
    var det = el('details', 'g-json'), sm = el('summary'); labels.push([sm, 'paste']); det.appendChild(sm);
    E.json = el('textarea'); E.json.spellcheck = false; E.json.setAttribute('aria-label', 'JSON'); det.appendChild(E.json);
    var act = el('div', 'g-act'); E.apply = el('button', 'btn'); E.apply.type = 'button'; labels.push([E.apply, 'apply']); E.err = el('span', 'g-err'); act.appendChild(E.apply); act.appendChild(E.err); det.appendChild(act); body.appendChild(det);
    var f1 = el('fieldset'); legend(f1, 'g1');
    f1.appendChild(pairRow(field('envExpected', 'envE'), field('envPresented', 'envP'))); f1.appendChild(pairRow(field('verExpected', 'verE'), field('verPresented', 'verP'))); f1.appendChild(pairRow(field('depExpected', 'depE'), field('depPresented', 'depP'))); body.appendChild(f1);
    var f2 = el('fieldset'); legend(f2, 'g2');
    var gf = el('div', 'g-f'); lab(gf, 'gate', 'g-gateState'); E.gateState = el('select'); E.gateState.id = 'g-gateState'; ['OPEN', 'CLOSED', 'UNKNOWN'].forEach(function (v) { var o = el('option', null, v); o.value = v; E.gateState.appendChild(o); }); E.gateState.addEventListener('change', run); gf.appendChild(E.gateState);
    f2.appendChild(gf); f2.appendChild(check('activeHold', 'hold')); f2.appendChild(check('coreClear', 'clear')); var hint = el('div', 'g-hint'); labels.push([hint, 'clearHint']); f2.appendChild(hint); body.appendChild(f2);
    var f3 = el('fieldset'); legend(f3, 'g3'); f3.appendChild(check('permitClaimed', 'claimed')); f3.appendChild(pairRow(field('claimTime', 'tClaim', 'datetime-local'), field('dispatchTime', 'tDisp', 'datetime-local'))); f3.appendChild(field('permitExpiry', 'tExp', 'datetime-local')); body.appendChild(f3);
    var rh = el('div', 'g-head'); labels.push([rh, 'trace']); right.appendChild(rh);
    E.verdict = el('div', 'g-verdict'); right.appendChild(E.verdict); E.trace = el('div', 'g-trace'); right.appendChild(E.trace);
    grid.appendChild(left); grid.appendChild(right); root.appendChild(grid);

    var ev = el('div', 'g-panel g-ev'), eh = el('div', 'g-head'); labels.push([eh, 'evTitle']); ev.appendChild(eh);
    var eb = el('div', 'g-body g-evbody'), of = el('div', 'g-f'); lab(of, 'evOut', 'g-outcome'); E.outcome = el('select'); E.outcome.id = 'g-outcome'; ['ATTEMPTED', 'COMPLETED'].forEach(function (v) { var o = el('option', null, v); o.value = v; E.outcome.appendChild(o); }); E.outcome.addEventListener('change', runEv); of.appendChild(E.outcome);
    eb.appendChild(of); var ic = check('indep', 'evInd'); E.indep = E.indep; eb.appendChild(ic); E.evr = el('div', 'g-evr'); eb.appendChild(E.evr); var en = el('p', 'g-hint g-evn'); labels.push([en, 'evNote']); eb.appendChild(en); ev.appendChild(eb); root.appendChild(ev);
    E.indep.removeEventListener('input', run); E.indep.removeEventListener('change', run); E.indep.addEventListener('change', runEv);

    var rf = el('details', 'g-refs'), rs = el('summary'); labels.push([rs, 'refs']); rf.appendChild(rs); E.refs = el('div', 'g-refbody'); rf.appendChild(E.refs); root.appendChild(rf);
    PRESETS.forEach(function (pr) { var b = el('button', 'g-pre'); b.type = 'button'; b.addEventListener('click', function () { write(pr.s); E.json.value = JSON.stringify(pr.s, null, 2); run(); }); E.presets.appendChild(b); pr.btn = b; });
    E.apply.addEventListener('click', function () { E.err.textContent = ''; try { write(JSON.parse(E.json.value)); run(); } catch (e) { E.err.textContent = tx(T.badJson) + e.message; } });
    write(PRESETS[0].s); E.json.value = JSON.stringify(PRESETS[0].s, null, 2);
  }
  function write(s) { FIELDS.forEach(function (f) { var e = E[f]; if (!e || s[f] === undefined) return; if (e.type === 'checkbox') e.checked = !!s[f]; else e.value = s[f]; }); }
  function read() { var s = {}; FIELDS.forEach(function (f) { var e = E[f]; s[f] = e.type === 'checkbox' ? e.checked : e.value; }); return s; }

  function st(status, title, detail, cite) { return { status: status, title: title, detail: detail, cite: cite }; }
  function evaluate(s) {
    var steps = [], stopped = false, verdict = null;
    function push(x) { steps.push(stopped ? { status: 'skip', title: x.title, detail: x.detail, cite: x.cite } : x); }
    var c;
    if (!s.gateState || s.gateState === 'UNKNOWN') { push(st('exception', L('The switch state is UNKNOWN', 'Състоянието на превключвателя е UNKNOWN'), L('A missing or unknown state raises an exception instead of going on.', 'Липсващо или неизвестно състояние предизвиква изключение вместо продължаване.'), '004:74')); stopped = true; verdict = { k: 'exception', t: L('EXCEPTION', 'ИЗКЛЮЧЕНИЕ'), s: L('Unknown state: no decision is made and execution cannot go on.', 'Неизвестно състояние: не се взема решение и изпълнението не може да продължи.') }; }
    else push(st('pass', L('The switch state is known', 'Състоянието на превключвателя е известно'), L('Reported as ' + s.gateState + '.', 'Обявено като ' + s.gateState + '.'), '004:74'));
    if (!stopped) { if (s.envExpected === s.envPresented && s.envExpected !== '') push(st('pass', L('Identity matches: envelope_digest', 'Самоличността съвпада: envelope_digest'), L('Expected and presented envelope_digest agree.', 'Очакваният и представеният envelope_digest съвпадат.'), '004:36-41, 79-84')); else { push(st('fail', L('Identity does not match: envelope_digest', 'Самоличността не съвпада: envelope_digest'), L('Expected "' + (s.envExpected || '-') + '", presented "' + (s.envPresented || '-') + '". One mismatch raises an exception.', 'Очакван „' + (s.envExpected || '-') + '“, представен „' + (s.envPresented || '-') + '“. Едно несъвпадение предизвиква изключение.'), '004:36-41, 79-84')); stopped = true; verdict = { k: 'bad', t: L('DENIED', 'ОТКАЗАНО'), s: L('The identity does not match on envelope_digest.', 'Самоличността не съвпада по envelope_digest.') }; } }
    var vOk = s.verExpected === s.verPresented, dOk = s.depExpected === s.depPresented;
    if (!stopped) { if (vOk && dOk) push(st('pass', L('No drift: version and dependency_digest', 'Няма отклонение: version и dependency_digest'), L('Both match the expected values.', 'И двете съвпадат с очакваните стойности.'), '004:75-77')); else { var w = [!vOk && 'version', !dOk && 'dependency_digest'].filter(Boolean).join(' / '); push(st('fail', L('Drift detected: ' + w, 'Открито отклонение: ' + w), L('A changed ' + w + ' stops the action before it runs.', 'Променен ' + w + ' спира действието, преди да се изпълни.'), '004:75-77')); stopped = true; verdict = { k: 'bad', t: L('DENIED', 'ОТКАЗАНО'), s: L('Drift blocked execution (' + w + ').', 'Отклонението блокира изпълнението (' + w + ').') }; } }
    if (!stopped) { var open = s.gateState === 'OPEN' && !s.activeHold; if (open && s.coreClear) push(st('pass', L('Both approvals are present', 'И двете одобрения са налице'), L('The switch is OPEN with no active hold, and a matching Core CLEAR exists.', 'Превключвателят е OPEN без активно задържане и има съответстващо Core CLEAR.'), '004:24-26, 45-47')); else { var rEn = !open && !s.coreClear ? 'the switch is not OPEN or is on hold, and no matching Core CLEAR exists' : !open ? (s.activeHold ? 'an active hold is on the switch' : 'the switch is not OPEN') : 'no matching Core CLEAR; a risk decision alone is not a permission'; var rBg = !open && !s.coreClear ? 'превключвателят не е OPEN или е задържан и няма съответстващо Core CLEAR' : !open ? (s.activeHold ? 'има активно задържане на превключвателя' : 'превключвателят не е OPEN') : 'няма съответстващо Core CLEAR; само решение за риск не е разрешение'; push(st('fail', L('The two approvals are not both present', 'Двете одобрения не са налице'), L(rEn.charAt(0).toUpperCase() + rEn.slice(1) + '.', rBg.charAt(0).toUpperCase() + rBg.slice(1) + '.'), '004:24-26, 45-47')); stopped = true; verdict = { k: 'bad', t: L('DENIED', 'ОТКАЗАНО'), s: L('The two-approval requirement is not met.', 'Изискването за две одобрения не е изпълнено.') }; } }
    if (!stopped) { if (!s.permitClaimed) push(st('pass', L('Single use: not yet claimed', 'Еднократно: още не е взето'), L('The permit has not been claimed and the lock is taken.', 'Разрешението не е взето и ключалката е заета.'), '004:89-91, 66/72/86')); else { push(st('fail', L('The permit was already claimed', 'Разрешението вече е взето'), L('A claimed permit cannot be claimed again; locks make this safe under concurrency.', 'Взето разрешение не може да се вземе пак; ключалки правят това безопасно при паралелност.'), '004:89-91, 66/72/86')); stopped = true; verdict = { k: 'bad', t: L('DENIED', 'ОТКАЗАНО'), s: L('Another process already claimed the permit.', 'Друг процес вече е взел разрешението.') }; } }
    if (!stopped) { c = new Date(s.claimTime); var x = new Date(s.permitExpiry); if (s.claimTime && s.permitExpiry && c < x) push(st('pass', L('Not expired at claim', 'Не е изтекло при вземане'), L('The claim time is before the expiry.', 'Времето на вземане е преди изтичането.'), '004:93-100')); else { push(st('fail', L('Expired at claim', 'Изтекло при вземане'), L('The claim time is at or after the expiry. Expiry writes an audit event.', 'Времето на вземане е равно на или след изтичането. Изтичането записва събитие за одит.'), '004:93-100')); stopped = true; verdict = { k: 'bad', t: L('DENIED', 'ОТКАЗАНО'), s: L('The permit had already expired when claimed.', 'Разрешението вече е било изтекло при вземане.') }; } }
    if (!stopped) { var d = new Date(s.dispatchTime), y = new Date(s.permitExpiry); if (s.dispatchTime && s.permitExpiry && d < y) push(st('pass', L('Not expired at dispatch (checked again)', 'Не е изтекло при изпращане (проверено отново)'), L('The dispatch time is before the expiry.', 'Времето на изпращане е преди изтичането.'), '004:157-166')); else { push(st('fail', L('Expired at dispatch (checked again)', 'Изтекло при изпращане (проверено отново)'), L('Expiry is checked again at dispatch: a permit that was valid at claim can still expire before it is sent. Expiry writes an audit event.', 'Изтичането се проверява отново при изпращане: разрешение, валидно при вземане, още може да изтече, преди да бъде изпратено. Изтичането записва събитие за одит.'), '004:157-166')); stopped = true; verdict = { k: 'bad', t: L('DENIED', 'ОТКАЗАНО'), s: L('The permit expired between claim and dispatch.', 'Разрешението изтече между вземането и изпращането.') }; } }
    if (!stopped) { push(st('pass', L('Permit granted, audit event written', 'Разрешение дадено, записано е събитие за одит'), L('Every action that changes state writes an append-only audit event.', 'Всяко действие, което променя състояние, записва събитие за одит само за добавяне.'), '004:96, 111, 163')); verdict = { k: 'good', t: L('PERMIT GRANTED', 'РАЗРЕШЕНИЕ ДАДЕНО'), s: L('All checks passed, in order, with no way around them.', 'Всички проверки минаха, по ред, без заобикаляне.') }; }
    else {
      var rest = [[L('The switch state is known', 'Състоянието на превключвателя е известно'), '004:74'], [L('Identity matches: envelope_digest', 'Самоличността съвпада: envelope_digest'), '004:36-41, 79-84'], [L('No drift: version and dependency_digest', 'Няма отклонение: version и dependency_digest'), '004:75-77'], [L('Both approvals are present', 'И двете одобрения са налице'), '004:24-26, 45-47'], [L('Single use: not yet claimed', 'Еднократно: още не е взето'), '004:89-91, 66/72/86'], [L('Not expired at claim', 'Не е изтекло при вземане'), '004:93-100'], [L('Not expired at dispatch (checked again)', 'Не е изтекло при изпращане (проверено отново)'), '004:157-166']];
      rest.slice(steps.length).forEach(function (r) { steps.push(st('skip', r[0], L('Not reached: an earlier check already refused the request.', 'Не се стига до тук: по-ранна проверка вече отказа заявката.'), r[1])); });
      steps.push(st('fail', L('Refusal recorded, audit event written', 'Отказът е записан, събитие за одит'), L('The refusal is itself an append-only audit event, not a silent failure.', 'Отказът сам по себе си е събитие за одит само за добавяне, не тиха грешка.'), '004:96, 111, 163'));
    }
    return { steps: steps, verdict: verdict };
  }
  var lastRes = null;
  function run() { lastRes = evaluate(read()); drawTrace(); }
  function drawTrace() {
    if (!lastRes) return; E.trace.textContent = '';
    lastRes.steps.forEach(function (x) {
      var d = el('div', 'g-step ' + x.status), top = el('div', 'g-top'); top.appendChild(el('b', null, tx(x.title)));
      top.appendChild(el('span', 'g-tag', x.status === 'skip' ? tx(T.notEval) : x.status === 'pass' ? tx(T.pass) : x.status === 'exception' ? tx(T.exc) : tx(T.fail)));
      d.appendChild(top); d.appendChild(el('div', 'g-detail', tx(x.detail))); d.appendChild(el('div', 'g-cite mono', x.cite)); E.trace.appendChild(d);
    });
    var v = lastRes.verdict; E.verdict.className = 'g-verdict ' + v.k; E.verdict.textContent = ''; var vt = el('div'); vt.appendChild(el('b', null, tx(v.t))); vt.appendChild(el('div', 'g-vs', tx(v.s))); E.verdict.appendChild(vt);
  }
  function runEv() {
    var r = E.evr; r.className = 'g-evr';
    if (E.outcome.value === 'ATTEMPTED') { r.textContent = tx(T.evA); r.classList.add('bad'); }
    else if (E.indep.checked) { r.textContent = tx(T.evV); r.classList.add('good'); }
    else { r.textContent = tx(T.evC); r.classList.add('bad'); }
  }
  function drawRefs() {
    var b = E.refs; b.textContent = '';
    b.appendChild(el('h4', null, tx(T.h1))); b.appendChild(el('p', 'g-hint', tx(T.h1n)));
    var wrap = el('div', 'g-tw'), tb = el('table'), hr = el('tr'); [T.thCtl, T.thWhere, T.thDoes].forEach(function (k) { hr.appendChild(el('th', null, tx(k))); }); tb.appendChild(hr);
    T.table.forEach(function (r) { var tr = el('tr'); tr.appendChild(el('td', null, tx(r[0]))); tr.appendChild(el('td', 'mono', r[1])); tr.appendChild(el('td', null, tx(r[2]))); tb.appendChild(tr); }); wrap.appendChild(tb); b.appendChild(wrap);
    b.appendChild(el('h4', null, tx(T.h2))); b.appendChild(el('p', 'g-hint', tx(T.h2n)));
    b.appendChild(el('h4', null, tx(T.h3))); var ul = el('ul', 'g-gaps'); T.gaps.forEach(function (g) { ul.appendChild(el('li', null, tx(g))); }); b.appendChild(ul);
    b.appendChild(el('h4', null, tx(T.h4))); b.appendChild(el('blockquote', null, tx(T.para)));
  }
  function render(l) {
    lang = l === 'bg' ? 'bg' : 'en';
    labels.forEach(function (p) { p[0].textContent = tx(T[p[1]]); });
    PRESETS.forEach(function (pr) { pr.btn.textContent = tx(pr.n); });
    drawTrace(); runEv(); drawRefs();
  }
  build(); run(); render(document.documentElement.lang);
  window.SSCGate = { render: render };
})();
