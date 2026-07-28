/* ==========================================================================
   valuation.js — the Amazon Gordon Growth widget only. Independently
   deletable: remove this <script> tag and the .js-only widget markup and
   nothing else on the page breaks (the badge above it is plain, JS-free
   prose and stays).

   NOTE ON THE BASE CASE: single-stage Gordon Growth,
     P0 = FCF0 * (1 + g) / (r - g)
   with FCF0 = 5.897, g = 9.84%, r = 12.00% computes — at full floating-point
   precision, no intermediate rounding — to $299.87 (299.87337...), which is
   +25.0% vs. the $239.89 prior price (25.0045%, rounds to 25.0%). That is
   the value pre-rendered in the HTML and reproduced here; the two must never
   drift apart.
   ========================================================================== */
(function () {
  'use strict';
  try {
    var root = document.getElementById('valuation');
    if (!root) return;

    var FCF0 = 5.897;          // USD/share, illustrative normalized FCF
    var PRIOR_PRICE = 239.89;  // reference price used in the original coursework
    var BASE_G = 9.84;         // her stated implied growth rate, %
    var BASE_R = 12.00;        // illustrative cost of equity, %
    var SPREAD_MIN = 0.25;     // pp — below this the model is treated as undefined
    var PRICE_CEILING = 100000; // sane ceiling; never print a nine-figure number

    var gInput = document.getElementById('v-g');
    var rInput = document.getElementById('v-r');
    var gOut = document.getElementById('v-g-out');
    var rOut = document.getElementById('v-r-out');
    var priceOut = document.getElementById('v-price');
    var upsideOut = document.getElementById('v-upside');
    var statusEl = document.getElementById('v-status');
    var resetBtn = document.getElementById('v-reset');

    if (!gInput || !rInput || !gOut || !rOut || !priceOut || !upsideOut) return;

    var priceFmt = new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
    var pctFmt = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1, maximumFractionDigits: 1
    });

    var RM = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : { matches: false, addEventListener: function () {} };

    var statusTimer = null;
    var pulseTimer = null;

    function compute(gPct, rPct) {
      var spread = rPct - gPct; // percentage points
      if (!Number.isFinite(gPct) || !Number.isFinite(rPct) || spread <= SPREAD_MIN) {
        return null;
      }
      var price = FCF0 * (1 + gPct / 100) / (spread / 100);
      if (!Number.isFinite(price) || price < 0 || price > PRICE_CEILING) return null;
      var upside = (price - PRIOR_PRICE) / PRIOR_PRICE * 100;
      if (!Number.isFinite(upside)) return null;
      return { price: price, upside: upside };
    }

    function scheduleStatus(text) {
      if (statusTimer) clearTimeout(statusTimer);
      statusTimer = setTimeout(function () {
        statusEl.textContent = text;
      }, 400);
    }

    function pulse() {
      if (RM.matches) return;
      root.classList.add('is-pulse');
      if (pulseTimer) clearTimeout(pulseTimer);
      pulseTimer = setTimeout(function () { root.classList.remove('is-pulse'); }, 260);
    }

    function render(gPct, rPct, announce) {
      gOut.textContent = gPct.toFixed(2) + '%';
      rOut.textContent = rPct.toFixed(2) + '%';

      var result = compute(gPct, rPct);

      if (!result) {
        priceOut.textContent = '—';
        upsideOut.textContent = '—';
        upsideOut.classList.remove('is-pos', 'is-neg');
        upsideOut.classList.add('is-undefined');
        if (announce) {
          scheduleStatus('Model undefined when the discount rate does not exceed the growth rate.');
        }
        return;
      }

      var isPos = result.upside >= 0;
      var glyph = isPos ? '+' : '−';
      var word = isPos ? 'upside' : 'downside';

      priceOut.textContent = priceFmt.format(result.price);
      upsideOut.textContent = glyph + pctFmt.format(Math.abs(result.upside)) + '% ' + word;
      upsideOut.classList.remove('is-undefined');
      upsideOut.classList.toggle('is-pos', isPos);
      upsideOut.classList.toggle('is-neg', !isPos);

      if (announce) {
        scheduleStatus(
          'Implied value ' + priceFmt.format(result.price) +
          ', ' + word + ' ' + pctFmt.format(Math.abs(result.upside)) + ' percent.'
        );
      }
    }

    function onInput() {
      var g = parseFloat(gInput.value);
      var r = parseFloat(rInput.value);
      render(g, r, true);
      pulse();
    }

    gInput.addEventListener('input', onInput);
    rInput.addEventListener('input', onInput);

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        gInput.value = BASE_G;
        rInput.value = BASE_R;
        render(BASE_G, BASE_R, true);
        pulse();
      });
    }

    // Initial paint — must reproduce the pre-rendered HTML exactly (no drift).
    render(parseFloat(gInput.value), parseFloat(rInput.value), false);

  } catch (err) {
    // Fail closed on this widget only: leave the static, JS-free badge prose
    // and the pre-rendered base-case output text exactly as shipped in HTML.
  }
})();
