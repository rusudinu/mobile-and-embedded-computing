// ============================================================================
// Laboratory 1: Orientation, Set-up & Project
// Rebuilt on the shared template (template.js). Source: srclabs/lab1.md
// ============================================================================
const path = require("path");
const T = require("../assets/template");
const { C, F, MONO } = T;

const d = new T.Lab({
  lab: 1,
  title: "Orientation, Set-up & Project",
  subtitle: "environment, tooling and the semester project",
});

// ---------------------------------------------------------------- 1 title ---
d.titleSlide();

// ------------------------------------------------------------------ 2 bio ---
T.bioSlide(d);

// ----------------------------------------------------------- 3 objectives ---
{
  const s = T.objectivesSlide(d, [
    ["wrench", "A working toolchain", "Flutter and Dart installed, with flutter doctor reporting no blocking issues"],
    ["smartphone", "A device to run on", "An emulator or simulator that boots, with the default Flutter app running on it"],
    ["users", "A team and an idea", "Teams of at most three, an idea written down, ready to be approved next lab"],
    ["github", "The hand-in workflow", "Branch, pull request, repository: how every lab is submitted this semester"],
  ], "Laboratory 1", "What you'll build today");
  T.takeaway(s, "This lab puts Lecture 1 to work",
    "on the machine you will use all semester: the landscape, Git and GitHub.", 5.5);
  s.addNotes("Ask who already has Flutter installed before starting. Students who finish early should help their neighbors; say so out loud.");
}

// -------------------------------------------------------------- 4 grading ---
{
  const s = d.content("Orientation", "What the laboratory is worth");
  T.hline(s, 0.9, 2.1, 11.53);
  T.statRow(s, [
    ["3 p", "Laboratory & assignments", "individual, every session"],
    ["1.5 p", "Lab test", "individual, practical"],
    ["1.5 p", "Project", "teams of at most 3"],
  ], { y: 2.45 });
  T.takeaway(s, "4.5 points of laboratory plus 1.5 points of project.",
    "Six of the ten points of this course are earned in this room; the remaining four are the exam and the concept presentation.", 5.15);
  s.addNotes("This is the only lab that states the grading; repeat it in Lab 2 for anyone who missed today.");
}

// ------------------------------------------------------------- 5 divider ----
d.divider("The semester project", "Worth 1.5 points, in teams of at most three",
  "One repository per team. You propose the idea, and we approve it in Laboratory 2");

// -------------------------------------------------------- 6 project rules ---
{
  const s = d.content("The project", "How the project runs, and how it is graded");
  T.lines(s, [
    { text: "Project development must be tracked on GitHub: one repository per team, from the first commit to the demo.", options: { bold: true } },
    { text: "The application must be written in Flutter.", options: { bold: true } },
    "Individual participation is measured from your commits and from the quality of the code you wrote.",
    "Every member must know their own part in detail, and have at least a brief awareness of the rest.",
    "Teams of at most 3 students. You will present from your own laptop, at the projector.",
  ], { x: 0.9, y: 1.95, w: 7.3, h: 3.3, fontSize: 14, paraSpaceAfter: 15 });

  T.panel(s, 8.6, 1.95, 3.85, 2.65);
  s.addText("WAY OF WORKING: ALSO GRADED", {
    x: 8.9, y: 2.2, w: 3.3, h: 0.32, fontFace: F, fontSize: 10.5, bold: true, color: C.GRAY, charSpacing: 1.2, margin: 0,
  });
  s.addText([
    { text: "Pull requests, not pushes to main", options: { breakLine: true } },
    { text: "A branch per feature", options: { breakLine: true } },
    { text: "Code review before merge", options: { breakLine: true } },
    { text: "GitHub Issues for the work items", options: {} },
  ], { x: 8.9, y: 2.62, w: 3.3, h: 1.85, fontFace: F, fontSize: 12, color: C.INK, margin: 0, paraSpaceAfter: 9, valign: "top" });

  T.takeaway(s, "Individual participation is measured from the commit history,",
    "not only from the final state of the code.", 5.5);
}

// --------------------------------------------------- 7 mandatory features ---
{
  const s = d.content("The project", "What your project must do");
  s.addText("Five requirements. A project without all five is not approved.", {
    x: 0.9, y: 1.72, w: 11.53, h: 0.35, fontFace: F, fontSize: 13.5, color: C.GRAY, margin: 0,
  });
  const feats = [
    ["layers", "State management, BLoC", "every screen's state flows through a BLoC", "Lecture 4"],
    ["key", "Real authentication", "Firebase Auth or Keycloak, not a hard-coded login", "Lecture 7"],
    ["database", "Persistence, offline-first", "a real database; usable with no network", "Lecture 10"],
    ["foldersync", "Data follows the user", "log in on another device and the data is there", "Lecture 10"],
    ["zap", "Realtime over WebSockets", "at least one screen that updates live", "Lecture 8"],
  ];
  let y = 2.25;
  feats.forEach(([ic, head, txt, lec], i) => {
    s.addImage({ path: T.icon(ic, "ink"), x: 0.9, y: y + 0.06, w: 0.4, h: 0.4 });
    s.addText(head, { x: 1.6, y, w: 3.7, h: 0.52, fontFace: F, fontSize: 15.5, bold: true, color: C.INK, valign: "middle", margin: 0 });
    s.addText(txt, { x: 5.45, y, w: 5.1, h: 0.52, fontFace: F, fontSize: 13, color: C.GRAY, valign: "middle", margin: 0 });
    s.addText(lec, { x: 10.6, y, w: 1.83, h: 0.52, fontFace: F, fontSize: 12.5, color: C.BLUE, align: "right", valign: "middle", margin: 0 });
    y += 0.72;
    if (i < feats.length - 1) T.hline(s, 0.9, y - 0.1, 11.53);
  });
  s.addNotes("Be explicit: the labs cover setup, Dart, widgets, DevTools and networking. BLoC, auth, persistence and WebSockets come from the lectures only.");
}

// ----------------------------------------------------- 8 teams & approval ---
{
  const s = d.content("The project", "Forming a team and getting the idea approved");
  T.lines(s, [
    "Teams of at most 3 students. Agree on an idea first, then write the team down.",
    { text: "The team-forming sheet is posted in the Microsoft Teams channel of this course.", options: { bold: true } },
    "One row per team: the members, and a short description of what the app will do.",
    "We then discuss the idea together and validate its complexity: aim for medium difficulty, with enough surface to carry all five requirements.",
    "Approval happens in Laboratory 2. Do not start building before that conversation.",
  ], { x: 0.9, y: 1.95, w: 7.3, h: 3.4, fontSize: 14, paraSpaceAfter: 14 });

  T.flowDown(s, [
    ["Form a team", "at most 3, in the sheet", "hair"],
    ["Write the idea", "a short description", "hair"],
    ["Discuss & validate", "is it complex enough?", "hair"],
    ["Approved in Lab 2", "then you start building", "black"],
  ], { x: 8.6, y: 2.0, w: 3.85, h: 0.85, gap: 0.3 });

  T.takeaway(s, "Nobody is assigned a project.", "You propose it, so propose something you actually want to build.", 5.55, { w: 7.3 });
}

// ------------------------------------------------- 9 readme, demo, slides ---
{
  const s = d.content("The project", "What you hand in at the end of the semester");
  s.addText("The README must contain these sections, in this order", {
    x: 0.9, y: 1.95, w: 7.0, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0,
  });
  const readme = [
    "Team composition: one person per row with name, surname and group",
    "Project description: what the app does, what screens it has",
    "Link to the GitHub repository: if it is private, invite rusudinu as a collaborator",
    "Other information: anything else you would like to mention",
  ];
  s.addText(readme.map((t, i) => ({
    text: t, options: { bullet: { type: "number", startAt: i + 1 }, breakLine: i < readme.length - 1 },
  })), {
    x: 0.9, y: 2.45, w: 7.0, h: 2.6, fontFace: F, fontSize: 13.5, color: C.INK,
    margin: 0, valign: "top", paraSpaceAfter: 11,
  });

  s.addText("THE FINAL PRESENTATION", {
    x: 8.6, y: 1.95, w: 3.85, h: 0.32, fontFace: F, fontSize: 10.5, bold: true, color: C.GRAY, charSpacing: 1.2, margin: 0,
  });
  s.addText([
    { text: "A live demo with slides, 15 minutes per team at the most", options: { breakLine: true } },
    { text: "Slides go in the repository, in a folder named presentation, both .pptx and .pdf", options: { breakLine: true } },
    { text: "You present from your own laptop, at the projector", options: { breakLine: true } },
    { text: "Questions are asked about the code", options: { bold: true } },
  ], { x: 8.6, y: 2.4, w: 3.85, h: 3.0, fontFace: F, fontSize: 12, color: C.INK, margin: 0, paraSpaceAfter: 10, valign: "top" });

  T.takeaway(s, "Do not copy projects, and do not ship code you cannot explain.",
    "Every member is questioned on their own commits.", 5.6);
}

// ----------------------------------------------------------- 10 the links ---
{
  const s = d.content("Environment set-up", "Everything you need to install");
  const rows = [
    ["Flutter SDK", "https://docs.flutter.dev/install", "pick your OS, then Install manually"],
    ["Android Studio", "https://developer.android.com/studio", "ships the Android SDK and the emulator"],
    ["Visual Studio Code", "https://code.visualstudio.com", "add the Flutter extension"],
    ["IntelliJ IDEA", "https://www.jetbrains.com/idea/download", "add the Flutter and Dart plugins"],
    ["Xcode (macOS only)", "Mac App Store", "needed for the iOS simulator"],
    ["Course Teams channel", "posted on Microsoft Teams", "the team-forming sheet lives here"],
  ];
  let y = 2.05;
  rows.forEach(([label, url, note], i) => {
    s.addText(label, { x: 0.9, y, w: 3.3, h: 0.34, fontFace: F, fontSize: 14, bold: true, color: C.INK, valign: "middle", margin: 0 });
    s.addText(url, { x: 4.3, y, w: 4.6, h: 0.34, fontFace: MONO, fontSize: 12, color: i < 4 ? C.BLUE : C.GRAY, valign: "middle", margin: 0 });
    s.addText(note, { x: 9.1, y, w: 3.33, h: 0.34, fontFace: F, fontSize: 12, color: C.GRAY, valign: "middle", margin: 0 });
    y += 0.58;
    if (i < rows.length - 1) T.hline(s, 0.9, y - 0.12, 11.53);
  });
  T.takeaway(s, "Type the URLs exactly as printed; they are complete, on one line.",
    "The Teams channel carries the sheet, the announcements and every link that cannot be public.", 5.6);
  s.addNotes("The old handout had the Flutter URL broken across two lines, which made it unusable from the PDF. Read it out once.");
}

// -------------------------------------------------------------- 11 task I ---
T.taskSlide(d, {
  n: "Task I",
  title: "Set up your development environment",
  intro: "Work on your own laptop. This is the machine you will use all semester, including at the demo.",
  steps: [
    "Install the Flutter SDK for your operating system from https://docs.flutter.dev/install",
    "In the Install Flutter section of that page, follow the Install manually path",
    "Add the flutter/bin folder to your PATH, so flutter --version works in a brand-new terminal",
    "Install Android Studio from https://developer.android.com/studio",
    "On macOS, also install Xcode from the Mac App Store",
    "Install your editor, VS Code or IntelliJ IDEA, and add the Flutter and Dart plugins to it",
    "Run flutter doctor and resolve everything it flags",
  ],
  hints: [
    "flutter --version",
    "flutter doctor  ·  flutter doctor -v",
    "PATH lives in ~/.zshrc on macOS, and in Environment Variables on Windows",
    "Target: Flutter 3.44 with Dart 3.12",
  ],
  done: [
    "flutter --version prints a version in a fresh terminal",
    "flutter doctor shows no blocking issue for Flutter, the Android toolchain or your editor",
  ],
});

// ------------------------------------------------------------- 12 task II ---
T.taskSlide(d, {
  n: "Task II",
  title: "Run the default app on a device",
  intro: "Straight after Task I, on the same machine. This is the deliverable for today.",
  steps: [
    "Create an Android Virtual Device in Android Studio (Device Manager), or open the iOS Simulator on macOS",
    "Start it and wait until it reaches the home screen",
    "Run flutter devices and confirm your emulator appears in the list",
    "Create a project with flutter create lab1_app",
    "Run it with flutter run from inside that folder",
    "Change the app-bar title in lib/main.dart, then press r to hot-reload and watch it update",
    "Take a screenshot of the running app on your emulator",
  ],
  hints: [
    "flutter devices",
    "flutter emulators --launch <emulator_id>",
    "flutter create lab1_app  ·  flutter run",
    "r hot-reloads, R hot-restarts, q quits",
  ],
  done: [
    "The counter app runs and the + button increments it",
    "Your edited title appears after a hot reload",
    "The screenshot is committed under /screenshots",
  ],
});

// ------------------------------------------------ 13 troubleshooting: doctor ---
{
  const s = d.content("Troubleshooting", "When flutter doctor reports problems");
  T.codeBlock(s, [
    "# 1 - find out what is actually missing",
    "flutter doctor -v",
    "",
    "# 2 - accept the Android SDK licenses",
    "flutter doctor --android-licenses",
    "",
    "# 3 - SDK missing? Android Studio >",
    "#     Settings > SDK Manager > SDK Tools >",
    "#     Android SDK Command-line Tools",
    "",
    "# 4 - check the fix landed",
    "flutter doctor",
  ], { x: 0.9, y: 1.95, w: 7.3, h: 4.3, fontSize: 12 });

  s.addText([
    { text: "cmdline-tools component is missing", options: { bold: true, breakLine: true } },
    { text: "Install Android SDK Command-line Tools from the SDK Manager, then run doctor again.", options: { color: C.GRAY, breakLine: true } },
    { text: "Android license status unknown", options: { bold: true, breakLine: true } },
    { text: "Run the licenses command above and answer y to every prompt.", options: { color: C.GRAY, breakLine: true } },
    { text: "Unable to locate Android SDK", options: { bold: true, breakLine: true } },
    { text: "Open Android Studio once; the SDK is downloaded on first launch.", options: { color: C.GRAY } },
  ], { x: 8.6, y: 1.95, w: 3.85, h: 4.0, fontFace: F, fontSize: 12, color: C.INK, margin: 0, paraSpaceAfter: 9, valign: "top" });

  s.addNotes("Almost every set-up failure in this session is one of these three. Walk the room and read the doctor output rather than guessing.");
}

// ------------------------------------------- 14 troubleshooting: devices ---
{
  const s = d.content("Troubleshooting", "No devices, emulators that will not boot, macOS");
  T.codeBlock(s, [
    "# nothing under connected devices?",
    "flutter devices",
    "flutter emulators",
    "flutter emulators --launch <emulator_id>",
    "",
    "# a physical Android phone works too:",
    "# Developer options > USB debugging",
    "",
    "# macOS - toolchain for the simulator",
    "sudo xcode-select --install",
    "sudo gem install cocoapods",
  ], { x: 0.9, y: 1.95, w: 7.3, h: 4.0, fontSize: 12 });

  s.addText([
    { text: "The emulator never boots", options: { bold: true, breakLine: true } },
    { text: "Hardware acceleration is off. Turn on virtualization (VT-x / AMD-V) in the BIOS; on Windows use a WHPX image.", options: { color: C.GRAY, breakLine: true } },
    { text: "Apple silicon Mac", options: { bold: true, breakLine: true } },
    { text: "Pick an arm64 system image in the AVD Manager; x86 images will not run.", options: { color: C.GRAY, breakLine: true } },
    { text: "Xcode installed, still no simulator", options: { bold: true, breakLine: true } },
    { text: "Open Xcode once, accept the license, then install the command-line tools above.", options: { color: C.GRAY } },
  ], { x: 8.6, y: 1.95, w: 3.85, h: 4.0, fontFace: F, fontSize: 12, color: C.INK, margin: 0, paraSpaceAfter: 9, valign: "top" });

  s.addText("If you are stuck for more than fifteen minutes, ask.", {
    x: 0.9, y: 6.25, w: 7.3, h: 0.4, fontFace: F, fontSize: 13, bold: true, color: C.BLUE, margin: 0,
  });
}

// ---------------------------------------------------------- 15 submission ---
T.submissionSlide(d, {
  labNumber: 1,
  extra: [
    "For Laboratory 1 the deliverable is the running default app: commit the project from Task II, with the screenshot in /screenshots.",
    "Your team and project idea go in the team-forming sheet on Teams, not on GitHub.",
  ],
});

// ------------------------------------------------------------- 16 closing ---
d.closing([
  ["checklist", "Recap", [
    "Flutter, an editor and the Android or iOS tooling installed",
    "An emulator that boots, and the default app running on it",
    "A team of at most three, and a project idea",
  ]],
  ["calendar", "Before Laboratory 2", [
    "Write your team and idea in the sheet on Teams",
    "Come with a project you can defend for a semester",
    "Bring the same laptop, in working order",
  ]],
  ["bookopen", "Read more", [
    "docs.flutter.dev/install",
    "docs.flutter.dev/get-started/test-drive",
    "developer.android.com/studio/run",
    "dart.dev/language",
  ]],
], "Wrapping up");

d.write(path.join(__dirname, "Mobile-and-Embedded-Lab1-v2.pptx")).then((f) => console.log("wrote", f));
