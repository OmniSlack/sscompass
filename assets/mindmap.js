/* Interactive mind map. A tree that opens to the right with soft curved branches.
   Drag to move, pinch or Ctrl+wheel or the + / - buttons to zoom, Fit to see everything. Tap › to open or close a branch.
   Nodes: { t: string | {bg,en}, c: [children], note: string | {bg,en}, id: any, href: url, go: tab-id }. */
(function () {
  'use strict';
  var UI = {
    open: { bg: 'Отвори всичко', en: 'Open all' }, close: { bg: 'Затвори всичко', en: 'Close all' }, fit: { bg: 'Побери', en: 'Fit' },
    zin: { bg: 'Приближи', en: 'Zoom in' }, zout: { bg: 'Отдалечи', en: 'Zoom out' },
    toggle: { bg: 'Отвори или затвори клона', en: 'Open or close the branch' },
    hint: { bg: 'Влачи за движение, щипни за мащаб. › отваря клон.', en: 'Drag to move, pinch to zoom. › opens a branch.' },
    kids: { bg: 'подточки', en: 'sub-points' }, link: { bg: 'Отвори', en: 'Open' }
  };
  var SVGNS = 'http://www.w3.org/2000/svg';
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function safeHref(u) { return /^(https:\/\/|(\.\.\/|\.\/)?[\w\-\/.]+\.html(#[\w\/\-]*)?$)/.test(u || '') ? u : ''; }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  function create(box, tree, opts) {
    opts = opts || {};
    var lang = opts.lang || 'bg', openSet = {}, sel = null, startDepth = opts.startDepth == null ? 1 : opts.startDepth;
    var narrow = window.innerWidth < 640, W = narrow ? 176 : 232, GAP = narrow ? 54 : 78, PITCH = narrow ? 58 : 62, NH = 46;
    var view = { x: 20, y: 20, k: 1 }, nodes = {}, links = {}, raf = 0, drag = null, pointers = {}, pinch = null, suppress = false;
    function tx(v) { if (v == null) return ''; return typeof v === 'string' ? v : (v[lang] || v.en || ''); }
    (function seed(n, path, d) { if (d < startDepth && n.c && n.c.length) openSet[path] = true; (n.c || []).forEach(function (k, i) { seed(k, path + '.' + i, d + 1); }); })(tree, 'r', 0);
    function find(n, path, want) { if (path === want) return n; var kids = n.c || []; for (var i = 0; i < kids.length; i++) { var r = find(kids[i], path + '.' + i, want); if (r) return r; } return null; }
    function allPaths(n, path, out) { if (n.c && n.c.length) out.push(path); (n.c || []).forEach(function (k, i) { allPaths(k, path + '.' + i, out); }); return out; }

    // ----- skeleton -----
    var bar = el('div', 'mm-bar'), bOpen = el('button', 'mm-b'), bClose = el('button', 'mm-b'), bFit = el('button', 'mm-b'), bOut = el('button', 'mm-b mm-sq', '−'), bIn = el('button', 'mm-b mm-sq', '+'), hint = el('span', 'mono mm-hint');
    [bOpen, bClose, bFit, bOut, bIn].forEach(function (b) { b.type = 'button'; bar.appendChild(b); }); bar.appendChild(hint);
    var vp = el('div', 'mm-view'), canvas = el('div', 'mm-canvas'), svg = document.createElementNS(SVGNS, 'svg'); svg.setAttribute('class', 'mm-links'); svg.setAttribute('aria-hidden', 'true');
    var defs = document.createElementNS(SVGNS, 'defs'); svg.appendChild(defs);
    canvas.appendChild(svg); vp.appendChild(canvas); vp.tabIndex = 0; vp.setAttribute('role', 'tree');
    var detail = el('div', 'mm-detail'); detail.setAttribute('role', 'status'); detail.setAttribute('aria-live', 'polite');
    box.textContent = ''; box.classList.add('mm'); box.appendChild(bar); box.appendChild(vp); box.appendChild(detail);

    // ----- layout of the visible tree -----
    function layout() {
      var out = [], cursor = 0;
      (function walk(n, path, depth, parent) {
        var open = !!openSet[path] && n.c && n.c.length, rec = { n: n, path: path, depth: depth, parent: parent, open: open, x: depth * (W + GAP), y: 0 };
        out.push(rec);
        if (open) { var ys = []; n.c.forEach(function (k, i) { ys.push(walk(k, path + '.' + i, depth + 1, rec)); }); rec.y = (ys[0] + ys[ys.length - 1]) / 2; }
        else { rec.y = cursor; cursor += PITCH; }
        return rec.y;
      })(tree, 'r', 0, null);
      return out;
    }

    // ----- drawing (nodes and links follow their current positions) -----
    function ensureNode(rec) {
      var o = nodes[rec.path];
      if (o) return o;
      var n = rec.n, has = n.c && n.c.length, d = el('div', 'mm-n d' + Math.min(rec.depth, 3)), b = el('button', 'mm-node', tx(n.t)), g = null;
      d.dataset.path = rec.path; d.setAttribute('role', 'treeitem'); d.style.width = W + 'px'; d.style.height = NH + 'px'; b.type = 'button'; b.dataset.path = rec.path; b.title = tx(n.t);
      d.appendChild(b);
      if (has) { g = el('button', 'mm-tg', '›'); g.type = 'button'; g.dataset.path = rec.path; d.appendChild(g); d.classList.add('has'); }
      canvas.appendChild(d);
      o = nodes[rec.path] = { el: d, btn: b, tg: g, cur: { x: rec.parent ? (nodes[rec.parent.path] ? nodes[rec.parent.path].cur.x : rec.x) : rec.x, y: rec.parent ? (nodes[rec.parent.path] ? nodes[rec.parent.path].cur.y : rec.y) : rec.y, o: 0 }, tgt: null, rec: rec };
      return o;
    }
    function ensureLink(rec) {
      var id = rec.path; if (links[id]) return links[id];
      var p = document.createElementNS(SVGNS, 'path'); p.setAttribute('class', 'mm-link d' + Math.min(rec.depth, 3)); svg.appendChild(p);
      return (links[id] = { el: p, rec: rec });
    }
    function paint() {
      Object.keys(links).forEach(function (id) {
        var l = links[id], c = nodes[id], pr = l.rec.parent && nodes[l.rec.parent.path]; if (!c || !pr) return;
        var x1 = pr.cur.x + W, y1 = pr.cur.y + NH / 2, x2 = c.cur.x, y2 = c.cur.y + NH / 2, mx = (x1 + x2) / 2;
        l.el.setAttribute('d', 'M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' C' + mx.toFixed(1) + ' ' + y1.toFixed(1) + ' ' + mx.toFixed(1) + ' ' + y2.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1));
        l.el.style.opacity = String(Math.max(0, Math.min(c.cur.o, pr.cur.o)));
      });
      Object.keys(nodes).forEach(function (id) { var o = nodes[id]; o.el.style.transform = 'translate(' + o.cur.x.toFixed(1) + 'px,' + o.cur.y.toFixed(1) + 'px)'; o.el.style.opacity = String(o.cur.o); });
    }
    function applyView(anim) {
      canvas.classList.toggle('anim', !!anim && !reduce);
      canvas.style.transform = 'translate(' + view.x.toFixed(1) + 'px,' + view.y.toFixed(1) + 'px) scale(' + view.k.toFixed(3) + ')';
    }

    var t0 = 0, dur = 420;
    function tick(now) {
      var t = Math.min(1, (now - t0) / dur), e = ease(t);
      Object.keys(nodes).forEach(function (id) { var o = nodes[id]; o.cur.x = o.from.x + (o.tgt.x - o.from.x) * e; o.cur.y = o.from.y + (o.tgt.y - o.from.y) * e; o.cur.o = o.from.o + (o.tgt.o - o.from.o) * e; });
      paint();
      if (t < 1) raf = requestAnimationFrame(tick); else { raf = 0; cleanup(); }
    }
    function cleanup() {
      Object.keys(nodes).forEach(function (id) { var o = nodes[id]; if (o.leaving) { o.el.remove(); delete nodes[id]; if (links[id]) { links[id].el.remove(); delete links[id]; } } });
    }
    function relayout(anchorPath, instant) {
      var recs = layout(), keep = {}, before = anchorPath && nodes[anchorPath] ? { x: nodes[anchorPath].tgt ? nodes[anchorPath].tgt.x : nodes[anchorPath].cur.x, y: nodes[anchorPath].tgt ? nodes[anchorPath].tgt.y : nodes[anchorPath].cur.y } : null;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      recs.forEach(function (r) { keep[r.path] = r; });
      recs.forEach(function (r) {
        var o = ensureNode(r); o.rec = r; o.leaving = false; o.el.classList.remove('leaving');
        var has = r.n.c && r.n.c.length; o.el.classList.toggle('open', !!r.open); if (has) { o.el.setAttribute('aria-expanded', String(!!r.open)); o.tg.textContent = r.open ? '‹' : '›'; o.tg.setAttribute('aria-label', tx(UI.toggle) + ': ' + tx(r.n.t) + ' (' + r.n.c.length + ' ' + tx(UI.kids) + ')'); }
        o.btn.classList.toggle('sel', sel === r.path); o.el.classList.toggle('sel', sel === r.path);
        o.from = { x: o.cur.x, y: o.cur.y, o: o.cur.o }; o.tgt = { x: r.x, y: r.y, o: 1 };
        if (r.parent) ensureLink(r);
      });
      Object.keys(nodes).forEach(function (id) {
        if (keep[id]) return; var o = nodes[id], p = id.replace(/\.\d+$/, ''), pr = nodes[p] && nodes[p].tgt ? nodes[p].tgt : o.cur;
        o.leaving = true; o.el.classList.add('leaving'); o.from = { x: o.cur.x, y: o.cur.y, o: o.cur.o }; o.tgt = { x: pr.x, y: pr.y, o: 0 };
      });
      if (before && nodes[anchorPath]) {   // keep the toggled node where the finger is, so the picture does not jump
        view.x += (before.x - nodes[anchorPath].tgt.x) * view.k; view.y += (before.y - nodes[anchorPath].tgt.y) * view.k; applyView(false);
      }
      if (instant || reduce) { Object.keys(nodes).forEach(function (id) { var o = nodes[id]; o.cur.x = o.tgt.x; o.cur.y = o.tgt.y; o.cur.o = o.tgt.o; }); paint(); cleanup(); }
      else { t0 = performance.now(); raf = requestAnimationFrame(tick); }
    }
    function bounds() {
      var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
      layout().forEach(function (r) { minX = Math.min(minX, r.x); maxX = Math.max(maxX, r.x + W); minY = Math.min(minY, r.y); maxY = Math.max(maxY, r.y + NH); });
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    }
    function fit(anim) {
      var b = bounds(), vw = vp.clientWidth || 600, vh = vp.clientHeight || 420, pad = 24;
      var k = Math.max(narrow ? .42 : .5, Math.min(1.05, (vw - pad * 2) / b.w, (vh - pad * 2) / b.h));
      view.k = k; view.x = pad - b.x * k + Math.max(0, (vw - pad * 2 - b.w * k) / 2 * (b.w * k < vw * .55 ? 1 : 0)); view.y = (vh - b.h * k) / 2 - b.y * k;
      applyView(anim);
    }
    function zoomAt(cx, cy, factor, anim) {
      var k = Math.max(.3, Math.min(2.4, view.k * factor)); factor = k / view.k;
      view.x = cx - (cx - view.x) * factor; view.y = cy - (cy - view.y) * factor; view.k = k; applyView(anim);
    }

    // ----- interaction: drag, pinch, wheel, buttons -----
    vp.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers);
      if (ids.length === 2) { var a = pointers[ids[0]], b = pointers[ids[1]]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) }; drag = null; }
      else drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
    });
    vp.addEventListener('pointermove', function (e) {
      if (!pointers[e.pointerId]) return; pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(pointers), r = vp.getBoundingClientRect();
      if (ids.length === 2 && pinch) {
        var a = pointers[ids[0]], b = pointers[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y); if (pinch.d > 0) zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, d / pinch.d, false); pinch.d = d; suppress = true; return;
      }
      if (drag) {
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (!drag.moved && Math.hypot(dx, dy) > 5) { drag.moved = true; vp.classList.add('grab'); try { vp.setPointerCapture(e.pointerId); } catch (x) {} }
        if (drag.moved) { view.x = drag.vx + dx; view.y = drag.vy + dy; applyView(false); }
      }
    });
    function up(e) {
      var wasMoved = drag && drag.moved; delete pointers[e.pointerId]; if (Object.keys(pointers).length < 2) pinch = null;
      if (wasMoved || suppress) { suppress = true; setTimeout(function () { suppress = false; }, 60); }
      if (!Object.keys(pointers).length) { drag = null; vp.classList.remove('grab'); }
    }
    vp.addEventListener('pointerup', up); vp.addEventListener('pointercancel', up);
    vp.addEventListener('wheel', function (e) {
      if (!(e.ctrlKey || e.metaKey)) return; e.preventDefault(); var r = vp.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0022), false);
    }, { passive: false });
    vp.addEventListener('keydown', function (e) {
      var s = 40, m = { ArrowLeft: [s, 0], ArrowRight: [-s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] }[e.key];
      if (m && e.target === vp) { e.preventDefault(); view.x += m[0]; view.y += m[1]; applyView(true); }
      else if (e.key === '+' || e.key === '=') { zoomAt(vp.clientWidth / 2, vp.clientHeight / 2, 1.2, true); }
      else if (e.key === '-') { zoomAt(vp.clientWidth / 2, vp.clientHeight / 2, 1 / 1.2, true); }
      else if (e.key === '0') fit(true);
    });
    bIn.addEventListener('click', function () { zoomAt(vp.clientWidth / 2, vp.clientHeight / 2, 1.25, true); });
    bOut.addEventListener('click', function () { zoomAt(vp.clientWidth / 2, vp.clientHeight / 2, 1 / 1.25, true); });
    bFit.addEventListener('click', function () { fit(true); });
    bOpen.addEventListener('click', function () { allPaths(tree, 'r', []).forEach(function (p) { openSet[p] = true; }); relayout(null); setTimeout(function () { fit(true); }, 30); });
    bClose.addEventListener('click', function () { openSet = {}; relayout(null); setTimeout(function () { fit(true); }, 30); });

    function closeBranch(p) { Object.keys(openSet).forEach(function (k) { if (k === p || k.indexOf(p + '.') === 0) delete openSet[k]; }); }   // closing a branch closes everything inside it
    canvas.addEventListener('click', function (e) {
      if (suppress) return;
      var g = e.target.closest('.mm-tg'), nd = e.target.closest('.mm-node');
      if (g) { var p = g.dataset.path; if (openSet[p]) closeBranch(p); else openSet[p] = true; relayout(p); return; }
      if (nd) {
        var p2 = nd.dataset.path, node = find(tree, 'r', p2), hasKids = node && node.c && node.c.length, hasInfo = node && (node.note || node.href || node.id != null || node.go);
        if (hasKids && !hasInfo) { if (openSet[p2]) closeBranch(p2); else openSet[p2] = true; }
        sel = sel === p2 ? null : p2; relayout(p2); showDetail();
      }
    });

    function showDetail() {
      detail.textContent = '';
      var n = sel ? find(tree, 'r', sel) : null;
      if (!n || !(n.note || n.href || n.id != null || n.go)) { detail.className = 'mm-detail'; return; }
      detail.className = 'mm-detail on'; detail.appendChild(el('b', null, tx(n.t)));
      if (n.note) detail.appendChild(el('p', null, tx(n.note)));
      var h = safeHref(n.href); if (h) { var a = el('a', 'btn', tx(UI.link)); a.href = h; detail.appendChild(a); }
      if ((n.id != null || n.go) && opts.onPick) { var o = el('button', 'btn', tx(UI.link)); o.type = 'button'; o.addEventListener('click', function () { opts.onPick(n); }); detail.appendChild(o); }
    }
    function labels() { bOpen.textContent = tx(UI.open); bClose.textContent = tx(UI.close); bFit.textContent = tx(UI.fit); bIn.setAttribute('aria-label', tx(UI.zin)); bOut.setAttribute('aria-label', tx(UI.zout)); hint.textContent = ''; }
    function retext() { Object.keys(nodes).forEach(function (id) { var o = nodes[id], n = find(tree, 'r', id); if (n) { o.btn.textContent = tx(n.t); o.btn.title = tx(n.t); } }); }

    labels(); relayout(null, true); fit(false); showDetail();
    if (window.ResizeObserver) new ResizeObserver(function () { if (vp.clientWidth && !drag) { /* keep the user's view */ } }).observe(vp);
    return {
      setLang: function (l) { lang = l === 'en' ? 'en' : 'bg'; labels(); retext(); relayout(null, true); showDetail(); },
      redraw: function () { relayout(null, true); }, openAll: function () { bOpen.click(); }, fit: function () { fit(false); }
    };
  }
  window.SSCMindmap = { create: create };
})();
