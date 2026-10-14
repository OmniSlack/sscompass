/* SSC Compass — личният таб (платформи, новини, бележки, недовършено).
   Съдържанието е запечатано във vault.js и се показва само след парола. Нищо от него не е публично. */
(function () {
  'use strict';
  var V = window.SSCVault, root = document.getElementById('p-root');
  var lang = 'bg', section = 'platforms', msgTimer = null, forgetArmed = false;
  function $(id) { return document.getElementById(id); }
  function esc(s) { return (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
  function safeUrl(u) { return /^https?:\/\/[^\s"'<>]+$/i.test(u || '') ? u : ''; }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function tx(v) { return v && typeof v === 'object' ? (v[lang] != null ? v[lang] : v.bg) : (v == null ? '' : v); }

  var T = {
    unsupported: { bg: 'Този браузър не поддържа криптиране (Web Crypto). Личният таб не може да се отвори тук.', en: 'This browser does not support encryption (Web Crypto). The personal tab cannot open here.' },
    checking: { bg: 'Проверявам…', en: 'Checking…' },
    unlockTitle: { bg: 'Отключи личния контрол', en: 'Unlock personal control' },
    unlockText: { bg: 'Тук са платформите, новините, бележките и недовършеното ми. Всичко е запечатано с парола и не е публично.', en: 'Platforms, news, notes and my unfinished work live here. Everything is sealed with a passphrase and is not public.' },
    createTitle: { bg: 'Създай личния си vault', en: 'Create your personal vault' },
    createText: { bg: 'Още няма vault на това устройство. Избери парола (поне 8 знака). Няма как да се възстанови, ако я забравиш. По желание зареди начален файл vault.json.', en: 'There is no vault on this device yet. Choose a passphrase (at least 8 characters). It cannot be recovered if you forget it. Optionally load a starter file, vault.json.' },
    name: { bg: 'Име', en: 'Name' }, needName: { bg: 'Въведи име.', en: 'Enter a name.' }, pass: { bg: 'Парола', en: 'Passphrase' }, pass2: { bg: 'Повтори паролата', en: 'Repeat the passphrase' },
    seed: { bg: 'Начален файл vault.json (по желание)', en: 'Starter file vault.json (optional)' },
    unlock: { bg: 'Отключи', en: 'Unlock' }, create: { bg: 'Създай', en: 'Create' },
    wrong: { bg: 'Грешна парола.', en: 'Wrong passphrase.' }, weak: { bg: 'Паролата трябва да е поне 8 знака.', en: 'The passphrase must be at least 8 characters.' },
    mismatch: { bg: 'Двете пароли не съвпадат.', en: 'The two passphrases do not match.' }, badSeed: { bg: 'Файлът не е валиден JSON.', en: 'The file is not valid JSON.' },
    novault: { bg: 'Няма vault на това устройство.', en: 'There is no vault on this device.' },
    saved: { bg: 'Запазено.', en: 'Saved.' }, saveFail: { bg: 'Не успях да запиша. Мястото в браузъра може да е пълно.', en: 'Could not save. Browser storage may be full or blocked.' },
    menu: { platforms: { bg: 'Платформи', en: 'Platforms' }, news: { bg: 'Новини', en: 'News' }, notes: { bg: 'Бележки', en: 'Notes' }, progress: { bg: 'Недовършено', en: 'In progress' }, vault: { bg: 'Vault', en: 'Vault' } },
    menuLabel: { bg: 'Личен контрол', en: 'Personal control' },
    pfHint: { bg: 'Полетата се попълват на ръка. Нищо не се тегли автоматично от платформите.', en: 'Fields are filled in by hand. Nothing is pulled automatically from the platforms.' },
    status: { bg: 'Състояние', en: 'Status' }, live: { bg: 'има линк', en: 'live' }, soon: { bg: 'скоро', en: 'soon' },
    handle: { bg: 'Профил', en: 'Handle' }, url: { bg: 'Линк (https://…)', en: 'Link (https://…)' }, metric: { bg: 'Число на ръка', en: 'Number by hand' }, note: { bg: 'Бележка', en: 'Note' },
    newsHint: { bg: 'Резюмета и новини, които записвам на ръка. Най-новото е най-горе.', en: 'Summaries and news I write down by hand. Newest first.' },
    title: { bg: 'Заглавие', en: 'Title' }, source: { bg: 'Източник (GPT, Claude, Gemini…)', en: 'Source (GPT, Claude, Gemini…)' }, text: { bg: 'Текст', en: 'Text' },
    add: { bg: 'Добави', en: 'Add' }, del: { bg: 'Изтрий', en: 'Delete' }, open: { bg: 'Отвори', en: 'Open' },
    noNews: { bg: 'Още няма новини.', en: 'No news yet.' }, noNotes: { bg: 'Още няма бележки.', en: 'No notes yet.' }, noProgress: { bg: 'Нищо недовършено.', en: 'Nothing in progress.' },
    notesHint: { bg: 'Бележки за преглеждане, когато седна на компютъра.', en: 'Notes to review when I sit down at the computer.' },
    notePh: { bg: 'Нова бележка…', en: 'New note…' },
    progressHint: { bg: 'Работа, която още не е за публичната витрина. Когато е завършена, отива там.', en: 'Work that is not ready for the public showcase yet. When it is finished it moves there.' },
    openTitle: { bg: 'Отворени въпроси', en: 'Open questions' },
    vaultText: { bg: 'Данните са криптирани в този браузър. За друго устройство: изтегли запечатан файл, качи го като assets/vault.enc.json в сайта и го отключи със същата парола.', en: 'The data is encrypted in this browser. For another device: download the sealed file, upload it as assets/vault.enc.json on the site and unlock it with the same passphrase.' },
    export: { bg: 'Изтегли запечатан файл', en: 'Download sealed file' }, lock: { bg: 'Заключи сега', en: 'Lock now' },
    forget: { bg: 'Забрави това устройство', en: 'Forget this device' }, forgetSure: { bg: 'Сигурен ли си? Натисни пак, за да изтриеш vault-а от това устройство.', en: 'Sure? Press again to delete the vault from this device.' },
    exported: { bg: 'Файлът е готов за изтегляне.', en: 'The file is ready to download.' }
  };

  function msg(text, bad) {
    var m = $('p-msg'); if (!m) return; m.textContent = text || ''; m.className = 'pmsg' + (bad ? ' bad' : '');
    clearTimeout(msgTimer); if (text && !bad) msgTimer = setTimeout(function () { if ($('p-msg')) $('p-msg').textContent = ''; }, 2500);
  }
  function persist() { return V.save().then(function () { msg(tx(T.saved)); }, function () { msg(tx(T.saveFail), true); }); }

  /* ---------- вход ---------- */
  function gateHtml(mode) {
    if (mode === 'unsupported') return '<div class="card gate"><p>' + esc(tx(T.unsupported)) + '</p></div>';
    if (mode === 'checking') return '<div class="card gate"><p>' + esc(tx(T.checking)) + '</p></div>';
    var create = mode === 'create';
    return '<form class="card gate" id="p-form" autocomplete="off" novalidate><h3>' + esc(tx(create ? T.createTitle : T.unlockTitle)) + '</h3>' +
      '<p class="note">' + esc(tx(create ? T.createText : T.unlockText)) + '</p>' +
      '<label for="p-name">' + esc(tx(T.name)) + '</label><input id="p-name" type="text" autocomplete="username" autocapitalize="none" spellcheck="false">' +
      '<label for="p-pass">' + esc(tx(T.pass)) + '</label><input id="p-pass" type="password" autocomplete="' + (create ? 'new-password' : 'current-password') + '">' +
      (create ? '<label for="p-pass2">' + esc(tx(T.pass2)) + '</label><input id="p-pass2" type="password" autocomplete="new-password">' +
        '<label for="p-seed">' + esc(tx(T.seed)) + '</label><input id="p-seed" type="file" accept="application/json,.json">' : '') +
      '<div class="prow"><button class="btn" id="p-go" type="submit">' + esc(tx(create ? T.create : T.unlock)) + '</button>' +
      (!create ? '<button class="btn ghost" id="p-forget0" type="button">' + esc(tx(T.forget)) + '</button>' : '') + '</div>' +
      '<p class="pmsg" id="p-msg" role="status"></p></form>';
  }

  function showGate() {
    if (!root) return;
    if (!V || !V.supported()) { root.innerHTML = gateHtml('unsupported'); return; }
    if (V.isOpen()) { renderApp(); return; }
    if (V.hasLocal()) { root.innerHTML = gateHtml('unlock'); return; }
    root.innerHTML = gateHtml('checking');
    V.remote().then(function (blob) { if (V.isOpen()) return; root.innerHTML = gateHtml(blob ? 'unlock' : 'create'); });
  }

  function submitGate(e) {
    e.preventDefault();
    var name = $('p-name').value.trim().toLowerCase(), create = !!$('p-pass2');
    if (!name) { msg(tx(T.needName), true); return; }
    var pass = $('p-pass').value;
    if (create) {
      if (pass.length < 8) { msg(tx(T.weak), true); return; }
      if (pass !== $('p-pass2').value) { msg(tx(T.mismatch), true); return; }
      var file = $('p-seed').files && $('p-seed').files[0];
      var done = function (seed) { V.create(name + ':' + pass, seed).then(function () { renderApp(); }, function () { msg(tx(T.saveFail), true); }); };
      if (!file) { done(null); return; }
      var fr = new FileReader();
      fr.onload = function () { var seed; try { seed = JSON.parse(String(fr.result)); } catch (x) { msg(tx(T.badSeed), true); return; } done(seed); };
      fr.onerror = function () { msg(tx(T.badSeed), true); };
      fr.readAsText(file);
    } else {
      V.unlock(name + ':' + pass).then(function () { renderApp(); }, function (err) { msg(tx(err && err.message === 'no-vault' ? T.novault : T.wrong), true); });
    }
  }

  /* ---------- приложение ---------- */
  function menuHtml() {
    return ['platforms', 'news', 'notes', 'progress', 'vault'].map(function (k) {
      return '<button data-s="' + k + '" aria-current="' + (k === section) + '">' + esc(tx(T.menu[k])) + '</button>';
    }).join('');
  }
  function renderApp() {
    root.innerHTML = '<div class="pwrap"><nav class="pmenu" id="pmenu" aria-label="' + esc(tx(T.menuLabel)) + '">' + menuHtml() + '</nav><div class="pview" id="pview"></div></div><p class="pmsg" id="p-msg" role="status"></p>';
    renderSection();
  }
  function setSection(s) {
    section = s;
    Array.prototype.forEach.call(document.querySelectorAll('#pmenu button'), function (b) { b.setAttribute('aria-current', b.dataset.s === s); });
    renderSection();
    try { history.replaceState(null, '', '#personal/' + s); } catch (e) {}
  }

  function renderSection() {
    var s = V.get(), v = $('pview'); if (!s || !v) return;
    if (section === 'platforms') v.innerHTML = platformsHtml(s);
    else if (section === 'news') v.innerHTML = newsHtml(s);
    else if (section === 'notes') v.innerHTML = notesHtml(s);
    else if (section === 'progress') v.innerHTML = progressHtml(s);
    else v.innerHTML = vaultHtml();
  }

  function platformsHtml(s) {
    return '<p class="note">' + esc(tx(T.pfHint)) + '</p><div class="pgrid">' + s.platforms.map(function (p, i) {
      function f(k, label) { return '<label>' + esc(tx(label)) + '<input data-pf="' + i + '" data-f="' + k + '" value="' + esc(p[k]) + '"></label>'; }
      return '<div class="card pf"><h3>' + esc(p.name) + '</h3>' +
        '<label>' + esc(tx(T.status)) + '<select data-pf="' + i + '" data-f="status"><option value="live"' + (p.status === 'live' ? ' selected' : '') + '>' + esc(tx(T.live)) + '</option><option value="soon"' + (p.status !== 'live' ? ' selected' : '') + '>' + esc(tx(T.soon)) + '</option></select></label>' +
        f('handle', T.handle) + f('url', T.url) + f('metric', T.metric) + f('note', T.note) + '</div>';
    }).join('') + '</div>';
  }
  function newsHtml(s) {
    var rows = s.news.slice().sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
    return '<p class="note">' + esc(tx(T.newsHint)) + '</p>' +
      '<form class="card pform" id="w-form" autocomplete="off"><label for="w-title">' + esc(tx(T.title)) + '</label><input id="w-title">' +
      '<label for="w-source">' + esc(tx(T.source)) + '</label><input id="w-source"><label for="w-url">' + esc(tx(T.url)) + '</label><input id="w-url">' +
      '<label for="w-text">' + esc(tx(T.text)) + '</label><textarea id="w-text"></textarea><div class="prow"><button class="btn" id="w-add" type="submit">' + esc(tx(T.add)) + '</button></div></form>' +
      (rows.length ? rows.map(function (n) {
        var u = safeUrl(n.url);
        return '<article class="card pitem"><h3>' + esc(n.title) + '</h3><div class="mono">' + esc(n.source || '') + ' · ' + esc(when(n.at)) + '</div><p>' + esc(n.text) + '</p>' +
          (u ? '<a href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(tx(T.open)) + ' →</a> ' : '') +
          '<button class="x" data-wdel="' + esc(n.id) + '" aria-label="' + esc(tx(T.del)) + '">×</button></article>';
      }).join('') : '<div class="empty">' + esc(tx(T.noNews)) + '</div>');
  }
  function notesHtml(s) {
    var rows = s.notes.slice().sort(function (a, b) { return (a.done ? 1 : 0) - (b.done ? 1 : 0) || (b.at || 0) - (a.at || 0); });
    return '<p class="note">' + esc(tx(T.notesHint)) + '</p>' +
      '<form class="card pform" id="n-form"><label for="n-text" class="sr">' + esc(tx(T.notePh)) + '</label><textarea id="n-text" placeholder="' + esc(tx(T.notePh)) + '"></textarea><div class="prow"><button class="btn" id="n-add" type="submit">' + esc(tx(T.add)) + '</button></div></form>' +
      (rows.length ? rows.map(function (n) {
        return '<div class="card pitem' + (n.done ? ' done' : '') + '"><input type="checkbox" data-ndone="' + esc(n.id) + '"' + (n.done ? ' checked' : '') + ' aria-label="done"><div class="ptxt">' + esc(n.text) + '<div class="mono">' + esc(when(n.at)) + '</div></div><button class="x" data-ndel="' + esc(n.id) + '" aria-label="' + esc(tx(T.del)) + '">×</button></div>';
      }).join('') : '<div class="empty">' + esc(tx(T.noNotes)) + '</div>');
  }
  function progressHtml(s) {
    return '<p class="note">' + esc(tx(T.progressHint)) + '</p>' +
      (s.projects.length ? '<div class="pgrid">' + s.projects.map(function (p) {
        return '<article class="card pitem pproj"><div class="chips"><span class="chip st">' + esc(tx(p.status)) + '</span>' + (p.chips || []).map(function (c) { return '<span class="chip">' + esc(tx(c)) + '</span>'; }).join('') + '</div>' +
          '<h3>' + esc(p.name) + '</h3><p>' + esc(tx(p.summary)) + '</p>' + ((p.details || []).length ? '<ul>' + p.details.map(function (d) { return '<li>' + esc(tx(d)) + '</li>'; }).join('') + '</ul>' : '') + '</article>';
      }).join('') + '</div>' : '<div class="empty">' + esc(tx(T.noProgress)) + '</div>') +
      (s.openItems.length ? '<h3 class="oh">' + esc(tx(T.openTitle)) + '</h3>' + s.openItems.map(function (o) {
        return '<article class="card pitem open"><h3>' + esc(tx(o.title)) + '</h3><ul>' + (o.items || []).map(function (i) { return '<li>' + esc(tx(i)) + '</li>'; }).join('') + '</ul>' + (o.note ? '<p>' + esc(tx(o.note)) + '</p>' : '') + '</article>';
      }).join('') : '');
  }
  function vaultHtml() {
    return '<div class="card pform"><p>' + esc(tx(T.vaultText)) + '</p><div class="prow"><button class="btn" id="v-export" type="button">' + esc(tx(T.export)) + '</button>' +
      '<button class="btn ghost" id="v-lock" type="button">' + esc(tx(T.lock)) + '</button><button class="btn ghost" id="v-forget" type="button">' + esc(tx(T.forget)) + '</button></div></div>';
  }
  function when(ms) { try { return new Date(ms).toLocaleString(lang === 'bg' ? 'bg-BG' : 'en-GB', { dateStyle: 'short', timeStyle: 'short' }); } catch (e) { return ''; } }

  /* ---------- събития ---------- */
  document.addEventListener('submit', function (e) {
    if (!root || !root.contains(e.target)) return;
    var id = e.target.id;
    if (id === 'p-form') { submitGate(e); return; }
    e.preventDefault();
    var s = V.isOpen() ? V.get() : null; if (!s) return;
    if (id === 'n-form') {
      var t = $('n-text').value.trim(); if (!t) return;
      s.notes.push({ id: uid(), text: t, done: false, at: Date.now() }); persist().then(renderSection);
    } else if (id === 'w-form') {
      var title = $('w-title').value.trim(); if (!title) return;
      var url = $('w-url').value.trim();
      s.news.push({ id: uid(), title: title, source: $('w-source').value.trim(), url: safeUrl(url), text: $('w-text').value.trim(), at: Date.now() }); persist().then(renderSection);
    }
  });
  document.addEventListener('click', function (e) {
    if (!root || !root.contains(e.target)) return;
    var t = e.target, s = V && V.isOpen() ? V.get() : null;
    if (t.dataset.s && t.closest('#pmenu')) { setSection(t.dataset.s); return; }
    if (t.id === 'p-forget0' || t.id === 'v-forget') {
      if (!forgetArmed) { forgetArmed = true; msg(tx(T.forgetSure), true); return; }
      forgetArmed = false; V.forget(); showGate(); return;
    }
    forgetArmed = false;
    if (t.id === 'v-lock') { V.lock(); showGate(); return; }
    if (t.id === 'v-export') {
      V.exportSealed().then(function (text) {
        P._lastExport = text;
        try { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = 'vault.enc.json'; document.body.appendChild(a); a.click(); a.remove(); } catch (x) {}
        msg(tx(T.exported));
      });
      return;
    }
    if (!s) return;
    if (t.dataset.wdel) { s.news = s.news.filter(function (n) { return n.id !== t.dataset.wdel; }); persist().then(renderSection); }
    if (t.dataset.ndel) { s.notes = s.notes.filter(function (n) { return n.id !== t.dataset.ndel; }); persist().then(renderSection); }
  });
  document.addEventListener('change', function (e) {
    if (!root || !root.contains(e.target) || !V || !V.isOpen()) return;
    var t = e.target, s = V.get();
    if (t.dataset.ndone) { s.notes.forEach(function (n) { if (n.id === t.dataset.ndone) n.done = t.checked; }); persist().then(renderSection); }
    if (t.dataset.pf !== undefined && s.platforms[+t.dataset.pf]) {
      var v = t.value; if (t.dataset.f === 'url') v = safeUrl(v.trim()) ? v.trim() : '';
      s.platforms[+t.dataset.pf][t.dataset.f] = v; persist();
    }
  });

  var P = {
    render: function (l) { if (l) lang = l; if (!root || !root.innerHTML) return; if (V && V.isOpen()) renderApp(); else showGate(); },
    onShow: function (sub) { if (sub && T.menu[sub]) section = sub; showGate(); },
    lockNow: function () { if (V) V.lock(); if (root) root.innerHTML = ''; forgetArmed = false; },
    section: function () { return section; }
  };
  window.SSCPersonal = P;
})();
