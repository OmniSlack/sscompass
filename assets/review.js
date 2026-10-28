/* Two tabs built from data: "Portfolio" (a short path for a reviewer) and "Future patch" (what is open).
   Every number shown has an address (folder + file in the portfolio repository, or a case number in the owner's register).
   The gate scenes are illustrations of the rules in validation-vs-authority/README.md, not recordings of a run. */
(function () {
  'use strict';
  var rv = document.getElementById('review-root'), pt = document.getElementById('patch-root');
  if (!rv && !pt) return;
  var lang = 'en', timers = [], REPO = 'https://github.com/OmniSlack/martin-urumov-portfolio/tree/main/';
  function L(en, bg) { return { en: en, bg: bg }; }
  function tx(o) { return o == null ? '' : typeof o === 'string' ? o : (o[lang] || o.en || ''); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function add(p, tag, cls, text) { var e = el(tag, cls, text); p.appendChild(e); return e; }
  function link(p, href, text) { var a = el('a', null, text); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; p.appendChild(a); return a; }
  function reduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }
  /* register ids carry Cyrillic letters (П, И, К, Ч, Ю, Л); the English view spells them with Latin letters */
  var TR = { 'П': 'P', 'И': 'I', 'К': 'K', 'Ч': 'Ch', 'Ю': 'Yu', 'Л': 'L' };
  function rid(s) { return lang === 'en' ? String(s).replace(/[ПИКЧЮЛ]/g, function (c) { return TR[c]; }) : s; }

  /* confidence marks: measured = a command and a date; stated = written in a document, not re-run here; approx = an estimate */
  var CONF = {
    measured: { s: '●', t: L('measured: command and date given', 'измерено: има команда и дата') },
    stated: { s: '◐', t: L('stated in a document, not re-run here', 'записано в документ, не е пускано наново тук') },
    approx: { s: '○', t: L('approximate', 'приблизително') }
  };
  function mark(p, k) { var m = add(p, 'span', 'rv-conf rv-' + k, CONF[k].s); m.title = tx(CONF[k].t); m.setAttribute('aria-label', tx(CONF[k].t)); return m; }

  /* ---------- gate scenes ---------- */
  var SCENES = [
    {
      id: 'nopermit', stop: 3,
      title: L('The check passed, but nobody permitted it', 'Проверката мина, но никой не е разрешил'),
      from: L('Validator v3, executor', 'Валидатор v3, изпълнител'),
      st: [L('Request', 'Заявка'), L('Check: no violation found', 'Проверка: няма нарушение'), L('Human permit', 'Разрешение от човек'), L('Executor needs a ticket', 'Изпълнителят иска билет')],
      says: [L('A clean request arrives.', 'Пристига чиста заявка.'), L('The validator says only "no violation found". It has no word for "run it".', 'Валидаторът казва само „не намерих нарушение“. Няма дума „изпълни“.'), L('There is no human permit for this target, action and scope.', 'Няма разрешение от човек за тази цел, действие и обхват.'), L('Without a ticket the executor does nothing.', 'Без билет изпълнителят не прави нищо.')],
      end: L('Not run. Passing the check is not a permission. The earlier version (v2) answered AUTO_EXECUTE here.', 'Не се изпълнява. Минатата проверка не е разрешение. По-старата версия (v2) тук отговаряше AUTO_EXECUTE.')
    },
    {
      id: 'reuse', stop: 5,
      title: L('The same ticket used twice', 'Един и същ билет, използван два пъти'),
      from: L('Execution ticket', 'Билет за изпълнение'),
      st: [L('Request', 'Заявка'), L('Check passed', 'Проверката мина'), L('Human permit', 'Разрешение от човек'), L('Ticket issued', 'Издаден билет'), L('First use', 'Първо използване'), L('Second use', 'Второ използване')],
      says: [L('A request arrives.', 'Пристига заявка.'), L('The check passed.', 'Проверката мина.'), L('A person permits this exact action.', 'Човек разрешава точно това действие.'), L('A ticket is issued, bound to the exact action and payload.', 'Издава се билет, вързан за точното действие и съдържание.'), L('The ticket is used. It works once.', 'Билетът се ползва. Важи един път.'), L('The same ticket again: refused.', 'Същият билет пак: отказан.')],
      end: L('The second use is refused. A ticket works once, and only for the action it was issued for.', 'Второто използване е отказано. Билетът важи един път и само за действието, за което е издаден.')
    },
    {
      id: 'conflict', stop: 3,
      title: L('Two documents disagree about the same file', 'Два документа спорят за един и същ файл'),
      from: L('Conflict gate', 'Пазач на спорове'),
      st: [L('Document A: digest 1', 'Документ A: отпечатък 1'), L('Document B: digest 2', 'Документ Б: отпечатък 2'), L('Pick by date, majority or title?', 'Избор по дата, мнозинство или заглавие?'), L('Measure the real file', 'Мери истинския файл')],
      says: [L('One document states a SHA-256 for the file.', 'Един документ записва SHA-256 за файла.'), L('Another states a different one.', 'Друг записва различен.'), L('The gate refuses to choose: not by date, not by majority, not by a title such as CANON. It answers CONFLICT.', 'Пазачът отказва да избира: не по дата, не по мнозинство, не по заглавие като CANON. Отговаря CONFLICT.'), L('The only way out is to hash the file itself.', 'Единственият изход е да се измери самият файл.')],
      end: L('Held as CONFLICT until the real file is measured. Digests cut to 16 characters are not accepted for comparison.', 'Задържа се като CONFLICT, докато файлът не се измери. Отпечатъци, отрязани до 16 знака, не се приемат за сравнение.')
    },
    {
      id: 'scope', stop: 2,
      title: L('A permit for a different action', 'Разрешение за друго действие'),
      from: L('Validator v3', 'Валидатор v3'),
      st: [L('Request: delete', 'Заявка: изтриване'), L('Check passed', 'Проверката мина'), L('Permit says: read', 'Разрешението е за: четене')],
      says: [L('A request to delete arrives.', 'Пристига заявка за изтриване.'), L('The check passed.', 'Проверката мина.'), L('The permit is for another action, so it does not apply.', 'Разрешението е за друго действие, затова не важи.')],
      end: L('Locked. A permit for another target, action or scope, or an expired one, does not release the work.', 'Заключено. Разрешение за друга цел, действие или обхват, или изтекло, не пуска работата.')
    }
  ];

  function buildScene(p, sc) {
    var card = add(p, 'article', 'rv-scene');
    add(card, 'h4', null, tx(sc.title));
    add(card, 'p', 'rv-from', tx(sc.from));
    var track = add(card, 'ol', 'rv-track'), n = sc.st.length, i;
    for (i = 0; i < n; i++) {
      var li = add(track, 'li', 'rv-st');
      add(li, 'span', 'rv-n', String(i + 1));
      add(li, 'b', null, tx(sc.st[i]));
      if (i === sc.stop) { var pc = add(li, 'span', 'rv-pc'); pc.setAttribute('aria-hidden', 'true'); for (var b = 0; b < 5; b++) add(pc, 'i'); }
    }
    var rail = add(card, 'div', 'rv-rail'); rail.setAttribute('aria-hidden', 'true');
    var tk = add(rail, 'div', 'rv-tk rv-sup'); tk.setAttribute('aria-hidden', 'true');
    tk.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1 23 12 12 23 1 12z" opacity=".28"/><path d="M12 1 17.5 6.5 12 12 6.5 6.5zM12 12 17.5 17.5 12 23 6.5 17.5z"/><path d="M21 3 3 21" stroke="#fff" stroke-width="1.7" stroke-linecap="round" fill="none"/></svg>';
    var line = add(card, 'p', 'rv-line'); line.setAttribute('aria-live', 'polite');
    var end = add(card, 'p', 'rv-end', tx(sc.end));
    var ctl = add(card, 'div', 'rv-ctl'), rp = add(ctl, 'button', 'rv-btn', lang === 'en' ? 'Replay' : 'Отначало'); rp.type = 'button';
    var st = Array.prototype.slice.call(track.children);
    function show(k, final) {
      st.forEach(function (s, j) { s.classList.toggle('on', j <= k); s.classList.toggle('now', j === k && !final); s.classList.toggle('stop', final && j === sc.stop); });
      tk.style.left = (((k + 0.5) / n) * 100).toFixed(3) + '%';
      line.textContent = (k + 1) + ' / ' + n + ' · ' + tx(sc.says[k]);
      card.classList.toggle('over', !!final);
      tk.classList.toggle('rv-sup', !final);
      tk.classList.toggle('rv-hit', !!final);
    }
    function play() {
      clearTimers(); // only one scene animates at a time
      if (reduced()) { show(sc.stop, true); return; }
      var k = 0; show(0, false);
      (function next() {
        timers.push(setTimeout(function () {
          k += 1;
          if (k >= sc.stop) { show(sc.stop, true); return; }
          show(k, false); next();
        }, 1100));
      })();
    }
    rp.addEventListener('click', play);
    show(sc.stop, true); // a finished state is always visible, so the page reads without motion
    card.dataset.sc = sc.id; card._play = play;
    return card;
  }

  /* ---------- content: Portfolio ---------- */
  var EV = [
    { n: '90', what: L('tests pass', 'теста минават'), cmd: 'python3 -B -m unittest discover -p "test_*.py" -v', addr: 'validation-vs-authority/evidence/2026-10-28/TESTS.txt', when: L('observed 2026-10-28, Python 3.13, Linux', 'наблюдавано 28.10.2026, Python 3.13, Linux'), c: 'measured' },
    { n: '7', what: L('test files, 22 + 20 + 12 + 12 + 9 + 8 + 7 = 90', 'тестови файла, 22 + 20 + 12 + 12 + 9 + 8 + 7 = 90'), cmd: L('count in the original package README of 2026-09-16', 'броене в README на оригиналния пакет от 16.09.2026'), addr: 'validation-vs-authority/README.md (Evidence)', when: L('2026-10-28', '28.10.2026'), c: 'measured' },
    { n: '10 / 10', what: L('audited defects of v2 are real in v2 and closed in v3', 'проверени дефекта на v2 са реални във v2 и затворени във v3'), cmd: 'PYTHONPATH=reference python3 -B probe_v2_defects.py', addr: 'validation-vs-authority/evidence/2026-10-28/PROBE_V2_V3.txt', when: L('observed 2026-10-28', 'наблюдавано 28.10.2026'), c: 'measured' }
  ];
  var AREAS = [
    ['Контрол на промените / „кандидат ≠ канон“', 'Change control, approval gates', '20+', '10.07', 'И-0; КЧ-36'],
    ['Проверка на твърдения и произход', 'Claim verification, provenance', '20+', '10.07', 'Ю-4; КЧ-42; Л-4'],
    ['Хващане на AI в измислица или надценяване', 'Hallucination / sycophancy detection', '25+', '10.07', 'Ю-1; КЧ-33; КЧ-39'],
    ['Проектиране на тестове за AI', 'Eval design, red teaming', '10+', '18.08', 'КЧ-5; КЧ-56; Л-1'],
    ['Оркестрация на няколко модела', 'Multi-model orchestration', '15+', '10.07', 'Ю-51; Ю-55; КЧ-54; КЧ-56'],
    ['Минимален достъп / само четене', 'Least privilege', '15+', '17.08', 'КЧ-2; КЧ-6; КЧ-9'],
    ['Аварийно спиране', 'Kill switch / stop-the-line', '8+', '19.08', 'КЧ-8; КЧ-23; КЧ-53'],
    ['Цялост на файлове и отпечатъци', 'Integrity, hashing', '10+', '26.07', 'Ю-6; Л-7'],
    ['Реакция при инцидент, разбор без вина', 'Incident response, blameless postmortem', '8+', '29.07', 'КЧ-32; КЧ-26; Л-14'],
    ['Криминалистично възстановяване', 'Forensic recovery', '1', '13.10', 'Л-9'],
    ['Защита от инструкции в данните', 'Prompt-injection hygiene', '8+', '17.08', 'КЧ-17; Ю-79'],
    ['Поверителност и трети лица', 'Privacy, data minimisation', '4+', '10.07', 'Ю-35; Ю-62'],
    ['Предаване между сесии', 'Handoff, runbooks', '10+', '10.07', 'Ю-36; Ю-51'],
    ['Проверка за предишни разработки', 'Prior-art search', '5+', '20.07', 'Ю-56; КЧ-48']
  ];
  var CASES = [
    { id: 'П-2', date: '15.09.2026', role: L('provoked', 'предизвика'), what: L('Version 2 and version 3 side by side: 10 real defects in v2, closed in v3; every test points to a named defect.', 'Версия 2 и версия 3 една до друга: 10 реални дефекта във v2, затворени във v3; всеки тест сочи наименуван дефект.'), addr: L('Day report of 2026-09-15, lines 22–24 (private repository); evidence in validation-vs-authority', 'Дневен отчет от 15.09.2026, редове 22–24 (частно хранилище); доказателство в validation-vs-authority') },
    { id: 'П-3', date: '15.09.2026', role: L('decided', 'реши'), what: L('"Validation passed ≠ allowed" holds both in the code and in the conversation.', '„Валидацията мина ≠ разрешено е“ — удържа и в кода, и в разговора.'), addr: L('Day report of 2026-09-15, lines 105–106 and 112–113 (private repository)', 'Дневен отчет от 15.09.2026, редове 105–106 и 112–113 (частно хранилище)') },
    { id: 'П-8', date: '16.09.2026', role: L('decided / coordinated', 'реши / координация'), what: L('A read-only task for a coding assistant: an exact list of allowed and forbidden actions, one file to write, and the written bytes must be the ones the owner approved (SHA-256 before and after).', 'Задача за кодиращ асистент само за четене: точен списък „позволено / забранено“, един файл за запис, а записаните байтове трябва да са същите, които е одобрил (SHA-256 преди и след).'), addr: L('Task of 2026-09-16, lines 6–14 and 33–42 (private repository)', 'Задача от 16.09.2026, редове 6–14 и 33–42 (частно хранилище)') },
    { id: 'П-7', date: '16.09.2026', role: L('decided', 'реши'), what: L('The number "76 tests" in an old README did not hold when the tests were run again (64). It was recorded as it is, not "fixed", and every test count is marked unverifiable until it is run again.', 'Числото „76 теста“ в стар README не се потвърди при повторно пускане (64). Записано е както е, не „оправено“, и всеки брой тестове е непроверим, докато не се пусне отново.'), addr: L('README of the old package, lines 61–86 (private repository)', 'README на стария пакет, редове 61–86 (частно хранилище)') },
    { id: 'П-10', date: '17.09.2026', role: L('provoked', 'предизвика'), what: L('A review of the whole setup found that independence of the check was NOT established: the reviewing assistant relied only on the other assistant\'s export.', 'Преглед на цялата уредба установи, че независимостта на проверката НЕ е установена: проверяващият асистент се опира само на износа на другия асистент.'), addr: L('Claude review 001, lines 24–35 (private repository)', 'Преглед на Claude 001, редове 24–35 (частно хранилище)') }
  ];
  var LIMITS = [
    L('One permit can mint many tickets. Each ticket works once, but the permit behind it can be used again until it expires.', 'Едно разрешение може да издаде много билети. Всеки билет важи един път, но разрешението може да се ползва пак до изтичането му.'),
    L('The person who grants a permit is a plain text string. Anyone can write a name.', 'Кой разрешава е обикновен текст. Всеки може да напише име.'),
    L('A ticket is not cryptography. Code in the same process that deliberately touches private names can forge one. What holds is narrower: a bypass needs deliberate, visible tampering.', 'Билетът не е криптография. Код в същия процес, който нарочно пипа частни имена, може да го подправи. Твърдението е по-тясно: заобикалянето иска нарочна и видима намеса.'),
    L('One module promises more than it checks: the verifier must differ from whoever applied the fix, but the code only requires a non-empty name.', 'Един модул обещава повече, отколкото проверява: проверяващият трябва да е различен от поправилия, но кодът иска само непразно име.'),
    L('One tool misses a digest whose file name is on the previous line (known since 2026-09-16).', 'Един инструмент пропуска отпечатък, чието име на файл е на предишния ред (известно от 16.09.2026).'),
    L('When there is both a conflict and a failed claim, the exit code shows only the conflict.', 'Когато има едновременно спор и неуспешно твърдение, кодът на изход показва само спора.'),
    L('None of this is wired to a real system. These are decisions tested against their own tests.', 'Нищо от това не е свързано с реална система. Това са решения, проверени със собствените им тестове.'),
    L('The same rules were later carried into JavaScript and extended in the proposal evaluator; this folder is the Python form of 2026-09-15 and 16, kept because it carries the v2 to v3 proof.', 'Същите правила по-късно са пренесени в JavaScript и разширени в оценителя на предложения; тази папка е Python формата от 15–16.09.2026, пазена заради доказателството v2 → v3.'),
    L('Missing from the whole portfolio: work in a team of people, a product with real users, an independent outside verifier.', 'Липсва в цялото портфолио: работа в екип с хора, продукт с реални потребители, независим външен проверител.'),
    L('Chats in other AI tools were not walked through; there may be more cases there, with no address here.', 'Чатовете в други AI инструменти не са обходени; там може да има още случаи, но без адрес тук.')
  ];

  function section(p, h, intro) { var s = add(p, 'section', 'rv-sec'); add(s, 'h3', 'sh', tx(h)); if (intro) add(s, 'p', 'plain', tx(intro)); return s; }
  function table(p, head) {
    var w = add(p, 'div', 'tablewrap'), t = add(w, 'table', 'tbl'), tr = add(add(t, 'thead'), 'tr');
    head.forEach(function (h) { add(tr, 'th', null, tx(h)); });
    return add(t, 'tbody');
  }

  function renderReview() {
    if (!rv) return;
    rv.textContent = '';
    var hero = add(rv, 'div', 'rv-hero');
    add(hero, 'p', 'mono', '// ' + (lang === 'en' ? 'portfolio · for reviewers' : 'портфолио · за проверяващи'));
    add(hero, 'h2', null, lang === 'en' ? 'A check that passed is not a permission' : 'Проверката мина не значи, че е разрешено');
    add(hero, 'p', 'lead', lang === 'en'
      ? 'One rule, built three ways, with a number only where there is a command and a date. Start here; the rest of the site is the catalogue.'
      : 'Едно правило, построено по три начина, с число само там, където има команда и дата. Започни оттук; останалата част от сайта е каталогът.');
    var lg = add(hero, 'p', 'rv-legend');
    ['measured', 'stated', 'approx'].forEach(function (k) { var s = add(lg, 'span', 'rv-lg'); mark(s, k); add(s, 'span', null, ' ' + tx(CONF[k].t)); });

    var s1 = section(rv, L('The rule and its three forms', 'Правилото и трите му форми'));
    var g = add(s1, 'div', 'rv-forms');
    [
      [L('Validator', 'Валидатор'), L('It can only say "I found no violation". It has no word for "execute". Releasing work needs a separate human permit for this exact target, action and scope, with an expiry.', 'Може да каже само „не намерих нарушение“. Няма дума „изпълни“. За пускане на работа е нужно отделно разрешение от човек за точно тази цел, действие и обхват, със срок.')],
      [L('Executor', 'Изпълнител'), L('It accepts nothing but a ticket. A ticket is issued only when the check passed and a human permitted it, is bound to the exact action and payload, and works once.', 'Приема само билет. Билет се издава само когато проверката е минала и човек е разрешил, вързан е за точното действие и съдържание и важи един път.')],
      [L('Dispute guard', 'Пазач на спорове'), L('When two documents state different SHA-256 digests for one file, it does not pick one. The only way out is to measure the real file.', 'Когато два документа дават различни SHA-256 за един файл, не избира. Единственият изход е да се измери истинският файл.')]
    ].forEach(function (f, i) { var c = add(g, 'div', 'rv-form'); add(c, 'span', 'rv-no', String(i + 1)); add(c, 'h4', null, tx(f[0])); add(c, 'p', null, tx(f[1])); });
    var pl = add(s1, 'p', 'note'); pl.appendChild(document.createTextNode((lang === 'en' ? 'Folder: ' : 'Папка: ')));
    link(pl, REPO + 'validation-vs-authority', 'validation-vs-authority');
    pl.appendChild(document.createTextNode(lang === 'en' ? ' · status: candidate, logic tested, not wired to any real system.' : ' · състояние: кандидат, логиката е тествана, не е свързана с реална система.'));

    var s2 = section(rv, L('Watch a request meet the gate', 'Как заявка среща вратата'), L('Each scene is a request trying to get through. The mark is uncertain while it travels and settles when a check decides. These illustrate the rules in the folder; they are not recordings of a run.', 'Всяка сцена е заявка, която се опитва да мине. Знакът е неопределен, докато пътува, и се уточнява, когато проверка реши. Те илюстрират правилата в папката, не са запис на изпълнение.'));
    var gr = add(s2, 'div', 'rv-scenes');
    SCENES.forEach(function (sc) { buildScene(gr, sc); });

    var s3 = section(rv, L('The numbers, and where each one comes from', 'Числата и откъде е всяко'));
    var tb = table(s3, [L('Number', 'Число'), L('What it is', 'Какво е'), L('Command', 'Команда'), L('Address', 'Адрес'), L('When', 'Кога')]);
    EV.forEach(function (e) {
      var tr = add(tb, 'tr'), a = add(tr, 'td'); mark(a, e.c); a.appendChild(document.createTextNode(' ' + e.n));
      add(tr, 'td', null, tx(e.what)); var c = add(tr, 'td'); add(c, 'code', null, tx(e.cmd));
      var ad = add(tr, 'td'); add(ad, 'code', null, e.addr); add(tr, 'td', null, tx(e.when));
    });

    var s4 = section(rv, L('Coverage of the whole discipline, not one finding', 'Покритие на цялата дисциплина, не една находка'), L('Fourteen areas of the profession. Each has cases dated from July 2026, before most of the code (August to September), except where the table shows a later date. Counts are approximate; the register is kept by the owner and shown on request.', 'Четиринайсет области на професията. Във всяка има случаи от юли 2026, преди повечето код (август–септември), освен където таблицата показва по-късна дата. Броят е приблизителен; регистърът се пази от автора и се показва при поискване.'));
    var tb2 = table(s4, [L('Area', 'Област'), L('Cases (approx.)', 'Случаи (прибл.)'), L('Earliest, 2026', 'Най-рано, 2026'), L('Register cases', 'Случаи в регистъра')]);
    AREAS.forEach(function (a) {
      var tr = add(tb2, 'tr'), c = add(tr, 'td'); add(c, 'b', null, lang === 'en' ? a[1] : a[0]); if (lang !== 'en') add(c, 'span', 'rv-sub', ' · ' + a[1]);
      var n = add(tr, 'td'); mark(n, 'approx'); n.appendChild(document.createTextNode(' ' + a[2]));
      add(tr, 'td', null, a[3]); add(tr, 'td', null, rid(a[4]));
    });
    add(s4, 'p', 'note', lang === 'en'
      ? 'Source: owner\'s register of cases, version 5 of 2026-10-28, section M (read, not re-counted here). Only one area has a single case (forensic recovery); it is whole and documented.'
      : 'Източник: регистър на случаите на автора, версия 5 от 28.10.2026, раздел М (прочетен, не е преброяван наново тук). Само една област е с един случай (криминалистично възстановяване); той е цял и документиран.');

    var s5 = section(rv, L('Five cases, with the role each time', 'Пет случая, с ролята всеки път'), L('Roles: caught = the owner caught the error · provoked = the owner set the check and the assistant found it · decided = the owner\'s rule · coordinated = the owner split the work between models.', 'Роли: хвана = авторът хвана грешката · предизвика = авторът сложи проверката, асистентът намери · реши = правило на автора · координация = авторът разпредели работата между модели.'));
    var tb3 = table(s5, [L('Case', 'Случай'), L('Date', 'Дата'), L('Role', 'Роля'), L('What happened', 'Какво е станало'), L('Address', 'Адрес')]);
    CASES.forEach(function (c) {
      var tr = add(tb3, 'tr'); add(tr, 'td', null, rid(c.id)); add(tr, 'td', null, c.date);
      var r = add(tr, 'td'); add(r, 'span', 'rv-role', tx(c.role)); add(tr, 'td', null, tx(c.what)); add(tr, 'td', 'rv-addr', tx(c.addr));
    });

    var s6 = section(rv, L('Honest limits', 'Честни граници'), L('From the folder\'s own Limitations section and from the register. They are published on purpose.', 'От раздела Limitations на самата папка и от регистъра. Публикувани са нарочно.'));
    var ul = add(s6, 'ul', 'rv-limits'); LIMITS.forEach(function (x) { add(ul, 'li', null, tx(x)); });
    var ct = add(s6, 'p', 'note');
    ct.appendChild(document.createTextNode(lang === 'en' ? 'Who did what: the owner set the rule, sent v2 to two other AI models for review (2026-09-15) and refused an undisclosed write to a log; an AI coding assistant wrote the code and the tests. Details: ' : 'Кой какво е правил: авторът зададе правилото, прати v2 на два други AI модела за преглед (15.09.2026) и отказа запис в дневник без показване; AI асистент написа кода и тестовете. Подробности: '));
    link(ct, REPO + 'validation-vs-authority', 'validation-vs-authority/README.md');
    ct.appendChild(document.createTextNode('.'));

  }
  function onShow(on) {
    if (!on || !rv || reduced()) return;
    var first = rv.querySelector('.rv-scene'); if (first && first._play) setTimeout(first._play, 300);
  }

  /* ---------- content: Future patch ---------- */
  var PATCH = [
    { id: 'A-1', h: L('"It is not there" is not an answer until it has been looked for', '„Няма го“ не е отговор, докато не е потърсено'), p: L('Before anyone, person or AI, says "missing", "lost" or "does not exist", they ask where they looked, and whether they looked where it was already sent.', 'Преди някой, човек или AI, да каже „липсва“, „изгубено е“ или „не съществува“, първо пита къде е търсил и дали е търсил там, където вече е било пратено.'), why: L('On 2026-10-28 an AI said version 2 was lost. It had been sent on 2026-10-26 and was among the attached files. The same rule had been written on 2026-07-13: never assume something is missing before searching.', 'На 28.10.2026 AI каза, че версия 2 е изгубена. Била е пратена на 26.10.2026 и е стояла в прикачените файлове. Същото правило е записано на 13.07.2026: никога не приемай, че нещо липсва, преди да си потърсил.'), who: L('Every AI, in every answer that says "none".', 'Всеки AI, при всеки отговор с „няма“.') },
    { id: 'A-2', h: L('Two things with one name: fingerprint first, work second', 'Две неща с едно име: първо отпечатък, после работа'), p: L('Before a file is used, its SHA-256 and size are compared. Two different files carry the same name for version 3 (10,249 and 15,284 bytes), and there are two different version 2 files.', 'Преди да се ползва файл, сверяват се SHA-256 и размер. Два различни файла носят едно и също име за версия 3 (10 249 и 15 284 байта) и има два различни файла за версия 2.'), why: L('Address: validation-vs-authority/README.md (Limitations) and PROVENANCE.md.', 'Адрес: validation-vs-authority/README.md (Limitations) и PROVENANCE.md.'), who: L('Everyone who receives a file.', 'Всеки, който получава файл.') },
    { id: 'V-1', h: L('A wrong date on version 2', 'Грешна дата на версия 2'), p: L('In the payload-policy-validator folder the version 2 file is labelled "Codex, 2026-10". It existed on 2026-09-15; "2026-10" is when it was received in the working folder, not when it was written.', 'В папката payload-policy-validator файлът за версия 2 е означен „Codex, 2026-10“. Съществувал е на 15.09.2026; „2026-10“ е кога е получен в работната папка, не кога е писан.'), why: L('Status: to be corrected in the portfolio repository. It is not changed here, because the portfolio copy is read-only for this site. Address: validation-vs-authority/PROVENANCE.md (Cross-checks).', 'Състояние: предстои поправка в портфолио хранилището. Тук не е променяно, защото копието на портфолиото е само за четене за този сайт. Адрес: validation-vs-authority/PROVENANCE.md (Cross-checks).'), who: L('The owner, in the repository.', 'Авторът, в хранилището.') },
    { id: 'V-2', h: L('The number of projects does not agree', 'Броят проекти не съвпада'), p: L('This site lists fifteen projects. The owner counts 20 folders in the portfolio (2026-10-28); a review of 2026-10-27 counted 17 project rows in the root README, plus the authorship-evidence folder.', 'Този сайт описва петнайсет проекта. Авторът брои 20 папки в портфолиото (28.10.2026); преглед от 27.10.2026 брои 17 реда с проекти в основния README, плюс папката authorship-evidence.'), why: L('Status: open. The site list needs to be synced with the repository, or the heading should carry no fixed number. Address: README.md in the root of the portfolio repository.', 'Състояние: отворено. Списъкът на сайта трябва да се синхронизира с хранилището, или заглавието да не носи фиксиран брой. Адрес: README.md в корена на портфолио хранилището.'), who: L('This site, after the repository is read again.', 'Този сайт, след като хранилището се прочете наново.') }
  ];

  function renderPatch() {
    if (!pt) return;
    pt.textContent = '';
    add(pt, 'p', 'mono', '// future patch · ' + (lang === 'en' ? 'open after 2026-10-28' : 'отворено след 28.10.2026'));
    add(pt, 'h2', null, 'Future patch');
    add(pt, 'p', 'lead', lang === 'en' ? 'What is still open, how we know, and who does it. Rules first, then corrections.' : 'Какво още е отворено, откъде го знаем и кой го прави. Първо правила, после поправки.');
    var rules = PATCH.filter(function (x) { return x.id.charAt(0) === 'A'; }), fixes = PATCH.filter(function (x) { return x.id.charAt(0) === 'V'; });
    function group(h, arr) {
      add(pt, 'h3', 'sh', tx(h));
      arr.forEach(function (x) {
        var c = add(pt, 'article', 'rv-patch'); add(c, 'span', 'rv-no', x.id); add(c, 'h4', null, tx(x.h)); add(c, 'p', null, tx(x.p));
        add(c, 'p', 'rv-why', tx(x.why)); var w = add(c, 'p', 'rv-who'); add(w, 'b', null, (lang === 'en' ? 'Who: ' : 'Кой: ')); w.appendChild(document.createTextNode(tx(x.who)));
      });
    }
    group(L('Rules to ask every time', 'Правила, които да се питат всеки път'), rules);
    group(L('Corrections to the portfolio and the site', 'Поправки в портфолиото и сайта'), fixes);
  }

  function render(l) { lang = l === 'bg' ? 'bg' : 'en'; clearTimers(); renderReview(); renderPatch(); }
  window.SSCReview = { render: render, stop: clearTimers, onShow: onShow };
})();
