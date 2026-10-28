/* A faint, sparse "digital rain" behind the page. Decorative only. A button at the top left turns it on or off;
   the choice is remembered. Off by default when the system asks for reduced motion; the button still lets the visitor turn it on. Paused when the tab is hidden. */
(function () {
  'use strict';
  if (!window.matchMedia || !document.body) return;
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var cv = document.createElement('canvas');
  cv.className = 'rain'; cv.setAttribute('aria-hidden', 'true');
  var ctx = cv.getContext && cv.getContext('2d');
  if (!ctx) return;
  document.body.insertBefore(cv, document.body.firstChild);
  var W = 0, H = 0, dpr = 1, streams = [], SIZE = 16, last = 0, raf = 0, on = false, lang = 'bg';

  function saved() { try { var s = localStorage.getItem('ssc-rain'); return s === 'on' || s === 'off' ? s : null; } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem('ssc-rain', v); } catch (e) {} }

  function fit() {
    dpr = Math.min(window.devicePixelRatio || 1, 2); W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.font = SIZE + 'px "IBM Plex Mono", ui-monospace, Consolas, monospace';
  }
  function glyph() { return String.fromCharCode(48 + Math.floor(Math.random() * 10)); }
  function spawn(anywhere) {
    var cols = Math.floor(W / (SIZE + 6)), c = Math.floor(Math.random() * cols), n = 8 + Math.floor(Math.random() * 10);
    streams.push({ x: c * (SIZE + 6) + 3, y: anywhere ? Math.random() * H : -SIZE, v: 34 + Math.random() * 12, n: n, ch: [], acc: 0 });
  }
  function seed() { streams = []; var k = Math.max(6, Math.floor(W / 46)); for (var i = 0; i < k; i++) spawn(true); }
  function frame(t) {
    raf = requestAnimationFrame(frame);
    var dt = Math.min((t - last) / 1000, .1); last = t;
    var max = Math.max(6, Math.floor(W / 40));
    if (streams.length < max && Math.random() < dt * 5) spawn(false);
    ctx.clearRect(0, 0, W, H);
    for (var i = streams.length - 1; i >= 0; i--) {
      var s = streams[i]; s.y += s.v * dt; s.acc += s.v * dt;
      while (s.acc >= SIZE) { s.acc -= SIZE; s.ch.unshift(glyph()); if (s.ch.length > s.n) s.ch.pop(); }
      while (s.ch.length < Math.min(s.n, 1 + Math.floor((s.y + SIZE) / SIZE))) s.ch.push(glyph());
      for (var k = 0; k < s.ch.length; k++) {
        var a = (1 - k / s.n) * (k === 0 ? .34 : .17);
        ctx.fillStyle = 'rgba(60,255,120,' + a.toFixed(3) + ')';
        ctx.fillText(s.ch[k], s.x, s.y - k * SIZE);
      }
      if (s.y - s.n * SIZE > H) streams.splice(i, 1);
    }
  }
  function start() { if (on && !raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'rain-btn';
  var wrap = document.querySelector('.top .wrap');
  if (wrap) wrap.insertBefore(btn, wrap.firstChild); else document.body.insertBefore(btn, document.body.firstChild);

  function label() {
    var t = lang === 'en' ? 'Rain' : 'Дъжд';
    btn.textContent = t + ' ' + (on ? '●' : '○');
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', lang === 'en' ? (on ? 'Turn the falling digits off' : 'Turn the falling digits on') : (on ? 'Спри падащите цифри' : 'Пусни падащите цифри'));
  }
  function set(v, remember) {
    on = v; cv.style.display = on ? '' : 'none';
    if (on) { fit(); if (!streams.length) seed(); start(); } else { stop(); ctx.clearRect(0, 0, W, H); }
    if (remember) save(on ? 'on' : 'off');
    label();
  }
  btn.addEventListener('click', function () { set(!on, true); });
  window.addEventListener('resize', function () { if (on) fit(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  window.SSCRain = { setLang: function (l) { lang = l === 'en' ? 'en' : 'bg'; label(); } };

  var s0 = saved();
  if (window.SSCApp && SSCApp.getLang) lang = SSCApp.getLang();
  set(s0 ? s0 === 'on' : !mq.matches, false);
})();
