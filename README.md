# khatriprishida.github.io

Personal site and CV for **Prishida Khatri**, Financial Analyst.
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

## 1. Adding the photograph — one line

The hero is built around a portrait-shaped frame. Until a photograph exists,
that frame shows a finished dark plate: an engraved border, a drawing taken
from the Amazon valuation model, and a nameplate. It is meant to look
deliberate on its own, and it does.

**To put the real photograph in:**

1. Save the photo as `assets/portrait.jpg`.
   Portrait shape, roughly **4 wide × 5 tall**, at least **800 × 1000 px**.
2. Open `css/tokens.css`. Near the top, find the line marked
   `>>> THE ONE LINE <<<`:

   ```css
   --portrait: none;                            /* >>> THE ONE LINE <<< */
   ```

   change it to:

   ```css
   --portrait: url("../assets/portrait.jpg");   /* >>> THE ONE LINE <<< */
   ```

3. Save. Done. The photograph now fills the frame edge to edge and covers
   the drawing and the nameplate underneath it.

Two optional extras:

* If the face sits too high or too low in the crop, change
  `--portrait-focus: 50% 28%;` on the next line. The first number is
  left↔right, the second is top↕bottom. `50% 20%` moves the crop up.
* Once the photo is in, the drawing behind it is dead weight. You can delete
  the `<svg class="plate__art"> … </svg>` block in `index.html` if you like.
  Nothing else references it.

The mechanism: `.plate__frame::after` in `css/components.css` paints
`var(--portrait)` as a full-bleed background layer on top of everything else
in the frame. When the value is `none`, that layer paints nothing and the
plate below shows through. No JavaScript is involved.

---

## 2. Editing the words

`index.html` is fenced with obvious comments:

```html
<!-- ==== EDIT: HERO TEXT ==================================== -->
   … the bit you can safely change …
<!-- ==== /EDIT ============================================== -->
```

The fenced regions are: hero text, the six headline numbers, the summary,
education, each of the four projects, experience, skills, certifications and
contact. `CONTENT-GUIDE.md` explains each one in plain English.

### Education dates

**Dates for both degrees are not currently known, so they are simply left
out.** No placeholders, no "TBC" badges — an omission reads as a design
choice, a placeholder reads as an unfinished site.

To add them when they are known, edit `index.html` inside
`<!-- ==== EDIT: EDUCATION ==== -->` and add one line per school, matching
the pattern already used by the job dates in the Experience section:

```html
<h4 class="edu__school">University of New Haven</h4>
<p class="edu__degree">Master of Business Administration — Financial Analysis</p>
<p class="edu__mark"><span class="num">2023 – 2025</span></p>   <!-- new line -->
```

---

## 3. File map

| Path | What it does |
|---|---|
| `index.html` | Every word on the site, plus the hand-written SVG charts |
| `404.html` | Not-found page, same design |
| `css/tokens.css` | **All** colours, sizes, spacing and timings. Contains the photo slot. Loaded first. |
| `css/base.css` | Reset, element defaults, typography, layout primitives, focus rings, skip link |
| `css/components.css` | Masthead, buttons, hero, the plate, figure tiles, projects, roles, skills, contact, footer |
| `css/charts.css` | Everything to do with the inline SVG charts and the data tables under them |
| `css/motion.css` | All reveal states, transitions and the single `prefers-reduced-motion` block. Loaded last. |
| `css/print.css` | `media="print"` only — the one-column CV |
| `js/app.js` | `defer`. Reveal-on-scroll, chart draw-in, number counters, sticky masthead, nav highlighting. Enhancement only. |
| `assets/Resume-Prishida-Khatri.pdf` | The CV. **Do not rename** — several links point at this exact filename. |
| `assets/og-image.png` | 1200×630 social preview |
| `assets/apple-touch-icon.png` | 180×180, opaque (touch icons must have no alpha channel) |
| `assets/favicon.svg` | Ink-blue plate with the valuation curve and initials |
| `tools/make-images.swift` | Regenerates the two PNGs above. Not part of the site. |
| `robots.txt`, `sitemap.xml`, `.nojekyll` | Standard hosting files |
| `CONTENT-GUIDE.md` | Plain-English editing manual |

---

## 4. The rules this site is built to

### It works with JavaScript switched off

`js/app.js` never creates content. Every word, every number and every chart
is in `index.html` as real markup. JavaScript only adds movement.

The mechanism is one class. A short inline script in `<head>` adds `js` to
`<html>`, and **every** rule in `css/motion.css` that hides something is
scoped to `html.js`. No `js` class, nothing hidden. Three guards back it up:

1. **JavaScript off entirely** — the class is never added.
2. **`js/app.js` fails to load** (404, blocked, offline) — the `onerror`
   handler on the `<script>` tag removes the class.
3. **`js/app.js` has a syntax error and never executes at all** — a 2.5
   second timer in that same `<head>` script checks for a `data-app-ready`
   flag and removes the class if `app.js` never set it. This is the case
   `try/catch` cannot catch, which is why the timer exists.

All three were tested by deliberately breaking the file.

### The charts are hand-written SVG

No chart library, no `<canvas>`. Every line, bar and label is markup in
`index.html`, which means the charts survive with JavaScript off, scale with
the page, print, and can be restyled from `css/charts.css`.

Each chart carries `role="img"` and a full `aria-label`, **and** the same
numbers appear as ordinary text right next to it — in the note underneath,
in a data table, or in the key-figures list. Nothing on this site exists only
as a picture.

The valuation chart is explicitly labelled *illustrative*: it is a
single-stage growth model calibrated to the one published figure
(`g = 9.84%`, implied `$299.87`, `+25.0%` against the `$239.89` prior price,
which implies a 12.0% discount rate). Check the arithmetic with:

```
python3 -c "print(5.897*1.0984/(0.12-0.0984))"    # 299.8734…
```

### Accessibility

One `<h1>`. No skipped heading levels. Landmarks (`header`, `nav`, `main`,
`footer`), a skip link, visible `:focus-visible` rings that are never
suppressed, 44px minimum touch targets, and colour that is never the only
signal — every chart series is labelled directly.

Every text/background pair in `css/tokens.css` was measured against WCAG AA
rather than eyeballed; the ratios are written into the comments beside each
colour. Body text is 4.5:1 or better; chart marks that carry meaning are
3:1 or better.

### No phone number

By design, no phone number appears anywhere in this repository — not in the
page, not in a comment, not in the metadata, not in the JSON-LD. Please do
not add one.

---

## 5. If the repository is ever renamed

Every internal link is relative, so the site works unchanged at `/` or at
`/SomeProjectName/`. Only the **absolute** URLs need editing, and they are
listed in a comment at the top of `<head>` in `index.html`:

* `<link rel="canonical">`
* `<meta property="og:url">`
* `<meta property="og:image">` and `<meta name="twitter:image">`
* the `url` and `image` fields in the JSON-LD block
* `sitemap.xml` (`<loc>`)
* `robots.txt` (`Sitemap:` line)

---

## 6. Regenerating the images

```
xcrun swift tools/make-images.swift
```

Rewrites `assets/og-image.png` and `assets/apple-touch-icon.png` using the
colours from `css/tokens.css`. It uses only AppKit and CoreGraphics, both of
which ship with macOS — nothing is downloaded or installed. This is a
convenience script, not a build step; the site never runs it.
