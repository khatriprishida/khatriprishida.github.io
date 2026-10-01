# khatriprishida.github.io

Personal site and CV for **Prishida Khatri**, Financial Analyst, New York, NY.
Live at <https://khatriprishida.github.io>.

Plain HTML, CSS and SVG. No build step, no framework, no npm, no CDN, no
webfonts, no analytics, **no external network requests of any kind**. Open
`index.html` in a browser and it works.

---

## Run it locally

```
python3 -m http.server 8799
```

then open <http://localhost:8799/>. Any static file server does the same job.

---

## 1. What is on the page

One page, in the order a recruiter reads it:

| Section | Anchor | What it answers |
|---|---|---|
| Hero | `#top` | Who she is, the roles she wants ("Open to work"), New York, the 3.90 MBA, and one-click résumé / email / LinkedIn. The **At a glance** card beside it summarises degrees, dates, focus and tools. |
| Key figures | — | 3.90 GPA · +25% modelled upside · 11 securities · 50% sales increase |
| Selected work | `#work` | The four MBA case studies. 01 (valuation) and 02 (portfolios) carry hand-drawn charts; 03 (BI) and 04 (budgeting) carry process strips. |
| Experience & education | `#experience` | Strii Nepal and Gyapu Nepal; University of New Haven (May 2026) and Islington College (Dec 2023). |
| Skills & certificates | `#skills` | Financial & analysis (7), Technical (9), Business (4); four certificates. |
| Contact | `#contact` | Email, LinkedIn, location, résumé. |

Every fact comes from `assets/Resume-Prishida-Khatri.pdf`. Nothing on the site
(metrics, employers, testimonials, photos, links) goes beyond it.

---

## 2. Editing the words

`index.html` is fenced with obvious comments:

```html
<!-- ==== EDIT: HERO TEXT ==================================== -->
   … the bit you can safely change …
<!-- ==== /EDIT ============================================== -->
```

The fenced regions are: hero text, at a glance, key figures, each of the four
case studies, experience, education, skills, certificates and contact.
`CONTENT-GUIDE.md` explains each one in plain English.

---

## 3. File map

| Path | What it does |
|---|---|
| `index.html` | Every word on the site, plus the hand-written SVG charts |
| `404.html` | Not-found page, same design. Uses root-relative (`/css/…`) links because GitHub Pages serves it at any missing path. |
| `css/tokens.css` | **All** colours (light and dark theme), type sizes, spacing and timings. Loaded first. |
| `css/base.css` | Reset, element defaults, typography, layout primitives, focus rings, skip link |
| `css/components.css` | Masthead and menu, buttons, hero, ledger, key figures, case studies, experience, education, skills, contact, footer, 404 |
| `css/charts.css` | The inline SVG charts and the data table under the valuation chart |
| `css/motion.css` | All reveal states, chart draw-in, and the single `prefers-reduced-motion` block. Loaded last. |
| `css/print.css` | `media="print"` only — the one-column CV |
| `js/app.js` | `defer`. Reveal-on-scroll, chart draw-in, masthead hairline, nav highlighting, mobile-menu closing. Enhancement only. |
| `assets/Resume-Prishida-Khatri.pdf` | The CV. **Do not rename** — several links point at this exact filename. |
| `assets/og-image.png` | 1200×630 social preview |
| `assets/apple-touch-icon.png` | 180×180, opaque (touch icons must have no alpha channel) |
| `assets/favicon.svg` | Green tile with the serif initials, same as the masthead mark |
| `tools/make-images.swift` | Regenerates the two PNGs above. Not part of the site. |
| `robots.txt`, `sitemap.xml`, `.nojekyll` | Standard hosting files |
| `CONTENT-GUIDE.md` | Plain-English editing manual |

---

## 4. The rules this site is built to

### It works with JavaScript switched off

`js/app.js` never creates content. Every word, every number and every chart
is in `index.html` as real markup. JavaScript only adds movement and closes
the mobile menu after a choice.

The mechanism is one class. A short inline script in `<head>` adds `js` to
`<html>`, and **every** rule in `css/motion.css` that hides something is
scoped to `html.js`. No `js` class, nothing hidden. Three guards back it up:

1. **JavaScript off entirely** — the class is never added.
2. **`js/app.js` fails to load** (404, blocked, offline) — the `onerror`
   handler on the `<script>` tag removes the class.
3. **`js/app.js` has a syntax error and never executes** — a 2.5 second
   timer in that same `<head>` script checks for a `data-app-ready` flag and
   removes the class if `app.js` never set it.

The narrow-screen menu is a native `<details>` element, so it opens and
closes with JavaScript off too.

### The charts are hand-written SVG

No chart library, no `<canvas>`. Every line, bar and label is markup in
`index.html`, which means the charts survive with JavaScript off, print, and
can be restyled from `css/charts.css`.

They stay readable from 320px to 1440px without sideways scrolling: the outer
`<svg>` has no `viewBox`, so horizontal positions are **percentages** of the
width and vertical positions are **pixels**. Text is always drawn at its real
CSS size. Only the valuation curve sits in a nested, stretched `<svg>`, with
`vector-effect: non-scaling-stroke` so its line never distorts.

Each chart carries `role="img"` and a full `aria-label`, **and** the same
numbers appear as ordinary text next to it — in the note, a data table or the
case-study copy. Nothing on this site exists only as a picture. No chart
implies data the résumé does not contain (no Sharpe values, no dashboard
screenshots).

The valuation chart is explicitly labelled *Illustrative*: it is a
single-stage growth model calibrated to the published figures (`g = 9.84%`,
implied `$299.87`, `+25.0%` against the `$239.89` prior price, which implies a
12.0% discount rate). Check the arithmetic with:

```
python3 -c "print(5.897*1.0984/(0.12-0.0984))"    # 299.8734…
```

The portfolio bars are drawn at 30% return = full width, so the bar widths
are 14.83%, 29.07% and 93.33% for 4.45%, 8.72% and 28%.

### Light and dark

Both themes are first-class and follow the visitor's system setting through
`prefers-color-scheme`. Components only use semantic tokens (`--bg`,
`--surface`, `--text-3`, `--accent` …); the dark theme is a second set of
values for the same names in `css/tokens.css`.

### Accessibility

One `<h1>`. No skipped heading levels. Landmarks (`header`, `nav`, `main`,
`footer`), a skip link, visible `:focus-visible` rings that are never
suppressed, 44px minimum touch targets, and colour that is never the only
signal — every chart series is labelled directly.

Every text/background pair in `css/tokens.css` was measured against WCAG AA
in both themes rather than eyeballed; the ratios are written in the comments
beside each colour. Body text is 4.5:1 or better; chart marks that carry
meaning are 3:1 or better.

All motion is transform/opacity only, nothing loops, and
`prefers-reduced-motion: reduce` shows everything in its finished state.

### No phone number

By design, no phone number appears anywhere on the site — not in the page,
not in a comment, not in the metadata, not in the JSON-LD. It is only in the
PDF. Please do not add one.

---

## 5. If the repository is ever renamed

Internal links in `index.html` are relative, so the page works at `/` or at
`/SomeProjectName/`. Only the **absolute** URLs need editing, listed in a
comment at the top of `<head>` in `index.html`:

* `<link rel="canonical">`
* `<meta property="og:url">`
* `<meta property="og:image">` and `<meta name="twitter:image">`
* the `url` and `image` fields in the JSON-LD block
* `sitemap.xml` (`<loc>`)
* `robots.txt` (`Sitemap:` line)

`404.html` uses root-relative links (`/css/…`, `/assets/…`), which is right for
a `username.github.io` site. If the site ever moves under a sub-path, prefix
those with the sub-path.

---

## 6. Regenerating the images

```
xcrun swift tools/make-images.swift
```

Rewrites `assets/og-image.png` and `assets/apple-touch-icon.png` using the
colours from `css/tokens.css`. The social image contains the location
("New York, NY") and the degree date, so rerun it if either changes. It uses
only AppKit and CoreGraphics, both of which ship with macOS — nothing is
downloaded or installed. This is a convenience script, not a build step; the
site never runs it.
