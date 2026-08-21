const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "Dinu-Ștefan Rusu";
pres.title = "Mobile and Embedded Computing: Lecture 1";
pres.theme = { headFontFace: "Arial", bodyFontFace: "Arial" };

// ---------- Apple-style system ----------
const INK = "1D1D1F";
const GRAY = "86868B";
const HAIR = "D2D2D7";
const PANEL = "F5F5F7";
const BLUE = "0071E3";
const ORANGE = "F56300";
const REDA = "FF3B30";
const WHITE = "FFFFFF";
const BLACK = "000000";
const DGRAY = "A1A1A6"; // gray on black

const F = "Arial";
const MONO = "Courier New";

const IC = (n) => path.join(__dirname, "..", "assets", "icons2", n + ".png");
const ASSET = (n) => path.join(__dirname, "..", "assets", "images", n);

const SPEC_ICONS = ["cloud", "laptop", "smartphone", "watch", "board", "cpu"];

let pageNum = 0;
function newSlide(dark) {
  const s = pres.addSlide();
  pageNum++;
  s.background = { color: dark ? BLACK : WHITE };
  if (!dark) {
    s.addText(String(pageNum), { x: 12.5, y: 7.05, w: 0.45, h: 0.3, fontFace: F, fontSize: 9, color: GRAY, align: "right", margin: 0 });
  }
  return s;
}
function header(s, eyebrow, titleText) {
  if (eyebrow) {
    s.addText(eyebrow.toUpperCase(), { x: 0.9, y: 0.52, w: 11.5, h: 0.3, fontFace: F, fontSize: 11, color: GRAY, charSpacing: 3, margin: 0 });
  }
  s.addText(titleText, { x: 0.9, y: 0.82, w: 11.5, h: 0.62, fontFace: F, fontSize: 30, bold: true, color: INK, margin: 0 });
}
function panel(s, x, y, w, h) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.12, fill: { color: PANEL }, line: { type: "none" } });
}
function hairbox(s, x, y, w, h, fill) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.09, fill: { color: fill || WHITE }, line: { color: HAIR, width: 1 } });
}
function hline(s, x, y, w) {
  s.addShape(pres.ShapeType.line, { x, y, w, h: 0, line: { color: HAIR, width: 0.75 } });
}
function arrow(s, x, y, w, h, color) {
  s.addShape(pres.ShapeType.line, { x, y, w, h, line: { color: color || GRAY, width: 1.25, endArrowType: "triangle" } });
}
// plain "bullet-less" list, Apple style
function lines(s, items, opts) {
  s.addText(items.map((t, i) => (typeof t === "string"
    ? { text: t, options: { breakLine: i < items.length - 1 } }
    : Object.assign({}, t, { options: Object.assign({}, t.options, { breakLine: i < items.length - 1 }) })
  )), Object.assign({ fontFace: F, fontSize: 15, color: INK, margin: 0, valign: "top", paraSpaceAfter: 14 }, opts));
}

// =====================================================================
// 1. TITLE (black)
// =====================================================================
{
  const s = newSlide(true);
  const d = 0.42, gap = 0.66;
  let x = 13.33 / 2 - (6 * d + 5 * gap) / 2;
  for (const ic of SPEC_ICONS) {
    s.addImage({ path: IC(ic + "-white"), x, y: 1.75, w: d, h: d });
    x += d + gap;
  }
  s.addText("Mobile and Embedded Computing", {
    x: 0.8, y: 2.85, w: 11.73, h: 0.95, fontFace: F, fontSize: 46, bold: true, color: WHITE, align: "center", margin: 0,
  });
  s.addText("Lecture 1: Course orientation · Platforms & the device landscape", {
    x: 0.8, y: 3.95, w: 11.73, h: 0.45, fontFace: F, fontSize: 17, color: DGRAY, align: "center", margin: 0,
  });
  s.addText("Dinu-Ștefan Rusu", {
    x: 0.8, y: 6.35, w: 11.73, h: 0.4, fontFace: F, fontSize: 13, color: "6E6E73", align: "center", margin: 0,
  });
}

// =====================================================================
// 2. BIO
// =====================================================================
{
  const s = newSlide(false);
  header(s, "Orientation", "Who's teaching this course");
  s.addText("Dinu-Ștefan Rusu", { x: 0.9, y: 1.95, w: 5.8, h: 0.5, fontFace: F, fontSize: 22, bold: true, color: INK, margin: 0 });
  s.addText([
    { text: "dinu_stefan.rusu@upb.ro", options: { breakLine: true } },
    { text: "Microsoft Teams: course channel", options: { breakLine: true } },
    { text: "rusudinu.com", options: {} },
  ], { x: 0.9, y: 2.55, w: 5.8, h: 1.3, fontFace: F, fontSize: 14, color: GRAY, margin: 0, paraSpaceAfter: 6 });

  // big quiet stats
  s.addText("45+", { x: 7.3, y: 1.75, w: 2.6, h: 1.0, fontFace: F, fontSize: 56, color: INK, margin: 0 });
  s.addText("Flutter apps shipped", { x: 7.3, y: 2.8, w: 2.6, h: 0.35, fontFace: F, fontSize: 13, color: GRAY, margin: 0 });
  s.addText("400k", { x: 10.2, y: 1.75, w: 2.6, h: 1.0, fontFace: F, fontSize: 56, color: INK, margin: 0 });
  s.addText("installs across them", { x: 10.2, y: 2.8, w: 2.6, h: 0.35, fontFace: F, fontSize: 13, color: GRAY, margin: 0 });

  hline(s, 0.9, 4.35, 11.53);
  s.addText("Appeared in, spoken at & partnered with", { x: 0.9, y: 4.55, w: 11.5, h: 0.3, fontFace: F, fontSize: 11, color: GRAY, charSpacing: 1.5, margin: 0 });
  // normalized logos: trimmed, area-weighted sizes from logos.json, common centerline
  const logos = JSON.parse(require("fs").readFileSync(path.join(__dirname, "..", "assets", "logos.json"), "utf8"));
  const totalW = logos.reduce((a, o) => a + o.w, 0);
  const lgap = (11.53 - totalW) / (logos.length - 1);
  const midY = 5.35;
  let lx = 0.9;
  for (const o of logos) {
    s.addImage({ path: path.join(__dirname, "..", "assets", "logos", o.file), x: lx, y: midY - o.h / 2, w: o.w, h: o.h });
    lx += o.w + lgap;
  }
}

// =====================================================================
// 3. COURSE TOPICS
// =====================================================================
{
  const s = newSlide(false);
  header(s, "Orientation", "The 12 lectures");
  const topics = [
    "The mobile & embedded landscape; native vs cross-platform; Git & GitHub",
    "Compiled vs interpreted languages; null safety; Dart & Kotlin; Flutter intro",
    "Agent-assisted coding; Flutter widgets; async, isolates vs goroutines",
    "Debugging; Stateless vs Stateful; introduction to state management",
    "Server vs client-side execution; serverless vs VPS; Go backends & Firebase",
    "Packages & feature flags; GraphQL & REST; observability and Crashlytics",
    "Authentication; OAuth providers; Firebase App Check",
    "WebSockets; runtime permissions; routing",
    "AI on-device and connecting to LLMs",
    "Offline-first: local data, sync and conflict resolution",
    "Performance & energy; embedded with TinyGo (sensors → MQTT → your app)",
    "gRPC; platform channels & FFI; Kotlin Multiplatform",
  ];
  const colX = [0.9, 7.05];
  const rowH = 0.78, startY = 1.85;
  topics.forEach((t, i) => {
    const cx = colX[Math.floor(i / 6)];
    const cy = startY + (i % 6) * rowH;
    const num = String(i + 1).padStart(2, "0");
    s.addText(num, {
      x: cx, y: cy, w: 0.5, h: 0.6, fontFace: F, fontSize: 14,
      color: i === 10 ? ORANGE : (i === 0 ? BLUE : GRAY), bold: i === 0 || i === 10, valign: "top", margin: 0,
    });
    s.addText(i === 0 ? [
      { text: t + "   ", options: {} },
      { text: "Today", options: { bold: true, color: BLUE } },
    ] : t, {
      x: cx + 0.62, y: cy - 0.02, w: 5.45, h: rowH, fontFace: F, fontSize: 12, color: INK, valign: "top", margin: 0,
    });
  });
}

// =====================================================================
// 4. GRADING
// =====================================================================
{
  const s = newSlide(false);
  header(s, "Orientation", "Grading");
  const parts = [
    ["3", "Final exam", "in the exam session"],
    ["3", "Laboratory + assignments", "individual"],
    ["1.5", "Lab test", "individual"],
    ["1.5", "Project", "teams of max 3"],
    ["1", "Concept presentation", "teams of max 3"],
  ];
  hline(s, 0.9, 2.0, 11.53);
  let x = 0.9;
  const cw = 2.306;
  for (const [pts, name, det] of parts) {
    s.addText([
      { text: pts, options: { fontSize: 52, color: INK } },
      { text: " p", options: { fontSize: 20, color: GRAY } },
    ], { x, y: 2.35, w: cw - 0.2, h: 1.0, fontFace: F, margin: 0 });
    s.addText(name, { x, y: 3.5, w: cw - 0.3, h: 0.6, fontFace: F, fontSize: 13.5, bold: true, color: INK, margin: 0 });
    s.addText(det, { x, y: 4.05, w: cw - 0.3, h: 0.35, fontFace: F, fontSize: 11.5, color: GRAY, margin: 0 });
    x += cw;
  }
  hline(s, 0.9, 4.75, 11.53);
  s.addText([
    { text: "You pass with a total of ", options: { color: INK } },
    { text: "≥ 5 out of 10", options: { bold: true, color: INK } },
    { text: ".", options: { color: INK } },
  ], { x: 0.9, y: 5.1, w: 11.5, h: 0.5, fontFace: F, fontSize: 16, margin: 0 });
}

// =====================================================================
// 5. CONCEPT PRESENTATIONS
// =====================================================================
{
  const s = newSlide(false);
  header(s, "Orientation", "Concept presentations");
  lines(s, [
    "Pick a topic from the shared Excel table; topics are taken in the order they are claimed",
    "Prepare slides that cover ~20 minutes of presentation",
    "If it fits the topic, include a demo, inside the same 20 minutes",
    "Every team member presents their part",
    "Upload all materials to Moodle in the designated space",
    "You present from your own laptop, at the projector",
    "Teams of at most 3 students",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 4.6, fontSize: 14.5, paraSpaceAfter: 13 });
  panel(s, 8.6, 1.95, 4.0, 2.75);
  s.addText("Speaking time", { x: 8.95, y: 2.25, w: 3.3, h: 0.35, fontFace: F, fontSize: 12, bold: true, color: GRAY, margin: 0 });
  s.addText([
    { text: "20 min ÷ team size", options: { fontSize: 21, bold: true, color: INK, breakLine: true } },
  ], { x: 8.95, y: 2.6, w: 3.3, h: 0.6, fontFace: F, margin: 0 });
  s.addText([
    { text: "team of 2   →   ~10 min each", options: { breakLine: true } },
    { text: "team of 3   →   ~7 min each", options: {} },
  ], { x: 8.95, y: 3.35, w: 3.3, h: 1.1, fontFace: F, fontSize: 13.5, color: GRAY, margin: 0, paraSpaceAfter: 6 });
}

// =====================================================================
// 6. LEARNING OBJECTIVES
// =====================================================================
{
  const s = newSlide(false);
  header(s, "Today", "What you should leave with");
  const objs = [
    ["target-ink", "The device spectrum", "The range of devices this course targets, and how their constraints differ by orders of magnitude"],
    ["scale-ink", "Four build strategies", "The four ways to build a mobile app, and the trade-offs of each"],
    ["zap-ink", "Why Flutter", "Why this course uses Flutter, and what that choice costs"],
    ["gitbranch-ink", "A working Git setup", "A GitHub account, and the branch → PR → review workflow the project grades"],
  ];
  let y = 2.0;
  for (const [ic, head, txt] of objs) {
    s.addImage({ path: IC(ic), x: 0.9, y: y + 0.05, w: 0.42, h: 0.42 });
    s.addText(head, { x: 1.65, y, w: 3.3, h: 0.55, fontFace: F, fontSize: 16, bold: true, color: INK, valign: "middle", margin: 0 });
    s.addText(txt, { x: 5.15, y, w: 7.3, h: 0.55, fontFace: F, fontSize: 13, color: GRAY, valign: "middle", margin: 0 });
    y += 0.78;
    if (y < 4.9) hline(s, 0.9, y - 0.12, 11.53);
  }
}

// =====================================================================
// 7. GIT & HOSTING
// =====================================================================
{
  const s = newSlide(false);
  header(s, "Git & GitHub", "Git and the services that host it");
  lines(s, [
    "Git is a version control system: it tracks every change ever made to your source code",
    "It lets multiple developers work on the same codebase without overwriting each other",
    "Git is a tool on your machine. GitHub, GitLab and Bitbucket are services that host Git repositories and add collaboration on top: reviews, issues, CI",
    { text: "This course uses GitHub", options: { bold: true } },
  ], { x: 0.9, y: 1.95, w: 6.8, h: 4.6, fontSize: 14.5, paraSpaceAfter: 15 });
  panel(s, 8.3, 1.95, 4.3, 4.0);
  s.addImage({ path: ASSET("image13.png"), x: 9.75, y: 2.5, w: 1.4, h: 1.4, sizing: { type: "contain", w: 1.4, h: 1.4 } });
  s.addText("one Git", { x: 8.3, y: 4.05, w: 4.3, h: 0.35, fontFace: F, fontSize: 12.5, bold: true, color: INK, align: "center", margin: 0 });
  s.addText("GitHub  ·  GitLab  ·  Bitbucket", { x: 8.3, y: 4.45, w: 4.3, h: 0.35, fontFace: F, fontSize: 12.5, color: GRAY, align: "center", margin: 0 });
  s.addText("many hosting services", { x: 8.3, y: 4.8, w: 4.3, h: 0.35, fontFace: F, fontSize: 11, color: GRAY, align: "center", margin: 0 });
}

// =====================================================================
// 8. GITHUB ACCOUNT + REPO
// =====================================================================
{
  const s = newSlide(false);
  header(s, "Git & GitHub", "Create a GitHub account: it is mandatory");
  s.addText([
    { text: "Sign up, free:  ", options: { color: INK } },
    { text: "github.com/signup", options: { fontFace: MONO, fontSize: 13, color: BLUE, breakLine: true } },
    { text: "Your commits are part of your grade: labs, assignments and the team project", options: { color: INK, breakLine: true } },
    { text: "Every resource for this course lives in one repository:", options: { color: INK } },
  ], { x: 0.9, y: 1.95, w: 7.0, h: 2.4, fontFace: F, fontSize: 14.5, margin: 0, paraSpaceAfter: 15, valign: "top" });
  panel(s, 0.9, 4.35, 7.0, 0.85);
  s.addText("github.com/rusudinu/mobile-and-embedded-computing", {
    x: 1.2, y: 4.35, w: 6.5, h: 0.85, fontFace: MONO, fontSize: 13.5, color: INK, valign: "middle", margin: 0,
  });
  s.addImage({ path: ASSET("image12.png"), x: 8.8, y: 2.6, w: 3.8, h: 2.14, sizing: { type: "contain", w: 3.8, h: 2.14 } });
}

// =====================================================================
// 9. REPOS & BRANCHES
// =====================================================================
{
  const s = newSlide(false);
  header(s, "Git & GitHub", "Repositories and branches");
  lines(s, [
    "A repository holds all the files of your project, and every revision they've ever had",
    "It always has at least one branch (main)",
    "A repository is a Git concept, not a GitHub one. GitHub only hosts it",
    "Branches let you build features, fix bugs and experiment without stepping on your teammates' work",
    "A branch is always created from an existing branch",
  ], { x: 0.9, y: 1.95, w: 7.4, h: 4.6, fontSize: 14.5, paraSpaceAfter: 15 });
  s.addImage({ path: IC("gitbranch-ink"), x: 9.9, y: 2.6, w: 1.6, h: 1.6 });
  s.addText("main  →  feature/…", { x: 8.8, y: 4.5, w: 3.8, h: 0.4, fontFace: MONO, fontSize: 12.5, color: GRAY, align: "center", margin: 0 });
}

// =====================================================================
// 10. THE WORKFLOW
// =====================================================================
{
  const s = newSlide(false);
  header(s, "Git & GitHub", "The workflow you will use");
  panel(s, 0.9, 1.95, 7.7, 4.35);
  const codeLines = [
    ["git clone <repo-url>", "   # once"],
    ["git checkout -b feature/login-screen", ""],
    ["git add .", ""],
    ['git commit -m "Add login screen"', ""],
    ["git push -u origin feature/login-screen", ""],
    ["", ""],
    ["# open a Pull Request → review → merge", ""],
    ["", ""],
    ["git checkout main && git pull", ""],
  ];
  const runs = [];
  codeLines.forEach(([code, comment], i) => {
    const last = i === codeLines.length - 1;
    if (code.startsWith("#")) runs.push({ text: code, options: { color: GRAY, breakLine: !last } });
    else if (comment) {
      runs.push({ text: code, options: { color: INK } });
      runs.push({ text: comment, options: { color: GRAY, breakLine: !last } });
    } else runs.push({ text: code || " ", options: { color: INK, breakLine: !last } });
  });
  s.addText(runs, { x: 1.35, y: 2.3, w: 6.9, h: 3.7, fontFace: MONO, fontSize: 13, margin: 0, valign: "top", lineSpacing: 24 });

  s.addText("How the project is graded", { x: 9.0, y: 2.25, w: 3.6, h: 0.45, fontFace: F, fontSize: 16, bold: true, color: BLUE, margin: 0 });
  s.addText([
    { text: "The repository history is checked for:", options: { breakLine: true } },
    { text: "", options: { breakLine: true } },
    { text: "one branch per feature", options: { breakLine: true } },
    { text: "pull requests with peer review", options: { breakLine: true } },
    { text: "commits from every team member", options: {} },
  ], { x: 9.0, y: 2.8, w: 3.6, h: 3.0, fontFace: F, fontSize: 13, color: GRAY, margin: 0, paraSpaceAfter: 8, valign: "top" });
  s.addNotes("Live demo opportunity: run this loop once in front of the class. The graders look at the repo history: branches, PRs, reviews, and per-student commit distribution.");
}

// =====================================================================
// 11. PRs & CI
// =====================================================================
{
  const s = newSlide(false);
  header(s, "Git & GitHub", "Pull requests, and what happens after merge");
  lines(s, [
    "A pull request starts the process of merging your branch into the main branch",
    "A peer reviews the changes and either approves them or requests changes",
    "Until the author receives all required approvals, the PR stays open",
    "After merge, a CI pipeline takes over: test → build → deploy",
  ], { x: 0.9, y: 1.95, w: 5.4, h: 4.4, fontSize: 14.5, paraSpaceAfter: 15 });
  hairbox(s, 6.7, 1.95, 5.95, 3.6, WHITE);
  s.addImage({ path: ASSET("image14.png"), x: 7.0, y: 2.35, w: 5.35, h: 2.42, sizing: { type: "contain", w: 5.35, h: 2.42 } });
  s.addText("The CI pipeline: what runs after your pull request is merged", {
    x: 6.7, y: 5.7, w: 5.95, h: 0.35, fontFace: F, fontSize: 11, color: GRAY, align: "center", margin: 0,
  });
}

// =====================================================================
// 12. DIVIDER
// =====================================================================
{
  const s = newSlide(true);
  s.addText("THE DEVICE LANDSCAPE", { x: 0.8, y: 2.75, w: 11.73, h: 0.35, fontFace: F, fontSize: 12, color: "6E6E73", charSpacing: 4, align: "center", margin: 0 });
  s.addText("What is “mobile and embedded” computing?", {
    x: 0.8, y: 3.2, w: 11.73, h: 0.85, fontFace: F, fontSize: 36, bold: true, color: WHITE, align: "center", margin: 0,
  });
  s.addText("The device landscape, and why it changes how you write software", {
    x: 0.8, y: 4.15, w: 11.73, h: 0.45, fontFace: F, fontSize: 15, color: DGRAY, align: "center", margin: 0,
  });
}

// =====================================================================
// 13. SPECTRUM TABLE
// =====================================================================
{
  const s = newSlide(false);
  header(s, "The device landscape", "One spectrum: from the cloud to a microcontroller");
  const labelW = 1.13, colW = 1.733;
  const tableX = 0.9, tableY = 2.5;
  const labels = ["Cloud", "Laptop", "Phone", "Wearable", "SBC", "MCU"];
  for (let i = 0; i < 6; i++) {
    const cx = tableX + labelW + i * colW + colW / 2;
    s.addImage({ path: IC(SPEC_ICONS[i] + "-ink"), x: cx - 0.19, y: 2.0, w: 0.38, h: 0.38 });
  }
  const focus = (i) => i === 2 || i === 5; // phone + MCU
  const hdr = (t, i) => ({ text: t, options: { bold: true, color: INK, align: "center", fill: { color: focus(i) ? PANEL : WHITE } } });
  const lbl = (t) => ({ text: t, options: { color: GRAY, align: "left" } });
  const cell = (t, i, hot) => ({
    text: t,
    options: {
      align: "center",
      color: hot ? ORANGE : INK,
      bold: !!hot || i === 2,
      fill: { color: focus(i) ? PANEL : WHITE },
    },
  });
  const rows = [
    [{ text: "", options: {} }, ...labels.map((t, i) => hdr(t, i))],
    [lbl("RAM"), cell("100s of GB", 0), cell("16–32 GB", 1), cell("8–16 GB", 2), cell("1–2 GB", 3), cell("1–8 GB", 4), cell("~0.5 MB", 5, true)],
    [lbl("Storage"), cell("TB – PB", 0), cell("~1 TB", 1), cell("128–512 GB", 2), cell("~32 GB", 3), cell("SD card", 4), cell("~4 MB flash", 5, true)],
    [lbl("Power"), cell("grid, kW", 0), cell("~60 W", 1), cell("~5 W, battery", 2), cell("~1 W, battery", 3), cell("~5 W", 4), cell("milliwatts", 5, true)],
    [lbl("OS"), cell("Linux", 0), cell("macOS / Win", 1), cell("Android / iOS", 2), cell("watchOS / Wear", 3), cell("Linux", 4), cell("RTOS / none", 5, true)],
  ];
  s.addTable(rows, {
    x: tableX, y: tableY, w: labelW + 6 * colW,
    colW: [labelW, colW, colW, colW, colW, colW, colW],
    rowH: [0.48, 0.58, 0.58, 0.58, 0.58],
    fontFace: F, fontSize: 11.5, valign: "middle",
    border: { type: "solid", color: HAIR, pt: 0.5 },
  });
  s.addText([
    { text: "This course lives on the right half of this table: ", options: { bold: true, color: INK } },
    { text: "resources are limited and the device runs on a battery.", options: { color: GRAY } },
  ], { x: 0.9, y: 6.0, w: 11.5, h: 0.5, fontFace: F, fontSize: 15, margin: 0 });
  s.addNotes("Orders of magnitude are the point, not exact numbers. A phone has ~10,000x less RAM headroom than a cloud box; an MCU has ~10,000x less than the phone. Numbers are 2026-typical: flagship phones 8–16 GB RAM; ESP32-class MCU: 520 KB SRAM, 4 MB flash, milliwatt budgets.");
}

// =====================================================================
// 14. WHAT CHANGES
// =====================================================================
{
  const s = newSlide(false);
  header(s, "The device landscape", "What changes when you leave the desktop");
  const items = [
    ["battery-ink", "Battery is a first-class resource", "Every CPU cycle and radio wake-up costs energy. We measure this in Lecture 11"],
    ["thermometer-ink", "Thermal limits", "Sustained load throttles the SoC, so extra CPU time is not always available"],
    ["wifioff-ink", "Intermittent connectivity", "Offline is a normal state, not an error. Apps must be designed for it"],
    ["store-ink", "You don't control deployment", "App-store review, staged rollouts, and users who never update"],
    ["radio-ink", "Sensors & radios", "GPS, accelerometer, camera and BLE: capabilities desktops don't have"],
    ["cpu-ink", "ARM everywhere", "From flagship phones down to microcontrollers: a different ISA than most servers"],
  ];
  const cw = 3.7, gx = 0.5, gy = 0.6, chh = 1.95;
  items.forEach(([ic, head, txt], i) => {
    const x = 0.9 + (i % 3) * (cw + gx);
    const y = 2.05 + Math.floor(i / 3) * (chh + gy);
    s.addImage({ path: IC(ic), x, y, w: 0.42, h: 0.42 });
    s.addText(head, { x, y: y + 0.58, w: cw, h: 0.5, fontFace: F, fontSize: 14.5, bold: true, color: INK, margin: 0 });
    s.addText(txt, { x, y: y + 1.08, w: cw, h: 0.85, fontFace: F, fontSize: 11.5, color: GRAY, margin: 0 });
  });
}

// =====================================================================
// 15. DEVICE RESOURCES
// =====================================================================
{
  const s = newSlide(false);
  header(s, "The device landscape", "What every app negotiates for");
  const res = [
    ["cpu-ink", "CPU", "compute", INK],
    ["memory-ink", "RAM", "working memory", INK],
    ["harddrive-ink", "Storage", "NAND flash", INK],
    ["grid-ink", "GPU", "graphics & ML", INK],
    ["batterycharging-orange", "Battery", "mobile-only: a finite budget", ORANGE],
  ];
  let x = 0.9;
  const cw = 2.306;
  for (const [ic, name, det, color] of res) {
    s.addImage({ path: IC(ic), x, y: 2.3, w: 0.5, h: 0.5 });
    s.addText(name, { x, y: 3.0, w: cw - 0.3, h: 0.5, fontFace: F, fontSize: 19, bold: true, color, margin: 0 });
    s.addText(det, { x, y: 3.5, w: cw - 0.4, h: 0.65, fontFace: F, fontSize: 11.5, color: GRAY, margin: 0 });
    x += cw;
  }
  hline(s, 0.9, 4.6, 11.53);
  s.addText([
    { text: "On a desktop, the first four are effectively elastic. On mobile, all five are hard budgets, ", options: { color: INK } },
    { text: "and the battery is the one your code cannot replenish.", options: { bold: true, color: INK } },
  ], { x: 0.9, y: 4.85, w: 11.5, h: 0.7, fontFace: F, fontSize: 14.5, margin: 0 });
  s.addText("Next: one concrete resource negotiation, start to finish.", {
    x: 0.9, y: 5.75, w: 11.5, h: 0.35, fontFace: F, fontSize: 12, color: GRAY, margin: 0,
  });
}

// =====================================================================
// 16. LLM FLOWCHART
// =====================================================================
{
  const s = newSlide(false);
  header(s, "The device landscape", "Resource allocation in action: loading an LLM");
  // start (black)
  s.addShape(pres.ShapeType.roundRect, { x: 0.9, y: 1.95, w: 3.4, h: 0.58, rectRadius: 0.09, fill: { color: BLACK }, line: { type: "none" } });
  s.addText("App asks the OS to load an LLM", { x: 0.9, y: 1.95, w: 3.4, h: 0.58, fontFace: F, fontSize: 12.5, color: WHITE, align: "center", valign: "middle", margin: 0 });
  arrow(s, 2.6, 2.53, 0, 0.42);
  // vram?
  hairbox(s, 1.3, 2.95, 2.6, 0.58);
  s.addText("Enough free VRAM?", { x: 1.3, y: 2.95, w: 2.6, h: 0.58, fontFace: F, fontSize: 12.5, bold: true, color: INK, align: "center", valign: "middle", margin: 0 });
  arrow(s, 3.9, 3.24, 1.0, 0, BLUE);
  s.addText("yes", { x: 3.95, y: 2.92, w: 0.9, h: 0.3, fontFace: F, fontSize: 10, color: BLUE, align: "center", margin: 0 });
  hairbox(s, 4.9, 2.95, 3.4, 0.58, PANEL);
  s.addText("Weights load into VRAM → GPU-fast", { x: 5.0, y: 2.95, w: 3.2, h: 0.58, fontFace: F, fontSize: 12, color: INK, align: "center", valign: "middle", margin: 0 });
  arrow(s, 2.6, 3.53, 0, 0.42);
  s.addText("no", { x: 2.72, y: 3.58, w: 0.5, h: 0.3, fontFace: F, fontSize: 10, color: GRAY, margin: 0 });
  // ram?
  hairbox(s, 1.3, 3.95, 2.6, 0.58);
  s.addText("Enough free RAM?", { x: 1.3, y: 3.95, w: 2.6, h: 0.58, fontFace: F, fontSize: 12.5, bold: true, color: INK, align: "center", valign: "middle", margin: 0 });
  arrow(s, 3.9, 4.24, 1.0, 0, BLUE);
  s.addText("yes", { x: 3.95, y: 3.92, w: 0.9, h: 0.3, fontFace: F, fontSize: 10, color: BLUE, align: "center", margin: 0 });
  hairbox(s, 4.9, 3.95, 3.4, 0.58, PANEL);
  s.addText("Weights load into RAM → runs, slower", { x: 5.0, y: 3.95, w: 3.2, h: 0.58, fontFace: F, fontSize: 12, color: INK, align: "center", valign: "middle", margin: 0 });
  arrow(s, 2.6, 4.53, 0, 0.42);
  s.addText("no", { x: 2.72, y: 4.58, w: 0.5, h: 0.3, fontFace: F, fontSize: 10, color: GRAY, margin: 0 });
  // fail
  hairbox(s, 1.3, 4.95, 2.6, 0.58);
  s.addText("Model fails to load", { x: 1.3, y: 4.95, w: 2.6, h: 0.58, fontFace: F, fontSize: 12.5, bold: true, color: REDA, align: "center", valign: "middle", margin: 0 });

  // unified memory
  panel(s, 9.0, 2.95, 3.6, 2.6);
  s.addText("Unified memory", { x: 9.35, y: 3.25, w: 3.0, h: 0.35, fontFace: F, fontSize: 13.5, bold: true, color: INK, margin: 0 });
  s.addText("Macs and phones share one memory pool between CPU and GPU, which gives more effective “VRAM” for LLMs than a PC with a discrete GPU.", {
    x: 9.35, y: 3.65, w: 3.0, h: 1.7, fontFace: F, fontSize: 11.5, color: GRAY, margin: 0, valign: "top",
  });

  s.addText([
    { text: "On-device AI is a resource-allocation problem. ", options: { bold: true, color: INK } },
    { text: "Keep this slide in mind for Lecture 9, AI on-device.", options: { color: GRAY } },
  ], { x: 0.9, y: 6.1, w: 11.5, h: 0.45, fontFace: F, fontSize: 14, margin: 0 });
}

// =====================================================================
// 17. DIVIDER
// =====================================================================
{
  const s = newSlide(true);
  s.addText("STRATEGIES", { x: 0.8, y: 2.75, w: 11.73, h: 0.35, fontFace: F, fontSize: 12, color: "6E6E73", charSpacing: 4, align: "center", margin: 0 });
  s.addText("Four ways to build a mobile app", {
    x: 0.8, y: 3.2, w: 11.73, h: 0.85, fontFace: F, fontSize: 36, bold: true, color: WHITE, align: "center", margin: 0,
  });
  s.addText("Web · Native · Cross-platform in two flavors, and how to choose", {
    x: 0.8, y: 4.15, w: 11.73, h: 0.45, fontFace: F, fontSize: 15, color: DGRAY, align: "center", margin: 0,
  });
}

// =====================================================================
// 18. NATIVE
// =====================================================================
{
  const s = newSlide(false);
  header(s, "Strategies", "The baseline: native apps");
  lines(s, [
    "Platform-specific: built for one OS, with that OS's own SDK and tools",
    "Best possible performance, full access to every platform capability",
    "Native UI components: the platform's own look and behavior",
    "Works fully offline; distributed through Google Play / the App Store",
  ], { x: 0.9, y: 1.95, w: 6.6, h: 3.4, fontSize: 14.5, paraSpaceAfter: 15 });
  // right: two rows
  s.addImage({ path: IC("apple-ink"), x: 8.3, y: 2.1, w: 0.55, h: 0.55 });
  s.addText([
    { text: "iOS", options: { bold: true, fontSize: 16, color: INK, breakLine: true } },
    { text: "Swift / SwiftUI · Xcode", options: { fontSize: 12.5, color: GRAY } },
  ], { x: 9.15, y: 1.95, w: 3.4, h: 0.9, fontFace: F, valign: "middle", margin: 0 });
  hline(s, 8.3, 3.15, 4.3);
  s.addImage({ path: IC("android-ink"), x: 8.3, y: 3.5, w: 0.55, h: 0.55 });
  s.addText([
    { text: "Android", options: { bold: true, fontSize: 16, color: INK, breakLine: true } },
    { text: "Kotlin / Jetpack Compose · Android Studio", options: { fontSize: 12.5, color: GRAY } },
  ], { x: 9.15, y: 3.35, w: 3.4, h: 0.9, fontFace: F, valign: "middle", margin: 0 });
  hline(s, 0.9, 5.5, 11.53);
  s.addText("Everything on the next slides is ultimately built on top of these two platform SDKs.", {
    x: 0.9, y: 5.75, w: 11.5, h: 0.45, fontFace: F, fontSize: 14, bold: true, color: INK, margin: 0,
  });
}

// =====================================================================
// 19. WEB
// =====================================================================
{
  const s = newSlide(false);
  header(s, "Strategies", "Strategy 1: web apps and PWAs");
  s.addText("What you get", { x: 0.9, y: 1.95, w: 5.6, h: 0.4, fontFace: F, fontSize: 14, bold: true, color: INK, margin: 0 });
  const plus = (t, last) => [
    { text: "+  ", options: { color: BLUE, bold: true } },
    { text: t, options: { color: INK, breakLine: !last } },
  ];
  const minus = (t, last) => [
    { text: "−  ", options: { color: GRAY, bold: true } },
    { text: t, options: { color: INK, breakLine: !last } },
  ];
  s.addText([
    ...plus("Opens from a URL: no installation, no store review"),
    ...plus("Updates reach every user instantly"),
    ...plus("One codebase, every platform with a browser"),
    ...plus("PWAs: installable, offline-capable, HTTPS-only", true),
  ], { x: 0.9, y: 2.45, w: 5.6, h: 2.8, fontFace: F, fontSize: 13.5, margin: 0, paraSpaceAfter: 12, valign: "top" });
  s.addText("What you give up", { x: 7.0, y: 1.95, w: 5.6, h: 0.4, fontFace: F, fontSize: 14, bold: true, color: INK, margin: 0 });
  s.addText([
    ...minus("Limited sensor & hardware access: BLE, NFC, background GPS"),
    ...minus("No reliable background execution, especially on iOS"),
    ...minus("Browser performance ceiling, and WebKit-only on iOS"),
    ...minus("No store presence: a different discoverability model", true),
  ], { x: 7.0, y: 2.45, w: 5.6, h: 2.8, fontFace: F, fontSize: 13.5, margin: 0, paraSpaceAfter: 12, valign: "top" });
  hline(s, 0.9, 5.55, 11.53);
  s.addText([
    { text: "Web apps have their own set of architectures, SSR, SSG and CSR, which are a web-course topic. ", options: { color: GRAY } },
    { text: "Here we only care how the web option compares to the next three.", options: { color: INK, bold: true } },
  ], { x: 0.9, y: 5.8, w: 11.5, h: 0.7, fontFace: F, fontSize: 13, margin: 0 });
}

// =====================================================================
// 20. RN vs FLUTTER
// =====================================================================
{
  const s = newSlide(false);
  header(s, "Strategies", "Strategy 2: cross-platform, two architectures");
  const stack = (x, icon, headerTxt, layers, bullets) => {
    panel(s, x, 1.95, 5.9, 4.55);
    s.addImage({ path: IC(icon), x: x + 0.35, y: 2.25, w: 0.42, h: 0.42 });
    s.addText(headerTxt, { x: x + 0.95, y: 2.2, w: 4.8, h: 0.5, fontFace: F, fontSize: 15.5, bold: true, color: INK, valign: "middle", margin: 0 });
    let y = 2.9;
    layers.forEach(([txt, dark], i) => {
      if (dark) {
        s.addShape(pres.ShapeType.roundRect, { x: x + 0.35, y, w: 5.2, h: 0.5, rectRadius: 0.08, fill: { color: BLACK }, line: { type: "none" } });
        s.addText(txt, { x: x + 0.45, y, w: 5.0, h: 0.5, fontFace: F, fontSize: 11.5, color: WHITE, align: "center", valign: "middle", margin: 0 });
      } else {
        hairbox(s, x + 0.35, y, 5.2, 0.5, WHITE);
        s.addText(txt, { x: x + 0.45, y, w: 5.0, h: 0.5, fontFace: F, fontSize: 11.5, color: INK, align: "center", valign: "middle", margin: 0 });
      }
      if (i < layers.length - 1) arrow(s, x + 2.95, y + 0.5, 0, 0.2);
      y += 0.7;
    });
    s.addText(bullets.map((b, i) => ({ text: b, options: { breakLine: i < bullets.length - 1 } })), {
      x: x + 0.35, y: y + 0.1, w: 5.2, h: 1.3, fontFace: F, fontSize: 11.5, color: GRAY, margin: 0, paraSpaceAfter: 6, valign: "top",
    });
  };
  stack(0.9, "react-ink", "React Native: drive native widgets", [
    ["Your JavaScript / TypeScript code", true],
    ["JSI + Fabric, no serialized bridge since RN 0.76", false],
    ["Real native widgets on each OS", false],
  ], [
    "UI is genuinely native: per-platform look & feel",
    "JS can update over the air (Expo EAS Update)",
    "Every interaction crosses the JS ↔ native boundary",
  ]);
  stack(6.55, "zap-ink", "Flutter: draw every pixel", [
    ["Your Dart code, AOT-compiled to native", true],
    ["Impeller renderer: draws the entire UI", false],
    ["Identical UI on every platform", false],
  ], [
    "One rendering pipeline, so no per-platform differences",
    "Talks to the OS via platform channels (→ Lecture 12)",
    "Hot reload during development",
  ]);
  s.addNotes("History for the curious: RN's old async 'bridge' serialized JSON between JS and native. It was retired with the new architecture (default since RN 0.76, Oct 2024). CodePush was the classic OTA service; Microsoft retired it in March 2025, Expo EAS Update is the mainstream successor. Flutter: Impeller replaced Skia; since Flutter 3.44 Skia is fully removed on iOS and Android 10+.");
}

// =====================================================================
// 21. KMP
// =====================================================================
{
  const s = newSlide(false);
  header(s, "Strategies", "Strategy 3: Kotlin Multiplatform, share the logic");
  s.addShape(pres.ShapeType.roundRect, { x: 0.9, y: 2.0, w: 6.3, h: 0.95, rectRadius: 0.09, fill: { color: BLACK }, line: { type: "none" } });
  s.addText([
    { text: "Shared Kotlin module", options: { bold: true, breakLine: true } },
    { text: "business logic · networking · storage · models", options: { fontSize: 11, color: DGRAY } },
  ], { x: 0.9, y: 2.0, w: 6.3, h: 0.95, fontFace: F, fontSize: 13.5, color: WHITE, align: "center", valign: "middle", margin: 0 });
  arrow(s, 2.45, 2.95, 0, 0.4);
  arrow(s, 5.65, 2.95, 0, 0.4);
  hairbox(s, 0.9, 3.35, 2.95, 1.05);
  s.addText([
    { text: "Android app", options: { bold: true, color: INK, breakLine: true } },
    { text: "Jetpack Compose UI", options: { fontSize: 11, color: GRAY } },
  ], { x: 0.9, y: 3.35, w: 2.95, h: 1.05, fontFace: F, fontSize: 13, align: "center", valign: "middle", margin: 0 });
  hairbox(s, 4.25, 3.35, 2.95, 1.05);
  s.addText([
    { text: "iOS app", options: { bold: true, color: INK, breakLine: true } },
    { text: "SwiftUI, or Compose Multiplatform", options: { fontSize: 11, color: GRAY } },
  ], { x: 4.25, y: 3.35, w: 2.95, h: 1.05, fontFace: F, fontSize: 13, align: "center", valign: "middle", margin: 0 });
  s.addText("expect / actual bridges the platform-specific parts", {
    x: 0.9, y: 4.6, w: 6.3, h: 0.35, fontFace: MONO, fontSize: 11, color: GRAY, align: "center", margin: 0,
  });
  lines(s, [
    "Share as much, or as little, as you choose",
    "Kotlin compiles natively per platform (Kotlin/Native for iOS)",
    "Stable since Nov 2023; Compose Multiplatform for iOS stable since May 2025",
    "In production at McDonald's, Netflix, Forbes",
    { text: "We build a shared KMP module in Lecture 12", options: { bold: true } },
  ], { x: 7.9, y: 2.0, w: 4.7, h: 3.4, fontSize: 13, paraSpaceAfter: 12 });
  hline(s, 0.9, 5.6, 11.53);
  s.addText([
    { text: "Flutter shares everything, including the pixels. ", options: { bold: true, color: INK } },
    { text: "KMP shares exactly as much as you choose, and keeps each platform's native UI.", options: { color: GRAY } },
  ], { x: 0.9, y: 5.85, w: 11.5, h: 0.5, fontFace: F, fontSize: 14, margin: 0 });
}

// =====================================================================
// 22. HOW TO CHOOSE + WHY FLUTTER
// =====================================================================
{
  const s = newSlide(false);
  header(s, "Strategies", "How to choose, and why this course uses Flutter");
  const picks = [
    ["Reach without installs, light hardware needs", "Web / PWA"],
    ["Team lives in JS/React, wants native UI feel", "React Native"],
    ["Existing native apps, want shared logic", "Kotlin Multiplatform"],
    ["One team, pixel-identical UI, fast iteration", "Flutter"],
  ];
  s.addText("If you…", { x: 0.9, y: 1.9, w: 4.5, h: 0.3, fontFace: F, fontSize: 11, color: GRAY, charSpacing: 1.5, margin: 0 });
  let y = 2.3;
  for (const [need, pick] of picks) {
    s.addText(need, { x: 0.9, y, w: 4.6, h: 0.4, fontFace: F, fontSize: 12, color: INK, margin: 0 });
    s.addText("→  " + pick, { x: 0.9, y: y + 0.36, w: 4.6, h: 0.35, fontFace: F, fontSize: 12.5, bold: true, color: BLUE, margin: 0 });
    y += 1.02;
    if (y < 6.0) hline(s, 0.9, y - 0.18, 4.6);
  }
  panel(s, 6.3, 1.95, 6.3, 2.75);
  s.addText("Why Flutter, here", { x: 6.65, y: 2.2, w: 5.6, h: 0.4, fontFace: F, fontSize: 14.5, bold: true, color: INK, margin: 0 });
  s.addText([
    { text: "One codebase: a team of 3 can build the whole semester project", options: { breakLine: true } },
    { text: "Hot reload: fast iteration in the labs", options: { breakLine: true } },
    { text: "One renderer: what you see in the emulator is what you ship", options: { breakLine: true } },
    { text: "Your instructor ships Flutter for a living: 45+ apps, 400k installs", options: {} },
  ], { x: 6.65, y: 2.65, w: 5.6, h: 1.9, fontFace: F, fontSize: 12.5, color: INK, margin: 0, paraSpaceAfter: 9, valign: "top" });
  s.addText("Trade-offs", { x: 6.65, y: 5.0, w: 5.6, h: 0.35, fontFace: F, fontSize: 12.5, bold: true, color: GRAY, margin: 0 });
  s.addText([
    { text: "Bigger binaries than native apps", options: { breakLine: true } },
    { text: "Platform-channel overhead when talking to the OS (→ Lecture 12)", options: { breakLine: true } },
    { text: "Dart is knowledge you may not reuse outside Flutter", options: {} },
  ], { x: 6.65, y: 5.35, w: 5.6, h: 1.1, fontFace: F, fontSize: 11.5, color: GRAY, margin: 0, paraSpaceAfter: 5, valign: "top" });
}

// =====================================================================
// 23. EMBEDDED
// =====================================================================
{
  const s = newSlide(false);
  header(s, "Embedded", "And where does “embedded” fit in?");
  lines(s, [
    "The same constraints, taken further: kilobytes of RAM, milliwatt power budgets, and often no operating system at all",
    "The phone becomes the hub: nearby devices talk to your app over BLE or MQTT, and your app talks to the cloud",
    { text: "In Lecture 11: a TinyGo program on a microcontroller publishes sensor data, and your Flutter app consumes it live", options: { bold: true } },
  ], { x: 0.9, y: 1.95, w: 6.8, h: 3.0, fontSize: 14, paraSpaceAfter: 14 });
  hline(s, 0.9, 5.0, 6.8);
  s.addText("Hardware note", { x: 0.9, y: 5.2, w: 6.8, h: 0.3, fontFace: F, fontSize: 11, color: ORANGE, charSpacing: 1.5, bold: true, margin: 0 });
  s.addText("TinyGo supports the ESP32-C3 / S3 (Wi-Fi support since TinyGo 0.41) and the Raspberry Pi Pico. Support for the original ESP32 is minimal.", {
    x: 0.9, y: 5.5, w: 6.8, h: 0.8, fontFace: F, fontSize: 11.5, color: GRAY, margin: 0, valign: "top",
  });
  // chain
  const box = (y, main, sub, dark, accent) => {
    if (dark) {
      s.addShape(pres.ShapeType.roundRect, { x: 8.5, y, w: 4.1, h: 1.0, rectRadius: 0.09, fill: { color: BLACK }, line: { type: "none" } });
    } else {
      hairbox(s, 8.5, y, 4.1, 1.0, WHITE);
    }
    s.addText([
      { text: main, options: { bold: true, color: dark ? WHITE : (accent || INK), breakLine: true } },
      { text: sub, options: { fontSize: 11, color: dark ? DGRAY : GRAY } },
    ], { x: 8.5, y, w: 4.1, h: 1.0, fontFace: F, fontSize: 13.5, align: "center", valign: "middle", margin: 0 });
  };
  box(2.0, "Sensor + MCU", "ESP32-C3 · TinyGo", false, ORANGE);
  arrow(s, 10.55, 3.0, 0, 0.38);
  box(3.38, "Your Flutter app", "the hub, via MQTT / BLE", true);
  arrow(s, 10.55, 4.38, 0, 0.38);
  box(4.76, "Cloud", "storage · dashboards · ML", false);
}

// =====================================================================
// 24. ROADMAP
// =====================================================================
{
  const s = newSlide(false);
  header(s, "Roadmap", "The semester, pinned onto the spectrum");
  // thin spectrum line with end icons
  s.addImage({ path: IC("cloud-gray"), x: 0.9, y: 1.98, w: 0.34, h: 0.34 });
  hline(s, 1.45, 2.15, 10.35);
  s.addImage({ path: IC("cpu-orange"), x: 12.0, y: 1.98, w: 0.34, h: 0.34 });
  s.addText("cloud", { x: 0.9, y: 2.38, w: 1.5, h: 0.3, fontFace: F, fontSize: 10.5, color: GRAY, margin: 0 });
  s.addText("microcontroller", { x: 10.9, y: 2.38, w: 1.53, h: 0.3, fontFace: F, fontSize: 10.5, color: GRAY, align: "right", margin: 0 });

  const cols = [
    ["Cloud & backend", BLUE, [
      ["L5", "Serverless, VPS & Go backends"],
      ["L6", "GraphQL, REST & observability"],
      ["L7", "Auth, OAuth & App Check"],
      ["L8", "WebSockets, permissions, routing"],
    ]],
    ["The phone", INK, [
      ["L2", "Dart, Kotlin & Flutter"],
      ["L3", "Widgets & async"],
      ["L4", "State management"],
      ["L9", "AI on-device & LLMs"],
      ["L10", "Offline-first & sync"],
      ["L12", "Channels, FFI & KMP"],
    ]],
    ["Embedded", ORANGE, [
      ["L11", "Performance & energy"],
      ["L11", "TinyGo: sensors → MQTT → app"],
    ]],
  ];
  let cx = 0.9;
  const colWd = 3.85, cgap = 0.55;
  for (const [head, color, rows] of cols) {
    s.addText(head, { x: cx, y: 2.9, w: colWd, h: 0.4, fontFace: F, fontSize: 14.5, bold: true, color, margin: 0 });
    let ry = 3.45;
    for (const [lec, txt] of rows) {
      s.addText(lec, { x: cx, y: ry, w: 0.62, h: 0.4, fontFace: MONO, fontSize: 11, color: GRAY, valign: "middle", margin: 0 });
      s.addText(txt, { x: cx + 0.72, y: ry, w: colWd - 0.72, h: 0.4, fontFace: F, fontSize: 12, color: INK, valign: "middle", margin: 0 });
      ry += 0.52;
    }
    cx += colWd + cgap;
  }
  s.addText("You'll see this map again at the start of every lecture, with a pin on where we are.", {
    x: 0.9, y: 6.45, w: 11.5, h: 0.35, fontFace: F, fontSize: 12, color: GRAY, margin: 0,
  });
}

// =====================================================================
// 25. CLOSE (black)
// =====================================================================
{
  const s = newSlide(true);
  s.addText("Before next week", {
    x: 0.9, y: 0.7, w: 11.5, h: 0.7, fontFace: F, fontSize: 30, bold: true, color: WHITE, margin: 0,
  });
  const cols = [
    ["checklist-white", "Recap", [
      "One spectrum, cloud → microcontroller: this course covers the right half",
      "Four strategies: web, native, cross-platform, KMP",
      "We chose Flutter, with its trade-offs stated",
    ]],
    ["calendar-white", "This week", [
      "Create your GitHub account and open the course repo",
      "Install the Flutter SDK. Lab 1 walks you through it",
      "Start thinking about teammates and a project idea",
    ]],
    ["bookopen-white", "Read more", [
      "flutter.dev/multi-platform",
      "kotlinlang.org/multiplatform",
      "tinygo.org",
      "developer.android.com · developer.apple.com",
    ]],
  ];
  let x = 0.9;
  const cw = 3.7, cgap = 0.2;
  for (const [ic, head, items] of cols) {
    s.addImage({ path: IC(ic), x, y: 1.95, w: 0.42, h: 0.42 });
    s.addText(head, { x, y: 2.5, w: cw, h: 0.5, fontFace: F, fontSize: 17, bold: true, color: WHITE, margin: 0 });
    s.addText(items.map((t, i) => ({ text: t, options: { breakLine: i < items.length - 1 } })), {
      x, y: 3.15, w: cw, h: 3.0, fontFace: F, fontSize: 12.5, color: DGRAY, margin: 0, paraSpaceAfter: 11, valign: "top",
    });
    x += cw + cgap;
  }
}

pres.writeFile({ fileName: path.join(__dirname, "Mobile-and-Embedded-Lecture1-v3.pptx") }).then(() => console.log("written"));
