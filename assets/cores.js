/* SSC Compass — ядра (анимации) за всеки AI.
   Едни и същи частици се преливат между форми:
   Claude = мрежа от възли, GPT = възел (тореус), Codex = спирална галактика, Gemini = искра.
   Състояния: idle, listening, working, speaking, error. */
(function () {
  'use strict';
  var cv = document.getElementById('core');
  if (!cv) return;
  var box = cv.parentNode, ctx = cv.getContext('2d');

  var mobile = window.innerWidth < 640;
  var N = mobile ? 620 : 1000;
  var NET = mobile ? 110 : 170;               // възли с връзки при Claude
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var paused = reduce, dirty = true, visible = true;

  var ACCENT = { claude: [217, 70, 239], gpt: [52, 211, 153], codex: [147, 197, 253], gemini: [96, 165, 250] };
  var PARAM = {
    claude: { tilt: .28, mode: 'spin', speed: .22, amp: 0, alpha: .9 },
    gpt:    { tilt: .55, mode: 'spin', speed: .34, amp: 0, alpha: .95 },
    codex:  { tilt: 1.2, mode: 'spin', speed: .30, amp: 0, alpha: .85 },
    gemini: { tilt: 0,   mode: 'sway', speed: .55, amp: .5, alpha: .95 }
  };

  function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }
  function hsl(h, s, l) {
    s /= 100; l /= 100;
    var a = s * Math.min(l, 1 - l);
    function f(n) { var k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1))); }
    return [255 * f(0), 255 * f(8), 255 * f(4)];
  }

  function build(id) {
    var pos = new Float32Array(N * 3), col = new Float32Array(N * 3), siz = new Float32Array(N), i, c;
    for (i = 0; i < N; i++) {
      var x = 0, y = 0, z = 0, sz = 1;
      if (id === 'claude') {
        var yy = 1 - 2 * (i + .5) / N, r = Math.sqrt(1 - yy * yy), th = i * 2.399963, j = .72 + Math.random() * .5;
        x = Math.cos(th) * r * j; y = yy * j; z = Math.sin(th) * r * j;
        c = hsl(285 + Math.random() * 40, 70 + Math.random() * 25, 58 + Math.random() * 25); sz = .5 + Math.random() * 1.1;
      } else if (id === 'codex') {
        var tt = Math.pow(Math.random(), .65), ang = (i % 3) * 2.0944 + tt * 9.5, rad = .05 + tt * 1.0, sc = .035 + tt * .09;
        x = Math.cos(ang) * rad + gauss() * sc; z = Math.sin(ang) * rad + gauss() * sc; y = gauss() * .035 * (1.2 - tt);
        if (Math.random() < .18) { var q = Math.random(); x = gauss() * .17 * q; z = gauss() * .17 * q; y = gauss() * .1 * q; }
        c = hsl(212 + gauss() * 14, 18 + Math.random() * 30, 74 + Math.random() * 24); sz = .35 + Math.random() * 1.2;
      } else if (id === 'gpt') {
        var u = Math.random() * 6.2832, kr = 2 + Math.cos(3 * u);
        x = kr * Math.cos(2 * u) / 3 + gauss() * .07; y = kr * Math.sin(2 * u) / 3 + gauss() * .07; z = Math.sin(3 * u) / 3 * 1.3 + gauss() * .07;
        c = hsl(148 + (u / 6.2832) * 42, 68 + Math.random() * 20, 52 + Math.random() * 26); sz = .5 + Math.random() * 1.2;
      } else {
        var big = Math.random() < .86, t2 = Math.random() * 6.2832, uu = Math.pow(Math.random(), .55);
        var ct = Math.cos(t2), st = Math.sin(t2);
        x = ct * Math.abs(ct) * Math.abs(ct) * uu; y = st * Math.abs(st) * Math.abs(st) * uu; z = gauss() * .06;
        if (!big) { x = x * .28 + .78; y = y * .28 - .72; }
        c = hsl(205 + (x + 1) * 42 + (1 - y) * 8, 82, 58 + Math.random() * 22); sz = .5 + Math.random() * 1.3;
      }
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2]; siz[i] = sz;
    }
    return { pos: pos, col: col, siz: siz };
  }

  var shapes = {};
  ['claude', 'gpt', 'codex', 'gemini'].forEach(function (k) { shapes[k] = build(k); });

  var noise = new Float32Array(N * 3), net = [], k;
  for (k = 0; k < N * 3; k++) noise[k] = gauss();
  for (k = 0; k < NET; k++) net.push((Math.random() * N) | 0);

  var px = new Float32Array(N), py = new Float32Array(N), pz = new Float32Array(N), ps = new Float32Array(N);
  var from = 'claude', to = 'claude', m = 1;      // m: 0..1 прелив from -> to
  var phase = { claude: 0, gpt: 0, codex: 0, gemini: 0 };
  var state = 'idle', t = 0, last = 0;
  var cur = { spd: 1, rad: 1, jit: 0, br: 1, err: 0, ring: 0 };
  var accent = ACCENT.claude.slice();
  var W = 0, H = 0, dpr = 1;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = box.clientWidth; H = box.clientHeight;
    cv.width = Math.max(1, W * dpr); cv.height = Math.max(1, H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); dirty = true;
  }
  if (window.ResizeObserver) new ResizeObserver(size).observe(box); else window.addEventListener('resize', size);
  size();

  var mx = 0, my = 0;
  window.addEventListener('pointermove', function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(box);

  function ease(v) { return v < .5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2; }
  function lerp(a, b, v) { return a + (b - a) * v; }
  function angles(id) {
    var p = PARAM[id], ph = phase[id];
    return { yaw: p.mode === 'spin' ? ph : Math.sin(ph) * p.amp, roll: id === 'gemini' ? ph * .12 : 0, tilt: p.tilt, alpha: p.alpha };
  }

  function frame(now) {
    requestAnimationFrame(frame);
    var dt = Math.min((now - last) / 1000 || 0, .05); last = now;
    step(dt);
  }
  function step(dt) {
    var morphing = m < 1;
    if (!visible || (paused && !morphing && !dirty)) return;
    if (paused && !morphing) dt = 0;
    t += dt;

    // целеви стойности за текущото състояние
    var tg = { spd: 1, rad: 1, jit: 0, br: 1, err: 0, ring: 0 };
    if (state === 'listening') { tg.spd = .7; tg.rad = .965 + .03 * Math.sin(t * 2.4); tg.br = 1.1; tg.ring = 1; }
    else if (state === 'working') { tg.spd = 3.4; tg.jit = .035; tg.br = 1.3; }
    else if (state === 'speaking') { tg.rad = 1 + .07 * (Math.sin(t * 9) * .6 + Math.sin(t * 13.7) * .4 + .3 * Math.sin(t * 21)); tg.br = 1.25; }
    else if (state === 'error') { tg.spd = .25; tg.jit = .05; tg.br = .9; tg.err = 1; }
    var kf = Math.min(1, dt * 6) || 1;
    cur.spd = lerp(cur.spd, tg.spd, kf); cur.rad = lerp(cur.rad, tg.rad, state === 'speaking' || state === 'listening' ? 1 : kf);
    cur.jit = lerp(cur.jit, tg.jit, kf); cur.br = lerp(cur.br, tg.br, kf); cur.err = lerp(cur.err, tg.err, kf); cur.ring = lerp(cur.ring, tg.ring, kf);

    if (morphing) m = Math.min(1, m + dt / 1.1);
    var me = ease(m), A = ACCENT[to], B = ACCENT[from];
    accent = [lerp(B[0], A[0], me), lerp(B[1], A[1], me), lerp(B[2], A[2], me)];
    Object.keys(phase).forEach(function (id) { phase[id] += dt * PARAM[id].speed * cur.spd; });

    var a1 = angles(from), a2 = angles(to);
    var yaw = lerp(a1.yaw, a2.yaw, me) + mx * .6, roll = lerp(a1.roll, a2.roll, me);
    var tilt = lerp(a1.tilt, a2.tilt, me) + my * .35, alpha = lerp(a1.alpha, a2.alpha, me);
    var cy_ = Math.cos(yaw), sy = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt), cr = Math.cos(roll), sr = Math.sin(roll);

    var R = Math.min(W, H) * .33 * cur.rad, cx = W / 2, cy = H / 2;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    var S0 = shapes[from], S1 = shapes[to], swirl = Math.sin(Math.PI * me) * .55;
    var jit = cur.jit, i;
    for (i = 0; i < N; i++) {
      var i3 = i * 3;
      var x = lerp(S0.pos[i3], S1.pos[i3], me) + noise[i3] * swirl;
      var y = lerp(S0.pos[i3 + 1], S1.pos[i3 + 1], me) + noise[i3 + 1] * swirl;
      var z = lerp(S0.pos[i3 + 2], S1.pos[i3 + 2], me) + noise[i3 + 2] * swirl;
      if (jit) { x += (Math.random() - .5) * jit; y += (Math.random() - .5) * jit; z += (Math.random() - .5) * jit; }
      var x1 = x * cy_ + z * sy, z1 = -x * sy + z * cy_;
      var y2 = y * ct - z1 * st, z2 = y * st + z1 * ct;
      var x3 = x1 * cr - y2 * sr, y3 = x1 * sr + y2 * cr;
      var s = 1 / (1.7 - z2 * .45) * 1.7;
      px[i] = cx + x3 * R * s * 1.15; py[i] = cy + y3 * R * s * 1.15; pz[i] = z2; ps[i] = s;
    }

    // връзки (само при Claude)
    var wNet = (to === 'claude' ? me : 0) + (from === 'claude' && to !== 'claude' ? 1 - me : 0);
    if (wNet > .02) {
      var thr = R * .34, thr2 = thr * thr, a, b;
      ctx.lineWidth = .7;
      for (a = 0; a < NET; a++) for (b = a + 1; b < NET; b++) {
        var p = net[a], q = net[b], dx = px[p] - px[q], dy = py[p] - py[q], d = dx * dx + dy * dy;
        if (d < thr2) {
          ctx.strokeStyle = 'rgba(' + (accent[0] | 0) + ',' + (accent[1] | 0) + ',' + (accent[2] | 0) + ',' + (.3 * (1 - d / thr2) * wNet * cur.br) + ')';
          ctx.beginPath(); ctx.moveTo(px[p], py[p]); ctx.lineTo(px[q], py[q]); ctx.stroke();
        }
      }
    }

    // кръгове при „слуша“
    if (cur.ring > .02) {
      for (k = 0; k < 3; k++) {
        var ph = (t * .55 + k / 3) % 1;
        ctx.strokeStyle = 'rgba(' + (accent[0] | 0) + ',' + (accent[1] | 0) + ',' + (accent[2] | 0) + ',' + ((1 - ph) * .35 * cur.ring) + ')';
        ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(cx, cy, R * (1.15 + ph * .55), 0, 6.2832); ctx.stroke();
      }
    }

    // точки
    var ef = cur.err, br = cur.br, scale = Math.max(.75, R / 200);
    for (i = 0; i < N; i++) {
      var i3b = i * 3, r = lerp(S0.col[i3b], S1.col[i3b], me), g = lerp(S0.col[i3b + 1], S1.col[i3b + 1], me), bl = lerp(S0.col[i3b + 2], S1.col[i3b + 2], me);
      if (ef > .01) { var fl = ef * (.6 + .3 * Math.sin(t * 18 + i)); r = lerp(r, 248, fl); g = lerp(g, 90, fl); bl = lerp(bl, 90, fl); }
      var al = Math.max(.2, Math.min(1, (.45 + (pz[i] + 1) * .3) * alpha * br));
      var sz = (1.15 + lerp(S0.siz[i], S1.siz[i], me) * 1.05) * ps[i] * scale;
      ctx.fillStyle = 'rgba(' + (r | 0) + ',' + (g | 0) + ',' + (bl | 0) + ',' + al + ')';
      ctx.beginPath(); ctx.arc(px[i], py[i], sz, 0, 6.2832); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    dirty = false;
  }
  requestAnimationFrame(frame);

  window.SSCCore = {
    setAI: function (id) {
      if (!shapes[id] || id === to) return;
      from = to; to = id; m = 0; dirty = true;
    },
    setState: function (s) { state = s; dirty = true; },
    setPaused: function (b) { paused = !!b; dirty = true; },
    isPaused: function () { return paused; },
    advance: function (sec) { var n = Math.ceil(sec / .033), j; for (j = 0; j < n; j++) step(.033); }   // lets a test advance frames without rAF
  };
})();
