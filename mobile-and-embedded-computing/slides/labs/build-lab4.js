// ===========================================================================
// Laboratory 4: DevTools & Debugging
// Rebuilt on the shared template. Source: srclabs/lab4.md (2 slides).
// Review fixes: "out-of-bouds" typo; explicit reuse of the Lab 3 todo app;
// DevTools launch/attach instructions; specified tasks with hints + done;
// screenshots to /screenshots (never Word); correct rebuild/frame facts.
// ===========================================================================
const path = require("path");
const T = require("../assets/template");
const { C, F } = T;

const d = new T.Lab({
  lab: 4,
  title: "DevTools & Debugging",
  subtitle: "inspector, breakpoints and the render tree",
});

// ------------------------------------------------------------- 1 TITLE -----
d.titleSlide();

// -------------------------------------------------------- 2 OBJECTIVES -----
{
  const s = T.objectivesSlide(d, [
    ["terminal", "Attach the tools", "Launch DevTools from the terminal and from your IDE, without looking it up"],
    ["bug", "Find a real bug", "Reproduce it, stop on it with a breakpoint, and read the state that caused it"],
    ["layers", "Read the trees", "Connect a pixel on screen to the widget, element and render object behind it"],
    ["refresh", "Explain a rebuild", "Say which widgets rebuilt after a keystroke, and why the rest did not"],
  ], "Laboratory 4", "What you'll build today");
  T.takeaway(s, "This lab puts Lecture 4 to work.",
    "Debugging, setState, and the three trees: today you use them on code you wrote yourself.", 5.5);
}

// ---------------------------------------------------- 3 STARTING POINT -----
{
  const s = d.content("Starting point", "Start from your Lab 3 todo app");
  T.lines(s, [
    { text: "Continue from the todo app you built in Laboratory 3. Do not start a new project.", options: { bold: true } },
    "Open that project, create a branch named lab4, and work there. Everything today happens in the file that holds your todo page, which for most of you is lib/main.dart or lib/todo_page.dart.",
    "If your Lab 3 app never reached a working state, spend the first twenty minutes getting the four behaviors on the right to work. You cannot debug an app that does not run.",
    "Commit that working version before you touch anything else. You will deliberately break this app, and you want something to compare against.",
  ], { x: 0.9, y: 1.95, w: 7.3, h: 3.6, fontSize: 13.5, paraSpaceAfter: 13 });

  T.panel(s, 8.6, 1.95, 3.85, 2.75);
  s.addText("The app must already", {
    x: 8.9, y: 2.2, w: 3.3, h: 0.32, fontFace: F, fontSize: 11, bold: true, color: C.GRAY, charSpacing: 1.5, margin: 0,
  });
  T.lines(s, [
    "add a todo from a text field",
    "mark one done and undone",
    "delete one",
    "show how many are left",
  ], { x: 8.9, y: 2.65, w: 3.3, h: 1.9, fontSize: 12, color: C.INK, paraSpaceAfter: 9 });

  T.takeaway(s, "Nothing new is being built today.",
    "The app only has to run; the lab is about the tools.", 5.75);
  s.addNotes("Say this out loud: Lab 4 is not a second UI lab. If half the room rebuilds a todo app from scratch they will never open DevTools. Ten minutes in, check that everyone has a running app.");
}

// ------------------------------------------------------- 4 APP SHAPE -------
{
  const s = d.content("Starting point", "The shape of the app you are debugging");
  s.addText("State lives in the State object. Every change to it goes through setState. If your app is not shaped like this, make it so before Task I.", {
    x: 0.9, y: 1.9, w: 11.53, h: 0.35, fontFace: F, fontSize: 13, color: C.GRAY, margin: 0,
  });
  T.codeBlock(s, [
    "// lib/todo_page.dart",
    "class Todo {",
    "  Todo(this.title, {this.done = false});",
    "  final String title;",
    "  bool done;",
    "}",
    "",
    "class TodoPage extends StatefulWidget {",
    "  const TodoPage({super.key});",
    "  @override",
    "  State<TodoPage> createState() => _TodoState();",
    "}",
  ], { x: 0.9, y: 2.4, w: 5.6, h: 4.15, fontSize: 10.5 });
  T.codeBlock(s, [
    "class _TodoState extends State<TodoPage> {",
    "  final _items = <Todo>[];",
    "  final _input = TextEditingController();",
    "  void _add() {",
    "    final t = _input.text.trim();",
    "    if (t.isEmpty) return;",
    "    setState(() => _items.add(Todo(t)));",
    "    _input.clear();",
    "  }",
    "  void _toggle(int i) => setState(",
    "      () => _items[i].done = !_items[i].done);",
    "  // dispose() the controller.",
    "}",
  ], { x: 6.83, y: 2.4, w: 5.6, h: 4.15, fontSize: 10.5 });
}

// -------------------------------------------------- 5 LAUNCH DEVTOOLS ------
{
  const s = d.content("Setup", "Launching and attaching DevTools");
  T.codeBlock(s, [
    "# 1. Run the app in debug mode from the project folder.",
    "flutter run",
    "",
    "#     Flutter DevTools debugger and profiler is available at:",
    "#     http://127.0.0.1:9100?uri=http://127.0.0.1:53412/AbCdEfGh=/",
    "#     Cmd/Ctrl-click that URL, or paste the whole thing into a browser.",
    "",
    "# 2. App already running and you closed the tab? Start DevTools",
    "#     yourself, then paste the VM Service URI it asks for.",
    "dart devtools",
    "",
    "# 3. From the IDE. This is the only route that gives you breakpoints.",
    "#     VS Code         F5, then Cmd/Ctrl+Shift+P -> \"Dart: Open DevTools\"",
    "#     Android Studio  Run > Debug, then the Flutter Inspector tool window",
  ], { x: 0.9, y: 1.95, w: 11.53, h: 4.45, fontSize: 10.5 });
  T.takeaway(s, "Plain flutter run has no debugger attached.",
    "Start from the IDE and your breakpoints will be hit.", 6.5);
  s.addNotes("Demo this live before anyone starts Task I: the old handout never mentioned this step. Copy the printed URL into a browser so they see where the number comes from.");
}

// ------------------------------------------------------- 6 THE TABS --------
{
  const s = d.content("Setup", "The DevTools tabs you need today");
  T.iconGrid(s, [
    ["layers", "Inspector", "The live widget tree, Select Widget Mode, Track widget rebuilds and the Layout Explorer. Task III lives here."],
    ["bug", "Debugger", "Breakpoints, the call stack and the Variables pane. Task II lives here, or in your IDE, which is faster."],
    ["filetext", "Logging", "Everything debugPrint writes, plus framework events. Keep it open all session."],
    ["gauge", "Performance", "The frame timeline and the performance overlay. Only meaningful in a --profile build."],
    ["memory", "Memory", "Heap snapshots. This is how you find the controller you forgot to dispose."],
    ["network", "Network", "Every HTTP request the app makes. You will need this one in Lab 5."],
  ], { y: 2.05, rowH: 2.3 });
}

// --------------------------------------------------------- 7 TASK I --------
T.taskSlide(d, {
  n: "Task I",
  title: "An interactive todo list",
  intro: "In your Lab 3 project, on branch lab4. Most of this exists already, so verify it and fill the gaps.",
  steps: [
    "Confirm the todo page is a StatefulWidget and that the list of todos lives in its State object, not in the widget",
    "Add a text field and an Add button that appends a new todo to the list inside setState",
    "Make tapping a todo toggle its done flag inside setState",
    "Add a delete action that removes a todo by index inside setState",
    "Show the number of todos not yet done in the AppBar title",
    "Commit this working version: it is your reference point for the rest of the lab",
  ],
  hints: [
    "StatefulWidget and State<T>",
    "setState(() { ... })",
    "TextEditingController, and dispose() it",
    "ListView.builder with itemCount",
    "IconButton for the delete action",
  ],
  done: [
    "Add, toggle and delete all update the screen",
    "No exceptions in the console",
    "Committed on branch lab4",
  ],
});

// ----------------------------------------------------- 8 THE BUGS ----------
{
  const s = d.content("Task II", "The three bugs you will plant");
  s.addText("Plant these one at a time. Fix each one before planting the next. Three simultaneous bugs teach you nothing.", {
    x: 0.9, y: 1.9, w: 11.53, h: 0.35, fontFace: F, fontSize: 13, color: C.GRAY, margin: 0,
  });
  T.codeBlock(s, [
    "// Bug 1: out-of-bounds index. Off by one, on purpose.",
    "for (var i = 0; i <= _items.length; i++) { total += _items[i].done ? 1 : 0; }",
    "",
    "// Bug 2: the model changes, the screen does not. No setState.",
    "void _toggle(int i) => _items[i].done = !_items[i].done;",
    "",
    "// Bug 3: a null that arrives later than you assumed.",
    "String? _filter;                       // never assigned before the first build",
    "final visible = _items.where((t) => t.title.contains(_filter!)).toList();",
  ], { x: 0.9, y: 2.4, w: 11.53, h: 3.05, fontSize: 11 });
  T.takeaway(s, "Bug 1 throws, bug 2 is silent, bug 3 throws somewhere else entirely.",
    "Three different failure shapes, three different tools.", 5.7);
}

// -------------------------------------------------------- 9 TASK II --------
T.taskSlide(d, {
  n: "Task II",
  title: "Break it, then find it with the debugger",
  intro: "Start the app from your IDE so the debugger is attached. Screenshot each bug while paused.",
  steps: [
    "Plant bug 1 and run the app until it throws RangeError",
    "Read the stack trace and set a breakpoint on the line it names",
    "Step through the loop and watch i and _items.length in the Variables pane at the moment it fails",
    "Fix the bound, and confirm the exception is gone",
    "Plant bug 2, then use a conditional breakpoint to show the model changed while the screen did not",
    "Add debugPrint calls logging the done flag before and after the mutation",
    "Plant bug 3, reproduce the null failure, and fix it without using the ! operator",
  ],
  hints: [
    "Click the gutter to set a breakpoint",
    "Right-click it -> Edit condition",
    "Condition: i == _items.length",
    "debugPrint, not print",
    "debugger() from dart:developer",
  ],
  done: [
    "All three bugs reproduced, then fixed",
    "One screenshot per bug, paused at the breakpoint",
    "Screenshots committed in /screenshots",
  ],
});

// ------------------------------------------------ 10 BREAKPOINT REFERENCE --
{
  const s = d.content("Reference", "Breakpoints, conditions and debugPrint");
  T.lines(s, [
    "A breakpoint pauses the isolate. While paused you can hover any variable, edit it in the Variables pane, and evaluate arbitrary Dart in the debug console.",
    "A conditional breakpoint only stops when its expression is true: i == _items.length, or todo.title == 'milk'. Far more precise than a print inside a loop.",
    "debugPrint throttles its output so Android does not silently drop lines; plain print will lose them when a loop is noisy.",
    "Hot reload keeps your State objects; hot restart throws them away. If a fix does not appear on screen, that is nearly always the reason.",
  ], { x: 0.9, y: 1.95, w: 6.7, h: 3.6, fontSize: 13, paraSpaceAfter: 13 });
  const steps = [
    ["Step over", "Run this line. Do not descend into the calls on it."],
    ["Step into", "Descend into the call on this line."],
    ["Step out", "Finish this function, stop back at the caller."],
    ["Resume", "Run to the next breakpoint, or until the app exits."],
  ];
  let y = 1.98;
  steps.forEach(([head, txt], i) => {
    s.addText(head, { x: 8.2, y, w: 4.4, h: 0.32, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
    s.addText(txt, { x: 8.2, y: y + 0.33, w: 4.4, h: 0.55, fontFace: F, fontSize: 11.5, color: C.GRAY, margin: 0, valign: "top" });
    y += 1.06;
    if (i < steps.length - 1) T.hline(s, 8.2, y - 0.14, 4.4);
  });
  T.takeaway(s, "A breakpoint you can leave in place beats a print you have to delete.", "", 5.85);
}

// ------------------------------------------------------- 11 TASK III -------
T.taskSlide(d, {
  n: "Task III",
  title: "Inspector, render tree and rebuild counts",
  intro: "With the fixed app running, open the Inspector tab in DevTools.",
  steps: [
    "Turn on Select Widget Mode and tap a single todo row on the device",
    "Screenshot the widget tree with that row selected, showing the widget the framework picked",
    "Open the Layout Explorer on the Row or Column of that row and note the flex factors and incoming constraints",
    "Call debugDumpRenderTree() from a button handler and capture the render tree it prints to the console",
    "Turn on Track widget rebuilds, then type one single character into the text field",
    "Write down which widgets rebuilt, and add one sentence to your README explaining why the rest did not",
  ],
  hints: [
    "Inspector > Select Widget Mode",
    "Track widget rebuilds (Inspector toolbar)",
    "debugDumpRenderTree(), debugDumpApp()",
    "import 'package:flutter/rendering.dart'",
    "Layout Explorer for the yellow stripes",
  ],
  done: [
    "Screenshots of the widget tree and rebuild counts",
    "Render tree output captured",
    "Explanation committed in README.md",
  ],
});

// ------------------------------------------------------ 12 WHAT REBUILDS ---
{
  const s = d.content("Why it works", "What actually rebuilds, and why");
  T.lines(s, [
    "Flutter does not rebuild the whole widget tree each frame. setState marks one element dirty, and only that subtree is rebuilt on the next frame. Your rebuild counts should show exactly that.",
    "Walking a rebuilt subtree, the framework reuses the existing element, and with it the State object and the render object, when the new widget has the same runtimeType and the same key. A different type, or a different key, and the old element is discarded.",
    "That is why your list keeps its scroll position when one item changes, and why keys start to matter the moment items can be reordered or removed from the middle.",
    "One frame budget is 1 ÷ refresh rate: 16.7 ms at 60 Hz, 8.3 ms at 120 Hz on most 2026 phones. There is no fixed 16 ms rule to memorize.",
  ], { x: 0.9, y: 1.95, w: 6.9, h: 3.7, fontSize: 12.5, paraSpaceAfter: 12 });
  T.flowDown(s, [
    ["Widget", "immutable description", "hair"],
    ["Element", "identity + lifecycle", "black"],
    ["RenderObject", "layout and paint", "hair"],
  ], { x: 8.4, y: 2.0, w: 4.0, h: 1.0, gap: 0.36 });
  T.takeaway(s, "Rebuilt is not the same as repainted.",
    "The inspector counts rebuilds; the performance overlay shows what it cost.", 5.9);
  s.addNotes("Correction from the old handout: it implied the whole tree rebuilds and quoted a fixed 16 ms budget. Neither is true. Element reuse is runtimeType first, then key.");
}

// ---------------------------------------------------- 13 TROUBLESHOOTING ---
{
  const s = d.content("Troubleshooting", "When it goes wrong");
  T.table(s,
    ["What it means", "What to do"],
    [
      ["Breakpoints are hollow and never hit", "The app is running without a debugger attached", "Start it from the IDE (F5), not from a bare flutter run"],
      ["DevTools opens but shows no data", "It is pointed at a stale VM Service URI", "Restart flutter run and open the URL it prints this time"],
      ["The data changed, the screen did not", "You mutated state outside setState", "Track widget rebuilds will show zero rebuilds, which is your proof"],
      ["RangeError: index out of range", "You indexed at length, or the list shrank underneath you", "Breakpoint on the indexing line; watch the index and the length"],
      ["Yellow and black stripes on screen", "A RenderFlex overflowed its constraints", "Open the Layout Explorer on that Row or Column"],
    ],
    { y: 2.1, labelW: 3.5, rowH: 0.66, fontSize: 11 }
  );
  T.takeaway(s, "Read the first line of the exception first.",
    "It names the type, the value and the file.", 6.15);
}

// ------------------------------------------------------- 14 SUBMISSION -----
T.submissionSlide(d, {
  labNumber: 4,
  extra: [
    "This lab is screenshot-heavy on purpose: a paused debugger and a live inspector are the only evidence that you used the tools rather than read the code.",
    "Expected in /screenshots: one per planted bug paused at the breakpoint, one widget tree with a row selected, one Track widget rebuilds after a keystroke.",
  ],
});

// --------------------------------------------------------- 15 CLOSING ------
d.closing([
  ["checklist", "Recap", [
    "DevTools attaches from the terminal or the IDE, but only the IDE route gives you breakpoints",
    "setState marks one element dirty; the subtree rebuilds, not the app",
    "Element reuse is decided by runtimeType, then key",
  ]],
  ["calendar", "Before next lab", [
    "Push branch lab4 and open the pull request",
    "Screenshots in /screenshots, nowhere else",
    "Skim Lecture 5: HTTP, JSON and code generation",
  ]],
  ["bookopen", "Read more", [
    "docs.flutter.dev/tools/devtools",
    "docs.flutter.dev/tools/devtools/inspector",
    "api.flutter.dev: debugDumpRenderTree, debugPrint",
  ]],
], "Wrapping up");

d.write(path.join(__dirname, "Mobile-and-Embedded-Lab4-v2.pptx")).then((f) => console.log("wrote", f));
