/* ==========================================================================
   app.js — reveal-on-scroll, KPI counters, filter status/counts/clear,
   masthead sentinel, theme toggle.

   The entire body runs inside one try/catch. If anything throws, the catch
   strips `.js` from <html>, which turns off every `.reveal`/`.js-only`
   CSS rule at once and restores the full no-JS presentation. A thrown
   error here can never blank the page.
   ========================================================================== */
(function () {
  'use strict';
  try {
    var html = document.documentElement;

    var RM = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : { matches: false, addEventListener: function () {} };

    /* ---------------------------------------------------------- reveal IO */
    function createObserver(threshold, rootMargin, onEnter) {
      return new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            onEnter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: threshold, rootMargin: rootMargin || '0px' });
    }

    var sectionEls = document.querySelectorAll('section.reveal');
    var kpiEls = document.querySelectorAll('.kpi-tile.reveal');

    if ('IntersectionObserver' in window) {
      var sectionObserver = createObserver(0.15, '0px 0px -10% 0px', function (el) {
        el.classList.add('is-in');
      });
      sectionEls.forEach(function (el) { sectionObserver.observe(el); });

      var kpiObserver = createObserver(0.4, '0px', function (el) {
        el.classList.add('is-in');
        startCounter(el.querySelector('[data-count]'));
      });
      kpiEls.forEach(function (el) { kpiObserver.observe(el); });
    } else {
      // No IO support: reveal everything immediately, no animation, no
      // counter — the static numbers already in the HTML are correct.
      sectionEls.forEach(function (el) { el.classList.add('is-in'); });
      kpiEls.forEach(function (el) { el.classList.add('is-in'); });
    }

    /* ------------------------------------------------------- KPI counters
       Final value ships as static text; we read it, mirror it for AT, hide
       the animating span from AT, then count up to the exact same text. */
    function startCounter(span) {
      if (!span || span.dataset.counted) return;
      span.dataset.counted = '1';

      var raw = span.textContent.trim();

      // Duplicate the true, final value for screen readers before animating.
      var mirror = document.createElement('span');
      mirror.className = 'sr-only';
      mirror.textContent = raw;
      span.insertAdjacentElement('afterend', mirror);
      span.setAttribute('aria-hidden', 'true');

      if (RM.matches) return; // leave final text in place, animate nothing

      var match = raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
      if (!match) return;
      var prefix = match[1] || '';
      var numStr = match[2].replace(/,/g, '');
      var suffix = match[3] || '';
      var target = parseFloat(numStr);
      if (!Number.isFinite(target)) return;
      var decimals = (numStr.split('.')[1] || '').length;

      var duration = 1100;
      var start = null;

      function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

      function frame(ts) {
        if (start === null) start = ts;
        var elapsed = ts - start;
        var progress = Math.min(elapsed / duration, 1);
        var value = target * easeOutCubic(progress);
        span.textContent = prefix + value.toFixed(decimals) + suffix;
        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          span.textContent = raw; // land exactly on the shipped static text
        }
      }
      requestAnimationFrame(frame);
    }

    /* -------------------------------------------------------------- filter */
    var TOOL_NAMES = { powerbi: 'Power BI', sql: 'SQL', r: 'R', excel: 'Excel' };
    var toolRadios = document.querySelectorAll('input[name="tool"]');
    var filterStatus = document.getElementById('filter-status');
    var filterClear = document.getElementById('filter-clear');
    var coverageCards = document.querySelectorAll('#coverage .ev-card');

    function currentToolKey() {
      var checked = document.querySelector('input[name="tool"]:checked');
      if (!checked) return 'all';
      return checked.id.replace('tool-', '');
    }

    function updateFilterStatus() {
      if (!filterStatus) return;
      var key = currentToolKey();
      if (key === 'all') {
        filterStatus.textContent = 'Showing all coverage items.';
        if (filterClear) filterClear.hidden = true;
        return;
      }
      var total = coverageCards.length;
      var visible = 0;
      coverageCards.forEach(function (card) {
        if (getComputedStyle(card).display !== 'none') visible++;
      });
      filterStatus.textContent =
        'Showing ' + visible + ' of ' + total + ' coverage items tagged ' +
        (TOOL_NAMES[key] || key) + '.';
      if (filterClear) filterClear.hidden = false;
    }

    toolRadios.forEach(function (radio) {
      radio.addEventListener('change', updateFilterStatus);
    });

    if (filterClear) {
      filterClear.addEventListener('click', function () {
        var allRadio = document.getElementById('tool-all');
        if (allRadio) {
          allRadio.checked = true;
          updateFilterStatus();
          allRadio.focus();
        }
      });
    }

    // Chip counts — computed from the DOM, never hard-coded.
    Object.keys(TOOL_NAMES).forEach(function (tool) {
      var count = 0;
      coverageCards.forEach(function (card) {
        var list = (card.getAttribute('data-tools') || '').split(/\s+/).filter(Boolean);
        if (list.indexOf(tool) !== -1) count++;
      });
      var el = document.querySelector('.chip__n[data-count-for="' + tool + '"]');
      if (el) el.textContent = ' (' + count + ')';
    });

    updateFilterStatus(); // every page load starts at "All" — never persisted

    /* ------------------------------------------------------- masthead sentinel */
    var sentinel = document.querySelector('[data-masthead-sentinel]');
    var masthead = document.querySelector('[data-masthead]');
    if (sentinel && masthead && 'IntersectionObserver' in window) {
      var mastheadObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          masthead.classList.toggle('is-condensed', !entry.isIntersecting);
        });
      }, { threshold: 0 });
      mastheadObserver.observe(sentinel);
    }

    /* ------------------------------------------------------------ theme toggle */
    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      var prefersDark = window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : { matches: false };

      function effectiveTheme() {
        return html.dataset.theme || (prefersDark.matches ? 'dark' : 'light');
      }
      function syncPressed() {
        themeToggle.setAttribute('aria-pressed', effectiveTheme() === 'dark' ? 'true' : 'false');
      }
      syncPressed();
      themeToggle.addEventListener('click', function () {
        var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
        html.dataset.theme = next;
        try { localStorage.setItem('pkha-theme', next); } catch (e) {}
        syncPressed();
      });
    }

    /* --------------------------------------------- re-evaluate reduced motion
       If the OS setting changes live (no reload), stop pretending — future
       counters just skip animating too (past ones have already landed on
       their static text, which is harmless either way). */
    RM.addEventListener && RM.addEventListener('change', function () { /* no-op: read live via RM.matches above */ });

  } catch (err) {
    document.documentElement.classList.remove('js');
  }
})();
