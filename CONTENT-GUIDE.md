# How to edit this site

Written for someone who does not write code. You will not break anything by
changing words. Take a copy of the file first if that makes you happier.

Everything you are likely to want to change lives in **`index.html`**, inside
regions marked like this:

```html
<!-- ==== EDIT: EXPERIENCE =================================== -->
   … change what is in here …
<!-- ==== /EDIT ============================================== -->
```

Only change the words *between* the `>` and `<` symbols. Leave the tags
(`<p>`, `<li>`, `<h3>` and so on) exactly where they are.

Three characters have to be written the long way inside HTML:

| You want | Type this |
|---|---|
| `&` | `&amp;` |
| `<` | `&lt;` |
| `>` | `&gt;` |

That is why the file says `FP&amp;A` rather than `FP&A`.

---

## Changing your photograph

The photo in the hero is `assets/portrait.jpg`. To swap it, save the new
original as `assets/portrait-source.jpg` and run this from the repository
root:

```
xcrun swift tools/make-portrait.swift assets/portrait-source.jpg
```

It crops and resizes for you, so you do not have to get the shape right
yourself. See **section 1 of `README.md`** if you want to adjust the framing.

---

## The editable regions, one by one

### `EDIT: HERO TEXT`
Your name, the sentence under it, the four facts (Degree / Grade / Toolkit /
Focus), the three buttons and the "Open to" line.

If you change your email address, change it in **three** places: the button
here, the Contact section at the bottom, and the `"email"` line inside the
`<script type="application/ld+json">` block at the top of the file (that one
is for search engines).

### `EDIT: THE SIX HEADLINE NUMBERS`
The strip of big numbers under the hero.

Each tile looks like this:

```html
<p class="figure-tile__label">Graduate GPA</p>
<p class="figure-tile__value"><span class="num" data-count>3.90</span><span class="unit">/4.00</span></p>
<svg class="glyph" …> … </svg>
<p class="figure-tile__note">MBA, Financial Analysis</p>
```

* **label** — the small grey caption.
* **value** — the big number. Change the number between `data-count>` and
  `</span>`. It counts up on screen by itself; you do not have to do anything
  to make that happen.
* **unit** — the small suffix (`%`, `/4.00`). Delete this whole `<span>` if
  there isn't one.
* **glyph** — the small blue bar or row of blocks. Leave it alone unless the
  number it illustrates has changed; if it has, see "the small blue glyphs"
  below.
* **note** — the grey line at the bottom that says where the number came from.

### `EDIT: SUMMARY`
The three-paragraph profile, and the four "Roles in view" chips beneath it.
To add a chip, copy one whole line:

```html
<li><span>Financial Analyst</span></li>
```

### `EDIT: EDUCATION`
The two schools. Dates are deliberately not shown; `README.md` section 2
shows exactly what to paste in if you want to add them.

### `EDIT: PROJECT 01` … `PROJECT 04`
Each project has a title, one or two paragraphs, a row of key figures, and a
row of small tool labels.

Projects 01 and 02 also have a chart. **The chart numbers are drawn by hand
in the SVG.** If a project figure changes, the chart will not follow it
automatically — ask whoever built this to redraw it, or delete the whole
`<figure class="figure"> … </figure>` block and keep just the words and the
key figures. Deleting a chart breaks nothing else.

To add a tool label, copy one line:

```html
<li><span>Power BI</span></li>
```

### `EDIT: EXPERIENCE`
The two jobs. Each has an employer, a location, dates, a job title and a list
of bullet points. To add a bullet, copy one whole `<li>…</li>` line. To add a
whole new job, copy an entire `<article class="role"> … </article>` block and
change the words inside it.

### `EDIT: SKILLS`
Three groups. Each item is one `<li>…</li>` line. If you add or remove items,
also update the small count underneath the group heading — the line that says
`<span class="num">7</span> tools`.

### `EDIT: CERTIFICATIONS`
Four cards. To add a fifth, copy a whole `<li class="cert"> … </li>` block and
change the number, the name and the issuer. Also add it to the
`"hasCredential"` list at the top of the file if you want search engines to
know about it.

### `EDIT: CONTACT`
Email, LinkedIn, location and the résumé link.

---

## Replacing the résumé PDF

Save the new file over `assets/Resume-Prishida-Khatri.pdf`, keeping **exactly
that filename**. Several links point at it.

If the file size changes noticeably, update the label. Search `index.html`
for `73 KB` — it appears three times.

---

## The small blue glyphs

There are three kinds, and all of them are just coloured rectangles:

* **A filled bar** (used for the GPA) — one grey rectangle for the total and
  one blue rectangle on top for the part achieved. The blue one's `width` out
  of `120` is the proportion: `117` out of `120` is 3.90 out of 4.00.
* **A row of blocks** (used for counts) — one block per thing. Eleven blocks
  means eleven securities. Add or remove a `<rect …>` line to change the
  count.
* **Two stacked bars** (used for the two percentages) — the shorter bar is
  the "before", the longer one is the "after".

If a number changes and you cannot face editing the glyph, delete the whole
`<svg class="glyph"> … </svg>` block. The tile still works and still looks
tidy without it.

---

## Things not to change

* Any filename inside `assets/`.
* The `<script type="application/ld+json">` block at the top — except the
  values inside quote marks, if a fact changes.
* Anything in `css/` or `js/`, apart from the one photograph line in
  `css/tokens.css`.
* **Never add a phone number.** The site is built deliberately without one.

---

## Checking your work

Save the file, then open `index.html` in a browser and reload
(<kbd>⌘R</kbd> or <kbd>Ctrl</kbd>+<kbd>R</kbd>). If something looks wrong,
undo your change and it comes straight back — nothing here is clever enough
to break in a way that a plain undo will not fix.
