// ============================================================================
// Lecture 3: Widgets & Concurrency
// Built on the shared template (template.js). 61 source slides → 27.
// ============================================================================
const path = require("path");
const T = require("../assets/template");
const { Deck, C, F, MONO } = T;

const d = new Deck({
  lecture: 3,
  title: "Mobile and Embedded Computing",
  subtitle: "agent-assisted coding, Flutter widgets, async & isolates",
});

// ---------------------------------------------------------------- 1 TITLE ---
d.titleSlide();

// ------------------------------------------------------------------ 2 BIO ---
T.bioSlide(d);

// ----------------------------------------------------------- 3 OBJECTIVES ---
T.objectivesSlide(d, [
  ["bot", "Work with an agent", "Prompt it with real context, then review its output like any other pull request"],
  ["layout", "Read a widget tree", "Composition over inheritance, and what actually rebuilds when state changes"],
  ["gauge", "Keep the frame budget", "One frame = 1 ÷ refresh rate: 8.3 ms on a 120 Hz phone, not a fixed 16 ms"],
  ["split", "Async vs isolates", "When to await, when to spawn, and how Dart's model differs from Go's"],
]);

// ================================================================ SECTION 1 ==
d.divider("Agent-assisted coding", "Coding with an agent in the loop",
  "The 2026 tool landscape, and the review discipline it requires");

// ---------------------------------------------------------- 5 THE LANDSCAPE --
{
  const s = d.content("Agent-assisted coding", "The 2026 tool landscape");
  T.iconGrid(s, [
    ["terminal", "Agentic CLIs", "Claude Code, Codex CLI, Gemini CLI: they run in your repository, edit files and run your tests"],
    ["code", "IDE assistants", "Cursor, GitHub Copilot, Windsurf, JetBrains AI: completion plus in-editor chat"],
    ["cloud", "Cloud agents", "Long-running tasks against a checkout; what comes back is a pull request you review"],
    ["gitpr", "Review bots", "CodeRabbit and friends comment on your PR before a human ever opens it"],
    ["wrench", "Tool access (MCP)", "Agents reach your files, shell, database and APIs through a tool protocol"],
    ["brain", "One layer down", "All of them are shells over a handful of frontier models; the shell is what differs"],
  ], { y: 2.0, rowH: 2.3 });
  T.hline(s, 0.9, 6.4, 11.53);
  s.addText("The category moves every few months. What does not move is the part below: how you brief it, and how you check it.", {
    x: 0.9, y: 6.5, w: 11.5, h: 0.3, fontFace: F, fontSize: 12, color: C.GRAY, margin: 0,
  });
  s.addNotes("Ask the room which of these they already use. The point of the slide is the taxonomy, not the brand names. CLIs, IDE assistants, cloud agents and review bots are four different workflows with four different review burdens.");
}

// ------------------------------------------------------------- 6 STRENGTHS --
{
  const s = d.content("Agent-assisted coding", "What agents are good at, and where they fail");
  T.prosCons(s, [
    "Boilerplate: scaffolding, data classes, test fixtures, glue code",
    "Explaining unfamiliar code, stack traces and build errors",
    "Mechanical refactors that touch twenty files at once",
    "The test you were quietly going to skip",
    "A first draft of a task you are unsure how to start",
  ], [
    "Plausible but wrong APIs: Flutter's surface moves fast",
    "Security holes: hardcoded keys, unvalidated input, open rules",
    "Code that ignores conventions you never told it about",
    "Silent drift away from the package versions you are actually on",
    "The error paths and edge cases nobody asked for",
  ], { headL: "Where it helps", headR: "Where it costs you" });
  T.takeaway(s, "An agent produces confident output whether or not it is correct.",
    "Everything it writes still lands in the commit log under your name.", 5.35);
}

// ------------------------------------------------------------- 7 PROMPTING --
{
  const s = d.content("Agent-assisted coding", "Prompting: give it context, not wishes");
  T.lines(s, [
    "Name the files, packages and versions the change has to fit into",
    "Break multi-part work into numbered steps: one concern per prompt",
    "Ask for the shape of the output: a diff, a test, a table, a plan first",
    "State your conventions explicitly; it cannot guess your codebase",
    { text: "Then read the diff yourself.", options: { bold: true } },
  ], { x: 0.9, y: 1.95, w: 5.6, h: 4.4, fontSize: 14, paraSpaceAfter: 16 });
  T.codeBlock(s, [
    "// Weak",
    "add pagination to the list",
    "",
    "// Better",
    "In lib/ui/feed_page.dart, convert the",
    "ListView to ListView.builder and paginate:",
    "20 items per page, fetch the next page when",
    "the user is 200 px from the bottom, show a",
    "spinner row while loading.",
    "",
    "Conventions: Dio for HTTP, no setState",
    "outside a State class, const where possible.",
    "Add a widget test for the loading row.",
  ], { x: 6.9, y: 1.95, w: 5.53, h: 4.35, fontSize: 10.5 });
}

// ---------------------------------------------------------------- 8 REVIEW --
{
  const s = d.content("Agent-assisted coding", "Review it like any other pull request");
  T.iconGrid(s, [
    ["eye", "Read every line", "If you cannot explain it in review, you cannot ship it, or defend it at the exam"],
    ["shieldalert", "Check the security surface", "Hardcoded keys, unvalidated input, permissive database rules (→ Lecture 9)"],
    ["bug", "Test the edges", "Empty list, no network, expired token: the paths nobody thought to ask for"],
    ["history", "Check the API is current", "Models learn from old docs: firebase_ai, not the deprecated google_generative_ai"],
    ["gitpr", "Keep the slices small", "One concern per branch and PR; generated code is only reviewable in slices"],
    ["users", "You own it", "“The agent wrote it” is not a defense in code review, and not one here either"],
  ], { y: 2.0, rowH: 2.3 });
  s.addNotes("Tie this back to Lecture 1: the project is graded on the branch → PR → review loop. Agent-generated code makes review more important, not less, because the volume goes up.");
}

// ================================================================ SECTION 2 ==
d.divider("Flutter widgets", "Everything is a widget",
  "The tree, composition, state, and what actually rebuilds");

// ------------------------------------------------------------ 10 THE TREES --
{
  const s = d.content("Flutter widgets", "Everything is a widget, and three trees");
  T.lines(s, [
    "A widget is an immutable description of a piece of UI. Cheap to create, created and thrown away constantly.",
    "You compose them: a Scaffold holds a Column, which holds a Text and an ElevatedButton. That nesting is the widget tree.",
    "Behind it Flutter keeps two more. The element tree is the live instance graph: it holds State. The render tree does layout, paint and hit-testing.",
    "You write the first tree. Flutter maintains the other two.",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 3.6, fontSize: 14, paraSpaceAfter: 15 });
  T.flowDown(s, [
    ["Widget", "immutable config, rebuilt freely", "hair"],
    ["Element", "the live tree, holds State", "black"],
    ["RenderObject", "layout · paint · hit-test", "hair"],
  ], { x: 8.5, y: 2.0, w: 4.1, h: 1.0 });
  T.takeaway(s, "Rebuilding a widget is not redrawing the screen.",
    "It is handing Flutter a new description of what the screen should be.", 5.7, { w: 7.1 });
}

// ----------------------------------------------------------- 11 COMPOSITION --
{
  const s = d.content("Flutter widgets", "Composition, not inheritance");
  T.codeBlock(s, [
    "// You do not subclass Text to give it padding",
    "// and a border. You wrap it.",
    "",
    "Padding(",
    "  padding: const EdgeInsets.all(16),",
    "  child: DecoratedBox(",
    "    decoration: BoxDecoration(",
    "      border: Border.all(color: Colors.black12),",
    "    ),",
    "    child: const Text('Hello'),",
    "  ),",
    ")",
  ], { x: 0.9, y: 1.95, w: 6.8, h: 3.95, fontSize: 11.5 });
  T.lines(s, [
    "Each widget does one thing. Layout comes from nesting them, not from a widget with fifty properties.",
    "That is why trees get deep; deep trees are normal and cheap.",
    "Extract a subtree into its own named widget as soon as it repeats, or as soon as build() stops fitting on your screen.",
    "Small widgets also rebuild in smaller pieces, which is the next slide.",
  ], { x: 8.0, y: 1.95, w: 4.43, h: 4.0, fontSize: 13, paraSpaceAfter: 13 });
  T.takeaway(s, "Complex UIs are built out of simple widgets.",
    "There is no inheritance hierarchy to learn, only a catalog of widgets to compose.", 6.15);
}

// ------------------------------------------------------------- 12 STATELESS --
{
  const s = d.content("Flutter widgets", "StatelessWidget: configuration only");
  T.codeBlock(s, [
    "class Greeting extends StatelessWidget {",
    "  const Greeting({super.key, required this.name});",
    "",
    "  final String name;   // every field is final",
    "",
    "  @override",
    "  Widget build(BuildContext context) {",
    "    return Text('Hello, $name');",
    "  }",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.5, h: 3.5, fontSize: 11.5 });
  T.lines(s, [
    { text: "It does not \"build once\".", options: { bold: true } },
    "A StatelessWidget rebuilds whenever its parent rebuilds, or whenever something it depends on changes.",
    "What it does not have is mutable state of its own: everything it needs arrives through its constructor.",
    "Give it a const constructor whenever you can. That is what lets Flutter skip it later.",
  ], { x: 8.75, y: 1.95, w: 3.68, h: 4.0, fontSize: 12.5, paraSpaceAfter: 12 });
  T.takeaway(s, "Stateless means \"owns no state\",", "not \"is never rebuilt\".", 5.7, { w: 7.5 });
}

// -------------------------------------------------------------- 13 STATEFUL --
{
  const s = d.content("Flutter widgets", "StatefulWidget and setState");
  T.codeBlock(s, [
    "class CounterView extends StatefulWidget {",
    "  const CounterView({super.key});",
    "  @override",
    "  State<CounterView> createState() => _CounterViewState();",
    "}",
    "",
    "class _CounterViewState extends State<CounterView> {",
    "  int _count = 0;          // the mutable state lives here",
    "",
    "  @override",
    "  Widget build(BuildContext context) => Column(children: [",
    "    Text('Count: $_count'),",
    "    ElevatedButton(onPressed: () => setState(() => _count++),",
    "        child: const Text('Add')),",
    "  ]);",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.75, fontSize: 10 });
  s.addText("Two classes, one widget", {
    x: 8.85, y: 1.95, w: 3.58, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0,
  });
  T.lines(s, [
    "CounterView is still immutable configuration: it is recreated on every parent rebuild.",
    "_CounterViewState is the object that survives those rebuilds. Your mutable fields go there.",
    "setState mutates the field and marks the element dirty; Flutter rebuilds that subtree on the next frame.",
    { text: "Name the class for what it is.", options: { bold: true } },
  ], { x: 8.85, y: 2.4, w: 3.58, h: 4.0, fontSize: 12, paraSpaceAfter: 11 });
  s.addNotes("The old deck's example class was a StatefulWidget named StatelessText. Point out that naming a stateful widget 'Stateless…' misleads every reader of the code. Live demo: hot-reload this counter, then add a second setState and watch only this subtree rebuild in the Flutter Inspector.");
}

// ------------------------------------------------------- 14 WHAT REBUILDS ----
{
  const s = d.content("Flutter widgets", "What actually rebuilds");
  T.lines(s, [
    "Flutter does not rebuild the whole widget tree each frame. setState marks one element dirty, and only that subtree rebuilds.",
    "On rebuild, the new widgets are matched against the existing elements by runtimeType first, then by key.",
    "Match → the element and its State are reused. No match → the old element is discarded and its State goes with it.",
  ], { x: 0.9, y: 1.95, w: 7.0, h: 2.6, fontSize: 14, paraSpaceAfter: 15 });
  T.codeBlock(s, [
    "// Same instance every build → Flutter skips the subtree",
    "const Text('Total'),",
  ], { x: 0.9, y: 4.55, w: 7.0, h: 1.05, fontSize: 11 });
  T.panel(s, 8.3, 1.95, 4.13, 3.65);
  s.addText("Keys", { x: 8.65, y: 2.2, w: 3.5, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  s.addText([
    { text: "ValueKey('email'): identity from a value", options: { breakLine: true } },
    { text: "ObjectKey(item): identity from an object", options: { breakLine: true } },
    { text: "UniqueKey(): never matches, so it forces a fresh element", options: { breakLine: true } },
    { text: "GlobalKey: reach a widget from anywhere, and use it sparingly", options: { breakLine: true } },
    { text: "You need a key when list items are reordered, inserted or removed. Otherwise State follows position, not item.", options: {} },
  ], { x: 8.65, y: 2.6, w: 3.5, h: 2.9, fontFace: F, fontSize: 11, color: C.GRAY, margin: 0, paraSpaceAfter: 9, valign: "top" });
  T.takeaway(s, "Builds are designed to be cheap.",
    "Widgets are throwaway descriptions; elements and State are what persist.", 5.8);
}

// ---------------------------------------------------------------- 15 LAYOUT --
{
  const s = d.content("Flutter widgets", "The layout widgets you'll use every day");
  T.table(s, ["What it does", "The knobs you actually turn"], [
    ["Container", "padding, margin, decoration and size in one box", "padding · margin · decoration · alignment"],
    ["Row / Column", "lay children out along one axis", "mainAxisAlignment · crossAxisAlignment · mainAxisSize"],
    ["Expanded / Flexible", "divide the leftover space in a Row or Column", "flex: Expanded takes all, Flexible may take less"],
    ["Stack / Positioned", "overlay children; the first child paints at the bottom", "top · left · right · bottom"],
    ["SizedBox / ConstrainedBox", "impose a size, or a min/max constraint", "width · height · constraints"],
    ["ListView / GridView", "scroll a list or a grid, lazily", ".builder · .separated · scrollDirection"],
  ], { y: 2.05, labelW: 2.35, rowH: 0.55, fontSize: 11 });
  T.hline(s, 0.9, 6.0, 11.53);
  s.addText([
    { text: "Reach for Padding and SizedBox before Container. ", options: { bold: true, color: C.INK } },
    { text: "Container bundles several widgets; use it when you need most of them.", options: { color: C.GRAY } },
  ], { x: 0.9, y: 6.2, w: 11.5, h: 0.5, fontFace: F, fontSize: 13.5, margin: 0 });
}

// -------------------------------------------------------------- 16 SCROLLING --
{
  const s = d.content("Flutter widgets", "Making it scroll, lazily");
  T.codeBlock(s, [
    "// Eager: every child is built up front.",
    "ListView(children: items.map(ItemTile.new).toList())",
    "",
    "// Lazy: only the visible slice is ever built.",
    "ListView.builder(",
    "  itemCount: items.length,",
    "  itemBuilder: (context, i) => ItemTile(",
    "    key: ValueKey(items[i].id),",
    "    item: items[i],",
    "  ),",
    ")",
  ], { x: 0.9, y: 1.95, w: 7.3, h: 3.6, fontSize: 11 });
  T.lines(s, [
    "ListView.separated is the same thing with a Divider between items.",
    "GridView.builder is the same idea in two dimensions.",
    "SingleChildScrollView scrolls exactly one child and builds all of it: fine for a form, wrong for a feed.",
    "CustomScrollView composes slivers when you need a collapsing app bar above a list.",
  ], { x: 8.5, y: 1.95, w: 3.93, h: 4.0, fontSize: 12.5, paraSpaceAfter: 12 });
  T.takeaway(s, "Use a lazy list by default.", "If the list can grow with your data, it has to be a .builder.", 5.7, { w: 7.3 });
}

// ================================================================ SECTION 3 ==
d.divider("Concurrency", "Async, isolates and the frame budget",
  "One thread, one event loop, and when you need a second heap");

// ---------------------------------------------------------- 18 FRAME BUDGET --
{
  const s = d.content("Concurrency", "One frame budget = 1 ÷ refresh rate");
  T.statRow(s, [
    ["16.7 ms", "60 Hz", "older devices, power-saving mode"],
    ["11.1 ms", "90 Hz", "common mid-range in 2026"],
    ["8.3 ms", "120 Hz", "most 2026 flagships, and they switch on the fly"],
  ], { y: 2.15, bigSize: 46 });
  T.hline(s, 0.9, 4.5, 11.53);
  T.lines(s, [
    "Inside that budget the UI thread has to handle input, run build(), lay out, paint and hand the frame to the GPU.",
    "Overrun it and the frame is dropped: that is the stutter users call jank. Repeated overruns show up as continuous stutter.",
    { text: "Do not hard-code 16 ms.", options: { bold: true } },
  ], { x: 0.9, y: 4.75, w: 11.53, h: 1.9, fontSize: 14, paraSpaceAfter: 12 });
  s.addNotes("The old deck taught 16 ms as an invariant. It is only the 60 Hz case. Phones also change refresh rate dynamically to save power, so the budget moves at runtime. That is why the rule is to avoid blocking the UI thread, rather than to fit inside a fixed number.");
}

// ------------------------------------------------------------ 19 EVENT LOOP --
{
  const s = d.content("Concurrency", "The event loop and the microtask queue");
  T.lines(s, [
    "Your app runs on a single thread inside one isolate, the main isolate, and that isolate owns the UI.",
    "That thread runs an event loop: take one event, run it to completion, drain the entire microtask queue, then take the next event.",
    "await starts nothing. It registers the rest of your function as a continuation and hands control back to the loop.",
    "Nothing else runs while your code runs. A 400 ms function is 400 ms of dropped frames.",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 3.5, fontSize: 14, paraSpaceAfter: 14 });
  T.flowDown(s, [
    ["Microtask queue", "Future callbacks, drained completely first", "panel"],
    ["Event queue", "I/O, timers, gestures, platform messages", "hair"],
    ["Frame", "build → layout → paint", "black"],
  ], { x: 8.5, y: 2.0, w: 4.1, h: 1.0 });
  T.takeaway(s, "Concurrent, not parallel.", "One thread, interleaving work that is mostly waiting.", 5.6, { w: 7.1 });
}

// ------------------------------------------------------- 20 ASYNC + TRY/CATCH --
{
  const s = d.content("Concurrency", "Futures, async/await, and error handling");
  T.codeBlock(s, [
    "Future<User> loadUser(String id) async {",
    "  final res = await dio.get('/users/$id');   // suspends here",
    "  return User.fromJson(res.data);",
    "}",
    "",
    "Future<void> _refresh() async {",
    "  try {",
    "    _user = await loadUser(widget.id);",
    "  } on DioException catch (e) {        // expected failure",
    "    _error = 'Network failed: ${e.message}';",
    "  } catch (e, stack) {                 // anything else",
    "    _error = 'Unexpected error';",
    "    FirebaseCrashlytics.instance.recordError(e, stack);",
    "  } finally {",
    "    if (mounted) setState(() => _loading = false);",
    "  }",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.9, fontSize: 10 });
  s.addText("Errors inside async code", {
    x: 8.85, y: 1.95, w: 3.58, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0,
  });
  T.lines(s, [
    "A failure inside async code does not throw at the call site; it completes the Future with an error.",
    "await rethrows it, so try/catch/finally behaves exactly as it does in synchronous code. That is the whole point of await.",
    "Without a try, the error escapes as an unhandled async error, which users rarely report.",
    "Always check mounted before setState after an await: the widget may already have left the tree.",
  ], { x: 8.85, y: 2.4, w: 3.58, h: 4.2, fontSize: 11.5, paraSpaceAfter: 10 });
  s.addNotes("Error handling around await is absent from the rest of the course; this is the slide that covers it. Demo: turn off Wi-Fi mid-request and show the difference between the caught path and the unhandled one.");
}

// ----------------------------------------------------------------- 21 STREAMS --
{
  const s = d.content("Concurrency", "Streams: many values, over time");
  T.codeBlock(s, [
    "// A Future is one value, later.",
    "final user = await loadUser(id);",
    "",
    "// A Stream is many values, over time.",
    "Stream<int> ticker() async* {",
    "  for (var i = 0; ; i++) {",
    "    await Future.delayed(const Duration(seconds: 1));",
    "    yield i;",
    "  }",
    "}",
    "",
    "await for (final tick in ticker()) { print(tick); }",
  ], { x: 0.9, y: 1.95, w: 7.3, h: 3.85, fontSize: 11 });
  T.lines(s, [
    "In a widget, use StreamBuilder: it subscribes, rebuilds on each event and cancels for you.",
    "Streams are how WebSockets, sensor feeds and database snapshots reach your UI.",
    "→ Lecture 8, WebSockets · → Lecture 11, sensors over MQTT",
    "Cancel every subscription you create by hand in dispose().",
  ], { x: 8.5, y: 1.95, w: 3.93, h: 4.0, fontSize: 12.5, paraSpaceAfter: 12 });
  T.takeaway(s, "One value → Future. Many → Stream.", "Both ride the same event loop.", 5.95, { w: 7.3 });
}

// ---------------------------------------------------- 22 ASYNC IS NOT PARALLEL --
{
  const s = d.content("Concurrency", "Async is not parallel");
  T.codeBlock(s, [
    "// This function is async. It still freezes the UI.",
    "Future<int> sumTo(int n) async {",
    "  var total = 0;",
    "  for (var i = 0; i < n; i++) {",
    "    total += i;        // pure CPU, it never yields",
    "  }",
    "  return total;        // the loop never got a turn",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.3, h: 2.9, fontSize: 11.5 });
  s.addText("Typical offenders: decoding a large JSON payload, image resize and filtering, encryption, compression, sorting hundreds of thousands of items.", {
    x: 0.9, y: 5.0, w: 7.3, h: 0.7, fontFace: F, fontSize: 12, color: C.GRAY, margin: 0, valign: "top",
  });
  T.lines(s, [
    "async only helps when something else is doing the waiting: a socket, a disk, a timer.",
    "Pure CPU work has nothing to wait for, so it never returns to the event loop.",
    "Cooperative multitasking only works if every task yields.",
  ], { x: 8.5, y: 1.95, w: 3.93, h: 3.4, fontSize: 12.5, paraSpaceAfter: 13 });
  T.takeaway(s, "Rule of thumb:", "waiting on I/O → async/await. Burning CPU for longer than a frame → isolate.", 5.85);
}

// ---------------------------------------------------------------- 23 COMPUTE --
{
  const s = d.content("Concurrency", "compute(): the one-call isolate");
  T.codeBlock(s, [
    "import 'package:flutter/foundation.dart';",
    "",
    "// Must be a top-level or static function.",
    "List<Photo> parsePhotos(String body) {",
    "  final list = jsonDecode(body) as List<dynamic>;",
    "  return list.map(Photo.fromJson).toList();",
    "}",
    "",
    "Future<List<Photo>> fetchPhotos() async {",
    "  final res = await http.get(url);        // I/O  → await",
    "  return compute(parsePhotos, res.body);  // CPU  → isolate",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 3.85, fontSize: 11 });
  T.lines(s, [
    "compute() spawns a short-lived isolate, runs one function, sends the result back and shuts it down.",
    "Arguments and results must be sendable: primitives, Strings, Lists and Maps of them, TransferableTypedData.",
    "It costs a few milliseconds to spawn, and the payload is copied both ways, so do not use it for 2 ms of work.",
  ], { x: 8.85, y: 1.95, w: 3.58, h: 4.0, fontSize: 12, paraSpaceAfter: 12 });
  T.takeaway(s, "compute() covers most isolate work in application code.",
    "The next slide covers the cases it does not.", 5.95, { w: 7.7 });
}

// ----------------------------------------------------------------- 24 SPAWN --
{
  const s = d.content("Concurrency", "Isolate.spawn, SendPort, ReceivePort");
  T.codeBlock(s, [
    "Future<int> sumInIsolate(int n) async {",
    "  final inbox = ReceivePort();",
    "  await Isolate.spawn(_worker, [inbox.sendPort, n]);",
    "  final total = await inbox.first as int;  // one message",
    "  inbox.close();",
    "  return total;",
    "}",
    "",
    "// Runs in a new isolate: own heap, own event loop.",
    "void _worker(List<Object> msg) {",
    "  final send = msg[0] as SendPort;",
    "  final n = msg[1] as int;",
    "  var total = 0;",
    "  for (var i = 0; i < n; i++) { total += i; }",
    "  Isolate.exit(send, total);   // send and terminate",
    "}",
  ], { x: 0.9, y: 1.9, w: 7.9, h: 4.6, fontSize: 10.5 });
  s.addText("The two ports", {
    x: 9.05, y: 1.95, w: 3.38, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0,
  });
  T.lines(s, [
    "ReceivePort is your inbox. SendPort is a handle other isolates can post to.",
    "Messages are deep-copied between heaps: nothing is shared, so nothing needs a lock.",
    "Isolate.exit hands the result over without copying it, then ends the isolate.",
    "Use this when the worker is long-lived or streams results back; use compute() otherwise.",
  ], { x: 9.05, y: 2.4, w: 3.38, h: 4.2, fontSize: 11.5, paraSpaceAfter: 10 });
}

// -------------------------------------------------------- 25 ASYNC VS ISOLATE --
{
  const s = d.content("Concurrency", "Async vs isolates, precisely");
  T.table(s, ["async / await", "Isolate"], [
    ["Threads", "one, interleaved on the UI thread", "one per isolate, scheduled by the OS"],
    ["Memory", "one heap, shared by everything", "a separate heap per isolate"],
    ["Talking", "just call the function", "send messages over ports; values are copied"],
    ["Good for", "I/O: network, disk, database, timers", "CPU: parse, decode, encrypt, compress, sort"],
    ["Data races", "impossible: one thing runs at a time", "impossible: no shared mutable memory"],
    ["Ordering races", "possible", "possible: replies can arrive out of order"],
  ], { y: 2.05, labelW: 1.9, rowH: 0.55, fontSize: 11.5 });
  T.takeaway(s, "No shared memory means no data races, but it does not mean no races.",
    "Two replies can still arrive in an order you did not plan for. And the number of isolates is not capped by core count: the OS schedules them like any other work.", 5.95);
  s.addNotes("Two corrections to the old deck here. 'Race conditions: impossible' was wrong: data races are impossible, while logical and message-ordering races are not. And '4 cores means at most 4 isolates' was wrong: you can spawn more, you just stop gaining throughput once the cores are saturated.");
}

// ----------------------------------------------------------------- 26 GO ------
{
  const s = d.content("Concurrency", "Dart isolates vs Go goroutines");
  s.addText("Dart: no shared memory, message passing", {
    x: 0.9, y: 1.88, w: 5.8, h: 0.32, fontFace: F, fontSize: 13, bold: true, color: C.INK, margin: 0,
  });
  T.codeBlock(s, [
    "final inbox = ReceivePort();",
    "await Isolate.spawn(producer, inbox.sendPort);",
    "",
    "await for (final item in inbox) {   // consumer",
    "  if (item == null) break;",
    "  print(item);",
    "}",
    "",
    "void producer(SendPort out) {",
    "  for (var i = 0; i < 5; i++) out.send(i);",
    "  out.send(null);",
    "}",
  ], { x: 0.9, y: 2.28, w: 5.8, h: 3.6, fontSize: 9.5 });
  s.addText("Go: shared memory, synchronized by channels", {
    x: 6.9, y: 1.88, w: 5.53, h: 0.32, fontFace: F, fontSize: 13, bold: true, color: C.INK, margin: 0,
  });
  T.codeBlock(s, [
    "ch := make(chan int)",
    "",
    "go func() {                 // producer",
    "    for i := 0; i < 5; i++ {",
    "        ch <- i",
    "    }",
    "    close(ch)",
    "}()",
    "",
    "for item := range ch {      // consumer",
    "    fmt.Println(item)",
    "}",
  ], { x: 6.9, y: 2.28, w: 5.53, h: 3.6, fontSize: 9.5 });
  T.takeaway(s, "Same task, opposite guarantee.",
    "Dart copies messages between separate heaps, so sharing is impossible. Go shares one heap and uses channels to pass ownership; keeping that discipline is up to the programmer.  → Lecture 12, Go & gRPC", 6.0);
  s.addNotes("Go's slogan is 'share memory by communicating', which is a convention. Dart enforces it: there is no shared mutable memory to get wrong. The cost is that every message is copied. Go comes back in Lecture 12 with gRPC, and TinyGo in Lecture 11 on microcontrollers.");
}

// -------------------------------------------------------------- 27 CLOSING ---
{
  const s = d.closing([
    ["checklist", "Recap", [
      "Agents draft; you brief, review, test and own the result",
      "Widgets are immutable descriptions; only dirty subtrees rebuild, matched by runtimeType then key",
      "One frame budget = 1 ÷ refresh rate, not a fixed 16 ms",
      "await is not a thread; an isolate is one, minus shared memory",
    ]],
    ["calendar", "This week", [
      "Lab: the counter, then a ListView.builder feed with keys",
      "Wrap every await in your app in try / catch / finally",
      "Move one CPU-heavy call into compute() and measure the frame times",
    ]],
    ["bookopen", "Read more", [
      "docs.flutter.dev/ui/widgets-intro",
      "dart.dev/language/async  ·  dart.dev/language/concurrency",
      "api.flutter.dev: Isolate, compute, StreamBuilder",
      "go.dev/tour/concurrency",
    ]],
  ]);
}

d.write(path.join(__dirname, "Mobile-and-Embedded-Lecture3-v2.pptx"))
  .then((f) => console.log("written:", f, "slides:", d.n));
