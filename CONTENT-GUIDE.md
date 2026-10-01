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

**The one rule:** everything on the site should also be on the résumé. If a
fact is not on the PDF, it does not go on the site.

---

## The editable regions, one by one

### `EDIT: HERO TEXT`
The "Open to work" line and the roles after it, your name, the one-sentence
statement, the short paragraph under it, and the three buttons.

Your name is split into two pieces so each can animate in:
`<span class="hero__first">Prishida</span> <span class="hero__last">Khatri</span>`.
Change the words inside, keep the two `<span>`s.

The moving 3D picture behind the hero has no words or numbers in it, so there
is nothing to edit there.

If you change your email address, change it in **four** places: the
"Email me" button here, the big address and the list in the Contact section,
and the `"email"` line inside the `<script type="application/ld+json">` block
at the top of the file (that one is for search engines). `404.html` has one
more.

If you move city, change "New York" in the hero statement, the At a glance
card, the Contact list, the footer, the printed contact line (the
`print-contact` paragraph), the `<meta name="description">` at the top, and
`"addressLocality"` in the JSON-LD block. Then regenerate the social image
(see `README.md`, section 6) because it says "New York, NY" too.

### `EDIT: AT A GLANCE`
The frosted bar along the bottom of the hero. Each item is a short label
(`MBA · May 2026`, `GPA`…), a bold line and a small grey line underneath.

### `EDIT: KEY FIGURES`
The four big numbers under the hero. Each one looks like this:

```html
<p class="figure__value"><span class="fig" data-count>3.90</span></p>
<p class="figure__label">MBA grade point average</p>
<p class="figure__note">Financial Analysis, University of New Haven</p>
```

Change the number, the bold label and the grey note. The number counts up
from zero on screen by itself (`data-count`) and always lands on exactly what
you typed. For a percentage, the `%` sits in its own
`<span class="figure__unit">` so it can be drawn smaller; a leading `+` sits in
its own `<span class="fig">` so it does not count.

### `EDIT: CASE 01` … `CASE 04`
Each case study has a small label ("01 · Valuation"), a title, one or two
paragraphs, and then a visual.

* **Case 01** has two "calls" (Lockheed Martin — Buy; Amazon — +25% upside),
  a row of method tags, and the 3D Amazon chart (prior price vs. 25% upside)
  with three key facts under it.
* **Case 02** has three key facts, method tags and the 3D portfolio chart.
* **Cases 03 and 04** have a four-step strip. Each step is one line:

  ```html
  <li><span class="flow__step">Power Query</span><span class="flow__what">Data preparation</span></li>
  ```

**The 3D charts are set by hand.** Each column is a
`<div class="col3d" style="--h:0.311;--top:0.311">` block with a label inside.
`--h` is the column's height as a fraction of the tallest (for the portfolios:
the return divided by 28, so 8.72% → 0.311) and `--top` is the same number
(it places the label). Change the label text in `col3d__value` and
`col3d__name` to match. Also update the `aria-label` on the
`<div class="chart3d" …>` line, which is what screen readers hear. If in
doubt, delete the whole `<figure class="chartfig"> … </figure>` block and keep
the words — deleting a chart breaks nothing else. Deleting a
chart breaks nothing else.

To add a method tag, copy one line: `<li>Ratio analysis</li>`.

### `EDIT: EXPERIENCE`
The two jobs. Each has dates, a job title, the employer and place, and a list
of bullet points. To add a bullet, copy one whole `<li>…</li>` line. To add a
whole new job, copy an entire `<li class="role"> … </li>` block and change the
words inside it. Put the newest job first.

### `EDIT: EDUCATION`
The two degrees, each with its date, school, degree name and a small green
badge (GPA or honours).

### `EDIT: SKILLS`
Three groups. Each item is one `<li>…</li>` line. A grey sub-line (like the
Excel features) goes inside `<span class="skillset__detail">…</span>`. If you
add or remove items, also update the small count under the group title — the
line that says `9 tools`.

### `EDIT: CERTIFICATES`
Four cards. To add a fifth, copy a whole `<li class="cert"> … </li>` block and
change the name and the issuer. Also add it to the `"hasCredential"` list at
the top of the file if you want search engines to know about it.

### `EDIT: CONTACT`
The closing green panel: the heading, the short paragraph, the big email
address, the two buttons, and the list of contact details.

---

## Replacing the résumé PDF

Save the new file over `assets/Resume-Prishida-Khatri.pdf`, keeping **exactly
that filename**. Several links point at it.

If the file size changes noticeably, update the label. Search `index.html`
for `73&nbsp;KB` — it appears four times (hero button, menu, contact button,
contact list).

---

## Things not to change

* Any filename inside `assets/`.
* The `<script type="application/ld+json">` block at the top — except the
  values inside quote marks, if a fact changes.
* Anything in `css/` or `js/` (and never edit `js/vendor/`).
* The two `hero-still-*.webp` images (see `README.md`, section 7).
* **Never add a phone number.** The site is built deliberately without one.

---

## Checking your work

Save the file, then open `index.html` in a browser and reload
(<kbd>⌘R</kbd> or <kbd>Ctrl</kbd>+<kbd>R</kbd>). Check it on your phone too,
and in dark mode if your phone uses it. If something looks wrong, undo your
change and it comes straight back.
