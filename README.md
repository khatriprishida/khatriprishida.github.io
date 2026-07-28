# khatriprishida.github.io

Portfolio site for Prishida Khatri, built as an equity-research-report
metaphor: **PKHA** — ticker, rating, coverage. Plain HTML/CSS/JS, no build
step, no framework, no npm, no CDN, no external network requests.

## Run it locally

There is nothing to install and nothing to build.

```
python3 -m http.server
```

then open `http://localhost:8000/`. Any static file server works equally
well (`npx serve`, VS Code Live Server, etc.) — this is plain static HTML.

## File map

| Path | Responsibility |
|---|---|
| `index.html` | All content, single page |
| `404.html` | Minimal "not under coverage" page |
| `css/tokens.css` | Design tokens (`:root` custom properties), color modes, reset. Loaded first. |
| `css/base.css` | Element defaults, typography, layout primitives (`.wrap`, `.prose`, `.grid-auto`), `.sr-only`, skip link, focus ring, `@media print` |
| `css/components.css` | Masthead, cover, rating `<dl>`, byline plate, KPI tiles, chips + the 8 `:has()` filter rules, `.ev-card`, valuation widget, footer |
| `css/motion.css` | All `@keyframes`, `.reveal`/`.is-in` states, the filter's appear transition, and the **one** `prefers-reduced-motion` block. Loaded last. |
| `js/app.js` | `defer`. Reveal `IntersectionObserver`s, KPI counters + sr-only mirrors, filter status/counts/clear button, masthead-condense sentinel, theme toggle. Whole body wrapped in `try/catch`. |
| `js/valuation.js` | `defer`. The Amazon Gordon Growth widget only — independently deletable (see below). |
| `assets/favicon.svg` | Inline "PK" monogram with `prefers-color-scheme` built into the SVG |
| `assets/og-image.png` | 1200×630 social preview image |
| `assets/apple-touch-icon.png` | 180×180, opaque (no alpha channel) |
| `robots.txt`, `sitemap.xml` | Standard crawler files |
| `CONTENT-GUIDE.md` | Prishida's plain-English editing manual |

## Deliberate architecture decisions

### Everything must work with JavaScript disabled

The single most load-bearing rule in the codebase, in `css/motion.css`:

```css
html.js .reveal { opacity:0; transform:translateY(16px); }
html.js .reveal.is-in { opacity:1; transform:none; }
```

`.js` is added to `<html>` by a 6-line inline script in `<head>`. If JS is
disabled, that class is never added, so `.reveal` is never hidden — there is
no code path where content goes invisible because an `IntersectionObserver`
didn't fire. The same pairing (`.js-only { display:none } / html.js .js-only
{ display:block }`) hides genuinely JS-dependent UI (the valuation widget,
the theme toggle, chip counts) without ever hiding static content.

Belt-and-braces: all of `js/app.js` runs inside one `try/catch`. On any
thrown error, the catch removes `.js` from `<html>`, which turns off every
`.reveal`/`.js-only` rule at once and restores the full no-JS presentation.

### The filter is CSS-only

The "Filter by tool" control in the Coverage section uses radio inputs and
eight `:has()` selectors in `css/components.css` — no JS is required for it
to function. `js/app.js` only *enhances* it: a live status line ("Showing 3
of 10…"), chip counts, and a "Clear filter" button. Delete `js/app.js`
entirely and the filter still works.

```css
html:has(#tool-powerbi:checked) .ev-card:not([data-tools~="powerbi"]) { display:none; }
html:has(#tool-powerbi:checked) .ev-group:not(:has(.ev-card[data-tools~="powerbi"])) { display:none; }
```

`#tool-all` has no rule at all — the default state, the no-`:has()`-support
fallback, and the JS-disabled fallback are all identical: everything
visible. That's why the filter can't fail closed.

**To add a new filterable tool** (a 5th chip beyond Power BI/SQL/R/Excel):
1. Add a new radio + `<label class="chip">` in the `<fieldset class="filter">` in `index.html`.
2. Tag the relevant `<article class="ev-card" data-tools="...">` cards with the new keyword.
3. Add the matching pair of `:has()` rules in `css/components.css`.
4. Add the tool to the `TOOL_NAMES` map at the top of the filter section in `js/app.js` (for the status line and chip counts).

### The valuation widget is independently deletable

`js/valuation.js` only touches elements inside `#valuation`. To remove the
widget entirely: delete the `<div class="valuation js-only" id="valuation">`
block from `index.html` and drop the `<script src="js/valuation.js">` tag.
Nothing else on the page references it. The plain-prose "Illustrative
model" badge above the widget is static HTML and is unaffected either way.

**A note on the math.** Single-stage Gordon Growth,
`P0 = FCF0 × (1 + g) ÷ (r − g)`, with `FCF0 = 5.897`, `g = 9.84%`,
`r = 12.00%`. At full floating-point precision (no intermediate rounding)
this computes to **$299.87** (299.87337…), which is **+25.0%** vs. the
$239.89 prior price (25.0045%, rounds to 25.0%). The build spec this site
was implemented from states the answer as $299.88; that appears to be a
one-cent hand-rounding error in the spec (rounding the numerator to 4
decimal places before dividing lands on $299.875, which rounds up to
$299.88). `js/valuation.js` and the pre-rendered HTML both use the
full-precision $299.87 so the two can never drift apart — verify with
`python3 -c "print(5.897*(1+9.84/100)/((12.00-9.84)/100))"`.

The widget never prints `Infinity`, `NaN`, or a negative price: if
`r - g <= 0.25` percentage points, it renders `—` and an explanatory
sentence instead (`SPREAD_MIN` in `js/valuation.js`), and every computed
value is checked with `Number.isFinite()` before formatting.

### Headshot swap is one CSS line

`--headshot: none;` in `css/tokens.css`. Change to
`url("../assets/headshot.jpg")` to replace the "PK" monogram with a real
photo. See `CONTENT-GUIDE.md`.

## If this repo is ever renamed

The site is built to work unmodified at both `/` (a `USERNAME.github.io`
repo) and `/PrishidaKhatri/` (a project-page repo) because every internal
link (`<a>`, `<link>`, `<script src>`) is relative. The only things that
need editing after a rename are the **absolute** URLs, all listed in an
HTML comment at the top of `<head>` in `index.html`:

- `<link rel="canonical">`
- `<meta property="og:url">`
- `<meta property="og:image">` / `<meta name="twitter:image">`
- the two JSON-LD `url` / `image` fields
- `sitemap.xml` (`<loc>`)
- `robots.txt` (`Sitemap:` line)

## Regenerating the PNG assets

`assets/og-image.png` and `assets/apple-touch-icon.png` were generated with
Swift/AppKit (no ImageMagick, no downloads) via `xcrun swift <script>.swift`.
The generator scripts were throwaway and not committed to this repo; to
regenerate, draw with `NSBitmapImageRep` + `CoreGraphics` at 1200×630 (og
image) or 180×180 with **no alpha channel** (`samplesPerPixel: 3,
hasAlpha: false` — Apple touch icons must be fully opaque) and write with
`NSBitmapImageRep.representation(using: .png, properties: [:])`.

## No phone number, anywhere

By design, no phone number appears in this codebase — not in visible text,
not in a comment, not in meta tags or JSON-LD. Do not add one.
