// ============================================================================
// Mobile & Embedded Computing: Laboratory 2, Dart & Null Safety
// Built on the shared design system in ./template.js
// ============================================================================
const path = require("path");
const T = require("../assets/template");
const { C, F, MONO } = T;

const d = new T.Lab({
  lab: 2,
  title: "Dart & Null Safety",
  subtitle: "classes, null-safe types and collections",
});

// ---- local layout helpers (no new styling) --------------------------------
// mono token + explanation, in a row
function refRow(s, x, y, w, token, meaning) {
  s.addText(token, {
    x, y, w: 1.6, h: 0.5, fontFace: MONO, fontSize: 12, color: C.INK, valign: "top", margin: 0,
  });
  s.addText(meaning, {
    x: x + 1.7, y: y + 0.02, w: w - 1.7, h: 0.5, fontFace: F, fontSize: 12, color: C.GRAY, valign: "top", margin: 0,
  });
}
// compiler message + what to do about it
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
  ["shield", "Null safety in code", "Reach for ?, ?., ??, ??= and late deliberately instead of by trial and error"],
  ["boxes", "Classes and inheritance", "Model a small domain with an abstract base class and two subclasses"],
  ["layers", "Null-safe collections", "Search, filter and default over List<T> without ever returning null"],
  ["target", "Lecture 2, applied", "This lab puts Lecture 2 to work: today is the language, not the framework"],
], "Laboratory 2", "What you'll build today");

// =====================================================================
// 3. WHERE THE CODE GOES
// =====================================================================
{
  const s = d.content("Setup", "Where your code goes");
  T.lines(s, [
    { text: "You are not starting a new project.", options: { bold: true } },
    "Open the default Flutter project you created and ran in Lab 1, the one already pushed to your GitHub repository.",
    "Create a branch named lab2 before you write anything.",
    "All three tasks are plain Dart classes. Give each one its own file under lib/models/.",
    "Only main.dart holds widget code, just enough to display what your classes produce.",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 3.4, fontSize: 14, paraSpaceAfter: 13 });
  T.codeBlock(s, [
    "lib/",
    "  main.dart",
    "  models/",
    "    user.dart",
    "    bank_account.dart",
    "    library_item.dart",
    "    book.dart",
    "    magazine.dart",
    "    library.dart",
  ], { x: 8.3, y: 1.95, w: 4.13, h: 3.5, fontSize: 11 });
  T.takeaway(s, "One class per file, lower_snake_case filenames.",
    "That is the Dart convention, and the graders read your repository.", 5.6, { w: 7.1 });
  s.addNotes("Remind students that `flutter create` was Lab 1's deliverable. Nobody should be creating a second project today; the whole semester runs in one repository.");
}

// =====================================================================
// 4. THE NULL-SAFETY TOOLKIT
// =====================================================================
{
  const s = d.content("Reference", "The null-safety toolkit");
  s.addText("Types and operators", { x: 0.9, y: 1.9, w: 5.6, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: C.GRAY, charSpacing: 1.5, margin: 0 });
  s.addText("Declarations and promotion", { x: 7.0, y: 1.9, w: 5.4, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: C.GRAY, charSpacing: 1.5, margin: 0 });
  const left = [
    ["String?", "a value that may be null; plain String never can"],
    ["?.", "read a member only if the receiver is non-null"],
    ["??", "use the right-hand value when the left one is null"],
    ["??=", "assign only if the variable is currently null"],
    ["!", "assert non-null; throws at runtime if you are wrong"],
  ];
  const right = [
    ["late", "assigned after construction, before its first read"],
    ["required", "a named parameter the caller must pass"],
    ["= 0.0", "default value for an optional parameter"],
    ["is Book", "type test that promotes the variable in the branch"],
    ["x != null", "flow analysis promotes x to non-nullable here"],
  ];
  let y = 2.3;
  for (let i = 0; i < left.length; i++) {
    refRow(s, 0.9, y, 5.6, left[i][0], left[i][1]);
    refRow(s, 7.0, y, 5.4, right[i][0], right[i][1]);
    y += 0.62;
  }
  T.takeaway(s, "Use ! last, not first.",
    "Every ! you write is a promise the compiler can no longer check for you.", 5.6);
}

// =====================================================================
// 5. NULL SAFETY IN ONE FILE
// =====================================================================
{
  const s = d.content("Reference", "The same rules, in one file");
  T.codeBlock(s, [
    "class Room {",
    "  final String code;            // always present",
    "  final int? seats;             // may be unknown",
    "  String? projector;            // may be absent",
    "  late final DateTime opened;   // set later, read after",
    "",
    "  Room({required this.code, this.seats, this.projector});",
    "",
    "  String describeSeats() =>",
    "      seats == null ? 'Capacity unknown' : '$seats seats';",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.4, h: 3.85, fontSize: 11 });
  s.addText("Read it line by line", { x: 8.7, y: 1.95, w: 3.7, h: 0.4, fontFace: F, fontSize: 14.5, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "code can never be null, so no check is ever needed.",
    "seats and projector may be null, so the compiler forces you to say what happens then.",
    "opened has no value yet; reading it too early throws LateInitializationError.",
    "Inside the == null branch the compiler knows seats is an int, so $seats compiles.",
  ], { x: 8.7, y: 2.45, w: 3.7, h: 3.4, fontSize: 12, color: C.GRAY, paraSpaceAfter: 11 });
  T.takeaway(s, "r.projector ??= 'none';",
    "then r.projector?.length is 4, with no null check written by hand.", 6.0, { w: 7.4 });
  s.addNotes("Type this live and delete the ? from seats: the analyzer error appears immediately. That is a quick way to demonstrate null safety.");
}

// =====================================================================
// 6. TASK I
// =====================================================================
T.taskSlide(d, {
  n: "Task I",
  title: "Users",
  intro: "Work in lib/models/user.dart, and show the result from lib/main.dart.",
  steps: [
    "Create a User class with a String name, an int? age and a String? email.",
    "Make name a required named parameter; leave age and email optional.",
    "Create at least three User instances covering different combinations of null and non-null values.",
    "Display each user's information safely, showing “Not provided” wherever a value is null.",
    "Implement a method getDisplayAge() that returns “Age not specified” when age is null, and the age as a string otherwise.",
  ],
  hints: [
    "int? / String? for nullable fields",
    "?? supplies the “Not provided” fallback",
    "?. reads through a nullable safely",
    "required vs optional named parameters",
    "if (age != null) promotes age to int",
  ],
  done: [
    "Three users render, one with every optional field null",
    "getDisplayAge() covers both branches",
    "No null-check crash on any of them",
  ],
});

// =====================================================================
// 7. TASK II
// =====================================================================
T.taskSlide(d, {
  n: "Task II",
  title: "Bank accounts",
  intro: "lib/models/bank_account.dart. This task is about late: a field that is not ready at construction time.",
  steps: [
    "Create a BankAccount class with a late String accountNumber, assigned after the object is created.",
    "Add a required String holderName named parameter to the constructor.",
    "Add a double balance property with a default value of 0.0.",
    "Add an optional String? bankBranch property.",
    "Add a method initializeAccount(String number) that sets the account number.",
    "Add a way for callers to tell whether the account number has been set yet.",
    "Read the account number through that check, so an uninitialized account shows a message instead of throwing.",
    "Create several accounts and display them in a ListView.",
  ],
  hints: [
    "late String: no value at construction",
    "LateInitializationError = read too early",
    "A bool flag, or a String? backing field",
    "double balance = 0.0 in the constructor",
    "ListView.builder, on the next slide",
  ],
  done: [
    "Every account renders, branch or “Not provided”",
    "An uninitialized account shows a message, not a crash",
  ],
});

// =====================================================================
// 8. MINIMAL LIST UI
// =====================================================================
{
  const s = d.content("Scaffolding", "Just enough UI to see your objects");
  T.codeBlock(s, [
    "// inside the body: of your Scaffold",
    "ListView.builder(",
    "  itemCount: accounts.length,",
    "  itemBuilder: (context, i) {",
    "    final a = accounts[i];",
    "    return ListTile(",
    "      title: Text(a.holderName),",
    "      subtitle: Text(a.bankBranch ?? 'Not provided'),",
    "      trailing: Text(a.balance.toStringAsFixed(2)),",
    "    );",
    "  },",
    ")",
  ], { x: 0.9, y: 1.95, w: 7.4, h: 4.35, fontSize: 11.5 });
  s.addText("You have not had the widgets lecture yet", { x: 8.7, y: 1.95, w: 3.7, h: 0.7, fontFace: F, fontSize: 14.5, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "Widgets are Lecture 3 and Lab 3; today you only need enough of them to see your data.",
    "ListView.builder builds only the rows that are on screen.",
    "?? inside the widget tree is how the “Not provided” rule reaches the display.",
    "The default project already gives you MaterialApp and Scaffold, so put this in body:.",
  ], { x: 8.7, y: 2.75, w: 3.7, h: 3.1, fontSize: 12, color: C.GRAY, paraSpaceAfter: 11 });
}

// =====================================================================
// 9. TASK III (model layer)
// =====================================================================
T.taskSlide(d, {
  n: "Task III",
  title: "Library management system: the model",
  intro: "The biggest task of the lab. Build the class hierarchy first; the Library itself is on the next slide.",
  steps: [
    "Create an abstract class LibraryItem with a String title, a String? author and a DateTime? publishDate.",
    "Create a Book class that extends LibraryItem and adds an int? pageCount and a String? isbn.",
    "Create a Magazine class that extends LibraryItem and adds an int? issueNumber and a String? publisher.",
    "Pass the shared fields up to LibraryItem through a super constructor in both subclasses.",
    "Add a User? borrower and a DateTime? dueDate to LibraryItem, so any item can be on loan.",
    "Reuse the User class from Task I as the borrower type; do not write a second one.",
  ],
  hints: [
    "abstract class: cannot be instantiated",
    "class Book extends LibraryItem",
    "super constructor: : super(title: title)",
    "@override on anything you replace",
    "DateTime?: null until published",
  ],
  done: [
    "Book and Magazine both compile with no unset non-null field",
    "Every unknown value is typed with ?, not defaulted to a dummy",
  ],
});

// =====================================================================
// 10. TASK III (library API)
// =====================================================================
T.taskSlide(d, {
  n: "Task III, continued",
  title: "The Library API and borrowing",
  intro: "lib/models/library.dart. A Library class managing the collection with null-safe operations.",
  steps: [
    "Give Library a List<LibraryItem> and an addItem(LibraryItem? item) that validates before adding.",
    "Implement searchByTitle(String? query), handling a null or empty search term.",
    "Implement getItemsByAuthor(String? author), returning the items written by that author.",
    "Implement getRecentItems(int? count), falling back to a default count when count is null.",
    "Implement borrowing: set borrower and dueDate when an item is taken out.",
    "Refuse to lend an item that already has a borrower, and clear both fields when it is returned.",
  ],
  hints: [
    "where(...).toList() to filter",
    "?? supplies the default count",
    "sort by publishDate, nulls last",
    "item.borrower == null means available",
    "Return an empty list, never null",
  ],
  done: [
    "Every method survives a null argument",
    "Borrowing the same item twice is rejected",
    "A null query returns a sensible list, not an exception",
  ],
});

// =====================================================================
// 11. ERRORS YOU WILL HIT
// =====================================================================
{
  const s = d.content("Troubleshooting", "Errors you will hit today");
  const rows = [
    ["The non-nullable variable 'x' must be assigned before it can be used.",
      "Give it a value, make the type nullable with ?, or mark it late."],
    ["LateInitializationError: Field 'accountNumber' has not been initialized.",
      "A late field was read before it was set, which is Task II's case."],
    ["The property 'length' can't be unconditionally accessed because the receiver can be null.",
      "Use ?. or check for null first. Do not reach for ! to silence it."],
    ["Null check operator used on a null value.",
      "A ! that turned out to be wrong. Replace it with ?? or a real check."],
    ["The argument type 'String?' can't be assigned to the parameter type 'String'.",
      "Promote it with an if (x != null) branch, or supply a fallback with ??."],
  ];
  let y = 2.0;
  rows.forEach(([m, f], i) => {
    errRow(s, y, m, f);
    y += 0.88;
    if (i < rows.length - 1) T.hline(s, 0.9, y - 0.16, 11.53);
  });
  s.addNotes("The analyzer messages are the main feedback in this lab. Tell students to read the message rather than paste code around it; each of these five names its own fix.");
}

// =====================================================================
// 12. SUBMISSION
// =====================================================================
T.submissionSlide(d, {
  labNumber: 2,
  extra: ["This lab asks for no screenshots; the committed code and a running app are the evidence."],
});

// =====================================================================
// 13. CLOSING
// =====================================================================
d.closing([
  ["checklist", "Recap", [
    "A nullable type is a promise the compiler keeps checking",
    "late defers that promise, but you still have to keep it",
    "?? and ?. replace hand-written defensive null checks",
    "Collections return empty lists, never null",
  ]],
  ["calendar", "Before next lab", [
    "Merge your lab2 pull request",
    "Skim the Flutter widget catalog; Lab 3 builds two screens",
    "Bring the same project: Lab 3 continues inside it",
  ]],
  ["bookopen", "Read more", [
    "dart.dev/null-safety",
    "dart.dev/language/classes",
    "dart.dev/language/collections",
    "api.flutter.dev · ListView.builder",
  ]],
], "Wrapping up");

d.write(path.join(__dirname, "Mobile-and-Embedded-Lab2-v2.pptx")).then((f) => console.log("wrote", f));
