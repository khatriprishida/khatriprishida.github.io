# Editing this site — a plain-English guide

You do **not** need to know how to code to update this website. Everything
lives in one file, `index.html`, and it's organized so you can find the part
you want to change by searching (Ctrl+F / Cmd+F) for comments that look like
this:

```
<!-- ===== ADD A NEW JOB HERE: copy one <article class="ev-card"> block ===== -->
```

Open `index.html` in any plain text editor (TextEdit on a Mac — set it to
"Plain Text" mode first; Notepad on Windows; or a free code editor like
[VS Code](https://code.visualstudio.com/)). **Do not use Microsoft Word** —
it will corrupt the file.

After you save a change, open `index.html` by double-clicking it to preview
in your browser before it goes live.

---

## Add a new job

1. Search for `ADD A NEW JOB HERE`.
2. Copy one whole block, from `<article class="ev-card"...` down to the
   matching `</article>`.
3. Paste it right before `</div>` at the end of that section.
4. Edit the text inside:
   - `<h4>` — the job title.
   - The line with the company, city and dates.
   - Each `<li>` — one bullet point per accomplishment.
5. Give your new `<article>` a unique `id="job-something"` (lowercase, no
   spaces, e.g. `id="job-newcompany"`) if you want a Key Metric tile to be
   able to link to it later.
6. Leave `data-tools=""` empty unless the résumé bullet explicitly names a
   tool (Power BI, SQL, R, or Excel) — see "Tagging a card with a tool"
   below.

## Add a new academic project

Search for `ADD A NEW PROJECT HERE` and follow the same copy/paste steps as
above, inside the "Analytical Projects" section.

## Add a new certification

Search for `ADD A NEW CERT HERE`. Certification cards are short — just a
title (`<h4>`) and an issuer line (`<p class="ev-card__meta">`).

## Add or edit a degree (Education)

Search for `ADD/EDIT A DEGREE HERE`. Each `<article class="ev-card">` in
that section is one degree.

### The "TODO: add dates" boxes

Both degrees currently show an amber **TODO: add dates** box because the
exact start/end dates weren't in the source résumé. To fill them in, find:

```html
<p class="ev-card__meta"><span class="todo">TODO: add dates</span></p>
```

and replace the whole line with your dates, e.g.:

```html
<p class="ev-card__meta">August 2023 &ndash; May 2025</p>
```

(`&ndash;` is just a long dash "–"; you can also use a plain hyphen.)

## Add or remove a skill

Search for `ADD/EDIT A SKILL HERE`. Each skill is one line:

```html
<li class="chip">SQL</li>
```

Add a new `<li class="chip">...</li>` line inside the right group
(Technical / Data & Financial Analysis / Business), or delete a line to
remove a skill.

## Tagging a card with a tool (for the Coverage filter)

The "Filter by tool" chips in the Coverage section (Power BI / SQL / R /
Excel) work by reading the `data-tools` attribute on each
`<article class="ev-card" data-tools="...">`. This lists which tools that
specific project, job, or certification explicitly used.

**Rule: only tag a tool if the text on the card actually says it.** Don't
guess or add a tool because it seems related — an empty `data-tools=""` is
fine and correct if the card doesn't name a specific tool.

To tag a card with more than one tool, separate them with spaces inside the
quotes, e.g. `data-tools="excel powerbi"`.

If you ever add a **brand-new tool** (not Power BI/SQL/R/Excel), you also
need a developer to add a matching filter chip and CSS rule — see
`README.md`.

## Swap in a headshot

Right now the site shows a "PK" monogram instead of a photo — this is a
deliberate, finished design, not a placeholder. To swap in a real photo:

1. Add your photo file to the `assets/` folder, e.g. `assets/headshot.jpg`.
2. Open `css/tokens.css` and find this line near the top:
   ```css
   --headshot: none;
   ```
3. Change it to:
   ```css
   --headshot: url("../assets/headshot.jpg");
   ```
4. Save. That's the **only** line you need to change — the photo will
   appear automatically, cropped to fit the same frame the monogram used.

## Updating your résumé PDF

The résumé link depends on the file being named exactly
`Resume-Prishida-Khatri.pdf` inside the `assets/` folder. If you replace it
with a newer version, **keep the exact same filename** — otherwise the
"View résumé" and "Download résumé" buttons will break. If the file size
changes meaningfully, you can update the `(PDF, 73 KB)` text next to both
résumé links in `index.html` (search for `73 KB`) to match the new size.

## A rule that protects you: every number must come from your résumé

This whole site is built around the idea that every statistic — the GPA,
the percentages, the security counts — is something a recruiter could look
up in your résumé or transcript and confirm. When adding new content, keep
that rule: don't add a number you can't point to in your own materials.

## The one thing you should never do

**Never add a phone number anywhere on this site** — not in the visible
text, not in a comment, nowhere. This was a deliberate decision to avoid
unwanted calls; email and LinkedIn are the contact methods by design.
