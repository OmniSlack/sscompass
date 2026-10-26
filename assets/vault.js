/* SSC Compass — vault: личните данни, запечатани в браузъра.
   Парола → PBKDF2 (SHA-256) → AES-GCM. Паролата и ключът никога не се пазят на диск и не се пращат никъде.
   Какво се пази: платформи, новини, бележки, недовършени проекти.
   Къде: криптиран в localStorage на това устройство. Може да се изтегли като запечатан файл (vault.enc.json),
   за да се качи в assets/ и да се отключва на друго устройство със същата парола. */
(function () {
  'use strict';
  var LS = 'ssc-vault', ITER = 250000, REMOTE = 'assets/vault.enc.json', MAPS_URL = 'assets/maps.enc.json';
  var cr = window.crypto && window.crypto.subtle ? window.crypto : null;
  var enc = new TextEncoder(), dec = new TextDecoder();
  var key = null, salt = null, state = null;

  function b64(buf) { var b = new Uint8Array(buf), s = '', i; for (i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s); }
  function unb64(str) { var s = atob(str), b = new Uint8Array(s.length), i; for (i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }

  function blank() { return { v: 1, platforms: [], news: [], notes: [], projects: [], openItems: [] }; }
  function normalise(o) {
    var s = blank(); o = o && typeof o === 'object' ? o : {};
    ['platforms', 'news', 'notes', 'projects', 'openItems'].forEach(function (k) { if (Array.isArray(o[k])) s[k] = o[k]; });
    return s;
  }

  function derive(pass, saltBytes, iter) {
    return cr.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveKey']).then(function (km) {
      return cr.subtle.deriveKey({ name: 'PBKDF2', salt: saltBytes, iterations: iter, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    });
  }
  function seal() {
    var iv = cr.getRandomValues(new Uint8Array(12));
    return cr.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(JSON.stringify(state))).then(function (ct) {
      return { v: 1, kdf: 'PBKDF2-SHA256', iter: ITER, salt: b64(salt), iv: b64(iv), data: b64(ct) };
    });
  }
  function open(blob, pass) {
    if (!blob || !blob.salt || !blob.iv || !blob.data) return Promise.reject(new Error('bad-file'));
    var s = unb64(blob.salt);
    return derive(pass, s, blob.iter || ITER).then(function (k) {
      return cr.subtle.decrypt({ name: 'AES-GCM', iv: unb64(blob.iv) }, k, unb64(blob.data)).then(function (pt) {
        key = k; salt = s; state = normalise(JSON.parse(dec.decode(pt))); return state;
      }, function () { throw new Error('bad-passphrase'); });
    });
  }

  function readLocal() { try { var t = localStorage.getItem(LS); return t ? JSON.parse(t) : null; } catch (e) { return null; } }
  function loadRemote() {
    if (typeof fetch !== 'function') return Promise.resolve(null);
    return fetch(REMOTE, { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }

  var V = {
    supported: function () { return !!cr; },
    hasLocal: function () { return !!readLocal(); },
    remote: loadRemote,
    isOpen: function () { return !!state; },
    get: function () { return state; },
    /* отключване: първо локалния, после качения файл */
    unlock: function (pass) {
      if (!cr) return Promise.reject(new Error('unsupported'));
      if (!pass) return Promise.reject(new Error('bad-passphrase'));
      var local = readLocal();
      var tryLocal = local ? open(local, pass).then(function () { return 'local'; }, function (e) { if (e.message !== 'bad-passphrase') throw e; return null; }) : Promise.resolve(null);
      return tryLocal.then(function (src) {
        if (src) return state;
        return loadRemote().then(function (blob) {
          if (!blob) throw new Error(local ? 'bad-passphrase' : 'no-vault');
          return open(blob, pass).then(function () { return V.save().then(function () { return state; }); });
        });
      });
    },
    /* нов vault с парола и по желание начални данни */
    create: function (pass, seed) {
      if (!cr) return Promise.reject(new Error('unsupported'));
      if (!pass || pass.length < 8) return Promise.reject(new Error('weak-passphrase'));
      salt = cr.getRandomValues(new Uint8Array(16));
      return derive(pass, salt, ITER).then(function (k) { key = k; state = normalise(seed); return V.save().then(function () { return state; }); });
    },
    save: function () {
      if (!key || !state) return Promise.reject(new Error('locked'));
      return seal().then(function (blob) { try { localStorage.setItem(LS, JSON.stringify(blob)); } catch (e) { throw new Error('storage'); } return true; });
    },
    exportSealed: function () { return seal().then(function (b) { return JSON.stringify(b, null, 2); }); },
    lock: function () { key = null; salt = null; state = null; },
    forget: function () { V.lock(); try { localStorage.removeItem(LS); } catch (e) {} },
    /* Карти (само за четене): отделен запечатан файл със същата парола. Ако го няма, просто няма карти. */
    loadMaps: function (pass) {
      if (!cr || typeof fetch !== 'function') return Promise.resolve(null);
      return fetch(MAPS_URL, { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (blob) {
        if (!blob || !blob.salt || !blob.iv || !blob.data) return null;
        return derive(pass, unb64(blob.salt), blob.iter || ITER).then(function (k) {
          return cr.subtle.decrypt({ name: 'AES-GCM', iv: unb64(blob.iv) }, k, unb64(blob.data));
        }).then(function (pt) { var o = JSON.parse(dec.decode(pt)); return Array.isArray(o.maps) ? o.maps : null; });
      }).catch(function () { return null; });
    },
    normalise: normalise
  };
  window.SSCVault = V;
})();
