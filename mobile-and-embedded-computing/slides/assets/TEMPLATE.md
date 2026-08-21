# Deck template guide — Mobile & Embedded Computing

Every lecture is rebuilt on ONE design system, defined in `template.js`. You are producing
lecture N. Do not invent a new look; do not restyle. Use the primitives.

Reference deck (already shipped, matches this system exactly):
`/Users/dinu/dev/upb/mobile-and-embedded-computing/lectures/Mobile-and-Embedded-Lecture1.pptx`
Its generator is `build2.js` in this directory — read it for worked examples.

---

## The design system (non-negotiable)

**Look:** Apple-keynote minimal. Whitespace is the layout tool. No decorative anything.

- **Type:** `Helvetica Neue` everywhere, `Menlo` for code / lecture tags. Titles 30pt bold,
  body 13–15pt, captions 11–12pt, big stats 52–56pt.
- **Color:** ink `1D1D1F`, gray `86868B`, hairline `D2D2D7`, panel `F5F5F7`, white, black.
  Accents, used sparingly: **blue `0071E3`** = emphasis / interactive / "yes" paths;
  **orange `F56300`** = EMBEDDED topics ONLY (sensors, MCU, TinyGo, energy at the device level);
  **red `FF3B30`** = failure states only.
- **Separators:** hairline rules (`hline`, `takeaway`), never boxes-in-boxes. The grey `panel`
  and hairline `hairbox` are the only fills besides black emphasis blocks.
- **No bullet glyphs.** Body copy is bullet-less lines (`lines()`), spaced apart. This is deliberate.
- **Every slide:** eyebrow label (uppercase, letterspaced, gray) + one-line title. Slide numbers
  are automatic on light slides; dark slides have none.

**Banned** (these are what made the old decks look generated): rounded pastel cards, icon-in-colored-circle
chips, accent stripes/bars under titles, gradients, drop shadows, emoji, clip-art, centered body text,
multiple accent colors on one slide, any second typeface.

---

## Deck skeleton (every lecture)

1. `titleSlide()` — black, device spectrum row
2. `bioSlide(deck)` — identical in every deck, call it verbatim
3. `objectivesSlide(deck, objs)` — 3–4 learning objectives for THIS lecture
4. …content slides, grouped by section with `divider()` between major sections…
5. `closing(cols)` — Recap / This week / Read more

Aim for **22–28 slides**. If the source deck is huge (L3 is 61 slides), consolidate ruthlessly:
merge duplicate slides, drop decorative ones, keep the teaching. If it is thin (L9 is 12 slides),
expand with the missing substance named in the review notes — do not pad.

---

## API (require `./template`)

```js
const T = require("./template");
const { Deck, C } = T;
const d = new Deck({ lecture: 3, title: "Widgets & Concurrency", subtitle: "widgets, async, isolates" });
```

| Call | Use for |
|---|---|
| `d.titleSlide()` | opening black slide |
| `d.divider(eyebrow, title, subtitle?)` | black section break |
| `d.content(eyebrow, title)` → slide | every normal slide; returns the pptxgenjs slide |
| `d.closing(cols, heading?)` | final black slide; `cols` = 3 × `[icon, heading, [lines]]` |
| `T.bioSlide(d)` | the instructor slide |
| `T.objectivesSlide(d, objs)` | `objs` = `[icon, heading, description]` |
| `T.lines(s, items, opts)` | body copy. items = strings or `{text, options:{bold,color}}` |
| `T.iconGrid(s, items, opts)` | "N things" grid. items = `[icon, heading, body]`; 3 per row |
| `T.codeBlock(s, linesArray, opts)` | code on grey panel; lines starting `#` or `//` render grey |
| `T.prosCons(s, pros, cons, opts)` | two-column trade-off compare |
| `T.table(s, headers, rows, opts)` | data table; `focusCols`/`hotCols` (hot = orange/embedded) |
| `T.flowDown(s, steps, opts)` | vertical pipeline; steps = `[head, sub, "black"\|"hair"\|"panel"]` |
| `T.statRow(s, items, opts)` | big quiet numbers; items = `[big, label, caption]` |
| `T.takeaway(s, bold, rest, y?, opts?)` | hairline + closing sentence. **THE way to end a slide** |
| `T.hline / T.panel / T.hairbox / T.blackbox / T.arrow` | raw primitives |
| `T.icon(name, "ink"\|"white"\|"blue"\|"orange"\|"gray")` | icon path for `addImage` |

**Icons:** 174 available; names listed in `icon-names.txt`. Use `T.icon("bug","ink")`.
Never invent a name — `icon()` throws if missing. If you truly need one that doesn't exist,
add it to `render-icons.js` (map to a `react-icons/lu` or `/fa` component) and re-run `node render-icons.js`.

**Canvas:** 13.33 × 7.5 in. Content region **x 0.9 → 12.43**, **y 1.95 → 6.9**. Keep 0.9 in side
margins. Two-column split: left `x 0.9 w 6.8`, right `x 8.3 w 4.3` (or 6.5/5.95 for wide diagrams).

---

## Content rules

- **Code as real text, never screenshots.** Every hands-on lecture needs at least one complete,
  correct, runnable snippet via `codeBlock`. This is the single biggest upgrade over the old decks.
- **Fix the errors in the review notes.** You are given the reviewer's list for your lecture —
  every listed factual error MUST be corrected, not carried over.
- **Cut AI-generation residue**: citation chips ("Google Cloud+1"), literal `*asterisks*`/backticks,
  raw LaTeX, "(Not specified)", placeholder watermarks. Never reproduce them.
- **Images:** old decks are full of watermarked stock, fan art, and lifted slides — do NOT reuse
  any raster image from the source deck. Rebuild diagrams with `flowDown`/`hairbox`/`arrow`/`table`.
  The only pre-cleared images are in `assets/` (git logos, CI pipeline diagram) and the bio logos.
- **Forward/back references** are a feature of this course: "→ Lecture 7" when a topic recurs.
- **Speaker notes** (`s.addNotes("...")`) on slides with a demo opportunity, a subtlety, or a
  correction worth explaining aloud. Not on every slide.
- Titles must fit ONE line at 30pt (~52 characters). Shorten the title rather than let it wrap.

---

## Required QA before you report done

```bash
node buildN.js
python3 "$PPTX/scripts/office/validate.py" Mobile-and-Embedded-LectureN-v2.pptx
python3 "$PPTX/scripts/office/soffice.py" --headless --convert-to pdf Mobile-and-Embedded-LectureN-v2.pptx
pdftoppm -jpeg -r 100 Mobile-and-Embedded-LectureN-v2.pdf lN
```
where `PPTX="/Users/dinu/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/fe67b5e7-b659-4b16-a4ca-910758d460b1/8853caf6-3b01-4029-a906-30ac854bf748/skills/pptx"`

Then **read every rendered JPG with the Read tool** and fix what you see. Look for:
text overflowing its box or the slide edge, elements overlapping, a title that wrapped to two lines,
a hairline running under a diagram (pass `opts.w` to `takeaway`), uneven gaps, anything within
0.5 in of a slide edge. Re-render after fixing. Do not report done with a known visual defect.

Note: LibreOffice renders Helvetica Neue slightly differently than PowerPoint will, so treat
borderline text-fit as "too tight" and give it slack.

Write your generator as `buildN.js` in this directory and output
`Mobile-and-Embedded-LectureN-v2.pptx`. Do NOT copy anything into the user's repo — the
orchestrator deploys.
