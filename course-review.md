# Course review — Mobile and Embedded Computing (2026 revision notes)

Full-semester review of all 12 lecture decks (`lectures-pdf/`) and 5 lab handouts (`labs-pdf/`), covering content and design. Page numbers refer to the PDF exports.

---

## 1. Systemic issues (apply to nearly every deck)

### Pedagogy
- **No learning objectives, agenda, recap/summary, exercises, quizzes, or references in any of the 12 lectures or 5 labs.** Only L8 (synthesis slide) and L11/L12 sub-decks have any kind of closing slide. Adding a fixed 4-slide skeleton per deck (objectives → agenda → content → recap + further reading) is the single highest-leverage structural fix.
- **No slide numbers anywhere**, and no course name / lecture number / author / date on title slides. Students can't cite slides when asking questions.
- **Code is almost always screenshots** (JetBrains light theme with visible lint warnings, "You, moments ago" VCS annotations, autocomplete ghosts) — not searchable, not scalable, frequently clipped at the edges (L2 p11, L3 p25, L4 p18, L6 p5–6). Several lectures have **zero code at all** despite hands-on topics: L5 (HTTP libraries + codegen!), L9 (AI), L10 (offline-first), L12 deck A (gRPC — no .proto example).
- **The course title says "Embedded" but there is zero embedded content** in any lecture or lab — no sensors, GPIO, BLE, RTOS, MQTT, power management, or even mobile sensor APIs.

### Production/design
- **Template chaos.** Nearly every deck mixes 3+ PowerPoint Designer themes; L10–L12 are visibly 2–3 independently generated (Gamma-style) decks concatenated per file, with clashing templates and duplicated content (CAP theorem twice in L10; the three trees, Skia/Impeller, and const advice each twice in L11; "Executive Summary" title twice in L10).
- **AI-generation residue left in deliverables:**
  - Citation chips pasted as text: "Google Cloud+1", "AWS Documentation+1" (L5 p8)
  - Unrendered Markdown: literal `*emphasis*` and `` `backticks` `` (L6 p22, L8 p11/13/14, L9 p5/8/9)
  - Raw LaTeX on slides: `($W \oplus X$)` (L11 p18, p26), `$O(N)$` (L11 pp28/30/31/35)
  - Dropped math symbols leaving empty "( )" (L10 p21, p25, p28)
  - "(Not specified)" placeholder text in a table (L11 p3)
  - "600 × 400" image-placeholder watermark behind the title (L9 p1)
  - SmartArt auto-labels that read as nonsense: "Move / Start / Prefer / Time" (L5 p8–9)
- **Image licensing/hygiene problems:**
  - Watermarked stock images: pngtree (L10 p11), depositphotos with visible image ID (L11 p34)
  - Naruto/Kurama fan art — trademarked characters (L2 p20, p22)
  - A lifted slide from Sun Yat-sen University, unattributed (L10 p22)
  - AI images with garbled baked-in text: "Thead" (L1 p14), "IncremenEvent"/"buton" (L4 p19), "Backgrround Work" (L3 p49), "Old Generatıon" (L2 p14)
  - Virtually no image attribution anywhere; several decorative stock photos with no informational value (L5 p10/19/20/21/23/24/25, L8 p7)
- **Mid-word title wraps** from narrow title placeholders: "State manageme nt" (L4 p9), "Serverles s benefits" (L5 p5), "Prompt Engineeri ng" (L3 p8–9), "Multithreadin g" (L3 p41), and ~10 more.
- **Overlapping/clipped text:** L12 p16/17/22 (title and subtitle printed on top of each other), L12 p12 and L11 p35 (bullets collide), L11 p22 (clipped mid-word at slide edge), L2 p10 (title clipped by screenshot), L2 p22 (sentence truncated mid-thought).
- **Half-empty slides missing their asset:** L10 p7 and p10 (entire right half blank), L9 p5–6 (text crammed left, right half empty), L8 p11 (empty code box — see below).

---

## 2. Factual errors and outdated content (fix before next delivery)

### Lecture 1 — Orientation; Platforms & Technology
- p9: repo URL malformed — "https://rusudinu/mobile-and-embedded-computing" (missing github.com).
- p16: LLM-loading flowchart — both decision boxes say "Load model in VRAM"; one should be RAM. Dangling sentence "the operating system will do the following".
- p22: "TTCP" is not the acronym for Time to First Contentful Paint (FCP).
- p24: Create React App given as the CSR example — deprecated/sunset in 2025. p22–23 use legacy Next.js Pages Router APIs (getServerSideProps/getStaticProps).
- Git section (p7–12) has no commands, no clone/commit/push workflow, despite git being mandatory for the project.

### Lecture 2 — Languages & Flutter Intro
- p6: "Compiled languages tend to be about 100 times faster than interpreted" — unsourced and wrong as a blanket claim; the deck itself later teaches JIT (p18), which contradicts the dichotomy.
- p7: conflates compile-time type errors with security vulnerabilities.
- p13–17: GC internals (remembered sets, write barriers) very deep for week 2 while **basic Dart syntax is never taught in any lecture**.
- p21: Google Trends screenshot ends April 2024 — stale.
- p30: lifecycle diagram typo "didChangeDepedencies()" (third-party image).
- p20/p22: Naruto fan art (IP problem); p22 sentence truncated.

### Lecture 3 — AI-assisted coding; Widgets; Async
- p16: StatefulWidget example class is named `StatelessText` — will actively confuse.
- p43: "16ms rule" presented as invariant; most 2026 phones are 90–120 Hz (8.3ms budget).
- p58: "Race Conditions: Impossible" for isolates — data races yes, logical/message-ordering races no.
- p60: "4 cores ⇒ max 4 isolates" oversimplified rule.
- p49–61: isolates section has **zero code** (no compute()/Isolate.spawn example); async error handling (try/catch with await) absent entirely.
- p22: typo "complex Uis".
- Positive: the AI-tools landscape (p3) is genuinely current.

### Lecture 4 — Debugging; State Management Intro; Equatable
- p13: "Flutter builds a Widget Tree each frame" — only dirty widgets rebuild; comparison is by runtimeType then key.
- p14: "StatelessWidget … builds once" — wrong; rebuilds with parent. "Buttons" as the canonical StatefulWidget example is off.
- p23: Equatable code comment says the **opposite** of the (correct) prose — "Flutter won't know that the state has changed" should be "Flutter will think the state changed".
- p24: Riverpod recommended in best practices but never introduced; Provider/InheritedWidget skipped entirely.
- p19: AI diagram typos "IncremenEvent", "'i' buton".

### Lecture 5 — Server vs Client; Serverless; HTTP; Codegen
- p8: ChatGPT citation chips ("Google Cloud+1") pasted as slide text.
- p13: conflates HTTP "safe" with "idempotent" (GET/HEAD are safe; PUT/DELETE are idempotent but not safe).
- Zero code in an HTTP + codegen lecture: no dio/http snippet, no @JsonSerializable example.
- p14: "jitter" chart shows smooth staircases, not randomness; p17 hedging diagram contradicts its own text (red X on the winning request).
- p19–21: "Firebase in Flutter" contains nothing Flutter-specific (no flutterfire, no package names).

### Lecture 6 — Packages; Feature Flags; GraphQL/REST; Observability
- **p25, p27: code is Java/Android (Bundle, getInstance(this), Gradle), not Flutter/Dart** — should be `firebase_analytics`/`firebase_crashlytics` Dart APIs. Biggest content mismatch in the deck.
- Feature flags section never names a tool (Firebase Remote Config is covered 12 slides later and never connected).
- GraphQL section has no query/mutation example and no Flutter client (graphql_flutter/ferry).
- p31–38: eight consecutive uncaptioned production-dashboard screenshots at 8–10px effective text size — great authentic material, but needs zoom-crops, callouts, and one takeaway per slide.

### Lecture 7 — Firebase Auth, OAuth, App Check
- **p9: outdated + anti-pattern.** Firebase's email-enumeration protection (default since late 2023) means `user-not-found`/`wrong-password` no longer surface — it's `invalid-credential` now. The suggested UX messages ("No user found for that email") teach account enumeration in a security lecture.
- **p12: screenshot shows a plaintext `Password: 'qwerty'` field stored in Firestore** — models exactly the anti-pattern the lecture warns against. Replace the (borrowed, blurry) screenshot.
- **p13: the security rule `allow create: if request.auth != null` lets any signed-in user create a doc under someone else's uid** — needs `request.auth.uid == userId`.
- p15: OAuth diagram (server-side, Cloud Functions) contradicts the text (client-side google_sign_in); heading says "Two-Step" above a 4-step list.
- App Check section stops at debug tokens — never shows activate()/enforcement.
- Nearly no Dart code; missing: password reset, email verification, sign-out, account linking, MFA/biometrics.

### Lecture 8 — WebSockets, Permissions, Routing
- **p11: the AndroidManifest code box is empty** (angle brackets eaten by HTML escaping) and the Info.plist box lost its tags — students cannot see the actual manifest entries.
- p7–8: `WebSocketChannel.connect(...)` is never shown — listening and sending are, but not connecting.
- Missing: reconnection/backoff, heartbeats, wss://, background-lifecycle behavior; no MQTT/SSE mention (relevant to "embedded").
- p12: permission states omit `isLimited`/`isProvisional`; no Android 13+ granular permissions.
- Routing section is current and good; missing go_router `redirect` guards (natural bridge to L7's auth gate).

### Lecture 9 — AI in Flutter (weakest deck)
- p1: leftover "600 × 400" placeholder watermark on the title slide.
- p6: "as of mid-2024" device availability claim — dates the deck badly.
- p8: package name wrong — was `google_generative_ai` (not `generative_ai`), and it's since deprecated in favor of `firebase_ai`, which would strengthen the slide's own argument if stated.
- p2: unsourced "$826 billion by 2030" stat.
- Only 12 slides, one code snippet (the insecure one), no TensorFlow Lite/LiteRT, broken half-empty layouts (p5–6), different template from the rest of the course.

### Lecture 10 — Offline-First + CRDTs
- Two concatenated decks: CAP taught twice (p4, p19), LWW twice (p14, p20), tombstones twice (p10, p26–27).
- p20: clock-skew figure is a **digital-circuit** clock-skew diagram (CLKA/CLKB waveforms) — wrong domain for distributed wall-clock skew.
- p21/p25/p28: math symbols dropped — empty "( )" where formulas should be; δ glyph collides with "delta".
- p7, p10: right half of slide completely empty (missing asset).
- Zero Dart/SQL code (no Drift schema, no outbox example) despite referencing watch()/isDirty.

### Lecture 11 — Performance & Energy; JIT vs AOT; Tree Mutations
- Three concatenated decks; three trees, Skia/Impeller, and const advice each taught twice.
- **p26: recommends Bitcode (iOS) — removed by Apple in Xcode 14 (2022).** Typo "sandbosed".
- p38: O(N²) described as "Exponential" — wrong terminology on a complexity slide.
- p18/p26: raw `($W \oplus X$)` LaTeX on slides.
- p3: "(Not specified)" placeholder cells; p25/p5: unsourced benchmark stats.
- p23: RN "JSI: New interface" — default since RN 0.76 (2024).
- p13: fix for expensive Opacity given as "FadeInImage" — off-target (AnimatedOpacity / avoiding saveLayer).
- p34: depositphotos-watermarked, irrelevant image; p35 overlapping text; p17 dark-on-dark labels near-invisible.

### Lecture 12 — gRPC; IPC & FFI
- **p27 vs p28: platform-channel latency contradiction — table says ~0.5–2.0 ms; chart says ~2000 ns (0.002 ms). Three orders of magnitude apart.**
- p5 vs p14: payload-size claims conflict ("3–10x smaller" vs "30–50% smaller").
- p12: gRPC call types incomplete — unary and client-streaming missing.
- No .proto example, no generated stub, no Dart snippet in the entire gRPC deck.
- No HTTP/3/QUIC mention (undercuts the radio-tail/handshake argument); no gRPC-Web/Connect; no iOS background-session caveat.
- p16/p17/p22: three broken title slides (subtitle printed over the title, "Architecturesin Flutter" missing space).
- p20/p24: broken sentences with missing nouns ("sending a Dart results in…", "Apple's is highly optimized").
- Deck B's "Channels for Control / FFI for Compute" takeaway is genuinely good — keep it.

---

## 3. Labs

### Biggest issue: project/lab mismatch
The graded project **requires** BLoC, real auth (Firebase/Keycloak), persistence + offline-first, cross-device sync, and WebSockets — **none of which any lab teaches.** Labs cover: setup → Dart null safety → UI composition → DevTools → serialization/networking. Either add labs 6–9 (BLoC, persistence/offline, auth, WebSockets) or reduce project requirements.

### Per-lab
- **Lab 1:** only lab with grading info; no troubleshooting for the most failure-prone session (emulator setup); Teams/Google-Sheet links not in the PDF; URL broken across lines (p8).
- **Lab 2:** two formatting collapses — Task I item 3 merges two requirements; Task II item 1 merges `balance` and `bankBranch` into one bullet. No statement of where code should live.
- **Lab 3:** typo "StatlessWidget" (p2); reference screenshot is Romanian + third-party branded with no asset pack; Task II names no widget (Dismissible) — no hints at all.
- **Lab 4:** typo "out-of-bouds" (p2); heavily overlaps Lab 3's todo app without saying "reuse it"; no DevTools launch/attach instructions; thinnest lab (likely under-fills a session).
- **Lab 5:** **title slide reads just "Laboratory 5." — topic name missing.** Best-specified lab otherwise; big difficulty jump (codegen + backoff + jitter) with zero scaffolding (no pubspec snippet, no build_runner command). "Word document" submission format inconsistent with other labs.

### As a set
- No learning objectives, no submission destination/deadline, evidence format drifts (nothing → screenshots → screenshots-in-Word). Prefer the project GitHub repo as the single submission channel.
- Formatting drifts: hyphen vs en-dash task titles, backticks only in Lab 5, ➤ bullets only in Lab 1.
- Zero embedded-side labs.

---

## 4. Recommended structural changes for next year

1. **One master template.** Rebuild all decks on a single theme (title/section/content/code layouts, slide numbers, footer with course + lecture number). Fixes ~40% of all issues found in one stroke.
2. **Code as text, not screenshots.** Use a highlighter (e.g. carbon-style export at fixed scale, or PowerPoint code blocks) and give every hands-on lecture at least one complete, runnable snippet. Priority: L5, L7, L9, L10, L12.
3. **De-duplicate L10–L12** (CAP ×2, three trees ×2, Skia/Impeller ×2, const ×2) and merge each file's sub-decks into one coherent narrative. The saved time funds the new KMP/Go sections.
4. **Rebalance:** L3 (61 slides) → split widgets vs concurrency; L9 (12 slides) → expand or merge into another deck.
5. **Teach what the project grades:** either add BLoC/persistence/auth/WebSockets labs, or move lectures 7–10 earlier so they precede the project milestones.
6. **Add the pedagogical skeleton** to every deck: objectives, agenda, recap, 2–3 self-check questions, references/further reading.
7. **Image pass:** remove watermarked/fan-art/lifted images, attribute the rest, regenerate AI diagrams with garbled text, replace decorative stock photos with diagrams or nothing.
8. **Address "Embedded" in the title:** either add a real embedded module (see Go/TinyGo below, plus sensors/BLE/MQTT from Flutter) or rename expectations in Lecture 1.

---

## 5. Kotlin Multiplatform & Go — proposed placement

### Kotlin Multiplatform (~1 lecture-hour total, split)
- **L1 (platform taxonomy, p17–20):** extend the cross-platform slide into a 3-way comparison of strategies — Flutter (own renderer draws every pixel), React Native (bridges to native widgets), **KMP (shared Kotlin business logic compiled natively per platform + optional Compose Multiplatform UI)**. KMP has been stable since late 2023 and Compose Multiplatform for iOS stable since 2025, so it's a legitimate third pillar, not a curiosity.
- **L2 (languages):** Dart vs Kotlin side-by-side (null safety maps 1:1 — reuse the existing null-safety section); Kotlin/Native fits perfectly into the JIT/AOT compilation-spectrum story you already tell in L2/L11.
- **New ~30-min section (L11 or a dedicated half-lecture):** "share logic, not UI" architecture — expect/actual, a shared KMP module consumed by an Android and an iOS app; contrast with Flutter's platform channels/FFI from L12. A small demo repo (shared networking + models module) mirrors what students already do in Flutter and makes the trade-offs concrete.
- Optional exam-ready framing: "when would you pick Flutter vs KMP?" — team skills, UI fidelity needs, existing native codebase.

### Go (~1 lecture-hour total, split)
- **L12 (gRPC) is the natural home.** The gRPC deck currently has no code at all; a Go gRPC server + generated Dart client is the canonical pairing and fixes two gaps at once (missing .proto/stub example, missing server-side perspective). ~20 min: .proto → `protoc` → Go server (20 lines) → Dart client call.
- **L3 (concurrency):** goroutines/channels vs Dart isolates is a great compare-and-contrast — Go's shared-memory-with-channels model vs Dart's no-shared-memory message passing. One slide each: same producer/consumer in both.
- **L5 (serverless vs VPS):** Go as the deploy-a-tiny-binary backend story (single static binary, fast cold starts on Cloud Run) — directly strengthens the existing serverless section.
- **TinyGo as the embedded hook (recommended):** a short TinyGo-on-microcontroller (or WASM) section — blink an LED / read a sensor, publish over MQTT, consume in the Flutter app — is the cheapest credible way to finally put "Embedded" in the course. Even one lecture + one optional lab (ESP32 or simulator) closes the course's biggest title-vs-content gap and gives Go a purpose beyond "another language".

### Making room
The KMP + Go additions total roughly 2 lecture-hours. That budget is fully recoverable from: de-duplicating L10/L11 repeats (~1 hour) and tightening L1's rendering-strategies tail + L9's thin deck (~1 hour).
