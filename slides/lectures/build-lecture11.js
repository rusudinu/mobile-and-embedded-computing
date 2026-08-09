// ============================================================================
// Mobile & Embedded Computing, Lecture 11
// "Performance & Energy": rendering, compilation and energy, from phones to MCUs.
// Built on the shared template (template.js). Do not restyle.
// ============================================================================
const path = require("path");
const T = require("../assets/template");
const { Deck, C, F, MONO } = T;

const d = new Deck({
  lecture: 11,
  title: "Performance & Energy",
  subtitle: "rendering, compilation and energy, from phones to microcontrollers",
});

// ---------------------------------------------------------------- 1 TITLE ---
d.titleSlide();

// ------------------------------------------------------------------ 2 BIO ---
T.bioSlide(d);

// ----------------------------------------------------------- 3 OBJECTIVES ---
T.objectivesSlide(d, [
  ["gauge", "A frame, accounted for", "The frame budget as 1 ÷ refresh rate, the three trees, and what each mutation actually costs"],
  ["code", "JIT and AOT as build modes", "Why debug is JIT and release is AOT, on Dart and on ART, and why iOS has no choice"],
  ["battery", "Energy as a design input", "Screen, CPU and radio, and why the radio's tail decides your battery rating"],
  ["cpu", "TinyGo on bare metal", "The same lecture on a microcontroller: sensor → MQTT → your Flutter app, on milliwatts"],
]);

// ============================================================================
// PART 1: RENDERING & FRAMES
// ============================================================================
d.divider(
  "Part 1 · Rendering",
  "Where a frame goes",
  "The budget, the three trees, and the operations that exceed it"
);

// ------------------------------------------------------- 5 WHAT WE MEAN -----
{
  const s = d.content("Performance", "Two different things we call “performance”");
  T.lines(s, [
    { text: "Speed: how fast the app answers.", options: { bold: true, color: C.INK } },
    "Startup latency, scroll smoothness, the delay between a tap and something moving. The user feels this directly, in milliseconds.",
    { text: "Efficiency: what the app costs to run.", options: { bold: true, color: C.INK } },
    "Memory footprint, install size, and energy. The user feels this indirectly, as a hot phone and a flat battery.",
  ], { x: 0.9, y: 1.88, w: 11.53, h: 1.55, fontSize: 13, paraSpaceAfter: 8 });

  s.addText("Startup is the metric with a published bar", {
    x: 0.9, y: 3.45, w: 11.53, h: 0.32, fontFace: F, fontSize: 12.5, bold: true, color: C.GRAY, margin: 0,
  });
  T.table(s, ["What the system already has in memory", "Android vitals flags it above"], [
    ["Cold", "nothing: process created, runtime initialized, first frame drawn", "5 s"],
    ["Warm", "the process, but the screen is rebuilt from scratch", "2 s"],
    ["Hot", "process and UI both alive, just brought to the foreground", "1.5 s"],
  ], { y: 3.85, rowH: 0.5, labelW: 1.3, fontSize: 11.5 });
  T.takeaway(s,
    "Measure the one your users are actually hitting.",
    "Cold start is what a store reviewer sees; hot start is what a daily user sees ten times a day.",
    5.95);
  s.addNotes("The thresholds above are Android vitals' bad-behavior thresholds: they are what Google Play flags, not engineering targets. Do not quote a 'good' number you cannot source; measure your own app and track the trend instead.");
}

// ------------------------------------------------------- 6 FRAME BUDGET -----
{
  const s = d.content("Rendering", "The frame budget is 1 ÷ refresh rate");
  T.lines(s, [
    "A frame budget is not a constant. It is one divided by the display's refresh rate, and that rate has been climbing for a decade.",
    { text: "The old “16 ms” is a 60 Hz number. Most phones you will ship to in 2026 run 90 or 120 Hz.", options: { bold: true, color: C.INK } },
    "At 120 Hz you have 8.3 ms to run build, layout, paint and rasterization. Miss it and the compositor shows the previous frame again, which is jank.",
    "And jank is variance, not average. A steady 30 fps feels smoother than 55 fps with occasional 100 ms spikes, because the eye tracks rhythm, not throughput.",
  ], { x: 0.9, y: 1.9, w: 7.1, h: 3.5, fontSize: 13, paraSpaceAfter: 12 });

  const rates = [["60 Hz", "16.7 ms"], ["90 Hz", "11.1 ms"], ["120 Hz", "8.3 ms"]];
  T.panel(s, 8.5, 1.95, 3.93, 2.75);
  s.addText("One frame, in milliseconds", { x: 8.85, y: 2.2, w: 3.3, h: 0.3, fontFace: F, fontSize: 11.5, bold: true, color: C.GRAY, margin: 0 });
  let ry = 2.6;
  rates.forEach(([hz, ms], i) => {
    s.addText(hz, { x: 8.85, y: ry, w: 1.4, h: 0.42, fontFace: F, fontSize: 14, color: C.GRAY, valign: "middle", margin: 0 });
    s.addText(ms, {
      x: 10.25, y: ry, w: 1.9, h: 0.42, fontFace: F, fontSize: 17,
      bold: i === 2, color: i === 2 ? C.BLUE : C.INK, align: "right", valign: "middle", margin: 0,
    });
    ry += 0.62;
    if (i < rates.length - 1) T.hline(s, 8.85, ry - 0.1, 3.3);
  });
  T.takeaway(s,
    "Budget for the fastest panel you support, not the slowest.",
    "→ Lecture 3 introduced this budget; this lecture spends it.",
    5.05, { w: 7.1 });
}

// --------------------------------------------------------- 7 IMPELLER -------
{
  const s = d.content("Rendering", "Flutter owns every pixel, and Impeller draws them");
  T.lines(s, [
    "Flutter does not drive the platform's widgets. It ships a renderer and paints the whole surface itself. That is why the UI is identical everywhere, and why every performance problem in it is Flutter's, and yours.",
    { text: "The renderer is Impeller, not Skia.", options: { bold: true, color: C.INK } },
    "Impeller has been the iOS default since 2023 and the Android default (API 29+, Vulkan) since Flutter 3.29. As of Flutter 3.44 Skia is fully removed on iOS and Android 10+; only very old Android keeps an OpenGL fallback.",
    "The reason it exists: Skia compiled shaders at runtime, the first time an effect appeared on screen. That was the classic “first-run jank”: a blur that stuttered once and never again. Impeller compiles every shader at build time, so the first frame costs the same as the thousandth.",
  ], { x: 0.9, y: 1.9, w: 7.3, h: 3.9, fontSize: 13, paraSpaceAfter: 12 });

  T.flowDown(s, [
    ["Your widgets", "Dart: the blueprint", "hair"],
    ["Framework", "layout, paint, layers", "hair"],
    ["Impeller", "precompiled shaders", "black"],
    ["Metal / Vulkan", "the GPU", "panel"],
  ], { x: 8.6, y: 2.0, w: 3.83, h: 0.86, gap: 0.28 });
  T.takeaway(s,
    "If a tutorial tells you to warm up shaders, it predates Impeller.",
    "",
    6.0, { w: 7.3 });
  s.addNotes("Worth saying aloud: shader warm-up (SkSL bundles) was a real, widely-copied workaround for Skia. It is dead code today. Anything on the internet older than 2023 about Flutter rendering needs re-checking.");
}

// ------------------------------------------------------- 8 THREE TREES ------
{
  const s = d.content("Rendering", "Three trees, three very different costs");
  const items = [
    ["frame", "Widget tree", "The blueprint. Immutable configuration objects with no behavior. Allocating one is a bump-pointer write into the young heap: constant time, and genuinely cheap."],
    ["combine", "Element tree", "The mediator. Persists across frames, holds State, and decides, per child, whether the old render object can be kept or must be thrown away."],
    ["layers", "Render object tree", "The machinery. Layout, painting, hit-testing. Expensive to create, expensive to touch, so the framework keeps them alive as long as it possibly can."],
  ];
  T.iconGrid(s, items, { y: 2.0, cw: 3.7, gx: 0.5 });
  T.hline(s, 0.9, 4.75, 11.53);
  T.lines(s, [
    { text: "Flutter does not rebuild the whole widget tree every frame.", options: { bold: true, color: C.INK } },
    "Only subtrees marked dirty rebuild. “Rebuilding widgets is cheap” is a statement about allocation. It is not permission to rebuild the screen for one changed label, because every rebuilt widget still has to be diffed against the element tree.",
  ], { x: 0.9, y: 5.0, w: 11.53, h: 1.5, fontSize: 13, paraSpaceAfter: 8 });
}

// ---------------------------------------------------- 9 RECONCILIATION ------
{
  const s = d.content("Rendering", "Reconciliation: runtimeType first, then key");
  T.codeBlock(s, [
    "// flutter/lib/src/widgets/framework.dart: the whole decision",
    "static bool canUpdate(Widget oldWidget, Widget newWidget) {",
    "  return oldWidget.runtimeType == newWidget.runtimeType",
    "      && oldWidget.key == newWidget.key;",
    "}",
    "",
    "// true  → the element is updated in place.",
    "//         State survives. The render object is REUSED.",
    "",
    "// false → the old element is deactivated, its render",
    "//         object dropped, a new one inflated and laid out.",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 3.75, fontSize: 10.5 });

  s.addText("What this buys you", { x: 8.4, y: 1.98, w: 4.03, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "The element tree walks the new children in order and asks this question once per child: a linear pass, O(N) in the number of children.",
    "Everything you do to make Flutter fast is really about making the answer “true” more often: keep types stable, keep keys stable, and keep the dirty subtree small.",
    { text: "Swapping a Container for a SizedBox in a conditional is a type change, and it silently destroys the state below it.", options: { color: C.INK } },
  ], { x: 8.4, y: 2.45, w: 4.03, h: 3.4, fontSize: 11.5, color: C.GRAY, paraSpaceAfter: 11 });
  T.takeaway(s,
    "Same type, same key → the expensive object is kept.",
    "Everything else on the next four slides follows from this one line of code.",
    5.95);
}

// ------------------------------------------------------------- 10 KEYS ------
{
  const s = d.content("Rendering", "Keys: identity for things that move");
  T.lines(s, [
    "Without a key, children are matched by position. Reorder a list and Flutter hands item 3's state to whatever now sits third: the checkbox stays ticked, the wrong row animates, and the scroll offset jumps.",
    "With a key, Flutter recognizes the move: it relocates the element and its render object instead of rebuilding them, and the state travels with the item.",
    { text: "ValueKey(item.id) for data you own. ObjectKey for identity by instance. UniqueKey only when you genuinely want destruction, since it never matches anything.", options: { color: C.INK } },
  ], { x: 0.9, y: 1.9, w: 6.9, h: 3.2, fontSize: 13, paraSpaceAfter: 12 });

  T.panel(s, 8.1, 1.95, 4.33, 3.35);
  s.addText("GlobalKey is expensive", { x: 8.45, y: 2.2, w: 3.7, h: 0.35, fontFace: F, fontSize: 13.5, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "It can reparent a widget: move a live element under a completely different parent, keeping its state. Three costs come with it:",
    "The element is detached and re-attached, with a lookup in a global registry on top.",
    "Layout and paint are invalidated in both the old location and the new one.",
    "Every InheritedWidget dependency below it has to be resolved again.",
  ], { x: 8.45, y: 2.6, w: 3.7, h: 2.55, fontSize: 10.5, color: C.GRAY, paraSpaceAfter: 8 });

  T.takeaway(s,
    "Keys are cheap. GlobalKeys are not.",
    "Use a GlobalKey when you actually need to reparent or reach a State from outside, not as a convenient handle.",
    5.5, { w: 6.9 });
  s.addNotes("Classic demo: a ListView of stateful color tiles with a shuffle button, once without keys and once with ValueKey. Without keys the colors stay put while the labels move.");
}

// -------------------------------------------------------- 11 COST MATRIX ----
{
  const s = d.content("Rendering", "What each operation actually costs");
  T.table(s, ["Cost", "Why"], [
    ["Building a widget", "constant time", "an allocation in the young heap; the generational GC collects it almost for free"],
    ["Reconciling children", "linear, O(N)", "one canUpdate call per child; keys keep the answer positive when items move"],
    ["GlobalKey reparenting", "linear search + re-attach", "detach, re-attach, invalidate layout and paint in two places"],
    ["Intrinsic sizing", "quadratic, O(N²) when nested", "IntrinsicWidth/Height break the single-pass rule: each level walks its subtree again"],
  ], { y: 2.05, rowH: 0.66, labelW: 2.5, fontSize: 11.5 });
  T.hline(s, 0.9, 5.4, 11.53);
  T.lines(s, [
    { text: "Layout is one depth-first pass: constraints go down, sizes come up.", options: { bold: true, color: C.INK } },
    "A relayout boundary, a subtree whose size cannot depend on its children, stops a dirty flag from propagating upward, which is why a fixed-size box around a busy widget is a real optimization and not a cosmetic one.",
  ], { x: 0.9, y: 5.62, w: 11.53, h: 1.2, fontSize: 12.5, paraSpaceAfter: 7 });
  s.addNotes("Say the word out loud: O(N squared) is QUADRATIC, not exponential. Exponential would be 2^N. The distinction matters the moment a student tries to reason about scale in an exam answer.");
}

// ------------------------------------------------------------ 12 CONST ------
{
  const s = d.content("Optimization", "const constructors, and what they save");
  T.codeBlock(s, [
    "// Rebuilt, re-allocated and re-diffed on every parent build:",
    "Padding(",
    "  padding: EdgeInsets.all(16),",
    "  child: Text('Total'),",
    ")",
    "",
    "// Canonicalized at compile time: the SAME instance forever:",
    "const Padding(",
    "  padding: EdgeInsets.all(16),",
    "  child: Text('Total'),",
    ")",
    "",
    "# analysis_options.yaml: let the IDE add them for you",
    "linter:",
    "  rules: [prefer_const_constructors]",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 4.35, fontSize: 10.5 });

  s.addText("Why it short-circuits the rebuild", { x: 8.4, y: 1.98, w: 4.03, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "Dart canonicalizes const expressions: two identical const widgets are not equal objects, they are the same object.",
    "So when the element compares the new child to the old one, identical(old, new) is true, so it returns immediately without descending. The entire subtree below is skipped.",
    { text: "This is the one optimization that costs nothing but a keyword. Turn the lint on and let the IDE add them.", options: { color: C.INK } },
    "It only works if every argument is itself a compile-time constant, which is a good reason to hoist styles and paddings into static const fields.",
  ], { x: 8.4, y: 2.45, w: 4.03, h: 4.1, fontSize: 11, color: C.GRAY, paraSpaceAfter: 11 });
}

// ------------------------------------------------------------ 13 LISTS ------
{
  const s = d.content("Optimization", "Lists: build what is on screen, nothing else");
  T.codeBlock(s, [
    "// Builds all 1,000 children before the first frame is shown.",
    "ListView(children: items.map(RowTile.new).toList())",
    "",
    "// Builds only what is visible, plus a small cache extent.",
    "ListView.builder(",
    "  itemCount: items.length,",
    "  itemExtent: 72,        // fixed height: scroll math is O(1)",
    "  itemBuilder: (context, i) => RowTile(",
    "    key: ValueKey(items[i].id),",
    "    item: items[i],",
    "  ),",
    ")",
    "",
    "// Heavy parsing never belongs on the UI isolate:",
    "final rows = await compute(parseCsv, bytes);  // → Lecture 3",
  ], { x: 0.9, y: 1.95, w: 7.5, h: 4.75, fontSize: 10.5 });

  s.addText("Three things this fixes", { x: 8.8, y: 1.98, w: 3.63, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "Startup: the first frame no longer waits for a thousand build() calls it will never show.",
    "Memory: live elements and render objects stay proportional to the viewport, not to the data.",
    "Scrolling: with itemExtent the framework computes positions arithmetically instead of measuring children.",
    "Same idea, more control: SliverList and CustomScrollView, when a list has to share a scroll view with headers.",
    { text: "The bad version is not slow, it is unbounded. It works on the ten rows you tested with and fails on a user's ten thousand.", options: { color: C.INK } },
  ], { x: 8.8, y: 2.45, w: 3.63, h: 4.25, fontSize: 11, color: C.GRAY, paraSpaceAfter: 10 });
}

// ----------------------------------------------------------- 14 LAYERS ------
{
  const s = d.content("Optimization", "Offscreen buffers: when a layer helps and when it hurts");
  s.addText("Opacity and ClipRRect can force a saveLayer", {
    x: 0.9, y: 1.9, w: 6.6, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0,
  });
  T.flowDown(s, [
    ["1 · Allocate", "a new offscreen buffer in GPU memory", "hair"],
    ["2 · Render", "the entire child subtree into that buffer", "hair"],
    ["3 · Apply", "the alpha or the clip to the finished texture", "hair"],
    ["4 · Composite", "the texture back onto the frame", "black"],
  ], { x: 0.9, y: 2.4, w: 6.6, h: 0.72, gap: 0.24 });
  s.addText("Four GPU steps, every frame, for one faded widget. This is the classic green (raster thread) spike.", {
    x: 0.9, y: 6.05, w: 6.6, h: 0.6, fontFace: F, fontSize: 11.5, color: C.GRAY, margin: 0, valign: "top",
  });

  s.addText("What to do instead", { x: 8.1, y: 1.9, w: 4.33, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    { text: "Animating a fade?", options: { bold: true, color: C.INK } },
    "Use AnimatedOpacity or FadeTransition rather than rebuilding an Opacity with a new value each frame. They drive a compositor opacity layer instead of re-diffing the subtree.",
    { text: "Fading a single image?", options: { bold: true, color: C.INK } },
    "Image has an opacity: parameter that takes an Animation<double> and blends in the shader, with no offscreen buffer at all.",
    { text: "Hiding something?", options: { bold: true, color: C.INK } },
    "Opacity(opacity: 0) still lays out, still paints, still costs. Use Visibility, or simply do not build the widget.",
    { text: "Rounded corners?", options: { bold: true, color: C.INK } },
    "A BoxDecoration with a borderRadius paints the shape directly. Reach for ClipRRect only when you must clip real content.",
  ], { x: 8.1, y: 2.32, w: 4.33, h: 4.3, fontSize: 10.5, color: C.GRAY, paraSpaceAfter: 6 });

  s.addNotes("The mirror image of this slide is RepaintBoundary: it deliberately creates a layer so that a repaint inside it does not spread outward. The cost is video memory: width x height x 4 bytes for RGBA, per boundary. Wrapping every row of a list fragments the layer tree and multiplies VRAM use; wrap the one spinner that animates, not the list around it.");
}

// ---------------------------------------------------------- 15 DEVTOOLS -----
{
  const s = d.content("Optimization", "Find the bottleneck before you fix anything");
  T.codeBlock(s, [
    "# Debug builds are JIT and assert-heavy. Never quote a debug number.",
    "flutter run --profile        # on a REAL device, not a simulator",
    "# then open DevTools → Performance",
  ], { x: 0.9, y: 1.88, w: 11.53, h: 1.65, fontSize: 11 });

  const rows = [
    ["Blue bar: UI thread", "Your Dart is slow: an expensive build(), a setState() too high in the tree, work that belongs in an isolate."],
    ["Green bar: raster thread", "The GPU is slow: a saveLayer, an over-large image, too many layers, an expensive clip."],
    ["Track widget builds", "Shows which widgets rebuilt for a frame. If a whole screen lights up for one changed label, that is your bug."],
    ["CPU profiler & Memory", "Flame chart: look for deep stacks under performLayout or updateChild, which is layout thrashing."],
  ];
  let y = 3.85;
  rows.forEach(([head, body], i) => {
    s.addText(head, { x: 0.9, y, w: 3.5, h: 0.5, fontFace: F, fontSize: 12.5, bold: true, color: C.INK, valign: "top", margin: 0 });
    s.addText(body, { x: 4.6, y, w: 7.83, h: 0.5, fontFace: F, fontSize: 11.5, color: C.GRAY, valign: "top", margin: 0 });
    y += 0.62;
    if (i < rows.length - 1) T.hline(s, 0.9, y - 0.1, 11.53);
  });
  s.addText([
    { text: "Profile before you change anything. ", options: { bold: true, color: C.INK } },
    { text: "The color of the bar tells you which half of the problem you have.", options: { color: C.GRAY } },
  ], { x: 0.9, y: 6.4, w: 11.53, h: 0.4, fontFace: F, fontSize: 13, margin: 0 });
}

// ============================================================================
// PART 2: COMPILATION
// ============================================================================
d.divider(
  "Part 2 · Compilation",
  "JIT, AOT, and the phone in between",
  "Where the machine code comes from, and what that costs in battery"
);

// ------------------------------------------------------- 17 SPECTRUM --------
{
  const s = d.content("Compilation", "Three ways to turn your code into instructions");
  T.table(s, ["Interpretation", "JIT", "AOT"], [
    ["Mechanism", "read and execute bytecode instruction by instruction", "compile hot paths to machine code while the program runs", "compile everything to machine code before the program runs"],
    ["Startup", "instant: nothing to compile", "slow at first: you pay the compiler at runtime", "instant: the code is already native"],
    ["Peak speed", "lowest", "highest: it can optimize on real, observed types", "high, but every decision was made without runtime data"],
    ["Memory", "small", "largest: a compiler and its buffers live in your process", "smallest at runtime; largest on disk"],
  ], { y: 2.2, rowH: 0.78, labelW: 1.5, fontSize: 11 });
  T.takeaway(s,
    "Startup, peak speed and memory trade off: improving one usually degrades another.",
    "A phone has to navigate all three at once, on a battery, so nobody ships a pure strategy any more.",
    5.9);
}

// -------------------------------------------------------- 18 BUILD MODES ----
{
  const s = d.content("Compilation", "Dart uses both: they are build modes, not camps");
  T.codeBlock(s, [
    "flutter run                    # DEBUG",
    "#   Dart VM, JIT-compiled. Hot reload works because the VM",
    "#   can swap in newly compiled functions while you run.",
    "#   Asserts on, service protocol open, no optimization.",
    "",
    "flutter run --profile          # PROFILE",
    "#   AOT machine code + tracing hooks. This is where you",
    "#   measure. Release numbers, plus DevTools.",
    "",
    "flutter build appbundle --release   # RELEASE",
    "#   AOT: Dart compiled straight to ARM machine code.",
    "#   No JIT, no interpreter, no service protocol.",
  ], { x: 0.9, y: 1.95, w: 7.2, h: 4.0, fontSize: 10.5 });

  s.addText("Read this carefully", { x: 8.4, y: 1.98, w: 4.03, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "“Dart is JIT” and “Dart is AOT” are both half-true. It is one language with two compilers, and the build mode picks one.",
    "That is the whole trick behind hot reload: development gets the flexibility of a JIT, and users get the startup and the battery of an AOT binary.",
    { text: "Which is also why a stopwatch in debug mode measures nothing. Measure in profile mode.", options: { color: C.INK } },
  ], { x: 8.4, y: 2.45, w: 4.03, h: 3.8, fontSize: 11.5, color: C.GRAY, paraSpaceAfter: 12 });
  T.takeaway(s,
    "JIT for the developer loop, AOT for the user.",
    "",
    6.15, { w: 7.2 });
}

// ------------------------------------------------------ 19 TWO PLATFORMS ----
{
  const s = d.content("Compilation", "Two platforms, two different answers");
  s.addText("Android: a hybrid, arrived at slowly", {
    x: 0.9, y: 1.9, w: 6.0, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0,
  });
  const era = [
    ["Dalvik", "Android 2.2–4.4", "trace JIT: compiled while you scrolled, and janked while it did"],
    ["Early ART", "Android 5.0–6.0", "pure AOT at install time: fast, but slow updates and huge binaries"],
    ["Modern ART", "Android 7.0+", "interpreter + JIT + background AOT when idle and charging"],
    ["Baseline profiles", "Android 9+", "profiles shipped with the app or aggregated from Play: AOT speed on the first launch"],
  ];
  let y = 2.35;
  era.forEach(([name, ver, txt], i) => {
    s.addText(name, { x: 0.9, y, w: 2.2, h: 0.32, fontFace: F, fontSize: 12.5, bold: true, color: C.INK, margin: 0 });
    s.addText(ver, { x: 3.15, y, w: 2.9, h: 0.32, fontFace: MONO, fontSize: 10, color: C.GRAY, margin: 0 });
    s.addText(txt, { x: 0.9, y: y + 0.32, w: 5.6, h: 0.62, fontFace: F, fontSize: 11, color: C.GRAY, margin: 0, valign: "top" });
    y += 1.02;
    if (i < era.length - 1) T.hline(s, 0.9, y - 0.14, 5.6);
  });

  s.addText("iOS: no choice at all", { x: 7.0, y: 1.9, w: 5.43, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    { text: "Write XOR execute.", options: { bold: true, color: C.INK } },
    "A memory page may be writable or executable, never both at once. It is the defense that stops an attacker who can write bytes from also running them.",
    "A JIT needs exactly that forbidden combination: write machine code into a page, then jump into it. iOS does not grant third-party apps the entitlement, so every app you ship is AOT-compiled native code. WebKit's JavaScript engine is the privileged exception.",
    { text: "Bitcode is gone. Apple deprecated it in Xcode 14 (2022) and no longer accepts bitcode submissions. A build guide that tells you to enable it is four years out of date.", options: { color: C.INK } },
  ], { x: 7.0, y: 2.35, w: 5.43, h: 4.2, fontSize: 11, color: C.GRAY, paraSpaceAfter: 10 });
  s.addNotes("Write-XOR-execute is worth two minutes on the whiteboard: it is the single constraint that explains why iOS never had a Dalvik-style runtime, why Flutter release builds are AOT, and why JavaScript on iOS only goes fast inside Safari.");
}

// ----------------------------------------------- 20 CROSS-PLATFORM TODAY ----
{
  const s = d.content("Compilation", "Where cross-platform runtimes stand in 2026");
  s.addText("Flutter", { x: 0.9, y: 2.0, w: 5.6, h: 0.4, fontFace: F, fontSize: 15, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "Dart AOT-compiles to native ARM for release, so there is no interpreter in production.",
    "Impeller's shaders are compiled at build time too, so the GPU work is decided before you ship.",
    "Debug keeps the JIT, which is what hot reload is.",
    "One pipeline: what you measured in profile mode is what ships.",
  ], { x: 0.9, y: 2.5, w: 5.6, h: 2.8, fontSize: 12.5, color: C.GRAY, paraSpaceAfter: 12 });

  s.addText("React Native", { x: 7.0, y: 2.0, w: 5.43, h: 0.4, fontFace: F, fontSize: 15, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "Hermes precompiles JavaScript to bytecode at build time, cutting the parse cost at launch.",
    { text: "The new architecture (JSI + Fabric, bridgeless) has been the default since RN 0.76 (Oct 2024).", options: { color: C.INK } },
    "The old serialized-JSON bridge is gone; JavaScript calls C++ directly.",
    "JS still runs on an engine, so the boundary is cheap now, but not free.",
  ], { x: 7.0, y: 2.5, w: 5.43, h: 2.8, fontSize: 12.5, color: C.GRAY, paraSpaceAfter: 12 });
  T.hline(s, 0.9, 5.35, 11.53);
  T.lines(s, [
    { text: "Both ecosystems moved the same work from runtime to build time.", options: { bold: true, color: C.INK } },
    "That is the actual trend: not “JIT versus AOT”, but how much can be decided before the user's battery is involved. → Lecture 1 compared these two architectures; this is the compilation half of that story.",
  ], { x: 0.9, y: 5.6, w: 11.53, h: 1.2, fontSize: 12.5, paraSpaceAfter: 7 });
}

// ============================================================================
// PART 3: ENERGY ON THE PHONE
// ============================================================================
d.divider(
  "Part 3 · Energy",
  "Battery as a design constraint",
  "Screen, silicon and radio, and which one dominates the drain"
);

// ------------------------------------------------------- 22 ENERGY DRIVERS --
{
  const s = d.content("Energy", "Where the milliamp-hours actually go");
  T.iconGrid(s, [
    ["monitor", "The screen", "On OLED a black pixel is an unlit pixel, so dark mode is a genuine saving. On LCD the backlight is on regardless and dark mode saves you nothing, so know which panel you are drawing on."],
    ["cpu", "CPU and GPU", "Inefficient code raises load, load raises temperature, and the OS throttles the SoC to cool it. Your energy problem returns a few seconds later as a speed problem."],
    ["radiotower", "The radio", "The most expensive component per byte, and the one that keeps drawing power after your request has finished."],
  ], { y: 2.05, cw: 3.7, gx: 0.5 });
  T.hline(s, 0.9, 4.8, 11.53);
  T.lines(s, [
    { text: "Race to idle.", options: { bold: true, color: C.INK } },
    "Modern SoCs are most efficient when they finish a task quickly and go back to sleep. Anything that keeps a core awake, such as a busy animation, a poll loop or a runtime compiler warming up, costs more than the work it performs.",
  ], { x: 0.9, y: 5.05, w: 11.53, h: 1.4, fontSize: 13, paraSpaceAfter: 8 });
}

// ---------------------------------------------------------- 23 RADIO TAIL ---
{
  const s = d.content("Energy", "The radio tail: why chatty apps drain batteries");
  T.lines(s, [
    "A cellular radio does not switch off when your response arrives. It stays in a high-power connected state for several seconds first, in case more data is coming. The network decides this, not you.",
    { text: "So a request that transfers 200 bytes can keep the radio awake for seconds.", options: { bold: true, color: C.INK } },
    "An app that sends one small packet every few seconds never lets the radio step down at all. It pays the tail continuously and shows up in the battery screen next to apps doing a hundred times the work.",
  ], { x: 0.9, y: 1.9, w: 6.7, h: 3.0, fontSize: 13, paraSpaceAfter: 12 });

  s.addText("What to do about it", { x: 8.1, y: 1.92, w: 4.33, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "Batch. Collect analytics, logs and non-urgent writes and flush them together, not as they happen.",
    "Defer. Hand background work to WorkManager or BGTaskScheduler and let the OS run it when the radio is already awake.",
    "Prefetch on Wi-Fi and while charging, when bytes are cheapest.",
    "Replace polling with push. One held connection or one FCM message beats a timer. → Lecture 8",
    "Send less: compress, page, and do not re-download what you already cached. → Lecture 10",
  ], { x: 8.1, y: 2.4, w: 4.33, h: 4.2, fontSize: 11, color: C.GRAY, paraSpaceAfter: 10 });

  T.takeaway(s,
    "Group your network calls into bursts.",
    "The fixed cost is the radio wake-up rather than the bytes, so ten small transfers cost far more than one batched transfer.",
    5.15, { w: 6.7 });
  s.addNotes("Keep this slide in mind: the last section of the lecture applies the same principle on a device with far less energy to spend.");
}

// ============================================================================
// PART 4: EMBEDDED (orange accent lives here and nowhere else)
// ============================================================================
d.divider(
  "Part 4 · Embedded",
  "Four orders of magnitude down",
  "TinyGo on a microcontroller: sensor, radio, and your Flutter app at the other end"
);

// --------------------------------------------------- 25 CONSTRAINT JUMP -----
{
  const s = d.content("Embedded", "The constraint jump: phone → microcontroller");
  s.addImage({ path: T.icon("smartphone", "ink"), x: 3.55, y: 1.9, w: 0.36, h: 0.36 });
  s.addImage({ path: T.icon("cpu", "orange"), x: 8.0, y: 1.9, w: 0.36, h: 0.36 });
  T.table(s, ["Phone", "Microcontroller"], [
    ["RAM", "8–16 GB", "~520 KB SRAM"],
    ["Storage", "128–512 GB", "~4 MB flash"],
    ["Power", "~5 W peak, recharged nightly", "milliwatts, sometimes a coin cell for a year"],
    ["OS", "Android / iOS", "an RTOS, or nothing at all"],
    ["Your code", "Dart, AOT-compiled", "Go, compiled by TinyGo through LLVM"],
  ], { y: 2.4, rowH: 0.55, labelW: 1.6, hotCols: [1] });
  T.takeaway(s,
    "This is the far right of the device spectrum from Lecture 1.",
    "Every habit from the first three parts of this lecture still applies, and there is no headroom left to absorb a mistake.",
    5.75);
  s.addNotes("Do not re-teach the spectrum, since students met it in Lecture 1. The point here is only the magnitude of the step: the phone column is roughly ten thousand times the memory and a thousand times the power budget.");
}

// -------------------------------------------------------------- 26 TINYGO ---
{
  const s = d.content("Embedded", "TinyGo: Go, compiled for bare metal");
  T.lines(s, [
    "TinyGo reads ordinary Go with the standard frontend, emits LLVM IR, and lets LLVM produce machine code for Cortex-M, RISC-V, AVR and WebAssembly. It is a different compiler for the same language, not a different language.",
  ], { x: 0.9, y: 1.88, w: 11.53, h: 0.85, fontSize: 13 });
  T.prosCons(s,
    [
      "Goroutines and channels on a chip with no operating system",
      "Binaries measured in tens of kilobytes, not megabytes",
      "The machine package: GPIO, ADC, I²C, SPI, UART, PWM, one API per board",
      "One language shared with your Go backend → Lecture 5",
    ],
    [
      "A reduced runtime: the scheduler is cooperative, the GC is simple",
      "Limited reflection, so reflection-heavy packages (much of encoding/json) will not build",
      "A subset of the standard library; no full net stack on most targets",
      "Some Go packages do not compile, so check before you design around one",
    ],
    { y: 2.85 });
  T.takeaway(s,
    "You keep the language and the concurrency model. You give up the library ecosystem.",
    "",
    5.9);
}

// ------------------------------------------------------- 27 BOARD REALITY ---
{
  const s = d.content("Embedded", "Which board to buy");
  s.addText("Do not start with the original ESP32", {
    x: 0.9, y: 1.9, w: 6.7, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.ORANGE, margin: 0,
  });
  T.lines(s, [
    "The classic Xtensa ESP32, the one in most tutorials and cheap starter kits, has minimal TinyGo support and no Wi-Fi or Bluetooth from TinyGo. You can blink an LED and very little else.",
    { text: "Buy one of these instead:", options: { bold: true, color: C.INK } },
    "ESP32-C3 or ESP32-S3: Wi-Fi from TinyGo via the espradio package, available since TinyGo 0.41 (April 2026). The C3 is a RISC-V part and the cheapest way into a networked project.",
    "Raspberry Pi Pico (RP2040) or Pico 2 (RP2350): first-tier TinyGo support and the best-documented machine package. Take the W variant if you need Wi-Fi.",
  ], { x: 0.9, y: 2.35, w: 6.7, h: 3.3, fontSize: 12, paraSpaceAfter: 11 });

  T.codeBlock(s, [
    "# One target flag is the whole difference.",
    "tinygo flash -target=pico       ./cmd/sensor",
    "tinygo flash -target=esp32c3    ./cmd/sensor",
    "",
    "# See what your board actually supports:",
    "tinygo targets",
    "tinygo info pico",
    "",
    "# Serial output from the running board:",
    "tinygo monitor",
  ], { x: 8.1, y: 2.35, w: 4.33, h: 3.3, fontSize: 9.5 });

  T.takeaway(s,
    "Buy a board that TinyGo actually supports.",
    "Check tinygo.org/docs/reference/microcontrollers before you order anything.",
    5.9);
}

// --------------------------------------------------------- 28 MACHINE CODE --
{
  const s = d.content("Embedded", "The machine package: a pin, a sensor, a loop");
  T.codeBlock(s, [
    "// import \"machine\" and \"time\" : machine is TinyGo's HAL,",
    "// one API across every supported board.",
    "func main() {",
    "  led := machine.LED",
    "  led.Configure(machine.PinConfig{Mode: machine.PinOutput})",
    "",
    "  machine.InitADC()",
    "  sensor := machine.ADC{Pin: machine.ADC0}",
    "  sensor.Configure(machine.ADCConfig{})",
    "",
    "  on := false",
    "  for {",
    "    on = !on",
    "    led.Set(on)                // blink: proof of life",
    "    raw := sensor.Get()        // 0 .. 65535, scaled for you",
    "    println(\"adc:\", raw)       // → the serial port",
    "    time.Sleep(2 * time.Second)",
    "  }",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.0, h: 4.85, fontSize: 9 });

  s.addText("What is different from server Go", { x: 8.2, y: 1.98, w: 4.23, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "There is no main loop provided for you and nothing to return to. If main() exits, the board stops.",
    "machine.LED and machine.ADC0 are aliases the compiler resolves per target, so the same source flashes to a Pico and to an ESP32-C3.",
    "println goes to the serial port, which is why tinygo monitor is your debugger.",
    { text: "For a digital sensor, swap the ADC for machine.I2C0 and a driver from tinygo.org/x/drivers, where there are a few hundred of them.", options: { color: C.INK } },
    "Goroutines work here: a ticker goroutine sampling into a channel, and main publishing from it, is idiomatic and costs a few hundred bytes of stack.",
  ], { x: 8.2, y: 2.45, w: 4.23, h: 4.3, fontSize: 10.5, color: C.GRAY, paraSpaceAfter: 9 });
}

// ------------------------------------------------------------ 29 MQTT PUB ---
{
  const s = d.content("Embedded", "Publishing a reading over MQTT");
  T.codeBlock(s, [
    "// 1. join the network (espradio / cyw43439 underneath)",
    "link, _ := netlink.New()",
    "link.NetConnect(&netlink.ConnectParams{",
    "  Ssid: ssid, Passphrase: pass,",
    "})",
    "",
    "// 2. connect to the broker",
    "opts := mqtt.NewClientOptions().",
    "  AddBroker(\"tcp://192.168.1.10:1883\").",
    "  SetClientID(\"mec-sensor-01\")",
    "client := mqtt.NewClient(opts)",
    "if t := client.Connect(); t.Wait() && t.Error() != nil {",
    "  panic(t.Error())",
    "}",
    "",
    "// 3. publish: topic, QoS, retained, payload",
    "msg := fmt.Sprintf(`{\"c\":%.1f,\"seq\":%d}`, tempC, seq)",
    "client.Publish(\"mec/lab/room1/temp\", 0, false, msg)",
  ], { x: 0.9, y: 1.9, w: 7.5, h: 5.0, fontSize: 9 });

  s.addText("Why MQTT and not HTTP", { x: 8.7, y: 1.98, w: 3.73, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    { text: "Packages: tinygo.org/x/drivers/netlink and .../net/mqtt.", options: { color: C.INK } },
    "A fixed header of two bytes, against several hundred bytes of HTTP headers per request. On a battery, bytes are energy.",
    "The broker fans one reading out to every subscriber, such as a phone, a dashboard or a database, without the device knowing any of them exist.",
    "Retained messages give a late subscriber the last known value immediately, and a last-will message announces that the device has dropped off when it stops answering.",
    { text: "→ Lecture 8 introduced MQTT as one of the four realtime transports. This is the device end of it.", options: { color: C.INK } },
  ], { x: 8.7, y: 2.45, w: 3.73, h: 4.3, fontSize: 10.5, color: C.GRAY, paraSpaceAfter: 10 });
  s.addNotes("Run a broker on the lab machine (mosquitto in Docker, one command) and subscribe from a laptop with mosquitto_sub while the board publishes. Seeing the JSON appear in a terminal before any Flutter code exists makes the next slide obvious.");
}

// ------------------------------------------------------- 30 FLUTTER SIDE ----
{
  const s = d.content("Embedded", "The other end: your Flutter app subscribes");
  T.codeBlock(s, [
    "// pubspec.yaml:  mqtt_client: ^10.0.0",
    "final client = MqttServerClient('192.168.1.10', 'flutter-hub')",
    "  ..port = 1883",
    "  ..keepAlivePeriod = 30",
    "  ..onDisconnected = _scheduleReconnect;",
    "",
    "await client.connect();",
    "",
    "// '+' matches one level: every room's temperature.",
    "client.subscribe('mec/lab/+/temp', MqttQos.atLeastOnce);",
    "",
    "client.updates!.listen((events) {",
    "  final msg = events.first.payload as MqttPublishMessage;",
    "  final text = MqttPublishPayload.bytesToStringAsString(",
    "      msg.payload.message);",
    "  _controller.add(Reading.fromJson(jsonDecode(text)));",
    "});   // → straight into your BLoC, → Lecture 8",
  ], { x: 0.9, y: 1.95, w: 7.5, h: 4.7, fontSize: 9 });

  s.addText("The loop the course promised", { x: 8.7, y: 1.98, w: 3.73, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.ORANGE, margin: 0 });
  T.lines(s, [
    "Sensor → TinyGo → broker → Flutter, with nothing proprietary anywhere in the chain and about forty lines of code at each end.",
    "The phone is the hub: it renders, it stores, it forwards to the cloud. The device only samples and publishes.",
    { text: "Everything you learned about sockets applies unchanged: reconnect with backoff, close in dispose(), and never trust a connection that has gone quiet.", options: { color: C.INK } },
    "Use wss:// or MQTT over TLS the moment this leaves the lab network. An unauthenticated broker accepts anyone.",
  ], { x: 8.7, y: 2.45, w: 3.73, h: 4.0, fontSize: 10.5, color: C.GRAY, paraSpaceAfter: 10 });
}

// ---------------------------------------------------------- 31 MCU ENERGY ---
{
  const s = d.content("Embedded", "Wake, send, sleep: energy at the device level");
  T.lines(s, [
    "On an ESP32-class part the datasheet spread between deep sleep and Wi-Fi transmit is roughly four orders of magnitude: microamps against hundreds of milliamps. The radio, not the processor, is the power budget.",
    { text: "So the design question is not “how fast is the code” but “what fraction of the time is the radio on”.", options: { bold: true, color: C.INK } },
    "Average current ≈ (active current × active time + sleep current × sleep time) ÷ period. Shorten the active window or lengthen the period, and everything else is noise.",
  ], { x: 0.9, y: 1.88, w: 6.9, h: 2.7, fontSize: 12.5, paraSpaceAfter: 11 });

  T.flowDown(s, [
    ["Wake", "on a timer, or on an interrupt from the sensor", "hair"],
    ["Sample & batch", "several readings before you spend a connection", "hair"],
    ["Connect, publish, close", "the only expensive step, so keep it short", "black"],
    ["Deep sleep", "radio off, RAM retained, microamps", "panel"],
  ], { x: 8.1, y: 1.95, w: 4.33, h: 0.86, gap: 0.26 });

  T.hline(s, 0.9, 4.85, 6.9);
  T.lines(s, [
    { text: "“Stay connected” loses to “wake, send, sleep”.", options: { bold: true, color: C.INK } },
    "An MQTT keepalive holds the radio in a powered state forever to save a handshake you only pay once. Unless you need commands pushed to the device within seconds, sleep between publishes and accept the reconnect.",
  ], { x: 0.9, y: 5.05, w: 6.9, h: 1.5, fontSize: 12, paraSpaceAfter: 8 });

  s.addNotes("This is the payoff of the whole lecture: batching network calls to dodge the cellular radio tail on a phone, and duty cycling an MCU so its radio sleeps, are the same optimization. On a phone it saves battery over an afternoon; on a coin cell it decides whether the device runs for a week or a year.");
}

// -------------------------------------------------------------- 32 CLOSING --
d.closing([
  ["checklist", "Recap", [
    "One frame budget = 1 ÷ refresh rate: 8.3 ms at 120 Hz, not 16",
    "Widget cheap, element persistent, render object expensive; canUpdate decides",
    "const, ListView.builder, keys, and no needless saveLayer",
    "JIT and AOT are build modes: debug for you, release for users",
    "Radio dominates energy, on a phone and on a microcontroller alike",
  ]],
  ["calendar", "This week", [
    "Profile your project in --profile mode on a real device; find one red frame and fix it",
    "Turn on prefer_const_constructors and let the IDE do the rest",
    "Order a Pico or an ESP32-C3, not an original ESP32",
    "Flash the blink example and get one reading onto a broker",
  ]],
  ["bookopen", "Read more", [
    "docs.flutter.dev/perf",
    "tinygo.org/docs/reference/microcontrollers",
    "pkg.go.dev/tinygo.org/x/drivers",
    "pub.dev/packages/mqtt_client",
    "developer.android.com/topic/performance/vitals",
  ]],
]);

d.write(path.join(__dirname, "Mobile-and-Embedded-Lecture11-v2.pptx"))
  .then((f) => console.log("written:", f, "slides:", d.n));
