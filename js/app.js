/* ==========================================================================
   app.js — enhancement only. Nothing here creates content.

   Everything the page says is already in index.html. This file adds:

     1. reveal-on-scroll (sections tip up in perspective)
     2. the 3D column charts: grow on arrival, turn with scroll and pointer
     3. counting key figures (landing exactly on the shipped text)
     4. masthead hairline and "you are here" in the nav
     5. the narrow-screen menu: close on choice, Escape, or outside tap
     6. desktop-only pointer effects: card tilt + glare, magnetic buttons,
        the hero's cursor-follow light
     7. the WebGL hero: js/hero3d.js, loaded lazily, only if WebGL works

   The whole body runs inside one try/catch. If anything throws, the catch
   removes `js` from <html>, which switches off every reveal rule in
   css/motion.css and leaves the page fully visible.
   ========================================================================== */
(function () {
  'use strict';

  try {
    var html = document.documentElement;
    html.setAttribute('data-app-ready', '');

    /* Resolve js/hero3d.js relative to this file, wherever the site lives. */
    var appSrc = (document.currentScript && document.currentScript.src) ||
                 new URL('js/app.js', document.baseURI).href;

    var mq = function (q) { return window.matchMedia ? window.matchMedia(q) : { matches: false }; };
    var reduced = mq('(prefers-reduced-motion: reduce)').matches;
    var finePointer = mq('(hover: hover) and (pointer: fine)').matches;
    var canObserve = 'IntersectionObserver' in window;
    var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };
    var clamp = function (x, a, b) { return Math.min(b, Math.max(a, x)); };

    function observe(nodes, options, onEnter) {
      if (!nodes.length) return;
      if (!canObserve) { each(nodes, onEnter); return; }
      var io = new IntersectionObserver(function (entries, self) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          self.unobserve(entry.target);
          onEnter(entry.target);
        });
      }, options);
      each(nodes, function (n) { io.observe(n); });
    }

    /* ------------------------------------------------------- 1. reveal */
    observe(
      document.querySelectorAll('.reveal'),
      { threshold: 0.06, rootMargin: '0px 0px -6% 0px' },
      function (el) { el.classList.add('is-in'); }
    );

    /* ---------------------------------------------------- 2. 3D charts */
    var charts = document.querySelectorAll('[data-chart3d]');
    observe(charts, { threshold: 0.35 }, function (el) { el.classList.add('is-drawn'); });

    var frameQueued = false;
    function turnCharts() {
      frameQueued = false;
      var vh = window.innerHeight || 1;
      each(charts, function (c) {
        var r = c.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        // 0 as the chart enters at the bottom, 1 as it leaves at the top.
        var p = clamp((vh - r.top) / (vh + r.height), 0, 1);
        var px = parseFloat(c.getAttribute('data-px') || '0');
        var py = parseFloat(c.getAttribute('data-py') || '0');
        c.style.setProperty('--ry', (-34 + p * 26 + px * 10).toFixed(2) + 'deg');
        c.style.setProperty('--rx', (-16 + p * 8 + py * 6).toFixed(2) + 'deg');
      });
    }
    function queueTurn() {
      if (frameQueued) return;
      frameQueued = true;
      requestAnimationFrame(turnCharts);
    }
    if (!reduced && charts.length) {
      window.addEventListener('scroll', queueTurn, { passive: true });
      window.addEventListener('resize', queueTurn, { passive: true });
      if (finePointer) {
        each(charts, function (c) {
          c.addEventListener('pointermove', function (e) {
            var r = c.getBoundingClientRect();
            c.setAttribute('data-px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
            c.setAttribute('data-py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
            queueTurn();
          });
          c.addEventListener('pointerleave', function () {
            c.setAttribute('data-px', '0');
            c.setAttribute('data-py', '0');
            queueTurn();
          });
        });
      }
      turnCharts();
    }

    /* --------------------------------------------------- 3. count-ups
       The finished value is the static text already in the HTML. A
       screen-reader twin keeps the real value; the animating copy is hidden
       from assistive technology and always lands on the exact same string. */
    function count(span) {
      if (span.hasAttribute('data-counted')) return;
      span.setAttribute('data-counted', '');
      var finalText = span.textContent;
      var host = span.closest('.figure__value') || span;
      if (!host.hasAttribute('aria-hidden')) {
        var twin = document.createElement('span');
        twin.className = 'sr-only';
        twin.textContent = host.textContent;
        host.insertAdjacentElement('afterend', twin);
        host.setAttribute('aria-hidden', 'true');
      }
      if (reduced) return;
      var target = parseFloat(finalText);
      if (!isFinite(target)) return;
      var decimals = (finalText.split('.')[1] || '').length;
      var t0 = null, dur = 1400;
      function frame(now) {
        if (t0 === null) t0 = now;
        var k = Math.min((now - t0) / dur, 1);
        var e = 1 - Math.pow(1 - k, 4);
        span.textContent = (target * e).toFixed(decimals);
        if (k < 1) requestAnimationFrame(frame);
        else span.textContent = finalText;
      }
      span.textContent = (0).toFixed(decimals);
      requestAnimationFrame(frame);
    }
    observe(document.querySelectorAll('.figure'), { threshold: 0.5 }, function (el) {
      each(el.querySelectorAll('[data-count]'), count);
    });

    /* ------------------------------------------ 4. masthead + nav state */
    var masthead = document.querySelector('[data-masthead]');
    var sentinel = document.querySelector('[data-sentinel]');
    if (masthead && sentinel && canObserve) {
      new IntersectionObserver(function (entries) {
        masthead.classList.toggle('is-stuck', !entries[0].isIntersecting);
      }).observe(sentinel);
    }

    var links = document.querySelectorAll('.nav--bar a[href^="#"]');
    if (links.length && canObserve) {
      var sections = [];
      each(links, function (link) {
        var s = document.getElementById(link.getAttribute('href').slice(1));
        if (s) sections.push(s);
      });
      var visible = {};
      var navIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
        var current = null;
        for (var i = 0; i < sections.length; i++) {
          if (visible[sections[i].id]) { current = sections[i].id; break; }
        }
        each(links, function (link) {
          if (current && link.getAttribute('href') === '#' + current) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      }, { rootMargin: '-30% 0px -60% 0px' });
      sections.forEach(function (s) { navIO.observe(s); });
    }

    /* ------------------------------------------------------- 5. the menu */
    var menu = document.querySelector('[data-menu]');
    if (menu) {
      var toggle = menu.querySelector('summary');
      var close = function (refocus) {
        if (!menu.open) return;
        menu.open = false;
        if (refocus && toggle) toggle.focus();
      };
      each(menu.querySelectorAll('a'), function (a) {
        a.addEventListener('click', function () { close(false); });
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(true); });
      document.addEventListener('click', function (e) {
        if (menu.open && !menu.contains(e.target)) close(false);
      });
      var wide = mq('(min-width: 52rem)');
      if (wide.addEventListener) wide.addEventListener('change', function () { if (wide.matches) close(false); });
    }

    /* ---------------------------------------- 6. desktop pointer effects */
    if (finePointer && !reduced) {
      // Card tilt + glare. Small angles: these are big cards.
      each(document.querySelectorAll('[data-tilt]'), function (card) {
        var raf = 0, mx = 0, my = 0;
        function apply() {
          raf = 0;
          var r = card.getBoundingClientRect();
          var x = (mx - r.left) / r.width, y = (my - r.top) / r.height;
          card.style.setProperty('--ty', ((x - 0.5) * 3.2).toFixed(2) + 'deg');
          card.style.setProperty('--tx', ((0.5 - y) * 2.4).toFixed(2) + 'deg');
          card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        }
        card.addEventListener('pointerenter', function () { card.classList.add('is-tilting'); });
        card.addEventListener('pointermove', function (e) {
          mx = e.clientX; my = e.clientY;
          if (!raf) raf = requestAnimationFrame(apply);
        });
        card.addEventListener('pointerleave', function () {
          card.classList.remove('is-tilting');
          card.style.setProperty('--tx', '0deg');
          card.style.setProperty('--ty', '0deg');
        });
      });

      // Magnetic buttons: drift a few pixels toward the pointer.
      each(document.querySelectorAll('[data-magnetic]'), function (btn) {
        btn.addEventListener('pointermove', function (e) {
          var r = btn.getBoundingClientRect();
          var dx = e.clientX - (r.left + r.width / 2);
          var dy = e.clientY - (r.top + r.height / 2);
          btn.style.transform = 'translate(' + (dx * 0.18).toFixed(1) + 'px,' + (dy * 0.28).toFixed(1) + 'px)';
        });
        btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
      });

      // Hero light that follows the cursor.
      var hero = document.querySelector('.hero');
      var glow = document.querySelector('[data-glow]');
      if (hero && glow) {
        var gq = 0, gx = 0, gy = 0;
        hero.addEventListener('pointermove', function (e) {
          var r = hero.getBoundingClientRect();
          gx = e.clientX - r.left; gy = e.clientY - r.top;
          if (!gq) gq = requestAnimationFrame(function () {
            gq = 0;
            glow.style.setProperty('--gx', gx + 'px');
            glow.style.setProperty('--gy', gy + 'px');
          });
          hero.classList.add('is-glowing');
        });
        hero.addEventListener('pointerleave', function () { hero.classList.remove('is-glowing'); });
      }
    }

    /* ------------------------------------------------ 7. the WebGL hero
       Loaded after the page has painted, only where WebGL works. If any
       part fails, the still render stays and nothing else is affected. */
    var stage = document.querySelector('[data-hero-stage]');
    function webglOK() {
      try {
        var c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext &&
          (c.getContext('webgl2') || c.getContext('webgl')));
      } catch (e) { return false; }
    }
    function boot3d() {
      if (!stage || !webglOK()) return;
      import(new URL('hero3d.js', appSrc).href).then(function (mod) {
        var small = mq('(max-width: 63.99rem)').matches;
        window.__hero3d = mod.mount(stage, { reduced: reduced, small: small });
      }).catch(function () { /* keep the still render */ });
    }
    if (document.readyState === 'complete') setTimeout(boot3d, 0);
    else window.addEventListener('load', function () { setTimeout(boot3d, 0); });

  } catch (err) {
    document.documentElement.classList.remove('js');
  }
})();
