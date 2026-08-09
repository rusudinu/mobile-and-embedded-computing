// ============================================================================
// Mobile & Embedded Computing: Laboratory 3, Widgets & UI
// Built on the shared design system in ./template.js
// ============================================================================
const path = require("path");
const T = require("../assets/template");
const { C, F, MONO } = T;

const d = new T.Lab({
  lab: 3,
  title: "Widgets & UI",
  subtitle: "composing layouts and handling gestures",
});

// ---- local layout helpers (no new styling) --------------------------------
// name + one-line requirement, stacked in a column
function specRow(s, x, y, nameW, w, name, req) {
  s.addText(name, {
    x, y, w: nameW, h: 0.55, fontFace: F, fontSize: 12.5, bold: true, color: C.INK, valign: "top", margin: 0,
  });
  s.addText(req, {
    x: x + nameW + 0.2, y: y + 0.02, w: w - nameW - 0.2, h: 0.55,
    fontFace: F, fontSize: 11.5, color: C.GRAY, valign: "top", margin: 0,
  });
}
// framework message + what to do about it
function errRow(s, y, msg, fix) {
  s.addText(msg, {
    x: 0.9, y, w: 6.3, h: 0.62, fontFace: MONO, fontSize: 10.5, color: C.INK, valign: "top", margin: 0, lineSpacing: 15,
  });
  s.addText(fix, {
    x: 7.6, y: y + 0.02, w: 4.83, h: 0.62, fontFace: F, fontSize: 12, color: C.GRAY, valign: "top", margin: 0,
  });
}

// =====================================================================
// 1. TITLE
// =====================================================================
d.titleSlide();

// =====================================================================
// 2. OBJECTIVES
// =====================================================================
T.objectivesSlide(d, [
  ["layout", "Compose a screen", "Build a login screen from Column, Row, Padding and Expanded, not one giant build()"],
  ["component", "Split it into widgets", "Extract reusable StatelessWidget and StatefulWidget components with clear parameters"],
  ["hand", "Handle gestures", "Make list rows respond to swipes, with a destructive action and a way back"],
  ["target", "Lecture 3, applied", "This lab puts Lecture 3 to work: the widget tree, composition and rebuilds"],
], "Laboratory 3", "What you'll build today");

// =====================================================================
// 3. WHERE THE CODE GOES
// =====================================================================
{
  const s = d.content("Setup", "Where your code goes");
  T.lines(s, [
    "Same repository, same Flutter project as Labs 1 and 2. Create a branch named lab3.",
    "Task I goes in lib/screens/login_screen.dart, Task II in lib/screens/todo_screen.dart.",
    "Every component you extract gets its own file under lib/widgets/.",
    "Point main.dart at whichever screen you are currently working on.",
    { text: "Keep the todo app. Lab 4 attaches DevTools to this exact app instead of rebuilding it.", options: { bold: true } },
  ], { x: 0.9, y: 1.95, w: 7.1, h: 3.5, fontSize: 14, paraSpaceAfter: 13 });
  T.codeBlock(s, [
    "lib/",
    "  main.dart",
    "  screens/",
    "    login_screen.dart",
    "    todo_screen.dart",
    "  widgets/",
    "    labeled_field.dart",
    "    todo_tile.dart",
  ], { x: 8.3, y: 1.95, w: 4.13, h: 3.3, fontSize: 11 });
  T.takeaway(s, "No pixel-perfect copy of anyone's app.",
    "You are given the element list; the styling decisions are yours.", 5.7, { w: 7.1 });
}

// =====================================================================
// 4. STATELESS vs STATEFUL
// =====================================================================
{
  const s = d.content("Composition", "Stateless or stateful?");
  s.addText("StatelessWidget", { x: 0.9, y: 1.95, w: 5.6, h: 0.4, fontFace: F, fontSize: 15.5, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "Holds no mutable state of its own; everything it draws arrives through its constructor.",
    "It does not “build once”: it rebuilds whenever its parent rebuilds or a dependency changes.",
    "Use it for the logo block, a labeled field, the primary button, a single todo row.",
  ], { x: 0.9, y: 2.5, w: 5.5, h: 3.0, fontSize: 13, paraSpaceAfter: 13 });
  s.addText("StatefulWidget", { x: 7.0, y: 1.95, w: 5.4, h: 0.4, fontFace: F, fontSize: 15.5, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "Owns state that changes over its lifetime: controllers, a password-visibility flag, the todo list.",
    "setState() marks that subtree dirty; only dirty subtrees rebuild, never the whole tree.",
    "The screens themselves are stateful here; most of what they contain does not need to be.",
  ], { x: 7.0, y: 2.5, w: 5.4, h: 3.0, fontSize: 13, paraSpaceAfter: 13 });
  T.takeaway(s, "Start stateless.",
    "Promote a widget to stateful only when it has to remember something between builds.", 5.6);
  s.addNotes("Common misconception worth correcting out loud: StatelessWidget does not mean 'built once'. It means it stores no mutable state; it is rebuilt as often as its parent is.");
}

// =====================================================================
// 5. LAYOUT WIDGETS
// =====================================================================
{
  const s = d.content("Composition", "The layout widgets you need today");
  const items = [
    ["Column", "children stacked vertically; mainAxisAlignment spaces them out"],
    ["Row", "children side by side; the horizontal equivalent of Column"],
    ["Expanded", "lets a child take the remaining space inside a Row or Column"],
    ["Padding", "space around a single child; EdgeInsets says how much"],
    ["SizedBox", "a fixed width or height; the plain way to add a gap"],
    ["Center", "centers its child inside the space the parent gave it"],
    ["Container", "padding, margin, color, border and size in one widget"],
    ["Stack", "children drawn over each other; Positioned places them"],
    ["SingleChildScrollView", "makes a Column scroll when the keyboard shrinks the screen"],
  ];
  const cw = 3.7, gx = 0.5;
  items.forEach(([name, body], i) => {
    const x = 0.9 + (i % 3) * (cw + gx);
    const y = 2.05 + Math.floor(i / 3) * 1.25;
    s.addText(name, { x, y, w: cw, h: 0.32, fontFace: F, fontSize: 14.5, bold: true, color: C.INK, margin: 0 });
    s.addText(body, { x, y: y + 0.36, w: cw, h: 0.75, fontFace: F, fontSize: 11.5, color: C.GRAY, valign: "top", margin: 0 });
  });
  T.takeaway(s, "Every one of these takes children, not pixels.",
    "You describe the arrangement; the framework does the measuring.", 5.85);
}

// =====================================================================
// 6. TASK I
// =====================================================================
T.taskSlide(d, {
  n: "Task I",
  title: "Login screen layout",
  intro: "lib/screens/login_screen.dart. The required elements are listed on the next slide.",
  steps: [
    "Build a login screen containing every element listed on the following slide.",
    "Lay it out with Column, Padding, SizedBox and Expanded, with no absolute positioning.",
    "Break the screen into smaller reusable components instead of one long build() method.",
    "Make each component that only displays data a StatelessWidget.",
    "Make the screen itself a StatefulWidget, so it can hold the field controllers and the error text.",
    "Show an error message under the fields when either field is empty on submit.",
    "Design the visual style yourself: colors, spacing and typography are your decisions.",
  ],
  hints: [
    "TextField + TextEditingController",
    "obscureText: true for the password",
    "ElevatedButton / TextButton",
    "InputDecoration(labelText:, hintText:)",
    "const constructors + required params",
  ],
  done: [
    "Every element on the list is on screen and readable",
    "At least two components live in lib/widgets/",
    "Submitting an empty form shows the error text",
  ],
});

// =====================================================================
// 7. THE LOGIN SCREEN SPEC
// =====================================================================
{
  const s = d.content("Task I", "The screen, element by element");
  const spec = [
    ["Logo or title", "An icon and the app name at the top. Anything that identifies the app."],
    ["Email field", "A labeled text input, keyboardType: TextInputType.emailAddress."],
    ["Password field", "A labeled text input with obscureText: true."],
    ["Error area", "A reserved line under the fields for one message. Empty when all is well."],
    ["Primary action", "A full-width “Sign in” button that reads both controllers."],
    ["Secondary link", "“Forgot password?” as a TextButton, not a second big button."],
    ["Spacing", "Consistent padding around the form, and a scroll view around the Column."],
  ];
  let y = 1.95;
  for (const [name, req] of spec) {
    specRow(s, 0.9, y, 1.75, 7.0, name, req);
    y += 0.6;
  }
  // wireframe: drawn, not screenshotted
  T.hairbox(s, 8.5, 1.95, 3.93, 4.15);
  T.panel(s, 8.85, 2.3, 3.23, 0.62);
  s.addText("logo / title", { x: 8.85, y: 2.3, w: 3.23, h: 0.62, fontFace: F, fontSize: 11, color: C.GRAY, align: "center", valign: "middle", margin: 0 });
  T.hairbox(s, 8.85, 3.12, 3.23, 0.44);
  s.addText("email", { x: 9.0, y: 3.12, w: 2.9, h: 0.44, fontFace: F, fontSize: 11, color: C.GRAY, valign: "middle", margin: 0 });
  T.hairbox(s, 8.85, 3.68, 3.23, 0.44);
  s.addText("password  ••••••", { x: 9.0, y: 3.68, w: 2.9, h: 0.44, fontFace: F, fontSize: 11, color: C.GRAY, valign: "middle", margin: 0 });
  s.addText("error message area", { x: 9.0, y: 4.18, w: 2.9, h: 0.3, fontFace: F, fontSize: 10, color: C.RED, margin: 0 });
  T.blackbox(s, 8.85, 4.58, 3.23, 0.5);
  s.addText("Sign in", { x: 8.85, y: 4.58, w: 3.23, h: 0.5, fontFace: F, fontSize: 12, bold: true, color: C.WHITE, align: "center", valign: "middle", margin: 0 });
  s.addText("Forgot password?", { x: 8.85, y: 5.2, w: 3.23, h: 0.35, fontFace: F, fontSize: 11, color: C.BLUE, align: "center", margin: 0 });
  s.addText("A wireframe, not a design.", { x: 8.5, y: 6.2, w: 3.93, h: 0.3, fontFace: F, fontSize: 11, color: C.GRAY, align: "center", margin: 0 });
  s.addNotes("Deliberately not a screenshot to copy. Grade the element list and the widget breakdown, not how closely the visuals match a reference image.");
}

// =====================================================================
// 8. EXTRACTING A COMPONENT
// =====================================================================
{
  const s = d.content("Task I", "What “reusable component” means");
  T.codeBlock(s, [
    "// lib/widgets/labeled_field.dart",
    "class LabeledField extends StatelessWidget {",
    "  const LabeledField({super.key, required this.label,",
    "      required this.controller, this.obscure = false});",
    "  final String label;",
    "  final TextEditingController controller;",
    "  final bool obscure;",
    "",
    "  @override",
    "  Widget build(BuildContext context) => TextField(",
    "      controller: controller,",
    "      obscureText: obscure,",
    "      decoration: InputDecoration(labelText: label));",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.4, h: 4.65, fontSize: 11 });
  s.addText("Why this counts", { x: 8.7, y: 1.95, w: 3.7, h: 0.4, fontFace: F, fontSize: 14.5, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "It renders from its parameters only, which is what makes it stateless.",
    "required names what the caller must pass; obscure has a default, so most callers ignore it.",
    "The email and password fields become two calls to the same widget.",
    "A const constructor with super.key lets Flutter skip rebuilding it when nothing changed.",
  ], { x: 8.7, y: 2.45, w: 3.7, h: 3.6, fontSize: 12, color: C.GRAY, paraSpaceAfter: 11 });
}

// =====================================================================
// 9. TASK II
// =====================================================================
T.taskSlide(d, {
  n: "Task II",
  title: "Todo list with swipe gestures",
  intro: "lib/screens/todo_screen.dart. Lab 4 debugs this app, so build it carefully.",
  steps: [
    "Create a Todo model with at least an id, a title and a done flag.",
    "Hold a list of todos in the screen's State and render it with ListView.builder.",
    "Render each todo as a Card containing a ListTile.",
    "Wrap each row in a Dismissible with a stable, unique key.",
    "Swipe left to delete the todo, removing it from the list.",
    "Swipe right to mark the todo as completed, keeping the row on screen.",
    "Give each swipe direction its own colored background with an icon, so the gesture is discoverable.",
    "Show a SnackBar with an Undo action after a delete.",
  ],
  hints: [
    "Dismissible: the swipe widget",
    "key: ValueKey(todo.id)",
    "direction: DismissDirection.…",
    "confirmDismiss, onDismissed",
    "ScaffoldMessenger.of(context)",
  ],
  done: [
    "Both swipe directions work on every row",
    "Deleting the top row does not remove the wrong one",
    "Undo restores the deleted todo",
  ],
});

// =====================================================================
// 10. DISMISSIBLE ANATOMY
// =====================================================================
{
  const s = d.content("Task II", "The anatomy of one swipeable row");
  T.codeBlock(s, [
    "// one row of your todo list",
    "ListView.builder(",
    "  itemCount: todos.length,",
    "  itemBuilder: (context, i) => Dismissible(",
    "    key: ValueKey(todos[i].id),",
    "    background: const ColoredBox(color: Colors.green),",
    "    secondaryBackground: const ColoredBox(color: Colors.red),",
    "    confirmDismiss: (direction) async =>",
    "        direction == DismissDirection.endToStart,",
    "    onDismissed: (_) => setState(() => todos.removeAt(i)),",
    "    child: Card(child: ListTile(title: Text(todos[i].title))),",
    "  ),",
    ")",
  ], { x: 0.9, y: 1.95, w: 7.4, h: 4.5, fontSize: 11.5 });
  s.addText("The four common mistakes", { x: 8.7, y: 1.95, w: 3.7, h: 0.4, fontFace: F, fontSize: 14.5, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "key is not optional. Without a stable unique key the wrong row disappears.",
    "background is the swipe-right layer, secondaryBackground the swipe-left one.",
    "Returning false from confirmDismiss keeps the row, which is how “completed” works without deleting.",
    "onDismissed must remove the item from your list, or the next build throws.",
  ], { x: 8.7, y: 2.45, w: 3.7, h: 3.6, fontSize: 12, color: C.GRAY, paraSpaceAfter: 11 });
  s.addNotes("Show the failure live: give every Dismissible the same key, delete a middle row, and watch the wrong card vanish. That demonstrates why keys matter.");
}

// =====================================================================
// 11. TROUBLESHOOTING
// =====================================================================
{
  const s = d.content("Troubleshooting", "Layout errors and their fixes");
  const rows = [
    ["A RenderFlex overflowed by 137 pixels on the bottom.",
      "The Column is taller than the screen. Wrap it in SingleChildScrollView, or make one child Expanded."],
    ["Vertical viewport was given unbounded height.",
      "A ListView inside a Column with no height. Wrap the ListView in Expanded."],
    ["A dismissed Dismissible widget is still part of the tree.",
      "onDismissed did not actually remove the item from the list backing the builder."],
    ["The wrong row disappears after a swipe.",
      "Two rows share a key, or the key is the list index. Key by the todo's own id."],
    ["The keyboard covers the password field.",
      "Put the form inside a SingleChildScrollView; Scaffold then resizes around the keyboard."],
  ];
  let y = 2.0;
  rows.forEach(([m, f], i) => {
    errRow(s, y, m, f);
    y += 0.88;
    if (i < rows.length - 1) T.hline(s, 0.9, y - 0.16, 11.53);
  });
}

// =====================================================================
// 12. SUBMISSION
// =====================================================================
T.submissionSlide(d, {
  labNumber: 3,
  extra: ["Lab 4 starts from this code, so make sure the app still builds after your pull request is merged."],
});

// =====================================================================
// 13. CLOSING
// =====================================================================
d.closing([
  ["checklist", "Recap", [
    "A screen is a tree of small widgets, not one long build()",
    "Stateless until the widget has to remember something",
    "Dismissible turns a list row into a gesture target",
    "Keys are what tell Flutter which row is which",
  ]],
  ["calendar", "Before next lab", [
    "Merge your lab3 pull request",
    "Keep the todo app; Lab 4 debugs this exact app with DevTools",
    "Skim the DevTools overview page before the session",
  ]],
  ["bookopen", "Read more", [
    "docs.flutter.dev/ui/layout",
    "docs.flutter.dev/ui/interactivity",
    "api.flutter.dev · Dismissible, ListView.builder",
  ]],
], "Wrapping up");

d.write(path.join(__dirname, "Mobile-and-Embedded-Lab3-v2.pptx")).then((f) => console.log("wrote", f));
