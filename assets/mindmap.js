/* Interactive mind map: a tree that opens to the right. Tap a node to select it, tap › to open or close its branch.
   Nodes: { t: string | {bg,en}, c: [children], note: string | {bg,en}, id: any, href: url }. */
(function () {
  'use strict';
  var UI = {
    open: { bg: 'Отвори всичко', en: 'Open all' }, close: { bg: 'Затвори всичко', en: 'Close all' },
    toggle: { bg: 'Отвори или затвори клона', en: 'Open or close the branch' },
    hint: { bg: 'Натисни › до възел, за да отвориш клона му. Натисни самия възел за подробности.', en: 'Tap › next to a node to open its branch. Tap the node itself for details.' },
    kids: { bg: 'подточки', en: 'sub-points' }, link: { bg: 'Отвори', en: 'Open' }
  };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function safeHref(u) { return /^(https:\/\/|(\.\.\/|\.\/)?[\w\-\/.]+\.html(#[\w\/\-]*)?$)/.test(u || '') ? u : ''; }

  function create(box, tree, opts) {
    opts = opts || {};
    var lang = opts.lang || 'bg', openSet = {}, sel = null, startDepth = opts.startDepth == null ? 1 : opts.startDepth;
    function tx(v) { if (v == null) return ''; return typeof v === 'string' ? v : (v[lang] || v.en || ''); }
    (function seed(n, path, d) { if (d < startDepth && n.c && n.c.length) openSet[path] = true; (n.c || []).forEach(function (k, i) { seed(k, path + '.' + i, d + 1); }); })(tree, 'r', 0);

    var bar = el('div', 'mm-bar'), bOpen = el('button', 'mm-b'), bClose = el('button', 'mm-b'), hint = el('span', 'mono mm-hint');
    bOpen.type = bClose.type = 'button'; bar.appendChild(bOpen); bar.appendChild(bClose); bar.appendChild(hint);
    var scroll = el('div', 'mm-scroll'), detail = el('div', 'mm-detail'); detail.setAttribute('role', 'status'); detail.setAttribute('aria-live', 'polite');
    box.textContent = ''; box.classList.add('mm'); box.appendChild(bar); box.appendChild(scroll); box.appendChild(detail);

    function allPaths(n, path, out) { if (n.c && n.c.length) out.push(path); (n.c || []).forEach(function (k, i) { allPaths(k, path + '.' + i, out); }); return out; }
    bOpen.addEventListener('click', function () { allPaths(tree, 'r', []).forEach(function (p) { openSet[p] = true; }); draw(); });
    bClose.addEventListener('click', function () { openSet = { r: true }; draw(); });

    function build(n, path, depth) {
      var has = n.c && n.c.length, li = el('li', 'mm-n d' + Math.min(depth, 4) + (has ? ' has' : '') + (openSet[path] ? ' open' : ''));
      li.setAttribute('role', 'treeitem'); if (has) li.setAttribute('aria-expanded', String(!!openSet[path]));
      var row = el('div', 'mm-row'), b = el('button', 'mm-node' + (sel === path ? ' sel' : ''), tx(n.t)); b.type = 'button'; b.dataset.path = path;
      row.appendChild(b);
      if (has) { var g = el('button', 'mm-tg', openSet[path] ? '‹' : '›'); g.type = 'button'; g.dataset.path = path; g.setAttribute('aria-label', tx(UI.toggle) + ': ' + tx(n.t) + ' (' + n.c.length + ' ' + tx(UI.kids) + ')'); row.appendChild(g); }
      li.appendChild(row);
      if (has && openSet[path]) { var ul = el('ul', 'mm-kids'); ul.setAttribute('role', 'group'); n.c.forEach(function (k, i) { ul.appendChild(build(k, path + '.' + i, depth + 1)); }); li.appendChild(ul); }
      return li;
    }
    function find(n, path, want) { if (path === want) return n; var kids = n.c || []; for (var i = 0; i < kids.length; i++) { var r = find(kids[i], path + '.' + i, want); if (r) return r; } return null; }
    function draw() {
      bOpen.textContent = tx(UI.open); bClose.textContent = tx(UI.close); hint.textContent = tx(UI.hint);
      var keepX = scroll.scrollLeft, keepY = scroll.scrollTop;
      scroll.textContent = '';
      var ul = el('ul', 'mm-root'); ul.setAttribute('role', 'tree'); ul.appendChild(build(tree, 'r', 0)); scroll.appendChild(ul);
      scroll.scrollLeft = keepX; scroll.scrollTop = keepY;
      detail.textContent = '';
      var n = sel ? find(tree, 'r', sel) : null;
      if (n && (n.note || n.href)) {
        detail.className = 'mm-detail on'; detail.appendChild(el('b', null, tx(n.t)));
        if (n.note) detail.appendChild(el('p', null, tx(n.note)));
        var h = safeHref(n.href); if (h) { var a = el('a', 'btn', tx(UI.link)); a.href = h; detail.appendChild(a); }
        if (n.id != null && opts.onPick) { var o = el('button', 'btn', tx(UI.link)); o.type = 'button'; o.addEventListener('click', function () { opts.onPick(n); }); detail.appendChild(o); }
      } else if (n && n.id != null && opts.onPick) {
        detail.className = 'mm-detail on'; detail.appendChild(el('b', null, tx(n.t)));
        var o2 = el('button', 'btn', tx(UI.link)); o2.type = 'button'; o2.addEventListener('click', function () { opts.onPick(n); }); detail.appendChild(o2);
      } else detail.className = 'mm-detail';
    }
    scroll.addEventListener('click', function (e) {
      var g = e.target.closest('.mm-tg'), nd = e.target.closest('.mm-node');
      if (g) { var p = g.dataset.path; if (openSet[p]) delete openSet[p]; else openSet[p] = true; draw(); return; }
      if (nd) {
        var p2 = nd.dataset.path, node = find(tree, 'r', p2);
        if (node && node.c && node.c.length && !(node.note || node.href || node.id != null)) { if (openSet[p2]) delete openSet[p2]; else openSet[p2] = true; }
        sel = sel === p2 ? null : p2; draw();
      }
    });
    draw();
    return { setLang: function (l) { lang = l === 'en' ? 'en' : 'bg'; draw(); }, redraw: draw, openAll: function () { bOpen.click(); } };
  }
  window.SSCMindmap = { create: create };
})();
