// ============================================================================
// Mobile & Embedded Computing, Lecture 4
// "State Management, Part 1": debugging, Stateless vs Stateful,
// introducing state management.
// Built on the shared template (template.js). Do not restyle.
// ============================================================================
const path = require("path");
const T = require("../assets/template");
const { Deck, C, F, MONO } = T;

const d = new Deck({
  lecture: 4,
  title: "State Management, Part 1",
  subtitle: "debugging, Stateless vs Stateful, introducing state management",
});

// ---------------------------------------------------------------- 1 TITLE ---
d.titleSlide();

// ------------------------------------------------------------------ 2 BIO ---
T.bioSlide(d);

// ----------------------------------------------------------- 3 OBJECTIVES ---
T.objectivesSlide(d, [
  ["bug", "Debug on purpose", "Launch and attach DevTools, read the inspector, set breakpoints and step through Dart"],
  ["layers", "The three trees", "Widget, Element and RenderObject, and what setState actually triggers"],
  ["toggle", "Stateless vs Stateful", "When a widget really needs a State object, and when it genuinely does not"],
  ["share", "Sharing state", "Lifting state up, InheritedWidget, and why value equality decides rebuilds"],
]);

// -------------------------------------------------------------- 4 DIVIDER ---
d.divider(
  "Part 1 · Debugging",
  "Seeing what your app is actually doing",
  "DevTools, breakpoints, and useful logging"
);

// ------------------------------------------------------- 5 DEBUG TOOLBOX ----
{
  const s = d.content("Debugging", "The debugging toolbox");
  T.iconGrid(s, [
    ["refresh", "Hot reload", "Injects changed source into the running VM and rebuilds. State objects survive."],
    ["power", "Hot restart", "Rebuilds from scratch and drops all state. Use it whenever initState or a global changed."],
    ["terminal", "debugPrint & assert", "Cheap, always available, and compiled out of release builds entirely."],
    ["pause", "Breakpoints", "Stop on a line, inspect every variable in scope, step through the frame."],
    ["gauge", "DevTools", "Inspector, performance, CPU, memory, network: a browser tab attached to your app."],
    ["circlealert", "Read the error", "Flutter's exception boxes name the widget and the constraint that failed."],
  ], { y: 2.05, rowH: 2.35 });
  s.addNotes("Ask the room how many have ever opened DevTools. Usually very few; that is the gap this section closes. Hot reload vs hot restart is a common source of 'my change didn't apply'.");
}

// ------------------------------------------------------------ 6 debugPrint --
{
  const s = d.content("Debugging", "print, debugPrint, and assert");
  T.codeBlock(s, [
    "print('value: $x');       // logcat truncates long lines",
    "debugPrint('value: $x');  // throttled, nothing is dropped",
    "assert(count >= 0, 'count negative: $count');  // debug only",
    "if (kDebugMode) debugPrint(jsonEncode(payload));",
    "",
    "// Three switches worth memorizing:",
    "debugDumpApp();                        // widget tree, as text",
    "debugDumpRenderTree();                 // sizes + constraints",
    "debugPrintRebuildDirtyWidgets = true;  // logs every rebuild",
  ], { x: 0.9, y: 1.95, w: 7.4, h: 3.35, fontSize: 11 });
  s.addText("Why not just print?", { x: 8.6, y: 1.98, w: 4.0, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "Android's logcat silently drops lines beyond a length limit. debugPrint throttles output so nothing disappears.",
    "assert takes a message. Use it for invariants you want to hear about in the lab and never in production.",
    "debugPrintRebuildDirtyWidgets is the print that matters today: it names every widget that rebuilt, in build order.",
  ], { x: 8.6, y: 2.45, w: 4.0, h: 3.4, fontSize: 11.5, color: C.GRAY, paraSpaceAfter: 11 });
  T.takeaway(s, "Logging is a primary debugging tool.", "It is the only tool that works identically on a simulator, a real phone and a colleague's machine.", 5.7);
}

// -------------------------------------------------------- 7 LAUNCH DEVTOOLS -
{
  const s = d.content("Debugging", "Launching and attaching DevTools");
  T.codeBlock(s, [
    "# Run in debug mode; the console prints the DevTools URL.",
    "flutter run",
    "",
    "#   Flutter DevTools debugger and profiler is available at:",
    "#   http://127.0.0.1:9100?uri=http://127.0.0.1:53412/AbCdEfGh=/",
    "",
    "# Already running? Launch DevTools and paste that VM Service URI:",
    "dart devtools",
    "",
    "# From the IDE, skip all of it:",
    "#   VS Code         Cmd/Ctrl+Shift+P  ->  \"Dart: Open DevTools\"",
    "#   Android Studio  the \"Flutter Inspector\" tool window",
  ], { x: 0.9, y: 1.95, w: 11.53, h: 4.0, fontSize: 11 });
  T.takeaway(s, "Attach the tools before you need them.",
    "Performance work needs flutter run --profile: debug builds are JIT and assertion-heavy, so their timings mean nothing.", 6.1);
  s.addNotes("This is the step the labs never spell out: Lab 4 asks students to use DevTools but never says how to launch or attach it. Demo it live: run the app, copy the URL, open the browser.");
}

// ------------------------------------------------------------- 8 DEVTOOLS ---
{
  const s = d.content("Debugging", "What each DevTools tab is for");
  T.iconGrid(s, [
    ["layers", "Inspector", "The live widget tree, the selected widget's properties, and the Layout Explorer for Row/Column overflow."],
    ["gauge", "Performance", "Frame timeline, UI vs raster thread, and exactly which frames blew the budget."],
    ["activity", "CPU Profiler", "Where Dart time actually goes: a flame chart of your own functions."],
    ["memory", "Memory", "Heap snapshots and allocation tracking. This is how you find the controller you forgot to dispose."],
    ["network", "Network", "HTTP and WebSocket traffic, request by request. We come back to this in Lecture 6."],
    ["filetext", "Logging", "The console stream, plus structured events and timeline entries."],
  ], { y: 2.05, rowH: 2.35 });
}

// ------------------------------------------------------------ 9 INSPECTOR ---
{
  const s = d.content("Debugging", "The Widget Inspector");
  T.lines(s, [
    "Select Widget Mode: tap a pixel on the running device and the inspector jumps to that widget, and your IDE jumps to the source line that built it.",
    "The Layout Explorer shows flex factors and incoming constraints. It is where you find the cause of a RenderFlex overflow, the yellow-and-black stripes.",
    { text: "Track widget rebuilds counts how many times each widget rebuilt. That count is the measurement this lecture is about.", options: { bold: true } },
    "Highlight repaints wraps every layer in a rotating color. Anything flashing constantly is repainting when it should not be.",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 3.4, fontSize: 13.5, paraSpaceAfter: 13 });
  T.panel(s, 8.4, 1.95, 4.2, 3.3);
  s.addText("Try this in the lab", { x: 8.75, y: 2.2, w: 3.5, h: 0.35, fontFace: F, fontSize: 12, bold: true, color: C.GRAY, margin: 0 });
  T.lines(s, [
    "1   Run your todo app",
    "2   Open the Inspector",
    "3   Turn on Track widget rebuilds",
    "4   Type one character into a text field",
    "5   Count what rebuilt",
  ], { x: 8.75, y: 2.65, w: 3.5, h: 2.4, fontSize: 12, color: C.INK, paraSpaceAfter: 8 });
  T.takeaway(s, "You cannot reason about rebuilds from the source alone.", "The inspector shows you the ones that actually happen.", 5.6);
}

// --------------------------------------------------------- 10 PERFORMANCE ---
{
  const s = d.content("Debugging", "Frames, jank, and the performance overlay");
  T.statRow(s, [
    ["16.7", "ms at 60 Hz", "one frame budget"],
    ["8.3", "ms at 120 Hz", "most 2026 phones"],
    ["2", "threads to watch", "UI (Dart) and raster (Impeller)"],
  ], { y: 2.0, bigSize: 48 });
  T.hline(s, 0.9, 4.4, 11.53);
  T.lines(s, [
    "The performance overlay draws two bar charts: the UI thread, which runs your Dart build and layout, and the raster thread, where Impeller turns the layer tree into GPU commands. A bar that crosses the line is a dropped frame.",
    "There is no fixed 16 ms rule. One frame budget is 1 ÷ refresh rate, and most phones you will be graded on are 90–120 Hz.",
    "The usual causes sit squarely in this lecture: setState called too high in the tree, expensive work inside build(), and missing const.",
  ], { x: 0.9, y: 4.6, w: 11.53, h: 2.2, fontSize: 12.5, color: C.INK, paraSpaceAfter: 10 });
  s.addNotes("Correction from older versions of this deck: the 16 ms budget is only true at 60 Hz. State it as one frame budget = 1/refresh rate. Also stress that debug-mode timings are meaningless: JIT, no optimization, assertions on.");
}

// -------------------------------------------------------- 11 BREAKPOINTS ----
{
  const s = d.content("Debugging", "Breakpoints and stepping");
  T.lines(s, [
    "Click the gutter in VS Code or Android Studio to set a breakpoint, then start the app with the debugger attached; plain flutter run in a terminal has no debugger.",
    "Right-click a breakpoint to make it conditional: todo.id == 42. That is more precise than a print inside a loop.",
    "debugger() from dart:developer breaks from code, which is useful inside a callback you cannot click on.",
    "While paused you can hover any variable, edit it in the Variables pane, and evaluate arbitrary Dart in the console.",
  ], { x: 0.9, y: 1.95, w: 6.7, h: 3.6, fontSize: 13.5, paraSpaceAfter: 13 });
  const steps = [
    ["Step over", "Run this line. Do not descend into the calls on it."],
    ["Step into", "Descend into the call on this line."],
    ["Step out", "Finish this function, stop back at the caller."],
    ["Resume", "Run until the next breakpoint, or until the app exits."],
  ];
  let y = 1.98;
  steps.forEach(([head, txt], i) => {
    s.addText(head, { x: 8.2, y, w: 4.4, h: 0.32, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
    s.addText(txt, { x: 8.2, y: y + 0.33, w: 4.4, h: 0.55, fontFace: F, fontSize: 11.5, color: C.GRAY, margin: 0, valign: "top" });
    y += 1.06;
    if (i < steps.length - 1) T.hline(s, 8.2, y - 0.14, 4.4);
  });
  T.takeaway(s, "Hot reload keeps your State objects; hot restart throws them away.",
    "If a change does not appear, that is nearly always the reason.", 5.9);
}

// ------------------------------------------------------------- 12 DIVIDER ---
d.divider(
  "State",
  "What changes, and who owns it",
  "Three trees, setState, and why StatelessWidget does not “build once”"
);

// ------------------------------------------------------ 13 WHAT IS STATE ----
{
  const s = d.content("State", "What counts as state");
  T.table(s, ["Ephemeral: UI state", "App: shared state"], [
    ["Lives in", "one widget's State object", "above every widget that reads it"],
    ["Looks like", "a checkbox tick, a page index, an animation, text being typed", "the signed-in user, theme mode, the cart, a cached feed"],
    ["Disposed when", "the widget leaves the tree", "never, ideally: it outlives navigation"],
    ["Reach for", "setState", "lift it up, then a shared holder"],
  ], { y: 2.2, rowH: 0.7, labelW: 1.5, fontSize: 12 });
  T.takeaway(s, "Most state is ephemeral.",
    "If setState in one widget is enough, that is the correct answer, not a beginner's answer.", 5.7);
}

// -------------------------------------------------------- 14 IMMUTABILITY ---
{
  const s = d.content("State", "Widgets are immutable blueprints");
  T.lines(s, [
    "A widget is a description of a piece of UI, not the UI itself. Once constructed, its fields never change.",
    "Changing the screen means constructing a new description, never editing the old one.",
    "That is what makes the framework's job cheap: comparing two immutable descriptions is fast, and whole subtrees can be skipped.",
    "const goes further. The compiler canonicalizes a const widget, so the identical instance comes back every build, and the framework can prove nothing changed.",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 3.3, fontSize: 13.5, paraSpaceAfter: 14 });
  T.panel(s, 8.4, 2.0, 4.2, 2.55);
  s.addText("const Text('Target °C')", { x: 8.75, y: 2.3, w: 3.6, h: 0.32, fontFace: MONO, fontSize: 12, color: C.INK, margin: 0 });
  s.addText("the same instance every build", { x: 8.75, y: 2.66, w: 3.6, h: 0.3, fontFace: F, fontSize: 11, color: C.GRAY, margin: 0 });
  T.hline(s, 8.75, 3.15, 3.5);
  s.addText("Text('Target °C')", { x: 8.75, y: 3.42, w: 3.6, h: 0.32, fontFace: MONO, fontSize: 12, color: C.INK, margin: 0 });
  s.addText("a new instance every build", { x: 8.75, y: 3.78, w: 3.6, h: 0.3, fontFace: F, fontSize: 11, color: C.GRAY, margin: 0 });
  T.takeaway(s, "Immutability is what makes rebuilding cheap.", "", 5.6);
}

// ------------------------------------------------------- 15 THE THREE TREES -
{
  const s = d.content("State", "The three trees");
  s.addText("Every Flutter app maintains three parallel trees. Almost every rebuild question is answered by knowing which one you are talking about.", {
    x: 0.9, y: 1.5, w: 11.5, h: 0.35, fontFace: F, fontSize: 13, color: C.GRAY, margin: 0,
  });

  const cols = [
    [0.9, "panel", "Widget", ["immutable configuration", "created and thrown away", "on every build", "cheap, just a description"], "you write this"],
    [4.85, "black", "Element", ["one per position in the tree", "holds your State object", "decides: reuse this,", "or rebuild it"], "the framework owns this"],
    [8.8, "hair", "RenderObject", ["layout, paint, hit-testing", "expensive to create", "mutated in place", "whenever possible"], "the pixels come from this"],
  ];
  const bw = 3.5, by = 2.05, bh = 2.4;
  for (const [x, style, head, body, foot] of cols) {
    if (style === "black") T.blackbox(s, x, by, bw, bh);
    else if (style === "panel") T.panel(s, x, by, bw, bh);
    else T.hairbox(s, x, by, bw, bh);
    const dark = style === "black";
    s.addText(head, { x: x + 0.3, y: by + 0.28, w: bw - 0.6, h: 0.4, fontFace: F, fontSize: 17, bold: true, color: dark ? C.WHITE : C.INK, margin: 0 });
    s.addText(body.map((t, i) => ({ text: t, options: { breakLine: i < body.length - 1 } })), {
      x: x + 0.3, y: by + 0.82, w: bw - 0.6, h: 1.4, fontFace: F, fontSize: 12, color: dark ? C.DGRAY : C.GRAY, margin: 0, valign: "top", lineSpacing: 17,
    });
    s.addText(foot, { x, y: by + bh + 0.16, w: bw, h: 0.3, fontFace: F, fontSize: 11, color: C.GRAY, align: "center", margin: 0 });
  }
  T.arrow(s, 4.42, 3.25, 0.4, 0);
  T.arrow(s, 8.37, 3.25, 0.4, 0);
  T.takeaway(s, "You build the left tree.", "The middle tree decides how little of the right tree has to change.", 5.5);
  s.addNotes("The old version of this slide claimed Flutter builds a widget tree each frame. It does not. Widgets are rebuilt; Elements are reused; RenderObjects are mutated in place. That asymmetry is where the performance comes from.");
}

// ---------------------------------------------------------- 16 SET STATE ----
{
  const s = d.content("State", "What setState actually does");
  T.lines(s, [
    { text: "Flutter does not rebuild the widget tree every frame.", options: { bold: true } },
    "setState marks exactly one Element dirty and asks for a frame. On that frame, build() runs on the dirty subtrees, and on nothing else.",
    "Sibling subtrees are never visited. Their Elements, State objects and RenderObjects are left completely untouched.",
    "So the cost of a setState is the size of the subtree beneath it. Push it as far down the tree as you can.",
  ], { x: 0.9, y: 2.0, w: 6.7, h: 3.2, fontSize: 13.5, paraSpaceAfter: 14 });
  T.flowDown(s, [
    ["setState(() { … })", "you mutate State fields", "black"],
    ["markNeedsBuild()", "this Element is now dirty", "hair"],
    ["next frame: build()", "dirty subtrees only", "panel"],
    ["reconcile children", "runtimeType, then key", "hair"],
    ["layout & paint", "only what actually changed", "panel"],
  ], { x: 8.1, y: 1.95, w: 4.5, h: 0.72, gap: 0.26 });
  T.takeaway(s, "Only dirty subtrees rebuild.", "That is the core of the performance model.", 5.4, { w: 6.7 });
  s.addNotes("Pedantic but worth saying aloud: the mutation is what matters, setState only schedules the rebuild; an empty setState body still works. Doing the mutation inside the callback is the convention that keeps the two together.");
}

// --------------------------------------------------------------- 17 KEYS ----
{
  const s = d.content("State", "Reuse is decided by runtimeType, then key");
  s.addText("When a parent rebuilds, each Element compares its old widget with the new one at the same position.", {
    x: 0.9, y: 1.5, w: 11.5, h: 0.35, fontFace: F, fontSize: 13, color: C.GRAY, margin: 0,
  });
  T.codeBlock(s, [
    "// Same runtimeType AND same key  ->  Element and State are reused.",
    "// Different runtimeType or key   ->  old subtree is disposed, new one built.",
    "",
    "ListView(",
    "  children: [",
    "    for (final todo in todos)",
    "      TodoTile(key: ValueKey(todo.id), todo: todo),",
    "  ],",
    ");",
    "",
    "// Without the key, Flutter matches children by POSITION.",
    "// Delete the first todo and the second row inherits the first row's",
    "// State: its scroll offset, its half-typed text, its animation.",
  ], { x: 0.9, y: 1.95, w: 11.53, h: 4.3, fontSize: 11 });
  s.addNotes("Classic demo: a list of stateful tiles with no keys. Type into one, delete the row above it, and the text jumps. Then add ValueKey and repeat.");
}

// ------------------------------------------------- 18 STATELESS vs STATEFUL -
{
  const s = d.content("State", "Stateless vs Stateful, precisely");
  T.table(s, ["StatelessWidget", "StatefulWidget"], [
    ["Mutable state", "none of its own", "a separate, long-lived State object"],
    ["build() runs", "on insert, and on every parent rebuild", "all of that, plus on every setState()"],
    ["Lifecycle hooks", "none", "initState · didUpdateWidget · dispose"],
    ["Genuinely fits", "a label, an icon, a button that only calls a callback", "a text field, an animation, a timer or stream subscription"],
  ], { y: 2.15, rowH: 0.66, labelW: 1.6, fontSize: 12 });
  T.takeaway(s, "A StatelessWidget does not “build once”.",
    "It rebuilds whenever its parent does; it simply holds no mutable state of its own. And a button is usually stateless: the state lives in whatever its callback changes.", 5.35);
  s.addNotes("Two corrections from the old deck. (1) 'StatelessWidget builds once' is wrong: it rebuilds with its parent. (2) 'Buttons' was listed as the canonical StatefulWidget; it is not. A button renders a label and fires a callback. Material's InkWell does keep State, but only for the ripple animation, not for your data.");
}

// ------------------------------------------------------ 19 STATE IN FULL ----
{
  const s = d.content("State", "Inside a State object");
  T.codeBlock(s, [
    "class _CounterFieldState extends State<CounterField> {",
    "  // Fields here survive rebuilds. The widget object does not.",
    "  final _controller = TextEditingController();",
    "  int _count = 0;",
    "",
    "  @override",
    "  void dispose() {",
    "    _controller.dispose();      // release what you created",
    "    super.dispose();",
    "  }",
    "",
    "  void _increment() => setState(() => _count++);",
    "",
    "  @override",
    "  Widget build(BuildContext context) => Text('$_count');",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.4, h: 4.85, fontSize: 11 });
  s.addText("Rules worth following", { x: 8.6, y: 1.98, w: 4.0, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "State lives in the State class, never on the widget. Widget fields are re-created on every rebuild.",
    "Read the widget's fields through widget.something; the framework refreshes that reference for you.",
    "Anything you create (controllers, timers, stream subscriptions) you dispose.",
    "Never call setState from build(), and never after dispose(): check mounted after an await.",
  ], { x: 8.6, y: 2.45, w: 4.0, h: 4.2, fontSize: 11.5, color: C.GRAY, paraSpaceAfter: 11 });
}

// ------------------------------------------------------------- 20 DIVIDER ---
d.divider(
  "Sharing state",
  "When one widget is not enough",
  "Lifting state up · InheritedWidget · value equality"
);

// -------------------------------------------------------- 21 LIFTING UP -----
{
  const s = d.content("Sharing state", "Lifting state up");
  T.blackbox(s, 2.15, 2.2, 3.0, 0.8);
  s.addText([
    { text: "Parent", options: { bold: true, breakLine: true } },
    { text: "owns  double target", options: { fontSize: 11, color: C.DGRAY } },
  ], { x: 2.15, y: 2.2, w: 3.0, h: 0.8, fontFace: F, fontSize: 13.5, color: C.WHITE, align: "center", valign: "middle", margin: 0 });
  T.arrow(s, 3.65, 3.0, 0, 0.3);
  T.hline(s, 2.15, 3.3, 3.0);
  T.arrow(s, 2.15, 3.3, 0, 0.35);
  T.arrow(s, 5.15, 3.3, 0, 0.35);
  T.hairbox(s, 0.9, 3.65, 2.5, 0.9);
  s.addText([
    { text: "TargetInput", options: { bold: true, breakLine: true } },
    { text: "calls onChanged", options: { fontSize: 11, color: C.GRAY } },
  ], { x: 0.9, y: 3.65, w: 2.5, h: 0.9, fontFace: F, fontSize: 13, color: C.INK, align: "center", valign: "middle", margin: 0 });
  T.hairbox(s, 3.9, 3.65, 2.5, 0.9);
  s.addText([
    { text: "TargetChart", options: { bold: true, breakLine: true } },
    { text: "reads target", options: { fontSize: 11, color: C.GRAY } },
  ], { x: 3.9, y: 3.65, w: 2.5, h: 0.9, fontFace: F, fontSize: 13, color: C.INK, align: "center", valign: "middle", margin: 0 });
  s.addText("events up   ·   data down", { x: 0.9, y: 4.7, w: 5.5, h: 0.3, fontFace: F, fontSize: 11.5, color: C.GRAY, align: "center", margin: 0 });

  T.lines(s, [
    "Two widgets need the same value, so it moves to their nearest common ancestor. Data flows down as constructor arguments; events flow back up as callbacks.",
    "The children stay reusable and know nothing about each other.",
    { text: "Lift too far and you get prop drilling: a value threaded through five widgets that do not care about it, just to reach the sixth.", options: { bold: true } },
    "That is precisely the problem the next slide solves.",
  ], { x: 7.3, y: 2.0, w: 5.3, h: 4.0, fontSize: 12.5, paraSpaceAfter: 13 });
  T.takeaway(s, "Lifting state up is the default answer.", "Reach for a package only when the drilling becomes a real problem.", 5.5, { w: 5.9 });
}

// ------------------------------------------------------ 22 INHERITEDWIDGET --
{
  const s = d.content("Sharing state", "InheritedWidget: what Provider is built on");
  s.addText("Put the value above the widgets that need it, and let them look it up directly instead of receiving it hand to hand.", {
    x: 0.9, y: 1.5, w: 11.5, h: 0.35, fontFace: F, fontSize: 13, color: C.GRAY, margin: 0,
  });
  T.codeBlock(s, [
    "class TargetScope extends InheritedWidget {",
    "  const TargetScope({super.key, required this.target, required super.child});",
    "  final double target;",
    "",
    "  // O(1) lookup, and it subscribes this context to future changes.",
    "  static double of(BuildContext context) =>",
    "      context.dependOnInheritedWidgetOfExactType<TargetScope>()!.target;",
    "",
    "  @override",
    "  bool updateShouldNotify(TargetScope old) => old.target != target;",
    "}",
    "",
    "// Anywhere below it in the tree, with no constructor plumbing:",
    "Text('${TargetScope.of(context)} °C');",
  ], { x: 0.9, y: 1.95, w: 11.53, h: 4.55, fontSize: 11 });
  s.addNotes("updateShouldNotify is the whole trick: only the contexts that depended on this scope rebuild, and only when the value actually differs. Provider is a thin, ergonomic wrapper around exactly this mechanism.");
}

// ---------------------------------------------------------- 23 EQUATABLE ----
{
  const s = d.content("Sharing state", "Value equality: why Equatable exists");
  T.codeBlock(s, [
    "class CounterState extends Equatable {",
    "  const CounterState({required this.count, required this.status});",
    "  final int count;",
    "  final LoadStatus status;",
    "",
    "  // == and hashCode are generated from exactly this list.",
    "  @override",
    "  List<Object?> get props => [count, status];",
    "}",
    "",
    "const a = CounterState(count: 1, status: LoadStatus.ready);",
    "const b = CounterState(count: 1, status: LoadStatus.ready);",
    "",
    "a == b;   // true  with Equatable",
    "          // false without it: Dart's default == is identity",
  ], { x: 0.9, y: 1.95, w: 7.0, h: 4.5, fontSize: 10.5 });
  s.addText("Why it matters", { x: 8.2, y: 1.98, w: 4.4, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "Every state consumer asks one question: is this state different from the last one?",
    { text: "Identity equality answers “yes” every time. Two structurally identical objects are still two objects, so the UI rebuilds when nothing changed.", options: { color: C.INK } },
    { text: "The mirror failure: mutate a state object in place and re-emit the same instance, and identity answers “no”, so the UI does not rebuild even though the data did change.", options: { color: C.INK } },
    "Hence the rule: state classes are immutable and compared by value.",
    "Add a field, add it to props. Forgetting is the classic bug.",
  ], { x: 8.2, y: 2.45, w: 4.4, h: 4.2, fontSize: 11, color: C.GRAY, paraSpaceAfter: 10 });
  s.addNotes("The previous deck's code comment said the opposite of its own prose. Get it right out loud: WITHOUT value equality the UI rebuilds when it should not; with in-place mutation it fails to rebuild when it should. Both are fixed by immutable, value-equal state.");
}

// ----------------------------------------------------------- 24 THE LADDER --
{
  const s = d.content("Sharing state", "Pick the smallest tool that works");
  T.table(s, ["setState", "Lifting up", "InheritedWidget", "Provider / Riverpod", "BLoC / Cubit"], [
    ["Scope", "one widget", "a few siblings", "one subtree", "whole app", "whole app"],
    ["Mechanism", "mark dirty", "callbacks up", "lookup + notify", "wraps Inherited", "events to states"],
    ["Costs you", "nothing", "prop drilling", "boilerplate", "a dependency", "a dependency + a pattern"],
    ["In this course", "today", "today", "today", "named only", "the project"],
  ], { y: 2.15, rowH: 0.56, labelW: 1.35, fontSize: 10.5, focusCols: [4] });
  T.lines(s, [
    "Provider is a thin, ergonomic wrapper around InheritedWidget. Riverpod is its successor: the same idea without needing a BuildContext, and checked at compile time. BLoC turns state into a stream of states driven by a stream of events.",
    "We name all three so you recognize them in a code review. Do not adopt a package you cannot explain.",
  ], { x: 0.9, y: 5.05, w: 11.53, h: 1.3, fontSize: 12, color: C.INK, paraSpaceAfter: 9 });
  T.takeaway(s, "This is Part 1.", "setState, lifting up and InheritedWidget carry most screens. The last column, BLoC and Cubit, is what the graded project asks for: the same ideas, expressed as events in and states out.", 6.05);
}

// -------------------------------------------------------------- 25 CLOSING --
{
  const s = d.closing([
    ["checklist", "Recap", [
      "DevTools first: look at what the app is doing before changing it",
      "Three trees: you rebuild widgets, the framework reuses Elements",
      "Only dirty subtrees rebuild; reuse is runtimeType, then key",
      "setState for ephemeral state, lift it up when siblings share it",
      "Value equality decides whether the UI rebuilds at all",
    ]],
    ["calendar", "This week", [
      "Run your lab app under DevTools and attach it from the printed URL",
      "Turn on Track widget rebuilds; find one rebuild you did not expect",
      "Add ValueKey to a list of stateful tiles and watch the behavior change",
      "Make one model class extend Equatable and write a == test for it",
    ]],
    ["bookopen", "Read more", [
      "docs.flutter.dev/tools/devtools",
      "docs.flutter.dev/data-and-backend/state-mgmt/intro",
      "api.flutter.dev: InheritedWidget, State, Key",
      "pub.dev/packages/equatable",
    ]],
  ]);
}

d.write(path.join(__dirname, "Mobile-and-Embedded-Lecture4-v2.pptx")).then((f) => console.log("written:", f));
