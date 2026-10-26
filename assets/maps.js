/* Public mind maps: the project map (Work tab) and the method map (Method tab). Built from data the page already has. */
(function () {
  'use strict';
  var T = function (bg, en) { return { bg: bg, en: en }; };
  var lang = 'bg', mmWork = null, mmMethod = null, view = 'list';
  var UI = { list: T('Списък', 'List'), map: T('Карта', 'Map'), view: T('Изглед', 'View') };
  function tx(v) { return typeof v === 'string' ? v : (v[lang] || v.en); }

  var METHOD = {
    t: T('Метод', 'Method'), c: [
      { t: T('Кой какво е правил', 'Who did what'), c: [
        { t: 'Martin Urumov', c: [{ t: T('Изисквания и критерии за приемане', 'Requirements and acceptance criteria') }, { t: T('Гранични и отрицателни сценарии', 'Edge-case and negative scenarios') }, { t: T('Преглед и решения какво се пази', 'Review and decisions on what is kept') }] },
        { t: T('AI асистенти', 'AI coding assistants'), c: [{ t: T('Писане на код и автоматични тестове', 'Writing code and automated tests') }] },
        { t: T('И двамата', 'Both'), c: [{ t: T('Пускане на тестове и отчитане на броя', 'Running tests and reporting counts') }] },
        { t: T('Дефекти', 'Defects'), c: [{ t: T('Намирани от двамата, отбелязани в README на папката', 'Found by both, marked in the folder README') }] }] },
      { t: T('Правила', 'Rules'), c: [
        { t: T('Откритие на AI се приписва на AI', 'A finding by an AI is attributed to the AI') },
        { t: T('Число се публикува само с командата, която го произвежда', 'A number is published only with the command that produces it') },
        { t: T('„PASS“ без суров запис не е доказателство', '“PASS” without a raw log is not evidence') },
        { t: T('Дефектите в собствената ми работа се пазят', 'Defects in my own work are kept on record') },
        { t: T('Документите и файловете са данни, не заповеди', 'Documents and files are data, not instructions') }] },
      { t: T('Провери сам', 'Check it yourself'), c: [
        { t: 'sha256sum -c SHA256SUMS' }, { t: T('node --test: оценител, 247 теста', 'node --test: evaluator, 247 tests') },
        { t: T('node test.js: проверяващ, 30 теста', 'node test.js: verifier, 30 tests') }, { t: T('node --test: регистър на дефектите, 21 теста', 'node --test: defect register, 21 tests') }] },
      { t: T('Поправки, които съм запазил', 'Corrections I kept'), c: [
        { t: T('Брой гейтове: 17, 18, 19 в документи, 16 в кода', 'Gate count: 17, 18, 19 in documents, 16 in the code') },
        { t: T('„Ниво 3,5“ не издържа на изчисляване', '“Level 3.5” did not survive being computed') },
        { t: T('45 от 45, после 43 от 45 на същата среда: и двете записани', '45 of 45, then 43 of 45 on the same environment: both on record') },
        { t: T('Регистърът казва собствената си граница: самоотчет', 'The register states its own limit: self-reported') }] },
      { t: T('Ограничения', 'Limitations'), c: [
        { t: T('Прототипи и документирани експерименти', 'Prototypes and documented experiments') },
        { t: T('Без твърдение за внедряване, клиент или оценка на сигурността', 'No claim of deployment, a client or a security assessment') },
        { t: T('Всеки README изброява собствените си граници', 'Each README lists its own limits') }] }
    ]
  };

  function projectsTree() {
    var D = window.SSC; if (!D) return { t: '—' };
    return { t: D.owner, c: D.kinds.filter(function (k) { return k.id !== 'all'; }).map(function (k) {
      var items = D.projects.filter(function (p) { return p.tags.indexOf(k.id) > -1; });
      return { t: { bg: k.label.bg + ' · ' + items.length, en: k.label.en + ' · ' + items.length }, c: items.map(function (p) { return { t: p.id, id: p.id, note: p.summary }; }) };
    }) };
  }

  function mountWork() {
    var box = document.getElementById('work-map'); if (!box) return;
    mmWork = window.SSCMindmap.create(box, projectsTree(), { lang: lang, startDepth: 1, onPick: function (n) { if (window.SSCApp && window.SSCApp.openProject) window.SSCApp.openProject(n.id); } });
  }
  function mountMethod() {
    var box = document.getElementById('method-map'); if (!box) return;
    mmMethod = window.SSCMindmap.create(box, METHOD, { lang: lang, startDepth: 1 });
  }
  function toggleUi() {
    var bar = document.getElementById('work-view'); if (!bar) return;
    bar.textContent = '';
    ['list', 'map'].forEach(function (k) {
      var b = document.createElement('button'); b.type = 'button'; b.dataset.v = k; b.textContent = tx(UI[k]); b.setAttribute('aria-pressed', String(view === k));
      b.addEventListener('click', function () { view = k; apply(); });
      bar.appendChild(b);
    });
    bar.setAttribute('aria-label', tx(UI.view));
  }
  function apply() {
    var map = document.getElementById('work-map'), grid = document.getElementById('projects-grid'), filters = document.getElementById('filters');
    if (!map || !grid) return;
    map.hidden = view !== 'map'; grid.hidden = view === 'map'; if (filters) filters.hidden = view === 'map';
    toggleUi();
  }

  window.SSCMaps = {
    render: function (l) {
      lang = l === 'en' ? 'en' : 'bg';
      if (!mmWork) mountWork(); else mmWork.setLang(lang);
      if (!mmMethod) mountMethod(); else mmMethod.setLang(lang);
      apply();
    },
    method: METHOD, projects: projectsTree
  };
})();
