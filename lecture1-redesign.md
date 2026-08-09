# Lecture 1 redesign — from "web overview" to "the mobile & embedded landscape"

**Problem:** 6 of the 19 content slides (Web App p17, PWA p18, SSR/SSG/CSR p21–24) teach web-app
architecture, and the Course Topics slide advertises "Overview of SSR, SSG, CSR" as topic 1.
Meanwhile the deck never defines what mobile/embedded computing *is* or why it's different.
Lecture 1 should sell the course's actual identity: constrained devices, batteries, sensors,
app stores — and set up the KMP/Go/TinyGo additions planned for next year.

**Approach:** keep the orientation half (it works), compress git, cut the web tail, and replace
it with a "device landscape → how do you build for it → why Flutter → semester roadmap" arc.
Net size stays ~24–26 slides.

---

## Part A — Course orientation (slides 1–6, mostly keep)

### 1. Title — KEEP, fix metadata
Add: course code, academic year, lecturer name, "Lecture 1/12". (Currently no metadata on any title slide.)

### 2. Instructor bio — KEEP as is.

### 3. Course Topics — REWRITE (this slide currently promises the web content)
New list, reflecting the redesign + planned additions:

1. The mobile & embedded landscape; native vs cross-platform; Git & GitHub
2. Compiled vs interpreted languages, null safety, Dart & Kotlin, Flutter intro
3. Agent-assisted coding; async vs threads (Dart isolates vs Go goroutines); Flutter widgets
4. Stateless vs Stateful; state management introduction
5. Server vs client-side execution; serverless vs VPS (+ Go backends, http & Firebase)
6. GraphQL & REST; observability for mobile (events, Crashlytics)
7. WebSockets, permissions & routing
8. State management techniques, BLoC pattern
9. Authentication, OAuth providers, Firebase App Check
10. AI on-device & connecting to LLMs
11. Deploy to stores & CI/CD; Kotlin Multiplatform — sharing logic across platforms
12. Performance & energy; embedded computing with TinyGo (sensors → MQTT → your app)

*(Adjust numbering to wherever KMP/Go actually land — the point is topic 1 no longer says SSR/SSG/CSR.)*

### 4. Grading — KEEP as is.

### 5. Concept presentation details — KEEP; fix "~20minutes" → "~20 minutes", add space after "➤".

### 6. NEW: Learning objectives for today
- Understand the spectrum of devices this course targets and their constraints
- Know the four strategies for building mobile apps and their trade-offs
- Understand why this course uses Flutter (and what it costs you)
- Have a working GitHub account and know the PR workflow the project requires

---

## Part B — Git & GitHub (slides 7–11, compress 7 → 5 and make it practical)

The project grades PRs, branches, reviews, and per-student commits — but the current deck has
zero commands. Compress the concept slides and add one hands-on slide.

- **7. Git & hosting services** — merge current p7+p8 into one slide (logo image + "what git is" bullets).
- **8. GitHub account + course repo** — KEEP p9 but **fix the broken URL**:
  `https://github.com/rusudinu/mobile-and-embedded-computing` (currently missing github.com).
- **9. Repos & branches** — merge current p10+p11.
- **10. NEW: The workflow you'll actually use** (code block, real commands):
  ```
  git clone <repo>          # once
  git checkout -b feature/login-screen
  git add .  &&  git commit -m "Add login screen"
  git push -u origin feature/login-screen
  # open Pull Request on GitHub → review → merge
  git checkout main && git pull
  ```
  Speaker note: this exact loop is what the project grades (branches, PRs, reviews).
- **11. Pull requests & CI** — merge current p12 (PR approval flow) + p13 (CI pipeline diagram).
  Keep the CI diagram — it foreshadows the deploy/CI-CD lecture. Fix "until he receives" → "until they receive".

---

## Part C — The device landscape (slides 12–15, NEW — this is the course-identity section)

### 12. NEW: What is "mobile and embedded computing"? (the spectrum slide)
One horizontal spectrum diagram, cloud → microcontroller, with orders of magnitude:

| | Cloud server | Laptop | **Phone** | **Wearable** | **SBC (Raspberry Pi)** | **MCU (ESP32)** |
|---|---|---|---|---|---|---|
| RAM | 100s GB | 16–32 GB | 6–12 GB | 1–2 GB | 1–8 GB | **~0.5 MB** |
| Storage | TB–PB | ~1 TB | 128–512 GB | 32 GB | SD card | ~4 MB flash |
| Power | grid, kW | 60 W | **~5 W, battery** | ~1 W | ~5 W | **milliwatts** |
| OS | Linux | macOS/Win | Android/iOS | watchOS/Wear | Linux | RTOS / bare metal |

Takeaway line: *this course lives on the right half of this table — where resources are scarce
and the power cable is gone.*
(This slide alone justifies the course title; it currently has no equivalent.)

### 13. NEW: What makes mobile/embedded different from desktop/web
- **Battery is a first-class resource** — every CPU cycle and radio wake-up costs energy (→ Lecture on performance & energy)
- **Thermal limits** — sustained performance throttles; you can't just "use more CPU"
- **Intermittent connectivity** — offline is a normal state, not an error (→ offline-first lecture)
- **You don't control deployment** — app store review, staged rollouts, users who never update
- **Sensors & radios** — GPS, accelerometer, camera, BLE: capabilities desktops don't have
- **ARM everywhere** — from phones to microcontrollers

### 14. Device resources — KEEP current p14+p15, with fixes
- Keep the resources content (CPU/RAM/SSD/GPU/battery); it fits this section perfectly now.
- Regenerate the p14 AI image (it contains the garbled label "Thead") or replace with a simple diagram.

### 15. Resource allocation for LLMs — KEEP p16 but FIX the flowchart
- The fallback box must say "Load model in **RAM**" (both boxes currently say VRAM).
- Complete the dangling sentence: "…the operating system will do the following **to find memory for the weights:**"
- "LLMS" → "LLMs".
- Reframe takeaway: *on-device AI is a resource-allocation problem — remember this table when we
  do the AI lecture.* (Turns an out-of-place slide into a forward reference.)

---

## Part D — How do you build for these devices? (slides 16–21, replaces the web tail)

### 16. NEW section divider: "Four ways to build a mobile app"

### 17. Native apps — KEEP current p20, expand slightly
- Keep existing bullets (Swift/Xcode, Kotlin/Android Studio, best performance, native components).
- Add one line: *everything else on the next slides is ultimately built on top of these platform SDKs.*

### 18. NEW: The web option (absorbs current p17+p18 into ONE slide)
- Web apps & PWAs: run in the browser, no install / installable with offline support, instant updates, no store review
- Trade-offs: no full sensor access, browser performance ceiling, no reliable background execution
- One closing line: *web apps have their own architecture zoo (SSR/SSG/CSR) — that's a web-course
  topic; here we only care how the web option compares to the alternatives on the next slide.*
- **CUT: current p21, p22, p23, p24 (SSR/SSG/CSR diagram + 3 slides) entirely.**

### 19. NEW: Cross-platform, strategy 1 & 2 — bridge vs own renderer
Two-column architecture mini-diagrams:
- **React Native** — JS logic, **bridges to real native widgets**; UI is genuinely native, but every
  interaction crosses a boundary (JSI); parts of the app can update over-the-air
- **Flutter** — Dart compiled AOT, **draws every pixel itself** (Impeller); identical UI on both
  platforms, one rendering pipeline; talks to the OS via platform channels (→ IPC/FFI lecture)

### 20. NEW: Cross-platform, strategy 3 — Kotlin Multiplatform (the planned KMP hook)
- **Share the logic, keep the UI native**: business logic, networking, storage in a common Kotlin
  module; each platform keeps its Swift UI / Compose UI (or shares that too with Compose Multiplatform)
- expect/actual for platform-specific code
- Stable since 2023 (Compose Multiplatform on iOS stable since 2025); used by McDonald's, Netflix, Forbes
- One-line contrast: *Flutter shares everything including pixels; KMP shares as much or as little as you choose*
- Forward reference: "we'll build a shared KMP module later in the semester"

### 21. NEW: How to choose + why this course uses Flutter
Decision table (team skills, UI fidelity, performance, existing native codebase, code sharing goal),
then the honest pitch:
- One codebase → the semester project is buildable by a team of 3
- Hot reload → fast lab iteration
- Single renderer → what you build in the emulator is what you ship
- Instructor's production experience: 45+ apps, 400k installs
- Trade-offs stated up front: bigger binaries than native, platform-channel overhead (→ Lecture 12), Dart is course-specific knowledge

---

## Part E — Roadmap & close (slides 22–24, NEW)

### 22. NEW: Where does "embedded" fit? (teaser for the planned Go/TinyGo addition)
- The same constraints (battery, RAM, connectivity) taken to the extreme: microcontrollers
- The phone as the hub: BLE/MQTT sensors → phone app → cloud
- What we'll do: a TinyGo program on an ESP32 (or simulator) publishing sensor data your Flutter app consumes
- *(If the embedded module isn't added next year, replace with an honest one-liner about scope:
  "this course focuses on the mobile side of the spectrum" — better than silently ignoring the title.)*

### 23. NEW: Semester roadmap
The spectrum diagram from slide 12 again, with lecture numbers pinned onto it
(UI/state → networking/backends → auth → AI → offline/sync → performance → gRPC/FFI → KMP → embedded).
Gives students a mental map they'll see again at the start of each lecture.

### 24. NEW: Recap + this week's tasks + references
- 3 recap bullets (spectrum, four strategies, why Flutter)
- Tasks: create GitHub account, install Flutter (→ Lab 1), think about project ideas
- References: flutter.dev/multi-platform, kotlinlang.org/lp/multiplatform, developer.android.com, developer.apple.com

---

## Summary of the diff

| Action | Slides |
|---|---|
| Keep unchanged | p1*, p2, p4, p5, p10–p13 (merged), p20 |
| Keep with fixes | p3 (rewrite list), p9 (URL), p14 ("Thead" image), p16 (VRAM→RAM, dangling sentence) |
| Merge/compress | p7+p8 → 1 slide; p10+p11 → 1 slide; p12+p13 → 1 slide; p17+p18 → 1 slide |
| **Cut** | **p21, p22, p23, p24 (SSR/SSG/CSR)** |
| New | objectives, git-commands, spectrum table, mobile-vs-desktop constraints, section divider, RN-vs-Flutter architectures, KMP, how-to-choose/why-Flutter, embedded teaser, roadmap, recap |

Fixes also bundled in: broken repo URL (p9), TTCP acronym (was p22 — slide now cut), CRA example
(was p24 — cut), "until he receives" (p12), "~20minutes" (p5).

*p1 = add course/lecture metadata.
