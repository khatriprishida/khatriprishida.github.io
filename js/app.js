/* ==========================================================================
   app.js — enhancement only. Nothing here creates content.

   Everything the page says is already in index.html. This file adds four
   things and nothing else:

     1. reveal-on-scroll for sections and cards
     2. draw-on-scroll for the SVG charts
     3. counting animation on the six headline numbers
     4. sticky-masthead shadow + "you are here" marking in the nav

   The whole body runs inside one try/catch. If anything throws, the catch
   removes `.js` from <html>, which switches off every reveal rule in
   css/motion.css at once and leaves the page in its plain, fully visible
   state. There is no failure mode where content stays hidden.
   ========================================================================== */
(function () {
  'use strict';

  try {
    var html = document.documentElement;

    /* Tell the guard timer in <head> that this file parsed and ran. */
    html.setAttribute('data-app-ready', '');

    var reduced = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : { matches: false };

    var canObserve = 'IntersectionObserver' in window;

    /* ------------------------------------------------------------ helper */
    function observe(nodes, options, onEnter) {
      if (!nodes.length) return;
      if (!canObserve) {
        // No IntersectionObserver: show everything at once, animate nothing.
        Array.prototype.forEach.call(nodes, onEnter);
        return;
      }
      var io = new IntersectionObserver(function (entries, self) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          self.unobserve(entry.target);
          onEnter(entry.target);
        });
      }, options);
      Array.prototype.forEach.call(nodes, function (n) { io.observe(n); });
    }

    /* --------------------------------------------------- 1. section reveal */
    observe(
      document.querySelectorAll('.reveal'),
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
      function (el) { el.classList.add('is-in'); }
    );

    /* ------------------------------------------------------ 2. chart draw */
    observe(
      document.querySelectorAll('[data-draw]'),
      { threshold: 0.25, rootMargin: '0px 0px -5% 0px' },
      function (el) { el.classList.add('is-drawn'); }
    );

    /* --------------------------------------------------- 3. number counters
       The finished value is the static text already in the HTML. We copy it
       into a screen-reader-only twin first, hide the animating span from
       assistive technology, then count up and land back on the exact same
       string. Nothing can end up showing a wrong number. */
    function count(span) {
      if (!span || span.hasAttribute('data-counted')) return;
      span.setAttribute('data-counted', '');

      var final = span.textContent;
      var host = span.closest('.figure-tile__value') || span;

      var twin = document.createElement('span');
      twin.className = 'sr-only';
      twin.textContent = host.textContent;
      host.insertAdjacentElement('afterend', twin);
      host.setAttribute('aria-hidden', 'true');

      if (reduced.matches) return;

      var target = parseFloat(final.replace(/,/g, ''));
      if (!isFinite(target)) return;
      var decimals = (final.split('.')[1] || '').length;

      var duration = 900;
      var t0 = null;

      function ease(t) { return 1 - Math.pow(1 - t, 3); }

      function frame(now) {
        if (t0 === null) t0 = now;
        var p = Math.min((now - t0) / duration, 1);
        span.textContent = (target * ease(p)).toFixed(decimals);
        if (p < 1) {
          requestAnimationFrame(frame);
        } else {
          span.textContent = final;   // land exactly on the shipped text
        }
      }
      requestAnimationFrame(frame);
    }

    observe(
      document.querySelectorAll('.figure-tile'),
      { threshold: 0.5 },
      function (el) {
        el.classList.add('is-in');
        count(el.querySelector('[data-count]'));
      }
    );

    /* --------------------------------------------------- 4a. sticky masthead */
    var masthead = document.querySelector('[data-masthead]');
    var sentinel = document.querySelector('[data-sentinel]');
    if (masthead && sentinel && canObserve) {
      new IntersectionObserver(function (entries) {
        masthead.classList.toggle('is-stuck', !entries[0].isIntersecting);
      }, { threshold: 0 }).observe(sentinel);
    }

    /* --------------------------------------------------- 4b. you-are-here nav */
    var links = document.querySelectorAll('.masthead__nav a[href^="#"]');
    if (links.length && canObserve) {
      var byId = {};
      var sections = [];
      Array.prototype.forEach.call(links, function (link) {
        var id = link.getAttribute('href').slice(1);
        var section = document.getElementById(id);
        if (!section) return;
        byId[id] = link;
        sections.push(section);
      });

      var visible = {};
      var navIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible[entry.target.id] = entry.isIntersecting;
        });
        var current = null;
        for (var i = 0; i < sections.length; i++) {
          if (visible[sections[i].id]) { current = sections[i].id; break; }
        }
        Array.prototype.forEach.call(links, function (link) {
          link.removeAttribute('aria-current');
        });
        if (current && byId[current]) byId[current].setAttribute('aria-current', 'true');
      }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

      sections.forEach(function (s) { navIO.observe(s); });
    }

  } catch (err) {
    document.documentElement.classList.remove('js');
  }
})();
