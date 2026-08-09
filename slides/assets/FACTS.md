# Verified facts (checked August 2026) — use these, they override the old decks

Current versions to cite if you cite any:
- **Flutter 3.44.x** (3.44 shipped at Google I/O 2026), **Dart 3.12**
- **Kotlin 2.4.0** (June 2026); Compose Multiplatform 1.11 (May 2026)

Rendering / compilation:
- Flutter's renderer is **Impeller**. It replaced Skia: iOS default since 2023, Android default
  (API 29+/Vulkan) since Flutter 3.29 (Feb 2025), and **as of Flutter 3.44 Skia is fully removed on
  iOS and Android 10+** (an OpenGL fallback remains for very old Android). Do not present Skia as current.
- Dart: **JIT in debug (hot reload), AOT-compiled to native machine code for release.** Both are true;
  do not present JIT vs AOT as a language-level dichotomy.

React Native:
- The **new architecture (JSI + Fabric, bridgeless) is the default since RN 0.76 (Oct 2024)**. The old
  serialized JSON "bridge" is gone — do not describe RN as "bridging over JSON".
- **CodePush was retired by Microsoft on 31 March 2025.** OTA JS updates still exist; the mainstream
  successor is **Expo EAS Update** (`expo-updates`).

Kotlin Multiplatform:
- **Stable since 1 Nov 2023.** **Compose Multiplatform for iOS stable since May 2025** (CMP 1.8.0).
- Production users incl. **McDonald's, Netflix, Forbes**. Mechanism: shared Kotlin module compiled
  natively per platform (Kotlin/Native on iOS); `expect`/`actual` for platform-specific pieces.

Hardware numbers (2026-typical):
- Flagship phone: **8–16 GB RAM**, 128–512 GB storage, ~5 W peak SoC draw.
- ESP32 (original): **520 KB SRAM**, ~4 MB flash on WROOM-32-class modules, milliwatt budgets.
- **TinyGo:** the original Xtensa ESP32 has minimal support (no Wi-Fi/BT). Recommend
  **ESP32-C3 / ESP32-S3 (RISC-V; Wi-Fi via the `espradio` package since TinyGo 0.41, April 2026)**
  or the **Raspberry Pi Pico (RP2040/RP2350)**, which is first-tier.

Web / PWA:
- Still true: limited sensor access, no reliable background execution (no background sync on iOS),
  WebKit-only engine on iOS caps performance.
- Apple's Feb 2024 move to disable EU home-screen web apps was **reversed** — PWAs work in the EU.
  iOS 26 opens home-screen sites as web apps by default. Safari 18.4 added Declarative Web Push.

Frames & performance:
- The "16 ms budget" is only true at 60 Hz. **Most 2026 phones run 90–120 Hz → an 8.3 ms budget
  at 120 Hz.** State it as "one frame budget = 1/refresh rate", not a fixed 16 ms.
- **Bitcode was removed by Apple in Xcode 14 (2022).** Never recommend it.
- O(N²) is **quadratic**, not "exponential".

Flutter framework correctness (frequently wrong in the old decks):
- Flutter does **not** rebuild the whole widget tree each frame — only dirty subtrees rebuild.
  Element reuse is decided by `runtimeType` then `key`.
- `StatelessWidget` does **not** "build once" — it rebuilds whenever its parent rebuilds or a
  dependency changes. It just holds no mutable state of its own.
- Isolates: **no shared mutable memory, so no data races** — but logical/ordering races are still
  possible. Do not claim "race conditions: impossible".
- Isolate count is not capped at core count; `Isolate.spawn`/`compute` schedule onto the OS.

Firebase Auth:
- **Email-enumeration protection is on by default since late 2023**: you get `invalid-credential`,
  not `user-not-found` / `wrong-password`. Never teach UX that reveals whether an account exists.
- A rule like `allow create: if request.auth != null` lets any signed-in user write under someone
  else's uid — it must compare `request.auth.uid == userId`.
- Never show passwords stored in Firestore, even as a bad example screenshot.

Packages (use current names):
- `google_generative_ai` is deprecated → **`firebase_ai`** for Gemini from Flutter.
- Analytics/Crashlytics from Flutter are **`firebase_analytics` / `firebase_crashlytics`** with Dart
  APIs — never Android/Java `Bundle`/`getInstance(this)` code in a Flutter course.
- HTTP: `http` or `dio`; JSON codegen: `json_serializable` + `build_runner`.

HTTP semantics:
- **Safe** = does not modify state (GET, HEAD, OPTIONS). **Idempotent** = repeating has the same
  effect (GET, HEAD, PUT, DELETE). PUT/DELETE are idempotent but NOT safe. Do not conflate them.
