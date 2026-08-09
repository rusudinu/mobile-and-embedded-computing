# Copy edit pass: plain language, no em-dashes, American English

This is a **text-only** pass over the deck generators. Do not change slide structure, layout,
code semantics, technical facts, or numbers. Only change how sentences are worded and punctuated.

## 1. Remove every em-dash

The character `—` (U+2014) must not appear anywhere in a generator. There are about 1000 of them.
Rewrite each one; never swap in a hyphen or an en-dash as a lazy substitute.

| The dash is doing this | Replace with |
|---|---|
| introducing an explanation or definition | a colon |
| joining two complete sentences | a period, and start a new sentence |
| a parenthetical aside (paired dashes) | commas, or parentheses |
| introducing a list | a colon |
| trailing afterthought that adds nothing | delete the afterthought |

Examples:

- `"Impeller draws the entire UI — no per-platform widgets"` → `"Impeller draws the entire UI, so there are no per-platform widgets"`
- `"Offline is a normal state — not an error"` → `"Offline is a normal state, not an error"`
- `"One codebase — a team of 3 can build the project"` → `"One codebase: a team of 3 can build the project"`
- `"It rebuilds — always — with its parent"` → `"It always rebuilds with its parent"`

**Leave alone:** the en-dash `–` inside numeric ranges (`8–16 GB`, `128–512 GB`), arrows `→`,
hyphens in compound words (`offline-first`, `cross-platform`), and the middot `·`.

## 2. Remove the drama

The writing should read as calm technical prose written for engineers. Cut rhetorical effect,
keep every piece of information. Specifically remove or rewrite:

- **Consequence inflation and fear.** "A lost set-up is a lost week." "A student who buys the wrong
  board loses a week." "This will bite you." State the fact instead: "Check the supported boards
  before ordering."
- **Slogans and rhetorical triples**, especially as titles. Real example to fix:
  `divider("The semester project", "1.5 points, three people, one repository", ...)` should become a
  plain title such as `"The semester project"` with a descriptive subtitle.
- **Emphatic one-word sentences.** "Ever." "Never." "Always." Fold the emphasis into the sentence.
- **Rhetorical questions used for effect.** A plain question as a slide title is fine when the slide
  answers it directly; a question asked for suspense is not.
- **Anthropomorphism and metaphor flourishes.** "When the layout fights back", "flutter doctor is
  unhappy", "a very fast junior who never says I don't know". Say what actually happens.
- **Narrative or scene setting.** "A Tuesday afternoon, four minutes after a 10% rollout."
- **Unsourced superlatives.** "The fastest way to drain a battery", "the biggest mistake you can
  make". Either give the number or drop the claim.
- **Second-person scolding.** "You should not vibe code stuff you can't explain" is fine as a rule;
  "do not embarrass yourself" is not.

If a takeaway line is pure rhetoric with no information in it, delete the line rather than rewriting
it. If it carries a real point, keep the point and say it plainly.

**Do not flatten precision.** Statements like "Rules run on Google's servers, so they cannot be
bypassed" or "`--delete-conflicting-outputs` is not optional" are factual and stay. The target is
theatre, not directness.

## 3. One specific deletion

In `labs/build-lab1.js`, delete this takeaway entirely (both the bold and the trailing half):

> "None of these five is practiced in a laboratory. They are taught in the lectures named above, so read ahead."

The lecture tags in that slide's right-hand column already carry the information.

## 4. American English everywhere

Convert British spellings in **prose, headings, hints, takeaways and speaker notes**:

`practised → practiced` · `practise → practice` · `optimisation → optimization` ·
`behaviour → behavior` · `labelled → labeled` · `colour → color` · `normalised → normalized` ·
`licence → license` · `analyse → analyze` · `analyser → analyzer` · `uninitialised → uninitialized` ·
`rasterisation → rasterization` · `virtualisation → virtualization` · `synchronised → synchronized` ·
`summarising → summarizing` · `specialised → specialized` · `travelling → traveling` ·
`grey → gray` · `centre → center` · `whilst → while` · `amongst → among` · `learnt → learned` ·
`artefact → artifact` · `programme → program` · `-ise/-isation → -ize/-ization` generally.

**Never change these**, even though they look British:

- Anything inside a code block that is an identifier, package name, API or command. In particular
  `flutter doctor --android-licenses` is the real command and stays exactly as written.
- Flutter/Dart API names that use British spelling, e.g. `Colors.grey`, `CupertinoColors.systemGrey`.
- Proper nouns and quoted product names.

When in doubt about a token inside a `codeBlock`, leave it alone.

## 5. Rebuild and re-verify

Text length changes can push content out of its box, so after editing each deck:

```bash
node build-lectureN.js                    # or build-labN.js
python3 "<pptx>/scripts/office/validate.py" <output>.pptx
python3 "<pptx>/scripts/office/soffice.py" --headless --convert-to pdf <output>.pptx
```

Then check for overflow on every slide of the deck:

```bash
pdftotext -bbox <output>.pdf - | python3 -c "
import sys,re
for l in sys.stdin:
    m=re.search(r'<word xMin=\"([\d.]+)\" yMin=\"([\d.]+)\" xMax=\"([\d.]+)\" yMax=\"([\d.]+)\">(.*?)</word>',l)
    if m and (float(m.group(3))>942 or float(m.group(4))>533): print(m.group(5), m.group(3), m.group(4))
"
```

Zero output means nothing overflows. Also confirm no slide title wrapped to a second line: titles
must fit one line at 30pt (roughly 52 characters). If a rewrite made a title longer, shorten it.

Finally, confirm your files are clean:

```bash
grep -c '—' <your files>          # must be 0
```
