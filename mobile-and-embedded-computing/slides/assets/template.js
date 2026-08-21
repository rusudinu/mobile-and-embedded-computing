// ============================================================================
// Mobile & Embedded Computing: shared deck template (Apple-minimal system)
// Every lecture deck is built with this module. Do not restyle per lecture.
// ============================================================================
const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

// ---------------------------------------------------------------- palette ---
const C = {
  INK: "1D1D1F",     // primary text
  GRAY: "86868B",    // secondary text
  HAIR: "D2D2D7",    // hairline rules & box borders
  PANEL: "F5F5F7",   // the ONLY light fill
  BLUE: "0071E3",    // accent: emphasis / interactive / "yes" paths
  ORANGE: "F56300",  // accent: EMBEDDED topics only
  RED: "FF3B30",     // failure states only
  WHITE: "FFFFFF",
  BLACK: "000000",   // dark slides + emphasis blocks
  DGRAY: "A1A1A6",   // secondary text ON black
  DIM: "6E6E73",     // tertiary text on black
};

const F = "Arial";          // all text; Liberation Sans on Linux (metric-compatible)
const MONO = "Courier New"; // code; Liberation Mono on Linux (metric-compatible)

const ICONS_DIR = path.join(__dirname, "icons2");
const ASSETS_DIR = path.join(__dirname, "images");
const LOGOS_DIR = path.join(__dirname, "logos");

// icon path: name + one of ink|white|blue|orange|gray  (see icon-names.txt)
function icon(name, color = "ink") {
  const p = path.join(ICONS_DIR, `${name}-${color}.png`);
  if (!fs.existsSync(p)) throw new Error(`icon not found: ${name}-${color} (see icon-names.txt)`);
  return p;
}
const asset = (f) => path.join(ASSETS_DIR, f);

// ------------------------------------------------------------------ deck ----
// Usage:  const d = new Deck({ lecture: 3, title: "...", subtitle: "..." })
class Deck {
  constructor({ lecture, title, subtitle }) {
    this.pres = new pptxgen();
    this.pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
    this.pres.author = "Dinu-Ștefan Rusu";
    this.pres.title = `Mobile and Embedded Computing, Lecture ${lecture}`;
    // Pin the theme fonts. Numbered-list bullets reference the theme's major font
    // (+mj-lt); leaving it at the pptxgenjs default (Calibri Light) would make the
    // step numbers substitute unpredictably on the Linux CI that builds the PDFs.
    this.pres.theme = { headFontFace: F, bodyFontFace: F };
    this.lecture = lecture;
    this.deckTitle = title;
    this.deckSubtitle = subtitle;
    this.n = 0;
    this.SPEC = ["cloud", "laptop", "smartphone", "watch", "board", "cpu"];
  }

  // --- raw slide (numbered footer on light slides) ---
  slide(dark = false) {
    const s = this.pres.addSlide();
    this.n++;
    s.background = { color: dark ? C.BLACK : C.WHITE };
    if (!dark) {
      s.addText(String(this.n), {
        x: 12.5, y: 7.05, w: 0.45, h: 0.3, fontFace: F, fontSize: 9,
        color: C.GRAY, align: "right", margin: 0,
      });
    }
    return s;
  }

  // --- TITLE SLIDE (black, device spectrum across the top) ---
  titleSlide() {
    const s = this.slide(true);
    const d = 0.42, gap = 0.66;
    let x = 13.33 / 2 - (6 * d + 5 * gap) / 2;
    for (const ic of this.SPEC) {
      s.addImage({ path: icon(ic, "white"), x, y: 1.75, w: d, h: d });
      x += d + gap;
    }
    s.addText(this.deckTitle, {
      x: 0.8, y: 2.85, w: 11.73, h: 0.95, fontFace: F, fontSize: 46,
      bold: true, color: C.WHITE, align: "center", margin: 0,
    });
    s.addText(`Lecture ${this.lecture}: ${this.deckSubtitle}`, {
      x: 0.8, y: 3.95, w: 11.73, h: 0.45, fontFace: F, fontSize: 17,
      color: C.DGRAY, align: "center", margin: 0,
    });
    s.addText("Dinu-Ștefan Rusu", {
      x: 0.8, y: 6.35, w: 11.73, h: 0.4, fontFace: F, fontSize: 13,
      color: C.DIM, align: "center", margin: 0,
    });
    return s;
  }

  // --- SECTION DIVIDER (black) ---
  divider(eyebrow, title, subtitle) {
    const s = this.slide(true);
    s.addText(eyebrow.toUpperCase(), {
      x: 0.8, y: 2.75, w: 11.73, h: 0.35, fontFace: F, fontSize: 12,
      color: C.DIM, charSpacing: 4, align: "center", margin: 0,
    });
    s.addText(title, {
      x: 0.8, y: 3.2, w: 11.73, h: 0.85, fontFace: F, fontSize: 36,
      bold: true, color: C.WHITE, align: "center", margin: 0,
    });
    if (subtitle) {
      s.addText(subtitle, {
        x: 0.8, y: 4.15, w: 11.73, h: 0.45, fontFace: F, fontSize: 15,
        color: C.DGRAY, align: "center", margin: 0,
      });
    }
    return s;
  }

  // --- CONTENT SLIDE: returns slide with eyebrow + title already placed ---
  // Content region: x 0.9 .. 12.43, y 1.95 .. 6.9
  content(eyebrow, title) {
    const s = this.slide(false);
    if (eyebrow) {
      s.addText(eyebrow.toUpperCase(), {
        x: 0.9, y: 0.52, w: 11.5, h: 0.3, fontFace: F, fontSize: 11,
        color: C.GRAY, charSpacing: 3, margin: 0,
      });
    }
    // Titles MUST fit one line at 30pt (~52 chars). Shorten rather than wrap.
    s.addText(title, {
      x: 0.9, y: 0.82, w: 11.5, h: 0.62, fontFace: F, fontSize: 30,
      bold: true, color: C.INK, margin: 0,
    });
    return s;
  }

  // --- CLOSING SLIDE (black, three columns) ---
  // cols: [ [iconName, heading, [lines...]], x3 ]
  closing(cols, heading = "Before next week") {
    const s = this.slide(true);
    s.addText(heading, {
      x: 0.9, y: 0.7, w: 11.5, h: 0.7, fontFace: F, fontSize: 30,
      bold: true, color: C.WHITE, margin: 0,
    });
    let x = 0.9;
    const cw = 3.7, cgap = 0.2;
    for (const [ic, head, items] of cols) {
      s.addImage({ path: icon(ic, "white"), x, y: 1.95, w: 0.42, h: 0.42 });
      s.addText(head, { x, y: 2.5, w: cw, h: 0.5, fontFace: F, fontSize: 17, bold: true, color: C.WHITE, margin: 0 });
      s.addText(items.map((t, i) => ({ text: t, options: { breakLine: i < items.length - 1 } })), {
        x, y: 3.15, w: cw, h: 3.0, fontFace: F, fontSize: 12.5,
        color: C.DGRAY, margin: 0, paraSpaceAfter: 11, valign: "top",
      });
      x += cw + cgap;
    }
    return s;
  }

  write(file) {
    return this.pres.writeFile({ fileName: file }).then(() => file);
  }
}

// ------------------------------------------------------------- primitives ---
// All take the slide as first arg. Coordinates in inches.

// gray rounded panel: the only light fill in the system
function panel(s, x, y, w, h) {
  s.addShape("roundRect", { x, y, w, h, rectRadius: 0.12, fill: { color: C.PANEL }, line: { type: "none" } });
}
// white box with hairline border
function hairbox(s, x, y, w, h, fill) {
  s.addShape("roundRect", { x, y, w, h, rectRadius: 0.09, fill: { color: fill || C.WHITE }, line: { color: C.HAIR, width: 1 } });
}
// solid black block for the "source"/emphasis node in diagrams
function blackbox(s, x, y, w, h) {
  s.addShape("roundRect", { x, y, w, h, rectRadius: 0.09, fill: { color: C.BLACK }, line: { type: "none" } });
}
// horizontal hairline rule: the main separator in this system
function hline(s, x, y, w) {
  s.addShape("line", { x, y, w, h: 0, line: { color: C.HAIR, width: 0.75 } });
}
// arrow (set w or h to 0 for straight)
function arrow(s, x, y, w, h, color) {
  s.addShape("line", { x, y, w, h, line: { color: color || C.GRAY, width: 1.25, endArrowType: "triangle" } });
}

// Bullet-less list: the default body text style (NO bullet glyphs in this system).
// items: strings, or {text, options:{bold,color,...}}
function lines(s, items, opts) {
  s.addText(items.map((t, i) => {
    const o = typeof t === "string" ? { text: t, options: {} } : { text: t.text, options: Object.assign({}, t.options) };
    o.options.breakLine = i < items.length - 1;
    return o;
  }), Object.assign({
    fontFace: F, fontSize: 15, color: C.INK, margin: 0, valign: "top", paraSpaceAfter: 14,
  }, opts));
}

// Icon + heading + body, in a grid. Use for "N things" slides.
// items: [iconName, heading, body]. 3 per row reads best
function iconGrid(s, items, opts = {}) {
  const cols = opts.cols || 3;
  const x0 = opts.x || 0.9, y0 = opts.y || 2.05;
  const cw = opts.cw || 3.7, gx = opts.gx || 0.5, rowH = opts.rowH || 2.55;
  items.forEach(([ic, head, body], i) => {
    const x = x0 + (i % cols) * (cw + gx);
    const y = y0 + Math.floor(i / cols) * rowH;
    s.addImage({ path: icon(ic, opts.iconColor || "ink"), x, y, w: 0.42, h: 0.42 });
    s.addText(head, { x, y: y + 0.58, w: cw, h: 0.5, fontFace: F, fontSize: 14.5, bold: true, color: C.INK, margin: 0 });
    if (body) s.addText(body, { x, y: y + 1.08, w: cw, h: 0.9, fontFace: F, fontSize: 11.5, color: C.GRAY, margin: 0 });
  });
}

// Code block on the gray panel. lines: ["code", ...]. Prefix a line with "#" for a comment (gray).
function codeBlock(s, code, opts = {}) {
  const x = opts.x || 0.9, y = opts.y || 1.95, w = opts.w || 7.7, h = opts.h || 4.35;
  const size = opts.fontSize || 13;
  panel(s, x, y, w, h);
  const arr = Array.isArray(code) ? code : code.split("\n");
  const runs = arr.map((ln, i) => ({
    text: ln === "" ? " " : ln,
    options: { color: ln.trim().startsWith("#") || ln.trim().startsWith("//") ? C.GRAY : C.INK, breakLine: i < arr.length - 1 },
  }));
  s.addText(runs, {
    x: x + 0.45, y: y + 0.35, w: w - 0.8, h: h - 0.65,
    fontFace: MONO, fontSize: size, margin: 0, valign: "top", lineSpacing: Math.round(size * 1.85),
  });
}

// Two-column compare: what you get / what you give up (+ blue, − grey)
function prosCons(s, pros, cons, opts = {}) {
  const y = opts.y || 1.95;
  const headL = opts.headL || "What you get", headR = opts.headR || "What you give up";
  s.addText(headL, { x: 0.9, y, w: 5.6, h: 0.4, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  s.addText(headR, { x: 7.0, y, w: 5.6, h: 0.4, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  const mk = (arr, sym, symColor) => arr.flatMap((t, i) => ([
    { text: sym + "  ", options: { color: symColor, bold: true } },
    { text: t, options: { color: C.INK, breakLine: i < arr.length - 1 } },
  ]));
  const o = { fontFace: F, fontSize: 13.5, margin: 0, paraSpaceAfter: 12, valign: "top" };
  s.addText(mk(pros, "+", C.BLUE), Object.assign({ x: 0.9, y: y + 0.5, w: 5.6, h: 2.8 }, o));
  s.addText(mk(cons, "−", C.GRAY), Object.assign({ x: 7.0, y: y + 0.5, w: 5.6, h: 2.8 }, o));
}

// Bottom takeaway: hairline + one strong sentence. THE standard way to close a slide.
// NOTE: pass opts.w when the slide has a right-side diagram, so the rule does
// not run underneath it (e.g. takeaway(s, "...", "...", 5.55, { w: 6.8 })).
function takeaway(s, boldPart, restPart, y = 5.55, opts = {}) {
  const w = opts.w || 11.53;
  hline(s, 0.9, y, w);
  const runs = [{ text: boldPart, options: { bold: true, color: C.INK } }];
  if (restPart) runs.push({ text: " " + restPart, options: { color: C.GRAY } });
  s.addText(runs, { x: 0.9, y: y + 0.25, w, h: 0.7, fontFace: F, fontSize: 14, margin: 0, valign: "top" });
}

// Vertical flow of boxes (architecture/pipeline diagrams).
// steps: [heading, sub, style]  style: "black" | "hair" | "panel"; accent color optional 4th
function flowDown(s, steps, opts = {}) {
  const x = opts.x || 8.5, w = opts.w || 4.1, h = opts.h || 1.0, gap = opts.gap || 0.38;
  let y = opts.y || 2.0;
  steps.forEach(([head, sub, style, accent], i) => {
    if (style === "black") blackbox(s, x, y, w, h);
    else if (style === "panel") panel(s, x, y, w, h);
    else hairbox(s, x, y, w, h);
    const dark = style === "black";
    s.addText([
      { text: head, options: { bold: true, color: dark ? C.WHITE : (accent || C.INK), breakLine: !!sub } },
      ...(sub ? [{ text: sub, options: { fontSize: 11, color: dark ? C.DGRAY : C.GRAY } }] : []),
    ], { x, y, w, h, fontFace: F, fontSize: 13.5, align: "center", valign: "middle", margin: 0 });
    if (i < steps.length - 1) arrow(s, x + w / 2, y + h, 0, gap);
    y += h + gap;
  });
}

// Standard table. rows[0] is the header row. focusCols: indexes to tint + bold.
function table(s, headers, rows, opts = {}) {
  const x = opts.x || 0.9, y = opts.y || 2.2;
  const totalW = opts.w || 11.53;
  const labelW = opts.labelW || 1.13;
  const n = headers.length;
  const colW = (totalW - labelW) / n;
  const focus = new Set(opts.focusCols || []);
  const hot = new Set(opts.hotCols || []); // orange (embedded) columns
  const hdr = [{ text: "", options: {} }, ...headers.map((t, i) => ({
    text: t, options: { bold: true, color: C.INK, align: "center", fill: { color: focus.has(i) || hot.has(i) ? C.PANEL : C.WHITE } },
  }))];
  const body = rows.map(([label, ...cells]) => [
    { text: label, options: { color: C.GRAY, align: "left" } },
    ...cells.map((t, i) => ({
      text: String(t), options: {
        align: "center", color: hot.has(i) ? C.ORANGE : C.INK,
        bold: hot.has(i) || focus.has(i),
        fill: { color: focus.has(i) || hot.has(i) ? C.PANEL : C.WHITE },
      },
    })),
  ]);
  s.addTable([hdr, ...body], {
    x, y, w: totalW,
    colW: [labelW, ...Array(n).fill(colW)],
    rowH: [0.48, ...Array(rows.length).fill(opts.rowH || 0.58)],
    fontFace: F, fontSize: opts.fontSize || 11.5, valign: "middle",
    border: { type: "solid", color: C.HAIR, pt: 0.5 },
  });
}

// Big quiet stat row (e.g. "3p Final exam"). items: [big, small, caption]
function statRow(s, items, opts = {}) {
  const y = opts.y || 2.35;
  const x0 = opts.x || 0.9;
  const cw = (opts.w || 11.53) / items.length;
  items.forEach(([big, label, caption], i) => {
    const x = x0 + i * cw;
    s.addText(big, { x, y, w: cw - 0.3, h: 1.0, fontFace: F, fontSize: opts.bigSize || 52, color: C.INK, margin: 0 });
    s.addText(label, { x, y: y + 1.15, w: cw - 0.3, h: 0.6, fontFace: F, fontSize: 13.5, bold: true, color: C.INK, margin: 0 });
    if (caption) s.addText(caption, { x, y: y + 1.7, w: cw - 0.3, h: 0.35, fontFace: F, fontSize: 11.5, color: C.GRAY, margin: 0 });
  });
}

// The instructor bio slide, identical in every deck. Call right after titleSlide().
function bioSlide(deck) {
  const s = deck.content("Orientation", "Who's teaching this course");
  s.addText("Dinu-Ștefan Rusu", { x: 0.9, y: 1.95, w: 5.8, h: 0.5, fontFace: F, fontSize: 22, bold: true, color: C.INK, margin: 0 });
  s.addText([
    { text: "dinu_stefan.rusu@upb.ro", options: { breakLine: true } },
    { text: "Microsoft Teams course channel", options: { breakLine: true } },
    { text: "rusudinu.com", options: {} },
  ], { x: 0.9, y: 2.55, w: 5.8, h: 1.3, fontFace: F, fontSize: 14, color: C.GRAY, margin: 0, paraSpaceAfter: 6 });
  s.addText("45+", { x: 7.3, y: 1.75, w: 2.6, h: 1.0, fontFace: F, fontSize: 56, color: C.INK, margin: 0 });
  s.addText("Flutter apps shipped", { x: 7.3, y: 2.8, w: 2.6, h: 0.35, fontFace: F, fontSize: 13, color: C.GRAY, margin: 0 });
  s.addText("400k", { x: 10.2, y: 1.75, w: 2.6, h: 1.0, fontFace: F, fontSize: 56, color: C.INK, margin: 0 });
  s.addText("installs across them", { x: 10.2, y: 2.8, w: 2.6, h: 0.35, fontFace: F, fontSize: 13, color: C.GRAY, margin: 0 });
  hline(s, 0.9, 4.35, 11.53);
  s.addText("Appeared in, spoken at & partnered with", {
    x: 0.9, y: 4.55, w: 11.5, h: 0.3, fontFace: F, fontSize: 11, color: C.GRAY, charSpacing: 1.5, margin: 0,
  });
  const logos = JSON.parse(fs.readFileSync(path.join(__dirname, "logos.json"), "utf8"));
  const totalW = logos.reduce((a, o) => a + o.w, 0);
  const lgap = (11.53 - totalW) / (logos.length - 1);
  let lx = 0.9;
  for (const o of logos) {
    s.addImage({ path: path.join(LOGOS_DIR, o.file), x: lx, y: 5.35 - o.h / 2, w: o.w, h: o.h });
    lx += o.w + lgap;
  }
  return s;
}

// Learning-objectives slide: rows of icon + heading + description, separated by hairlines.
// objs: [iconName, heading, description]
function objectivesSlide(deck, objs, eyebrow = "Today", title = "What you should leave with") {
  const s = deck.content(eyebrow, title);
  let y = 2.0;
  objs.forEach((o, i) => {
    const [ic, head, txt] = o;
    s.addImage({ path: icon(ic, "ink"), x: 0.9, y: y + 0.05, w: 0.42, h: 0.42 });
    s.addText(head, { x: 1.65, y, w: 3.3, h: 0.55, fontFace: F, fontSize: 16, bold: true, color: C.INK, valign: "middle", margin: 0 });
    s.addText(txt, { x: 5.15, y, w: 7.3, h: 0.55, fontFace: F, fontSize: 13, color: C.GRAY, valign: "middle", margin: 0 });
    y += 0.78;
    if (i < objs.length - 1) hline(s, 0.9, y - 0.12, 11.53);
  });
  return s;
}

// ============================== LAB HANDOUTS ================================
// Labs use the same visual system as the lectures, with a task-oriented spine.
// Usage: const d = new Lab({ lab: 3, title: "Widgets & UI", subtitle: "..." })
class Lab extends Deck {
  constructor({ lab, title, subtitle }) {
    super({ lecture: lab, title, subtitle });
    this.pres.title = `Mobile and Embedded Computing, Laboratory ${lab}`;
    this.lab = lab;
  }
  // Black title slide, "LABORATORY N" eyebrow instead of the device spectrum.
  titleSlide() {
    const s = this.slide(true);
    s.addText(`LABORATORY ${this.lab}`, {
      x: 0.8, y: 2.55, w: 11.73, h: 0.35, fontFace: F, fontSize: 12,
      color: C.DIM, charSpacing: 4, align: "center", margin: 0,
    });
    s.addText(this.deckTitle, {
      x: 0.8, y: 3.0, w: 11.73, h: 0.95, fontFace: F, fontSize: 44,
      bold: true, color: C.WHITE, align: "center", margin: 0,
    });
    s.addText(this.deckSubtitle, {
      x: 0.8, y: 4.1, w: 11.73, h: 0.45, fontFace: F, fontSize: 17,
      color: C.DGRAY, align: "center", margin: 0,
    });
    s.addText("Mobile and Embedded Computing  ·  Dinu-Ștefan Rusu", {
      x: 0.8, y: 6.35, w: 11.73, h: 0.4, fontFace: F, fontSize: 13,
      color: C.DIM, align: "center", margin: 0,
    });
    return s;
  }
}

// A task slide. This is the workhorse of a lab handout.
//   n      "Task I" / "Task II"
//   title  short task name
//   intro  one sentence of framing (optional)
//   steps  array of strings: the numbered requirements. ONE requirement each;
//            never merge two asks into one line.
//   hints  array of strings shown in the right column (packages, widget names,
//            API calls). Labs must not make students guess the intended widget.
//   done   array of strings: the acceptance criteria ("you are done when...")
function taskSlide(deck, { n, title, intro, steps = [], hints = [], done = [] }) {
  const s = deck.content(n, title);
  const hasSide = hints.length > 0 || done.length > 0;
  const bodyW = hasSide ? 7.3 : 11.53;
  let y = 1.95;
  if (intro) {
    s.addText(intro, { x: 0.9, y, w: bodyW, h: 0.5, fontFace: F, fontSize: 14, color: C.GRAY, margin: 0 });
    y += 0.62;
  }
  // Numbered steps as ONE text block: PowerPoint handles wrapping, so paragraph
  // spacing stays uniform no matter how long a step runs. (Measuring text width
  // ourselves and guessing line counts produced visibly uneven gaps.)
  if (steps.length) {
    s.addText(steps.map((t, i) => ({
      text: t,
      options: { bullet: { type: "number", startAt: i + 1 }, breakLine: i < steps.length - 1 },
    })), {
      x: 0.9, y, w: bodyW, h: 6.7 - y, fontFace: F, fontSize: 13.5, color: C.INK,
      margin: 0, valign: "top", paraSpaceAfter: 11, indentLevel: 0,
    });
  }
  if (hints.length) {
    s.addText("Hints", { x: 8.6, y: 1.95, w: 3.85, h: 0.32, fontFace: F, fontSize: 11, bold: true, color: C.GRAY, charSpacing: 1.5, margin: 0 });
    s.addText(hints.map((t, i) => ({ text: t, options: { breakLine: i < hints.length - 1 } })), {
      x: 8.6, y: 2.35, w: 3.85, h: 2.4, fontFace: F, fontSize: 12, color: C.INK, margin: 0, paraSpaceAfter: 9, valign: "top",
    });
  }
  if (done.length) {
    const dy = hints.length ? 4.95 : 1.95;
    s.addText("Done when", { x: 8.6, y: dy, w: 3.85, h: 0.32, fontFace: F, fontSize: 11, bold: true, color: C.BLUE, charSpacing: 1.5, margin: 0 });
    s.addText(done.map((t, i) => ({ text: t, options: { breakLine: i < done.length - 1 } })), {
      x: 8.6, y: dy + 0.4, w: 3.85, h: 1.6, fontFace: F, fontSize: 12, color: C.INK, margin: 0, paraSpaceAfter: 9, valign: "top",
    });
  }
  return s;
}

// The submission slide, IDENTICAL in every lab. The course review found the
// evidence format drifting (nothing → screenshots → screenshots-in-Word); this
// fixes it to one channel: the GitHub repo.
function submissionSlide(deck, { labNumber, extra = [] } = {}) {
  const s = deck.content("Submission", "How to hand this in");
  lines(s, [
    { text: "Everything goes to your GitHub repository. No Word documents, no email, no Teams upload.", options: { bold: true } },
    `Commit your work to a branch named lab${labNumber || deck.lab}, open a pull request, and merge it once it works.`,
    "Screenshots asked for in a task go in a /screenshots folder in the same repository.",
    "Your commit history is part of the assessment. Commit as you go, not once at the end.",
  ], { x: 0.9, y: 1.95, w: 7.3, h: 3.2, fontSize: 14 });
  if (extra.length) {
    lines(s, extra, { x: 0.9, y: 5.0, w: 7.3, h: 1.3, fontSize: 13, color: C.GRAY });
  }
  panel(s, 8.6, 1.95, 3.85, 2.5);
  s.addText("Checklist", { x: 8.9, y: 2.2, w: 3.25, h: 0.32, fontFace: F, fontSize: 11, bold: true, color: C.GRAY, charSpacing: 1.5, margin: 0 });
  s.addText([
    { text: "code committed and pushed", options: { breakLine: true } },
    { text: "screenshots where asked", options: { breakLine: true } },
    { text: "app builds and runs", options: { breakLine: true } },
    { text: "pull request merged", options: {} },
  ], { x: 8.9, y: 2.6, w: 3.25, h: 1.7, fontFace: F, fontSize: 12, color: C.INK, margin: 0, paraSpaceAfter: 8, valign: "top" });
  return s;
}

module.exports = {
  Deck, Lab, taskSlide, submissionSlide, C, F, MONO, icon, asset,
  panel, hairbox, blackbox, hline, arrow,
  lines, iconGrid, codeBlock, prosCons, takeaway, flowDown, table, statRow,
  bioSlide, objectivesSlide,
};
