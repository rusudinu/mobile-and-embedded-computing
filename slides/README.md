# Slide sources

The twelve lecture decks in `lectures/` and the five lab handouts in `labs/` (at the repo root) are
**generated**, not hand-edited. Each one is a JavaScript file here that builds a `.pptx` via
[pptxgenjs](https://gitbrent.github.io/PptxGenJS/), on top of one shared design system.

Edit the generator, re-run it, copy the result over the deck. **Do not hand-edit the `.pptx` files** —
the next rebuild overwrites your changes.

```
slides/
  assets/       the design system, docs, and shared images   ← shared by everything
  lectures/     build-lecture1.js … build-lecture12.js
  labs/         build-lab1.js … build-lab5.js
```

## Setup

```bash
npm install
cd assets && node render-icons.js
```

`render-icons.js` writes ~880 PNGs into `assets/icons2/` (5 colour variants of 176 icons) and
refreshes `assets/icon-names.txt`. That directory is gitignored and regenerated on demand.

## Building

```bash
cd lectures && node build-lecture4.js      # → Mobile-and-Embedded-Lecture4-v2.pptx
cp Mobile-and-Embedded-Lecture4-v2.pptx ../../lectures/Mobile-and-Embedded-Lecture4.pptx
```

```bash
cd labs && node build-lab3.js              # → Mobile-and-Embedded-Lab3-v2.pptx
cp Mobile-and-Embedded-Lab3-v2.pptx ../../labs/Mobile-and-Embedded-Lab3.pptx
```

Export the PDF alongside it (see QA below) and copy that into `lectures-pdf/` or `labs-pdf/`.

## What's in `assets/`

| File | What it is |
|---|---|
| `template.js` | **The design system.** Colours, type, and every layout primitive, for lectures (`Deck`) and labs (`Lab`). Change it once, rebuild everything, and the whole course follows. |
| `TEMPLATE.md` | The rules: the system, what is banned, the API, and the required QA pass. Read before touching anything. |
| `LABS.md` | Lab-specific structure and task-writing rules (one requirement per step, hints that name the intended widget, acceptance criteria, one submission channel). |
| `FACTS.md` | Verified technical facts (checked Aug 2026) used to correct the previous decks — Impeller/Skia, RN 0.76, KMP dates, TinyGo boards, frame budgets, Firebase auth behaviour, package names. Update it when the world moves. |
| `render-icons.js` | Generates the icon library. Add a name here if you need a new icon. |
| `images/`, `logos/`, `logos.json` | The only pre-cleared images: git/GitHub art, the CI pipeline diagram, and the trimmed, weight-normalised partner logos for the bio slide. |

`lectures/build-lecture1.js` predates the shared module and is self-contained; everything else
requires `../assets/template`. All render identically.

## Writing conventions

`assets/EDITPASS.md` is the house style, and it is enforced across every deck:

- **No em-dashes.** Use a colon for an explanation, a period to split two sentences, commas for an
  aside. En-dashes stay in numeric ranges (`8–16 GB`), and arrows `→` and middots `·` are fine.
- **Plain technical prose.** No slogans, rhetorical triples, emphatic one-word sentences,
  scene-setting, anthropomorphism, or consequence inflation. Directness and precision are wanted;
  theatre is not.
- **American English** in all prose, headings, hints, takeaways and speaker notes. Identifiers, API
  names and commands inside code blocks keep their real spelling (`flutter doctor --android-licenses`,
  `Colors.grey`).

After any text edit, re-run the overflow check below: rewritten sentences change length and can push
content out of its box.

## Design system in one paragraph

Apple-keynote minimal. Helvetica Neue throughout, Menlo for code. Whitespace and hairline rules do
the separating — no cards, no stripes, no gradients, no shadows. Near-monochrome (ink `1D1D1F`,
gray `86868B`, hairline `D2D2D7`, panel `F5F5F7`) with exactly two accents: **blue `0071E3`** for
emphasis, and **orange `F56300`** reserved for embedded topics only. Black title, divider and
closing slides. Body copy has no bullet glyphs. Every slide carries a letterspaced eyebrow label and
a one-line title that must fit at 30pt.

## QA before shipping a rebuilt deck

```bash
python3 "<pptx-skill>/scripts/office/validate.py" Mobile-and-Embedded-LectureN-v2.pptx
python3 "<pptx-skill>/scripts/office/soffice.py" --headless --convert-to pdf Mobile-and-Embedded-LectureN-v2.pptx
pdftoppm -jpeg -r 100 Mobile-and-Embedded-LectureN-v2.pdf slide
```

Then look at every rendered page for text overflow, overlap, a title that wrapped to two lines, or a
hairline running under a diagram. LibreOffice substitutes fonts slightly differently from
PowerPoint, so treat borderline text-fit as too tight.

## Fonts — and why these ones

`Arial` for everything, `Courier New` for code. Set once in `assets/template.js` (`F` and `MONO`),
and mirrored in the self-contained `lectures/build-lecture1.js`.

These are chosen for the **Linux CI that builds the PDFs**:

| Platform | Arial → | Courier New → |
|---|---|---|
| macOS / Windows | Arial (native) | Courier New (native) |
| Linux CI | Liberation Sans | Liberation Mono |

Liberation Sans and Liberation Mono are *metric-compatible* with Arial and Courier New — identical
advance widths — so a PDF built on the CI has the same line breaks and layout as one built on a Mac.
Nothing reflows.

`Deck` and `Lab` also pin the presentation **theme** fonts to Arial. This matters: numbered lists
reference the theme's major font (`+mj-lt`) for their numbers, and the pptxgenjs default is
Calibri Light, which is absent on Linux and substitutes unpredictably.

If you change these, keep the pair metric-compatible with something that exists on the CI image, and
re-run the overflow check below — a wider font silently pushes text out of its box.

### Checking for overflow after a font or layout change

Convert every deck to PDF, then flag any word that crosses the slide frame:

```bash
pdftotext -bbox deck.pdf - | \
  python3 -c "import sys,re; [print(m.group(5)) for m in \
  (re.search(r'<word xMin=\"([\d.]+)\" yMin=\"([\d.]+)\" xMax=\"([\d.]+)\" yMax=\"([\d.]+)\">(.*?)</word>', l) \
  for l in sys.stdin) if m and (float(m.group(3))>942 or float(m.group(4))>533)]"
```

A 13.33×7.5in slide is 960×540pt; 942/533 leaves a small margin. Zero output means nothing overflows.
