// ============================================================================
// Mobile & Embedded Computing, Lecture 2: Languages & Flutter
// Built on the shared design system in ./template.js
// ============================================================================
const path = require("path");
const T = require("../assets/template");
const { Deck, C, F, MONO } = T;

const d = new Deck({
  lecture: 2,
  title: "Mobile and Embedded Computing",
  subtitle: "compiled vs interpreted, null safety, Dart & Kotlin",
});

// ---- small local helpers (layout only, no new styling) ---------------------
// right-hand commentary column next to a code block
function note(s, x, y, w, heading, paras, opts = {}) {
  let cy = y;
  if (heading) {
    s.addText(heading, {
      x, y: cy, w, h: 0.4, fontFace: F, fontSize: opts.headSize || 14.5,
      bold: true, color: opts.headColor || C.INK, margin: 0,
    });
    cy += 0.48;
  }
  s.addText(paras.map((t, i) => {
    const o = typeof t === "string" ? { text: t, options: {} } : { text: t.text, options: Object.assign({}, t.options) };
    o.options.breakLine = i < paras.length - 1;
    return o;
  }), {
    x, y: cy, w, h: opts.h || 3.6, fontFace: F, fontSize: opts.fontSize || 12.5,
    color: opts.color || C.GRAY, margin: 0, paraSpaceAfter: opts.gap || 11, valign: "top",
  });
}

// gray panel with a heading + bullet-less lines inside it
function infoPanel(s, x, y, w, h, heading, items, opts = {}) {
  T.panel(s, x, y, w, h);
  s.addText(heading, {
    x: x + 0.35, y: y + 0.28, w: w - 0.7, h: 0.4, fontFace: F,
    fontSize: opts.headSize || 14.5, bold: true, color: opts.headColor || C.INK, margin: 0,
  });
  s.addText(items.map((t, i) => {
    const o = typeof t === "string" ? { text: t, options: {} } : { text: t.text, options: Object.assign({}, t.options) };
    o.options.breakLine = i < items.length - 1;
    return o;
  }), {
    x: x + 0.35, y: y + 0.78, w: w - 0.7, h: h - 1.05, fontFace: F,
    fontSize: opts.fontSize || 12.5, color: opts.color || C.INK, margin: 0,
    paraSpaceAfter: opts.gap || 10, valign: "top",
  });
}

// =====================================================================
// 1. TITLE
// =====================================================================
d.titleSlide();

// =====================================================================
// 2. BIO
// =====================================================================
T.bioSlide(d);

// =====================================================================
// 3. OBJECTIVES
// =====================================================================
T.objectivesSlide(d, [
  ["layers", "The compilation spectrum",
    "AOT, JIT, bytecode VMs, interpreters, and why “compiled” describes an implementation, not a language"],
  ["shieldcheck", "Sound null safety",
    "How non-nullable-by-default removes a whole family of crashes, in Dart and, almost identically, in Kotlin"],
  ["code", "Dart you can actually write",
    "Variables, functions, classes, collections and the null-aware operators: enough to read any Flutter code"],
  ["zap", "What Flutter really is",
    "One Dart codebase, one renderer, and why hot reload exists only in debug builds"],
]);

// =====================================================================
// 4. DIVIDER
// =====================================================================
d.divider("How code runs", "From source text to a running program",
  "Compilers, interpreters, and the spectrum in between");

// =====================================================================
// 5. COMPILER vs INTERPRETER
// =====================================================================
{
  const s = d.content("How code runs", "Compiler and interpreter: what actually happens");
  T.lines(s, [
    "A compiler translates your whole program ahead of time into instructions for one CPU and one OS. You ship the result; the translation is paid once, by you.",
    "An interpreter is a program that reads your code and carries out its instructions step by step, every time it runs. You ship the source; the translation is paid on every run, on the user's device.",
    { text: "Almost nothing real is purely one or the other.", options: { bold: true } },
  ], { x: 0.9, y: 1.95, w: 6.8, h: 3.2, fontSize: 14, paraSpaceAfter: 15 });

  infoPanel(s, 8.3, 1.95, 4.3, 4.1, "The same language, run differently", [
    { text: "Python", options: { bold: true } },
    "CPython compiles to bytecode, then interprets it. PyPy JIT-compiles the same source.",
    { text: "Java / Kotlin", options: { bold: true } },
    "Bytecode, interpreted at first, then JIT-compiled once a method gets hot.",
    { text: "JavaScript", options: { bold: true } },
    "V8 parses, interprets, then JIT-compiles, and de-optimizes when its guesses fail.",
    { text: "Dart", options: { bold: true } },
    "JIT while you develop. AOT for the build you ship.",
  ], { fontSize: 11.5, gap: 6 });

  T.takeaway(s, "“Compiled” and “interpreted” are properties of a toolchain,",
    "not of a language. The same source can be run either way.", 4.85, { w: 6.8 });
  s.addNotes("Ask the room for a 'compiled language' and a 'interpreted language'. Then point out that C has interpreters (Cling) and Python has AOT compilers (Nuitka, Cython). The dichotomy students arrive with is a folk taxonomy.");
}

// =====================================================================
// 6. THE SPECTRUM (table)
// =====================================================================
{
  const s = d.content("How code runs", "The compilation spectrum");
  T.table(s,
    ["AOT → native", "JIT in a VM", "Bytecode VM", "Interpreter"],
    [
      ["Translated", "Before you ship", "While running", "At load time", "Line by line"],
      ["You ship", "Machine code", "Source + VM", "Bytecode + VM", "Source + runtime"],
      ["Start-up", "Fastest", "Needs warm-up", "Medium", "Starts instantly"],
      ["Peak speed", "High, fixed", "Can beat AOT", "Medium", "Lowest"],
      ["Examples", "Go · Rust · Swift", "JVM · V8 · ART", "CPython", "Bash · shell"],
    ],
    { y: 2.35, focusCols: [0, 1], fontSize: 11.5 },
  );
  T.takeaway(s, "Dart sits at two points on this spectrum at once:",
    "JIT while you develop, AOT for the build your users install.", 5.95);
  s.addNotes("The rows are a continuum, not four boxes: modern runtimes mix tiers (V8 has an interpreter plus two JITs; Android's ART does install-time AOT plus profile-guided JIT). The point students must leave with is that 'how fast is it' is a question about a toolchain and a workload, not about a language name.");
}

// =====================================================================
// 7. IS COMPILED FASTER? (kills the 100x claim)
// =====================================================================
{
  const s = d.content("How code runs", "Is compiled code faster?");
  T.lines(s, [
    "There is a real gap, and it is entirely workload-dependent. A tight numeric loop shows the biggest difference; code dominated by I/O, syscalls or a native library shows almost none.",
    "A JIT can beat an AOT compiler. It sees the actual types and hot branches at run time and inlines on that evidence, using information that does not exist ahead of time.",
    "AOT wins where a phone needs it: cold start-up, memory footprint, and predictable latency.",
    "In a Flutter frame the budget goes to layout, rasterization, I/O and garbage collection long before it goes to language dispatch.",
  ], { x: 0.9, y: 1.95, w: 6.8, h: 3.3, fontSize: 14, paraSpaceAfter: 14 });

  T.panel(s, 8.3, 1.95, 4.3, 3.1);
  s.addText("Not a fact", { x: 8.65, y: 2.2, w: 3.6, h: 0.35, fontFace: F, fontSize: 11, bold: true, color: C.GRAY, charSpacing: 1.5, margin: 0 });
  s.addText("“Compiled languages are about 100× faster than interpreted ones.”", {
    x: 8.65, y: 2.6, w: 3.6, h: 1.0, fontFace: F, fontSize: 14, color: C.GRAY, margin: 0, valign: "top",
  });
  s.addText([
    { text: "There is no single multiplier.", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "Ask instead: faster at what, measured how, on which device?", options: { color: C.INK } },
  ], { x: 8.65, y: 3.7, w: 3.6, h: 1.2, fontFace: F, fontSize: 12.5, margin: 0, paraSpaceAfter: 8, valign: "top" });

  T.takeaway(s, "Benchmark the workload you actually have.",
    "Numbers from any other benchmark describe someone else's program.", 5.5, { w: 6.8 });
}

// =====================================================================
// 8. DART COMPILES BOTH WAYS
// =====================================================================
{
  const s = d.content("How code runs", "Why Dart compiles two different ways");
  const col = (x, tag, cmd, items) => {
    T.panel(s, x, 1.95, 5.75, 3.15);
    s.addText(tag, { x: x + 0.35, y: 2.2, w: 5.05, h: 0.4, fontFace: F, fontSize: 16, bold: true, color: C.INK, margin: 0 });
    s.addText(cmd, { x: x + 0.35, y: 2.65, w: 5.05, h: 0.35, fontFace: MONO, fontSize: 12, color: C.BLUE, margin: 0 });
    s.addText(items.map((t, i) => ({ text: t, options: { breakLine: i < items.length - 1 } })), {
      x: x + 0.35, y: 3.1, w: 5.05, h: 2.1, fontFace: F, fontSize: 12.5, color: C.INK,
      margin: 0, paraSpaceAfter: 10, valign: "top",
    });
  };
  col(0.9, "Debug: JIT", "flutter run", [
    "The Dart VM compiles your code as it runs",
    "Hot reload: new code is swapped into the live isolate in under a second",
    "Assertions on, DevTools attached, service protocol open",
    "Slower, and a much larger binary",
  ]);
  col(6.85, "Release: AOT", "flutter build apk --release", [
    "Compiled ahead of time to native ARM64 machine code",
    "No VM and no interpreter ship inside your app",
    "Fast cold start, smaller memory footprint, tree-shaken",
    "No hot reload: there is nothing to reload into",
  ]);
  T.takeaway(s, "Never judge performance from a debug build.",
    "Measure in profile or release mode: flutter run --profile.", 5.45);
  s.addNotes("This is the slide that replaces the old 'compiled vs interpreted' dichotomy. Same language, two compilers, chosen by build mode. Students routinely file performance bugs against debug builds. A debug Flutter build can be several times slower than release, and that is by design.");
}

// =====================================================================
// 9. TYPE ERRORS ≠ SECURITY
// =====================================================================
{
  const s = d.content("How code runs", "Type errors and security are different things");
  T.iconGrid(s, [
    ["check", "Compile-time type errors",
      "The compiler rejects int x = 'hi' before it ever ships. You get refactoring confidence and a smaller crash surface, at zero runtime cost."],
    ["circlealert", "Runtime failures",
      "Nulls, index-out-of-range, a request that fails, malformed input. The type system narrows these, and null safety removes a whole family of them, but they cannot be eliminated."],
    ["lock", "Security vulnerabilities",
      "Hard-coded API keys, a missing authorization check, injection, insecure local storage, over-broad permissions. A fully type-checked app can be completely insecure."],
  ], { y: 2.0, cw: 3.6, gx: 0.36 });

  T.hline(s, 0.9, 4.5, 11.53);
  s.addText([
    { text: "The one real overlap is memory safety.", options: { bold: true, color: C.INK } },
    { text: "  Dart, Kotlin, Go and Rust have no manual pointer arithmetic, so buffer overflows and use-after-free, the classic exploitable bugs of C and C++, cannot happen. That is memory safety, not type checking.", options: { color: C.GRAY } },
  ], { x: 0.9, y: 4.75, w: 11.53, h: 0.9, fontFace: F, fontSize: 14, margin: 0, valign: "top" });
  s.addText("Security is a design and review discipline. We come back to it in Lecture 7, authentication and App Check.", {
    x: 0.9, y: 5.7, w: 11.53, h: 0.4, fontFace: F, fontSize: 12, color: C.GRAY, margin: 0,
  });
}

// =====================================================================
// 10. DIVIDER
// =====================================================================
d.divider("Null safety", "The billion-dollar mistake, and its fix",
  "Why Dart and Kotlin make null part of the type");

// =====================================================================
// 11. THE PROBLEM
// =====================================================================
{
  const s = d.content("Null safety", "The billion-dollar mistake");
  T.codeBlock(s, [
    "// Java. This compiles cleanly, with no warning.",
    "String name = findUser(42);",
    "System.out.println(name.length());",
    "",
    "// findUser is allowed to return null.",
    "// NullPointerException at run time,",
    "// on a user's device, in production.",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 3.0, fontSize: 13 });

  note(s, 8.9, 1.95, 3.5, "Where null came from", [
    "Tony Hoare put the null reference into ALGOL W in 1965 because it was easy to implement. In 2009 he called it his “billion-dollar mistake”.",
    { text: "Non-nullable by default, since:", options: { color: C.INK, bold: true } },
    "Swift: 2014, optionals",
    "Kotlin: 2016, from 1.0",
    "Dart: 2021, from 2.12",
    "TypeScript: strictNullChecks",
    "C#: nullable reference types",
  ], { fontSize: 12, gap: 7, h: 4.4 });

  T.takeaway(s, "Null is not a value problem, it is a type problem.",
    "If the type cannot say “maybe absent”, the compiler cannot help you.", 5.3, { w: 7.7 });
}

// =====================================================================
// 12. DART NULL SAFETY OPERATORS
// =====================================================================
{
  const s = d.content("Null safety", "Dart null safety: the operators");
  T.codeBlock(s, [
    "// Non-nullable by default: String name = null; is an error.",
    "String name = 'Ada';",
    "",
    "// Add ? and the type is allowed to hold null.",
    "String? nickname;",
    "",
    "// ?. calls only if non-null; ?? supplies a fallback.",
    "final shown = nickname?.trim() ?? name;",
    "",
    "// ??= assigns only when the target is null.",
    "nickname ??= 'anon';",
    "",
    "// ! asserts non-null; it throws if you were wrong.",
    "final n = nickname!.length;",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.75, fontSize: 11.5 });

  note(s, 8.9, 1.95, 3.5, "Four symbols, and that is most of it", [
    { text: "?      the type may be null", options: { fontFace: MONO, fontSize: 11.5, color: C.INK } },
    { text: "?.     guarded access", options: { fontFace: MONO, fontSize: 11.5, color: C.INK } },
    { text: "??     fallback value", options: { fontFace: MONO, fontSize: 11.5, color: C.INK } },
    { text: "??=    fallback assignment", options: { fontFace: MONO, fontSize: 11.5, color: C.INK } },
    { text: "!      assertion, not a fix", options: { fontFace: MONO, fontSize: 11.5, color: C.INK } },
    "Every ! is a claim the compiler cannot check for you. If a file is full of them, the types are wrong; fix the types instead.",
  ], { fontSize: 12, gap: 9, h: 4.6 });
}

// =====================================================================
// 13. SOUND NULL SAFETY + ESCAPE HATCHES
// =====================================================================
{
  const s = d.content("Null safety", "What “sound” means, and the escape hatches");
  T.codeBlock(s, [
    "// Flow analysis promotes a nullable to non-nullable.",
    "String greet(String? name) {",
    "  if (name == null) return 'Hello, stranger';",
    "  return 'Hello, ${name.toUpperCase()}';  // no ! needed",
    "}",
    "",
    "// late: I promise to assign this before anything reads it.",
    "class Repo {",
    "  late final Database db;",
    "  Repo() { db = openDatabase(); }",
    "}",
    "// A broken promise throws LateInitializationError.",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.35, fontSize: 12 });

  note(s, 8.9, 1.95, 3.5, "Sound = the guarantee holds", [
    "A non-nullable Dart variable can never hold null at run time. This is a guarantee, not a strong tendency.",
    "So the compiler stops emitting null checks for it. Sound null safety makes release builds smaller and faster, not only safer.",
    { text: "Use late for dependency injection and expensive lazy fields, not to silence the analyzer.", options: { color: C.INK } },
  ], { fontSize: 12, gap: 12, h: 4.2 });
  s.addNotes("Demo opportunity: delete the null check in greet() and show the analyzer error in the IDE, then show that adding ! makes it compile and crash. The lesson is that ! moves the failure from build time to a user's phone.");
}

// =====================================================================
// 14. DART vs KOTLIN NULL SAFETY
// =====================================================================
{
  const s = d.content("Null safety", "Null safety in Dart and Kotlin, side by side");
  s.addText("Dart", { x: 0.9, y: 1.9, w: 5.6, h: 0.35, fontFace: F, fontSize: 15, bold: true, color: C.INK, margin: 0 });
  s.addText("Kotlin", { x: 7.0, y: 1.9, w: 5.6, h: 0.35, fontFace: F, fontSize: 15, bold: true, color: C.INK, margin: 0 });

  T.codeBlock(s, [
    "String? findEmail(int id) { ... }",
    "",
    "void notify(int id) {",
    "  final email = findEmail(id);",
    "  if (email == null) return;",
    "  send(email);",
    "  // promoted to String",
    "}",
  ], { x: 0.9, y: 2.35, w: 5.6, h: 2.9, fontSize: 11 });

  T.codeBlock(s, [
    "fun findEmail(id: Int): String? { ... }",
    "",
    "fun notify(id: Int) {",
    "  val email = findEmail(id)",
    "  if (email == null) return",
    "  send(email)",
    "  // smart cast to String",
    "}",
  ], { x: 7.0, y: 2.35, w: 5.6, h: 2.9, fontSize: 11 });

  T.hline(s, 0.9, 5.55, 11.53);
  s.addText("?.      ??      ??=     !       late final", {
    x: 1.35, y: 5.75, w: 5.0, h: 0.35, fontFace: MONO, fontSize: 12, color: C.INK, margin: 0,
  });
  s.addText("?.      ?:      (none)  !!      lateinit var", {
    x: 7.45, y: 5.75, w: 5.0, h: 0.35, fontFace: MONO, fontSize: 12, color: C.INK, margin: 0,
  });
  s.addText([
    { text: "Learn it once. ", options: { bold: true, color: C.INK } },
    { text: "The concept, and most of the syntax, transfers straight to Kotlin, and to Swift and Rust after that. One real difference: Kotlin's lateinit works on var only, while Dart allows late final.", options: { color: C.GRAY } },
  ], { x: 0.9, y: 6.25, w: 11.53, h: 0.6, fontFace: F, fontSize: 12.5, margin: 0, valign: "top" });
}

// =====================================================================
// 15. DIVIDER
// =====================================================================
d.divider("Dart & Kotlin", "The language you will write this semester",
  "Dart 3.12, with Kotlin 2.4 alongside it for comparison");

// =====================================================================
// 16. VARIABLES
// =====================================================================
{
  const s = d.content("Dart", "Variables: var, final, const");
  T.codeBlock(s, [
    "// var infers its type from the initializer.",
    "var count = 0;",
    "String title = 'Lecture 2';",
    "",
    "// final: assigned once, at run time.",
    "final now = DateTime.now();",
    "",
    "// const: assigned once, by the compiler, baked into",
    "// the binary. Everything in it must be known statically.",
    "const frameBudgetMs = 1000 / 120;",
    "",
    "// String interpolation, not concatenation.",
    "print('$title: $frameBudgetMs ms per frame');",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.5, fontSize: 12 });

  note(s, 8.9, 1.95, 3.5, "Read it this way", [
    { text: "var", options: { fontFace: MONO, color: C.INK } },
    "still statically typed: the type is inferred, not absent.",
    { text: "final", options: { fontFace: MONO, color: C.INK } },
    "the binding cannot be reassigned. The object it points at may still change.",
    { text: "const", options: { fontFace: MONO, color: C.INK } },
    "a compile-time constant. In Flutter, const widgets are built once and reused, which is a real performance lever.",
    { text: "dynamic", options: { fontFace: MONO, color: C.INK } },
    "opts out of static checking entirely. You will almost never want it.",
  ], { fontSize: 11.5, gap: 6, h: 4.5 });
}

// =====================================================================
// 17. FUNCTIONS
// =====================================================================
{
  const s = d.content("Dart", "Functions and parameters");
  T.codeBlock(s, [
    "// Positional parameters; => is a one-expression body.",
    "int add(int a, int b) => a + b;",
    "",
    "// Optional positional parameters, with a default.",
    "String tag(String n, [String suffix = '']) => '$n$suffix';",
    "",
    "// Named parameters: this is the Flutter style.",
    "String card({",
    "  required String title,",
    "  String? subtitle,",
    "  int maxLines = 2,",
    "}) => title;",
    "",
    "card(title: 'Dart', maxLines: 3);",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.7, fontSize: 11.5 });

  note(s, 8.9, 1.95, 3.5, "Why named parameters matter", [
    "Every Flutter widget constructor uses them. Call sites read as prose instead of as a row of anonymous positional arguments.",
    { text: "required is a compile-time obligation, not a runtime check.", options: { color: C.INK } },
    "Functions are first-class values: pass them, store them, return them. That is what a callback like onPressed actually is.",
  ], { fontSize: 12, gap: 12, h: 4.5 });
}

// =====================================================================
// 18. CLASSES
// =====================================================================
{
  const s = d.content("Dart", "Classes, constructors and getters");
  T.codeBlock(s, [
    "class Lecture {",
    "  final int number;",
    "  final String title;",
    "  final String? room;",
    "",
    "  // this.x in the parameter list assigns the field.",
    "  Lecture({required this.number, required this.title,",
    "           this.room});",
    "",
    "  // A getter: computed, called without parentheses.",
    "  String get label => 'L$number: $title';",
    "}",
    "",
    "final l = Lecture(number: 2, title: 'Languages');",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.7, fontSize: 11.5 });

  note(s, 8.9, 1.95, 3.5, "Also worth knowing", [
    { text: "Named constructors:", options: { color: C.INK } },
    { text: "Lecture.lab(this.number)", options: { fontFace: MONO, fontSize: 10.5, color: C.INK } },
    { text: "    : title = 'Lab', room = null;", options: { fontFace: MONO, fontSize: 10.5, color: C.INK } },
    { text: "Every class gets a default toString, ==, and hashCode, and == is identity by default.", options: {} },
    "Two Lecture objects with the same fields are not equal. Lecture 4 fixes that with Equatable.",
  ], { fontSize: 11.5, gap: 10, h: 4.5 });
}

// =====================================================================
// 19. COLLECTIONS & CONTROL FLOW
// =====================================================================
{
  const s = d.content("Dart", "Collections and control flow");
  T.codeBlock(s, [
    "final topics = <String>['Dart', 'Kotlin', 'Flutter'];",
    "final seen = <String>{};",
    "final points = <String, int>{'exam': 3, 'lab': 3};",
    "",
    "for (final t in topics) { seen.add(t); }",
    "",
    "// Collection-if and collection-for build lists inline.",
    "final menu = [",
    "  'Home',",
    "  if (isAdmin) 'Admin',",
    "  for (final t in topics) 'Lab: $t',",
    "];",
    "",
    "topics.where((t) => t.length > 4).forEach(print);",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.7, fontSize: 11.5 });

  note(s, 8.9, 1.95, 3.5, "You will see this everywhere", [
    "List, Set and Map are the three built-ins. The angle brackets are the element types.",
    { text: "Collection-if and collection-for are how Flutter builds a list of children conditionally, without a helper function and without a temporary list.", options: { color: C.INK } },
    "where, map, fold and forEach are lazy Iterable operations; call toList() when you need a List back.",
  ], { fontSize: 11.5, gap: 11, h: 4.5 });
}

// =====================================================================
// 20. GARBAGE COLLECTION (one slide of intuition)
// =====================================================================
{
  const s = d.content("Dart", "Garbage collection, in one slide");
  T.lines(s, [
    "Dart is garbage collected: you never free memory. The VM reclaims objects that nothing can reach any more.",
    "The generational hypothesis: most objects die young. Flutter proves it: a rebuild allocates thousands of short-lived Widget objects and discards them a frame later.",
    "So the heap is split. The young space is collected constantly and cheaply. Survivors are promoted to the old space, which is collected rarely and concurrently with your app.",
  ], { x: 0.9, y: 1.95, w: 6.8, h: 3.0, fontSize: 14, paraSpaceAfter: 15 });

  T.flowDown(s, [
    ["Young space", "almost everything dies here", "black"],
    ["Scavenge", "copy the few survivors, drop the rest", "hair"],
    ["Old space", "collected rarely, concurrently", "hair"],
  ], { x: 8.3, y: 1.95, w: 4.3, h: 1.0, gap: 0.36 });

  T.takeaway(s, "Why it matters on a phone:",
    "a pause longer than one frame budget, 8.3 ms at 120 Hz, is a visible dropped frame, and every collection costs CPU cycles and therefore battery. Allocate less inside build(), use const constructors, and keep heavy work off the UI isolate (→ Lecture 3).",
    5.25, { w: 6.8 });

  s.addText("The bookkeeping that keeps this correct, remembered sets and write barriers, is beyond the scope of week 2.", {
    x: 8.3, y: 5.9, w: 4.3, h: 0.7, fontFace: F, fontSize: 10.5, color: C.GRAY, margin: 0, valign: "top",
  });
}

// =====================================================================
// 21. KOTLIN vs DART, THE SAME SHAPES
// =====================================================================
{
  const s = d.content("Kotlin", "Kotlin and Dart: the same shapes");
  s.addText("Dart", { x: 0.9, y: 1.9, w: 5.6, h: 0.35, fontFace: F, fontSize: 15, bold: true, color: C.INK, margin: 0 });
  s.addText("Kotlin", { x: 7.0, y: 1.9, w: 5.6, h: 0.35, fontFace: F, fontSize: 15, bold: true, color: C.INK, margin: 0 });

  T.codeBlock(s, [
    "class User {",
    "  final String name;",
    "  final int age;",
    "  const User(this.name, this.age);",
    "}",
    "",
    "final u = User('Ada', 36);",
    "var count = 0;",
  ], { x: 0.9, y: 2.35, w: 5.6, h: 2.9, fontSize: 11 });

  T.codeBlock(s, [
    "data class User(",
    "  val name: String,",
    "  val age: Int,",
    ")",
    "",
    "",
    "val u = User(\"Ada\", 36)",
    "var count = 0",
  ], { x: 7.0, y: 2.35, w: 5.6, h: 2.9, fontSize: 11 });

  T.hline(s, 0.9, 5.5, 11.53);
  s.addText("Kotlin's data class gives you ==, hashCode, copy and toString for free. In Dart you write them by hand, or generate them with Equatable or freezed (→ Lecture 4).", {
    x: 0.9, y: 5.7, w: 5.6, h: 1.0, fontFace: F, fontSize: 11.5, color: C.GRAY, margin: 0, valign: "top",
  });
  s.addText("The same spectrum, again: Kotlin/JVM ships bytecode that Android's ART compiles; Kotlin/Native compiles ahead of time for iOS. Shared modules: Lecture 11.", {
    x: 7.0, y: 5.7, w: 5.6, h: 1.0, fontFace: F, fontSize: 11.5, color: C.GRAY, margin: 0, valign: "top",
  });
}

// =====================================================================
// 22. DIVIDER
// =====================================================================
d.divider("Flutter", "What Flutter actually is",
  "One Dart codebase, one renderer, and a build mode that changes how the code runs");

// =====================================================================
// 23. WHAT FLUTTER IS
// =====================================================================
{
  const s = d.content("Flutter", "What Flutter is, and what it draws");
  T.lines(s, [
    "Google's open-source UI toolkit: one Dart codebase for Android, iOS, web and desktop.",
    "Flutter does not use the platform's own widgets. It ships its own widget library and draws every pixel itself, through the Impeller renderer.",
    "That is why a Flutter app looks identical on both platforms, and why the platform's native controls are not automatically available.",
    "It reaches the OS (camera, sensors, BLE, files) through platform channels (→ Lecture 12).",
  ], { x: 0.9, y: 1.95, w: 6.8, h: 3.4, fontSize: 14, paraSpaceAfter: 14 });

  T.flowDown(s, [
    ["Your Dart code", "widgets · state · logic", "black"],
    ["Flutter framework", "layout, animation, gestures", "hair"],
    ["Impeller", "renderer, shaders precompiled", "hair"],
    ["GPU", "Metal on iOS · Vulkan on Android", "panel"],
  ], { x: 8.3, y: 1.95, w: 4.3, h: 0.85, gap: 0.3 });

  T.takeaway(s, "A release build is Dart, AOT-compiled to native ARM code.",
    "There is no interpreter and no JavaScript inside your app.", 5.6, { w: 6.8 });
  s.addNotes("Impeller replaced Skia: default on iOS since 2023, default on Android (Vulkan, API 29+) since Flutter 3.29 in Feb 2025, and as of Flutter 3.44 Skia is fully removed on iOS and Android 10+, with an OpenGL fallback only for very old Android. Do not describe Skia as the current renderer.");
}

// =====================================================================
// 24. HOT RELOAD
// =====================================================================
{
  const s = d.content("Flutter", "Hot reload, and why release builds cannot");
  T.flowDown(s, [
    ["1. You save a .dart file", "the tool watches your project", "hair"],
    ["2. Changed source → running VM", "over the dev service protocol", "hair"],
    ["3. The VM re-JITs it in place", "existing objects stay alive", "black"],
    ["4. Flutter rebuilds the tree", "your app keeps its state", "hair"],
  ], { x: 0.9, y: 1.95, w: 5.9, h: 0.8, gap: 0.26 });

  infoPanel(s, 7.2, 1.95, 5.4, 3.98, "What hot reload cannot do", [
    "Change main() or anything that only runs at start-up",
    "Change an enum into a class, or a generic type declaration",
    "Fix a compile error: the build has to succeed first",
    { text: "Work in a release build: it is AOT machine code, and there is no VM to load new code into.", options: { bold: true } },
    { text: "r = reload  ·  R = restart (state lost)", options: { fontFace: MONO, fontSize: 11.5, color: C.GRAY } },
  ], { fontSize: 12.5, gap: 10 });

  T.takeaway(s, "Hot reload is the payoff of the JIT half of the spectrum.",
    "It is a development-time feature, and it is the reason Dart kept its VM.", 6.1);
}

// =====================================================================
// 25. TOOLCHAIN
// =====================================================================
{
  const s = d.content("Flutter", "Your toolchain: install, create, run");
  T.codeBlock(s, [
    "# docs.flutter.dev/install, then Android Studio for the",
    "# Android SDK and an emulator, Xcode on macOS for iOS,",
    "# and VS Code or IntelliJ with the Dart + Flutter plugins.",
    "",
    "flutter doctor",
    "# checks every dependency and names what is missing",
    "",
    "flutter create my_app && cd my_app",
    "",
    "flutter run",
    "# debug build: JIT, hot reload (r), hot restart (R)",
    "",
    "flutter run --release",
    "# AOT machine code: what your users actually run",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.75, fontSize: 12 });

  note(s, 8.9, 1.95, 3.5, "In the lab this week", [
    "Lab 2 walks the whole install end to end, on Windows, macOS and Linux.",
    { text: "Run flutter doctor before you ask for help; it names the missing piece in one line.", options: { color: C.INK } },
    "An Android emulator is enough for every lab. A real device is faster, and the only way to test sensors.",
    "iOS builds need macOS and Xcode; the labs never require them.",
  ], { fontSize: 11.5, gap: 11, h: 4.6 });
}

// =====================================================================
// 26. CLOSING
// =====================================================================
const closeSlide = d.closing([
  ["checklist", "Recap", [
    "Compilation is a spectrum: Dart sits at two points on it",
    "Types catch type errors; security is a separate discipline",
    "Non-nullable by default: ? ?? ! late, and Kotlin maps 1:1",
    "Flutter = your Dart code, drawn by Impeller, AOT in release",
  ]],
  ["calendar", "This week", [
    "Lab 2: install the SDK, run flutter doctor, create and run an app",
    "Rewrite the null-unsafe snippet from the handout using ?, ?? and promotion",
    "Push the lab on a branch and open a PR, the Lecture 1 loop",
    "Form your project team (max 3) and claim a concept-presentation topic",
  ]],
  ["bookopen", "Read more", [
    "dart.dev/language",
    "dart.dev/null-safety",
    "dart.dev/effective-dart",
    "kotlinlang.org/docs/null-safety.html",
    "docs.flutter.dev/get-started",
  ]],
]);


d.write(path.join(__dirname, "Mobile-and-Embedded-Lecture2-v2.pptx")).then((f) => console.log("wrote", f));
