# khatriprishida.github.io

Personal site and CV for **Prishida Khatri**, Financial Analyst, New York, NY.
Live at <https://khatriprishida.github.io>.

Plain HTML, CSS and JavaScript, with one self-hosted library (a trimmed
three.js) for the 3D hero. No build step, no framework, no CDN, no webfonts,
no analytics, and **no requests to any other site** — everything the page
needs is in this repository. Open it from any static server and it works.

---

## Run it locally

```
python3 -m http.server 8799
```

then open <http://localhost:8799/>. (Opening `index.html` straight from disk
works too, except the 3D scene: browsers refuse ES-module imports from
`file://`, so you see the still render instead.)

---

## 1. What is on the page

One page, in the order a recruiter reads it:

| Section | Anchor | What it answers |
|---|---|---|
| Hero | `#top` | Who she is, the roles she wants ("Open to work"), New York, the 3.90 MBA, one-click résumé / email / LinkedIn — over a live 3D "growth landscape". A frosted **At a glance** bar along the bottom gives degrees, dates, focus and tools. |
| Key figures | — | 3.90 GPA · +25% upside identified · 11 securities · 50% increase (counted up on arrival) |
| Selected work | `#work` | The four MBA case studies. 01 (valuation) and 02 (portfolios) carry 3D column charts of résumé figures; 03 (BI) and 04 (budgeting) carry process strips. |
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
| `index.html` | Every word on the site, and the markup of the 3D column charts |
| `404.html` | Not-found page, same design. Uses root-relative (`/css/…`) links because GitHub Pages serves it at any missing path. |
| `css/tokens.css` | **All** colours, type sizes, spacing and timings. White theme only. Loaded first. |
| `css/base.css` | Reset, element defaults, typography, layout primitives, focus rings, skip link |
| `css/components.css` | Masthead and menu, buttons, hero and its 3D stage, glance bar, key figures, case studies (tilt + glare), experience, education, skills, contact, footer, 404 |
| `css/charts.css` | The CSS-3D column charts and the small unit chart |
| `css/motion.css` | All reveal states, the 3D column growth, and the single `prefers-reduced-motion` block. Loaded last. |
| `css/print.css` | `media="print"` only — the one-column CV |
| `js/app.js` | `defer`. Reveals, count-ups, 3D chart rotation on scroll, card tilt, magnetic buttons, cursor light, nav state, mobile menu, and the lazy loader for the 3D hero. Enhancement only. |
| `js/hero3d.js` | The WebGL hero scene (ES module). Loaded by `app.js` only when WebGL works. |
| `js/vendor/three.subset.min.js` | three.js v0.186.1, trimmed to the classes `hero3d.js` uses (541 KB minified, ~139 KB gzipped). MIT licence in `js/vendor/LICENSE-three.txt`. |
| `assets/hero-still-desktop.webp`, `assets/hero-still-mobile.webp` | Still renders of the 3D scene: shown before it loads, and instead of it with JavaScript off or no WebGL |
| `assets/Resume-Prishida-Khatri.pdf` | The CV. **Do not rename** — several links point at this exact filename. |
| `assets/og-image.png` | 1200×630 social preview |
| `assets/apple-touch-icon.png` | 180×180, opaque (touch icons must have no alpha channel) |
| `assets/favicon.svg` | Green tile with the serif initials, same as the masthead mark |
| `tools/make-images.swift` | Regenerates `og-image.png` and `apple-touch-icon.png`. Not part of the site. |
| `tools/three-subset.entry.js`, `tools/build-three-subset.sh` | How the vendored three.js subset was made. Not part of the site. |
| `robots.txt`, `sitemap.xml`, `.nojekyll` | Standard hosting files |
| `CONTENT-GUIDE.md` | Plain-English editing manual |

---

## 4. The 3D and motion

### The hero scene (WebGL)

An abstract "growth landscape": a field of rounded columns rising left to
right, breathing slowly, with a gold line threaded across it and a spark that
runs along the line every few seconds. The camera drifts, leans toward the
mouse, and rises as you scroll past. It is decoration: no numbers are attached
to it and it is hidden from screen readers.

How it is kept fast and safe:

* **One draw call** for every column (`InstancedMesh`), one shadow map.
* **Pixel ratio capped** at 2 (1.75 on small screens); a lighter field on
  small screens.
* **Lazy:** `app.js` imports `hero3d.js` only after the page has loaded, and
  only if a WebGL context can be created.
* **Paused** whenever the hero is off screen or the tab is hidden.
* **Seamless hand-off:** the page first shows `hero-still-*.webp`, a render of
  the scene's very first frame. The live canvas fades in on top of it, so the
  swap is invisible. If WebGL is missing, fails, or loses its context, the still
  stays.
* **Reduced motion:** one settled frame is rendered; nothing moves.

Measured in Chrome at 1440×900 (2× pixels) and 390×844 on an M1 Pro: a
steady 60 fps, and the live scene is on screen about 0.4 s after navigation.

### The column charts (CSS 3D)

The Amazon and portfolio charts are real 3D boxes built from five faces with
CSS transforms (`transform-style: preserve-3d`), not WebGL and not images.
Every label is HTML text. As the chart scrolls through the window it turns a
few degrees (and leans toward the mouse on desktop); the columns grow from the
floor when they first appear. With JavaScript off or reduced motion, the chart
sits at a fixed three-quarter angle, fully drawn.

Heights are fractions of the chart height, written in `style="--h:…"`:

* **Amazon:** prior price indexed to 100 → `0.8`; the +25 upside stacks `0.2`
  on top in gold. Only résumé figures: the $239.89 prior price, the 25%
  upside and the 9.84% implied growth rate (written beside it). It
  deliberately states no dollar target price.
* **Portfolios:** return ÷ 28 (the tallest), so 4.45% → `0.159`,
  8.72% → `0.311`, 28% → `1`.

### Other motion

Sections tip up into place in perspective; key figures count up and land on
the exact text in the HTML; case cards tilt slightly toward the pointer with a
moving glare; primary buttons are gently magnetic; a soft light follows the
cursor in the hero. Pointer effects run only on devices with a real mouse.

---

## 5. The rules this site is built to

### Every number comes from the résumé

No chart implies data the résumé does not contain: no target price, no
discount rate, no sensitivity table, no Sharpe values, no dashboard
screenshots. Each chart carries `role="img"` and a full `aria-label`, **and**
the same numbers appear as ordinary text beside it. Nothing exists only as a
picture.

### It works with JavaScript switched off

`js/app.js` never creates content. Every word, every number and every chart
is in `index.html` as real markup. With JavaScript off the page is complete,
the hero shows the still render, and the charts sit at their resting angle.

The mechanism is one class. A short inline script in `<head>` adds `js` to
`<html>`, and **every** rule in `css/motion.css` that hides something is
scoped to `html.js`. No `js` class, nothing hidden. Three guards back it up:

1. **JavaScript off entirely** — the class is never added.
2. **`js/app.js` fails to load** (404, blocked, offline) — the `onerror`
   handler on the `<script>` tag removes the class.
3. **`js/app.js` has a syntax error and never executes** — a 2.5 second
   timer in that same `<head>` script checks for a `data-app-ready` flag and
   removes the class if `app.js` never set it.

`hero3d.js` failing affects nothing but the hero, which keeps its still.

The narrow-screen menu is a native `<details>` element, so it opens and
closes with JavaScript off too.

### White only

One bright theme, on every machine: `color-scheme: light`, and no
`prefers-color-scheme` rules. Components only use semantic tokens (`--bg`,
`--surface`, `--text-3`, `--accent`, `--gold` …) from `css/tokens.css`.

### Accessibility

One `<h1>`. No skipped heading levels. Landmarks, a skip link, visible
`:focus-visible` rings, 44px minimum touch targets, and colour that is never
the only signal — every chart series is labelled directly. Every text colour
in `css/tokens.css` was measured against WCAG AA on white; ratios are in the
comments. Gold (`--gold`) is decorative only; gold text uses `--gold-ink`
(5.9:1).

All motion is transform/opacity (plus WebGL), and
`prefers-reduced-motion: reduce` shows everything in its finished state.

### No phone number

By design, the site never shows a phone number — not in the page, not in a
comment, not in the metadata, not in the JSON-LD. Please do not add one.

---

## 6. If the repository is ever renamed

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

## 7. Regenerating things (none of this is a build step)

**Social image and touch icon.**

```
xcrun swift tools/make-images.swift
```

Uses only AppKit and CoreGraphics. The social image contains the location,
the GPA and the degree dates, so rerun it if any of them change.

**The hero stills.** If `js/hero3d.js` changes, re-render the stills so the
hand-off stays seamless: serve the site, open it at desktop width in a browser,
and in the console run `copy(__hero3d.snapshot(true))` to get the first frame
as a PNG data URL; save it as WebP at `assets/hero-still-desktop.webp` (and
the same at phone width for `-mobile`).

**The three.js subset.** Only needed to upgrade three.js or use more of it:
add the class to `tools/three-subset.entry.js`, then follow the comment at the
top of `tools/build-three-subset.sh`.
