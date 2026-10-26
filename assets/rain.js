/* A faint, sparse "digital rain" behind the page. Decorative only: off for reduced motion, paused when the tab is hidden. */
(function () {
  'use strict';
  if (!window.matchMedia || !document.body) return;
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) return;
  var cv = document.createElement('canvas');
  cv.className = 'rain'; cv.setAttribute('aria-hidden', 'true');
  var ctx = cv.getContext && cv.getContext('2d');
  if (!ctx) return;
  document.body.insertBefore(cv, document.body.firstChild);
  var W = 0, H = 0, dpr = 1, streams = [], SIZE = 16, last = 0, raf = 0;
  function fit() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.font = SIZE + 'px "IBM Plex Mono", ui-monospace, Consolas, monospace';
  }
  function glyph() { return String.fromCharCode(48 + Math.floor(Math.random() * 10)); }
  function spawn() {
    var cols = Math.floor(W / (SIZE + 6)), c = Math.floor(Math.random() * cols);
    streams.push({ x: c * (SIZE + 6) + 3, y: -SIZE, v: 55 + Math.random() * 70, n: 7 + Math.floor(Math.random() * 9), ch: [], acc: 0 });
  }
  function frame(t) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min((t - last) / 1000, .1); last = t;
    var max = Math.max(3, Math.min(14, Math.floor(W / 110)));
    if (streams.length < max && Math.random() < dt * 1.3) spawn();
    ctx.clearRect(0, 0, W, H);
    for (var i = streams.length - 1; i >= 0; i--) {
      var s = streams[i]; s.y += s.v * dt; s.acc += s.v * dt;
      while (s.acc >= SIZE) { s.acc -= SIZE; s.ch.unshift(glyph()); if (s.ch.length > s.n) s.ch.pop(); }
      if (!s.ch.length) s.ch.push(glyph());
      for (var k = 0; k < s.ch.length; k++) {
        var a = (1 - k / s.n) * (k === 0 ? .55 : .34);
        ctx.fillStyle = 'rgba(52,50,150,' + a.toFixed(3) + ')';
        ctx.fillText(s.ch[k], s.x, s.y - k * SIZE);
      }
      if (s.y - s.n * SIZE > H) streams.splice(i, 1);
    }
  }
  function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
  window.addEventListener('resize', fit);
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  if (mq.addEventListener) mq.addEventListener('change', function (e) { if (e.matches) { stop(); cv.style.display = 'none'; } else { cv.style.display = ''; start(); } });
  fit(); start();
})();
