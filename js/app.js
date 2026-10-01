/* ==========================================================================
   app.js — enhancement only. Nothing here creates content.

   Everything the page says is already in index.html. This file adds:

     1. reveal-on-scroll for sections and cards
     2. draw-on-scroll for the SVG charts
     3. the masthead hairline once the page has scrolled
     4. "you are here" marking in the nav
     5. the narrow-screen menu: close on link choice, Escape, or outside tap

   The whole body runs inside one try/catch. If anything throws, the catch
   removes `js` from <html>, which switches off every reveal rule in
   css/motion.css at once and leaves the page fully visible.
   ========================================================================== */
(function () {
  'use strict';

  try {
    var html = document.documentElement;

    /* Tell the guard timer in <head> that this file parsed and ran. */
    html.setAttribute('data-app-ready', '');

    var canObserve = 'IntersectionObserver' in window;
    var each = function (list, fn) { Array.prototype.forEach.call(list, fn); };

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

    /* ------------------------------------------------------ 2. chart draw */
    observe(
      document.querySelectorAll('[data-draw]'),
      { threshold: 0.3 },
      function (el) { el.classList.add('is-drawn'); }
    );

    /* -------------------------------------------------- 3. masthead line */
    var masthead = document.querySelector('[data-masthead]');
    var sentinel = document.querySelector('[data-sentinel]');
    if (masthead && sentinel && canObserve) {
      new IntersectionObserver(function (entries) {
        masthead.classList.toggle('is-stuck', !entries[0].isIntersecting);
      }).observe(sentinel);
    }

    /* ---------------------------------------------- 4. you-are-here nav */
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
          if (current && link.getAttribute('href') === '#' + current) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
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
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close(true);
      });
      document.addEventListener('click', function (e) {
        if (menu.open && !menu.contains(e.target)) close(false);
      });
      /* If the window widens past the breakpoint, don't leave it open. */
      if (window.matchMedia) {
        var wide = window.matchMedia('(min-width: 52rem)');
        var onWide = function () { if (wide.matches) close(false); };
        if (wide.addEventListener) wide.addEventListener('change', onWide);
      }
    }

  } catch (err) {
    document.documentElement.classList.remove('js');
  }
})();
