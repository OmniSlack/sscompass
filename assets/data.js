/* Martin Urumov — portfolio site: public data.
   Текст = { bg, en }. Числата са взети от README файловете и от evidence/ папките на хранилището
   martin-urumov-portfolio (наблюдавано на 2026-10-26). Нищо лично не влиза тук: сайтът е публичен. */
window.SSC = {

  owner: { bg: 'Мартин Урумов', en: 'Martin Urumov' },
  cv: { url: 'cv/Martin_Urumov_CV.pdf', note: { bg: 'PDF · на английски', en: 'PDF · in English' } },
  repo: 'https://github.com/OmniSlack/martin-urumov-portfolio',

  /* Проекти: една папка в хранилището = един проект. */
  projects: [
    { id: 'agent-execution-control', tags: ['control'], chips: ['TypeScript', 'PostgreSQL'],
      summary: { bg: 'Контролен слой, който решава дали един AI агент може да извърши защитено действие и кара самата база данни, а не текстът в промпта, да налага решението.', en: 'A control layer that decides whether an AI agent may carry out a protected action, and makes the database, not prompt text, enforce the decision.' },
      proof: { bg: '54 от 54 unit теста и 24 от 24 теста срещу реален PostgreSQL 16, повторени на 2026-10-26. Замразеният пакет от 2026-08-17: 53 unit и 24 PostgreSQL, 0 провалени.', en: '54 of 54 unit tests and 24 of 24 tests against a real PostgreSQL 16, reproduced on 2026-10-26. The frozen package of 2026-08-17: 53 unit and 24 PostgreSQL, none failed.' },
      points: [
        { bg: 'Двоен ключ: точно съвпадение на самоличност, версия и зависимости, плюс отделно решение за риск, което само по себе си не е разрешение.', en: 'Dual key: an exact match of identity, version and dependencies, plus a separate risk decision that is not itself a permission.' },
        { bg: 'Еднократно искане под съветващи заключвания и повторна проверка непосредствено преди изпълнение. UNKNOWN никога не е безопасно.', en: 'A single-use claim under advisory locks, and a re-check right before dispatch. UNKNOWN is never safe.' }],
      limits: { bg: 'Проверката е локална. Няма проверен реален адаптер, нито реален външен ефект.', en: 'Verification is local. No real adapter and no real external effect was verified.' } },

    { id: 'ai-proposal-evaluator', tags: ['evaluation'], chips: ['JavaScript', 'Node.js', { bg: 'без зависимости', en: 'zero dependencies' }],
      summary: { bg: 'Решава дали едно предложение на AI може да продължи: CLEAR, HOLD (чака човек или повече информация) или STOP. При липсваща информация отказва.', en: 'Decides whether one AI proposal may go ahead: CLEAR, HOLD (waits for a human or more information) or STOP. It fails closed on missing information.' },
      proof: { bg: '247 от 247 теста, повторени на 2026-10-26. При премахване на всеки от 14-те гейта в core.js се променя поне един случай. Инвариантът на гейт 14 е проверен до дълбочина 5: 37 448 последователности, 0 нарушения.', en: '247 of 247 tests, reproduced on 2026-10-26. Removing any of the 14 gates in core.js changes at least one case. The Gate 14 invariant was checked to depth 5: 37,448 sequences, 0 violations.' },
      points: [
        { bg: '16 гейта могат да откажат. STOP е окончателно: никой следващ гейт не може да го смали.', en: '16 gates can refuse. STOP is terminal: no later gate can lower it.' },
        { bg: 'Ръчно написано {decision: "CLEAR"} не може да вземе заключването на действието. Само присъда, издадена от този оценител.', en: 'A hand-written {decision: "CLEAR"} cannot take the action lock. Only a verdict this evaluator issued can.' }],
      limits: { bg: 'Само в рамките на един процес. Оценява формата на подаденото, не истинността му. Някои прагове са избрани, а не измерени, и са маркирани така в кода.', en: 'In-process only. It judges the shape of what it is given, not its truth. Some thresholds are chosen, not measured, and are marked as such in the code.' } },

    { id: 'agent-action-verifier', tags: ['control'], chips: ['JavaScript', 'Node.js'],
      summary: { bg: 'Половината „опит и проверка“ от контрола на изпълнението: адаптерът не може да направи повече от разрешеното, състоянията на опита не се сливат и не се връщат назад, а „адаптерът казва, че е успял“ не значи „успяло е“.', en: 'The attempt-and-verify half of execution control: the adapter may not do more than permitted, attempt states never collapse or rewind, and “the adapter says it worked” does not mean “it worked”.' },
      proof: { bg: '30 от 30 теста (оригиналният пакет: 22 от 22). 5 000 плика, всеки с едно добавено поле: 0 грешни решения.', en: '30 of 30 tests (the original package: 22 of 22). 5,000 envelopes, each with one added field: 0 wrong decisions.' },
      points: [{ bg: 'Поправен е пропуск в плика, така че да отказва при съмнение.', en: 'A gap in the envelope check was fixed so that it fails closed.' }],
      limits: { bg: 'Няма реално изпълнение и няма гаранция „точно веднъж“. Това е в слоя с PostgreSQL.', en: 'No real execution and no exactly-once guarantee. That lives in the PostgreSQL layer.' } },

    { id: 'payload-policy-validator', tags: ['control'], chips: ['Python'],
      summary: { bg: 'Преграда до един AI агент, която за всяко действие решава дали може да се изпълни автоматично или трябва да спре за човек. Две независими скали, отказва при съмнение.', en: 'A gate beside an AI agent that decides, per action payload, whether it may run automatically or must stop for a human. Two independent scales, fail-closed.' },
      proof: { bg: '17 регресионни теста, по един за всеки документиран дефект. 20 000 случайни входа, стар срещу нов код: 0 разлики.', en: '17 regression tests, one per documented defect. 20,000 random inputs, old code against new: 0 differences.' },
      points: [{ bg: 'Версия 2 пропуска липсващо поле в схема от 10 полета и задейства ключова дума „rm“ върху „confirm“. И двете са записани като находки.', en: 'Version 2 lets a missing field through a 10-field schema and fires the keyword “rm” on “confirm”. Both are recorded as findings.' }],
      limits: { bg: 'Тежестите и константата M_DENOM са наследени или произволни, а не калибрирани.', en: 'The weights and the M_DENOM constant are inherited or arbitrary, not calibrated.' } },

    { id: 'batch-file-gateway', tags: ['control'], chips: ['Python'],
      summary: { bg: 'Преминава всеки файл от входна папка през охрана и или записва почистено копие, или го отказва, с един одитен ред на файл. Така DLP проверката не може да се заобиколи с невидими знаци.', en: 'Passes every file of an input folder through a guard and either writes a sanitized copy or refuses it, with one audit line per file. A DLP check cannot be bypassed with invisible characters.' },
      proof: { bg: '15 теста. Ключ, разцепен с нулеширинни знаци, се блокира. При двама писатели печели точно един.', en: '15 tests. A key split by zero-width characters is blocked. With concurrent writers exactly one wins.' },
      points: [{ bg: 'Никаква тайна не стига до одитния дневник, обобщението или stderr по никой от пътищата на провал.', en: 'No secret reaches the audit log, the summary or stderr on any failure path.' }],
      limits: { bg: 'Реалната охрана не е предоставена: резултатите са срещу заместител. Публикуването на изхода и одитният запис не са една транзакция.', en: 'The real guard is not supplied: results are against a stub. Publishing the output and appending the audit are not one transaction.' } },

    { id: 'status-flow-validator', tags: ['control'], chips: ['Python'],
      summary: { bg: 'Двустепенна проверка на заявка: минала ли е през статусите в правилния ред и чист ли е товарът. И двете стъпки винаги се изпълняват, а дневникът на отказите никога не съдържа товара.', en: 'A two-stage check of a request: did it walk its status chain in order, and is its payload clean. Both stages always run, and the rejection log never contains the payload.' },
      proof: { bg: '6 теста за поверителност и 4 самопроверки.', en: '6 privacy tests and 4 self-test scenarios.' },
      points: [{ bg: 'Никаква тайна не се записва, дори външният скенер да хвърли грешка или да върне неправилен изход.', en: 'No secret is written even when the external scanner raises an error or returns malformed output.' }],
      limits: { bg: 'Вграденият набор от шаблони е резервен, не е DLP продукт. Редът е единственото, което се проверява в първата стъпка.', en: 'The built-in pattern set is a fallback, not a DLP product. Stage 1 checks order only.' } },

    { id: 'defect-register', tags: ['evaluation'], chips: ['JavaScript', 'Node.js', { bg: 'данни', en: 'data' }],
      summary: { bg: 'Регистър на видовете провал, не на отделните грешки: 165 случая в 22 семейства, всеки с това как е намерен и от кого. Новите случаи се сравняват с него.', en: 'A register of forms of failure, not single mistakes: 165 cases in 22 families, each with how it was found and by whom. New cases are compared against it.' },
      proof: { bg: '165 записа: 51 намерени от мен, 114 от инструментите. 21 теста; помощните функции връщат точно каквото връщат оригиналните.', en: '165 entries: 51 found by me, 114 by the instruments. 21 tests; the helpers return exactly what the original ones return.' },
      points: [{ bg: 'Записите са написани от първо лице от AI асистента за собствените му грешки. Моите собствени грешки също са вътре.', en: 'The entries are written in the first person by the AI assistant about its own errors. My own errors are in there too.' }],
      limits: { bg: 'Полето „намерено от“ е самоотчетено: нито един запис не е класифициран независимо отвън. Регистърът помни, но не мисли.', en: 'The “found by” field is self-reported: no entry has been classified independently from outside. The register remembers; it does not think.' } },

    { id: 'claim-audit-tools', tags: ['evaluation'], chips: ['Node.js', 'Python'],
      summary: { bg: '13 малки инструмента за проверка на твърдения, не на код: откъде идва твърдението, как се знае, търсил ли е някой какво би го опровергало и дали по-късна версия тихо казва повече от по-ранната.', en: '13 small tools for checking claims rather than code: where a claim came from, how it is known, whether anyone looked for what would refute it, and whether a later version quietly says more than the earlier one.' },
      proof: { bg: 'Записано: 30 от 30 теста. Английските инструменти решават като оригиналите: 22 еквивалентни, 0 различни.', en: 'Recorded: 30 of 30 tests. The English tools decide exactly as the originals: 22 equivalent, 0 different.' },
      points: [{ bg: 'Три от Python тестовете изискват команда python3. На Windows без нея те се провалят, затова при повторение на 2026-10-26 у мен бяха 27 от 30. Това е проблем с преносимостта на теста, не с инструментите.', en: 'Three of the Python tests need the command python3. On Windows without it they fail, so my re-run on 2026-10-26 gave 27 of 30. That is a portability problem of the test, not of the tools.' }],
      limits: { bg: 'Само английски вход. Инструментите преценяват формата на твърдението, не истинността му.', en: 'English input only. The tools judge the form of a claim, never its truth.' } },

    { id: 'document-claim-checker', tags: ['evaluation'], chips: ['Python'],
      summary: { bg: 'Чете Markdown документ и проверява твърденията му за файлове (SHA-256, препратки file:line, брой тестове) спрямо файловете на диска. Документ не доказва сам себе си.', en: 'Reads a Markdown document and checks its claims about files (SHA-256 digests, file:line references, test counts) against the files on disk. A document does not prove itself.' },
      proof: { bg: '15 от 15 теста. 400 генерирани реда със 397 твърдения: същите статуси като оригинала. Оригиналът потвърждава собствения си манифест: 7 от 7.', en: '15 of 15 tests. 400 generated lines with 397 claims: the same statuses as the original. The original verifies its own manifest: 7 of 7.' },
      points: [{ bg: 'Пет статуса, които никога не се сливат. Брой тестове в документ се отчита като „непроверяем“: само повторното пускане на тестовете го доказва.', en: 'Five statuses that are never merged. A test count in a document is reported as “uncheckable”: only running the tests again proves it.' }],
      limits: { bg: 'Разпознава само SHA-256, file:line и брой тестове. Чист отчет не значи, че документът е верен.', en: 'It recognises only SHA-256, file:line and test counts. A clean report does not mean the document is true.' } },

    { id: 'evidence-retriever', tags: ['evaluation'], chips: ['PowerShell'],
      summary: { bg: 'Локално търсене само за четене в Markdown бележки. За всяко попадение връща файл, ред, секция, маркера за увереност от същия ред и адресите, така че твърдението да се проследи до мястото му.', en: 'A local, read-only search over Markdown notes. For each hit it returns the file, line, section, the confidence marker on that line and the URLs, so a claim can be traced to its address.' },
      proof: { bg: 'Петточкова матрица на PowerShell 7 върху 26 файла: заявка без резултат връща 0, а не „няма такова“. Проверка върху пример: 7 успешни.', en: 'A five-point matrix on PowerShell 7 over 26 files: a query with no result returns 0, never “absent”. The check script on the sample: 7 pass.' },
      points: [{ bg: '„Няма резултат“ никога не се отчита като „няма го“.', en: '“No result” is never reported as “absent”.' }],
      limits: { bg: 'Проследимост, не релевантност или истинност. Без семантично търсене.', en: 'Traceability, not relevance or truth. No semantic retrieval.' } },

    { id: 'agent-threat-model', tags: ['research'], chips: [{ bg: 'доклад', en: 'report' }],
      summary: { bg: 'Модел на заплахите за система, в която AI агенти действат с инструменти и данни за достъп, разширен до дронове, където компрометирана самоличност може да стане физическо действие.', en: 'A threat model for a system in which AI agents act with tools and credentials, extended to drone operations where a compromised identity can become a physical action.' },
      proof: { bg: '13 подредени риска, базов набор от 10 контрола, обратим 7-дневен план и 11 контра-модела. 21 регистрирани източника, проверени с хеш на оригиналния файл.', en: '13 ranked risks, a 10-part control baseline, a reversible 7-day plan and 11 counter-models. 21 registered sources; the original file is matched by hash.' },
      points: [{ bg: 'Разделя наблюдаваните процедурни контроли от липсващите технически.', en: 'Separates observed procedural controls from missing technical ones.' }],
      limits: { bg: 'Разсъждение на ниво дизайн, не е тествано емпирично. Не е тест за проникване. Вероятностите са относителни приоритети, не измерени честоти.', en: 'Design-level reasoning, not tested empirically. Not a penetration test. Likelihoods are relative priorities, not measured frequencies.' } },

    { id: 'observer-gated-control-sim', tags: ['simulation'], chips: ['Python'],
      summary: { bg: 'Показва върху една симулирана топлинна система какво печели и какво губи регулатор, който действа върху доверена оценка на състоянието вместо върху суровия сензор. Сензорът лъже: 60 секунди чете с 35 °C повече.', en: 'Shows, on one simulated thermal process, what a controller gains and loses when it acts on a trusted estimate instead of the raw sensor. The sensor lies: for 60 seconds it reads 35 °C too high.' },
      proof: { bg: '13 теста. При грешния сензор максималното отклонение пада от 43,02 °C на 2,15 °C. Но когато сензорът е честен, директният регулатор е по-добър: IAE 3730,87 срещу 4387,05.', en: '13 tests. With the faulty sensor the maximum deviation drops from 43.02 °C to 2.15 °C. But when the sensor is honest the direct controller is better: IAE 3730.87 against 4387.05.' },
      points: [{ bg: 'Цената на предпазването е показана, не скрита.', en: 'The cost of the protection is shown, not hidden.' }],
      limits: { bg: 'Играчка: едно състояние, един вид повреда, една реализация на seed, без доверителни интервали.', en: 'A toy model: one state, one fault type, one realisation per seed, no confidence intervals.' } },

    { id: 'source-monitoring-pilot-sim', tags: ['simulation'], chips: ['Python', 'R'],
      summary: { bg: 'Синтетичен край-до-край процес за експеримент върху наблюдение на източника, при който се търси промяна в критерия без промяна в чувствителността. Доказва механиката преди да има човешки данни.', en: 'A synthetic end-to-end pipeline for a source-monitoring experiment where the quantity of interest is a shift in criterion without a change in sensitivity. It proves the machinery before any human data.' },
      proof: { bg: 'run_all.py възпроизвежда доставените изходи байт за байт. На 2026-10-25: 45 от 45 проверки. На следващия ден: 43 от 45: проверки 35 и 45 (байт-идентичен прогон срещу доставения еталон) се провалят на същата среда. Записано и обяснено.', en: 'run_all.py reproduces the shipped outputs byte for byte. On 2026-10-25: 45 of 45 checks. A day later: 43 of 45: checks 35 and 45 (a byte-identical rerun against the shipped reference) fail on the same environment. Recorded and explained.' },
      points: [{ bg: 'Строгото правило за приемане отхвърли 6 от 30 опита в доставените smoke прогони.', en: 'The strict acceptance rule rejected 6 of 30 attempts in the shipped smoke runs.' }],
      limits: { bg: 'Всичко е синтетично и не потвърждава никаква хипотеза. „Детерминирано“ важи на една машина, не между машини.', en: 'Everything is synthetic and validates no hypothesis. “Deterministic” holds on one machine, not across machines.' } },

    { id: 'keynes-beauty-contest-sim', tags: ['simulation'], chips: ['JavaScript', 'Node.js'],
      summary: { bg: 'Конкурсът на Кейнс за красотата („познай 2/3 от средното“): колко нива „те мислят, че аз мисля…“ да разсъждаваш. Отговорът не е число, а зависи от това кои са останалите играчи.', en: 'Keynes’s beauty contest (guess 2/3 of the average): how many levels of “they think that I think…” should you reason. The answer is not a number; it depends on who else is playing.' },
      proof: { bg: '6 теста. Срещу тълпа от „реални хора“ печели ниво 3, срещу теоретици ниво 10, а равновесието по Неш е 0.', en: '6 tests. Against a crowd of “real people” level 3 wins, against theorists level 10, and the Nash equilibrium is 0.' },
      points: [{ bg: 'Едно „ниво 3,5“, което стоеше в коментар, не издържа на изчисляване и е поправено.', en: 'A “level 3.5” that stood in a comment did not survive being computed and was corrected.' }],
      limits: { bg: 'Модел, не измерване. Тълпите са допуснати разпределения и без реални данни.', en: 'A model, not a measurement. The crowds are assumed distributions and no real data is used.' } },

    { id: 'p-vs-np-gap-measurement', tags: ['simulation'], chips: ['JavaScript', 'Node.js'],
      summary: { bg: 'Измерва върху конкретни примери разликата, за която пита P срещу NP: как расте цената на намирането на отговор спрямо цената на проверката му. Не се опитва да реши P срещу NP.', en: 'Measures, on concrete instances, the gap that P versus NP asks about: how the cost of finding an answer grows compared with the cost of checking one. It does not try to resolve P versus NP.' },
      proof: { bg: '6 теста. Изчерпването е точно 2^n·(n+1) за n от 4 до 16; проверката е най-много n+1 стъпки. При n=8 е 2 304 стъпки, при n=22 е 96 468 992.', en: '6 tests. Exhaustion is exactly 2^n·(n+1) for n from 4 to 16; checking is at most n+1 steps. At n=8 it is 2,304 steps, at n=22 it is 96,468,992.' },
      points: [{ bg: 'Първото попадение не е монотонно: n=12 дава 13 572, а n=14 дава 3 915.', en: 'First-hit steps are not monotone: n=12 gives 13,572 while n=14 gives 3,915.' }],
      limits: { bg: 'Не може да реши P срещу NP. Кривата е на пълното изчерпване, не на самата задача.', en: 'It cannot resolve P versus NP. The curve is that of exhaustion, not of the problem.' } }
  ],

  /* Филтри за проектите */
  kinds: [
    { id: 'all', label: { bg: 'Всички', en: 'All' } },
    { id: 'control', label: { bg: 'Контрол на агенти', en: 'Agent controls' } },
    { id: 'evaluation', label: { bg: 'Оценка и твърдения', en: 'Evaluation & claims' } },
    { id: 'simulation', label: { bg: 'Симулации', en: 'Simulations' } },
    { id: 'research', label: { bg: 'Изследване', en: 'Research' } }
  ],

  /* Фонови материали: концептуални модели зад работата */
  decks: [
    { id: 'omniecho', url: 'decks/index.html#omniecho/1', title: 'The OmniEcho Architecture', note: { bg: '16 слайда, английски', en: '16 slides, English' } },
    { id: 'coherence', url: 'decks/index.html#coherence/1', title: 'The Coherence Protocol', note: { bg: '21 слайда, английски', en: '21 slides, English' } },
    { id: 'dream', url: 'decks/index.html#dream/1', title: 'Dream Protocol', note: { bg: '16 слайда, български', en: '16 slides, Bulgarian' } }
  ],

  /* Контакти: само живите връзки */
  socials: [
    { name: 'GitHub',      url: 'https://github.com/OmniSlack',                 handle: 'OmniSlack' },
    { name: 'LinkedIn',    url: 'https://www.linkedin.com/in/martin-urumov/',   handle: 'martin-urumov' },
    { name: 'YouTube',     url: 'https://www.youtube.com/@OmniEcho26',          handle: '@OmniEcho26' },
    { name: 'TikTok',      url: 'https://www.tiktok.com/@omniecho26',           handle: '@omniecho26' },
    { name: 'Facebook',    url: 'https://www.facebook.com/martin.urumov.7/',    handle: 'martin.urumov.7' }
  ]
};
