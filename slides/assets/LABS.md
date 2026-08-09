# Lab handout guide

Read `TEMPLATE.md` first — the visual system, banned patterns, and QA requirements are identical
for labs and lectures. This file covers only what differs.

Labs use `Lab` instead of `Deck`, plus two lab-only helpers:

```js
const T = require("./template");
const d = new T.Lab({ lab: 3, title: "Widgets & UI", subtitle: "composing layouts and handling gestures" });
d.titleSlide();                       // black, "LABORATORY 3" eyebrow
T.objectivesSlide(d, objs, "Laboratory 3", "What you'll build today");
T.taskSlide(d, { n: "Task I", title: "...", intro: "...", steps: [...], hints: [...], done: [...] });
T.submissionSlide(d, { labNumber: 3 });
d.closing(cols, "Wrapping up");
```

## Deck skeleton

1. `titleSlide()`
2. `objectivesSlide(d, objs, "Laboratory N", "What you'll build today")` — 2–4 concrete capabilities
3. optional context/setup slide(s) — only where the lab needs them
4. one `taskSlide` per task (labs have 1–3 tasks)
5. optional troubleshooting slide where the session is failure-prone
6. `submissionSlide(d, { labNumber: N })` — identical wording in every lab, by design
7. `closing(cols, "Wrapping up")` — Recap / Before next lab / Read more

**Target 10–14 slides.** Labs are handouts students work from, not lectures. Do not pad.

The instructor bio slide belongs ONLY in Lab 1.

## Task rules — these fix the specific defects the reviewer found

- **One requirement per step.** The old Lab 2 merged two asks into a single line twice
  ("…showing 'Not provided' for null values Implement a method getDisplayAge()…" and
  "double balance with default value of 0.0 String? bankBranch (optional)"). Every `steps` entry
  is exactly one thing to do.
- **Never make students guess the intended API.** Old Lab 3 asked for swipe-to-delete without ever
  naming `Dismissible`. Put the widget/package/method names in `hints`. Hints are not solutions —
  they are the vocabulary needed to search effectively.
- **Say where the code goes.** Old Lab 2 never said. State the project/file explicitly, and whether
  the student starts fresh or extends the previous lab's app.
- **Reuse must be explicit.** Old Lab 4 rebuilt Lab 3's todo app without saying "reuse it".
- **`done` is the acceptance criteria** — what the student checks before submitting.
- Screenshots: ask for them only where they are genuine evidence (debugger/inspector work).
  They go in `/screenshots` in the repo — never a Word document.

## Submission — one channel

`submissionSlide()` states it: GitHub repo, branch `labN`, pull request, screenshots in
`/screenshots`. The reviewer found the evidence format drifting across labs (nothing → screenshots
→ screenshots-in-Word). Do not invent a different channel.

## Lecture ↔ lab pairing

Each lab exercises a lecture. Say so on the objectives slide ("this lab puts Lecture N to work"):

| Lab | Lecture |
|---|---|
| 1 Orientation, set-up & project | 1 — landscape, Git & GitHub |
| 2 Dart & null safety | 2 — languages, null safety, Dart |
| 3 Widgets & UI | 3 — widgets |
| 4 DevTools & debugging | 4 — debugging, state |
| 5 Serialization & networking | 5 — HTTP, codegen (and 6 — REST) |

## Content sourcing

The old handouts are extremely thin (8/4/3/2/3 slides). You are expected to **specify** the tasks
properly — the existing task text is the requirement, but it needs objectives, hints, acceptance
criteria, scaffolding and a stated starting point around it. Do not invent new assignments or
change what is being asked; make the existing ask complete and unambiguous.

Where the reviewer notes a missing prerequisite (Lab 5's difficulty jump with no scaffolding: no
pubspec snippet, no `build_runner` command), supply it — a short `codeBlock` is the right tool.
