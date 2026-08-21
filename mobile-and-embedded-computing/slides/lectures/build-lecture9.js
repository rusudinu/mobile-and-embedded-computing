// ============================================================================
// Mobile & Embedded Computing, Lecture 9
// "AI in Flutter": on-device ML and connecting to LLMs.
// Built on the shared template (template.js). Do not restyle.
// Source deck was 12 slides; this is a rebuild, not a port.
// ============================================================================
const path = require("path");
const T = require("../assets/template");
const { Deck, C, F, MONO } = T;

const d = new Deck({
  lecture: 9,
  title: "AI in Flutter",
  subtitle: "on-device ML and connecting to LLMs",
});

// ---------------------------------------------------------------- 1 TITLE ---
d.titleSlide();

// ------------------------------------------------------------------ 2 BIO ---
T.bioSlide(d);

// ----------------------------------------------------------- 3 OBJECTIVES ---
T.objectivesSlide(d, [
  ["scale", "On-device or cloud", "The variables that decide it: latency, privacy, offline, cost per call, capability ceiling"],
  ["microchip", "ML Kit and LiteRT", "Real Dart for text and barcodes, plus your own quantized model through tflite_flutter"],
  ["key", "Where the API key lives", "Why a key inside an app binary is public, and the two architectures that fix it"],
  ["waves", "LLMs in a real UI", "Streaming, timeouts, token cost, and validating output you cannot trust"],
]);

// ================================================================ SECTION 1 ==
d.divider(
  "Part 1 · The decision",
  "On the device, or on someone else's GPU",
  "Five variables: latency, privacy, offline, cost, capability ceiling"
);

// ------------------------------------------------------- 5 THE THREE SHAPES --
{
  const s = d.content("The decision", "Three different things called “AI in the app”");
  T.iconGrid(s, [
    ["scantext", "Classic on-device ML",
      "A fixed-purpose model runs locally: read text, find a barcode, locate a face. Milliseconds, offline, nothing leaves the phone."],
    ["sparkles", "On-device generative",
      "A small language model on the phone's NPU: summarize, proofread, rewrite. Gated on hardware, so never guaranteed."],
    ["cloud", "A cloud LLM",
      "A large model on someone else's machines. Highest capability, network-bound, and billed per token. It is also where this lecture's security problems come from."],
  ], { y: 2.15, cw: 3.48, gx: 0.55 });
  T.lines(s, [
    "They are not three sizes of the same thing. They differ in where the compute happens, who pays for it, what happens with no network, and what an attacker can reach.",
    { text: "Picking one is an architecture decision. It is not a library choice, and it is very expensive to reverse late.", options: { bold: true } },
  ], { x: 0.9, y: 4.55, w: 11.53, h: 1.5, fontSize: 13.5, paraSpaceAfter: 12 });
  T.takeaway(s, "Most shipping apps use two of the three.",
    "The boundary between them is where most of the design work sits.", 5.9);
  s.addNotes("Worth naming out loud: the old version of this deck opened with a market-size projection. Market size tells you nothing about which of these three to build, so it is gone. The deck now opens on the question that changes your code.");
}

// -------------------------------------------------------- 6 THE COMPARISON ---
{
  const s = d.content("The decision", "On-device vs cloud, variable by variable");
  T.table(s, ["On-device", "Cloud"], [
    ["Latency", "1–50 ms, no network involved", "300 ms – several seconds, plus the round trip"],
    ["No connection", "works, because offline is a normal state", "the feature does not exist"],
    ["Where the data goes", "nowhere; it never leaves the device", "to a third party: a residency and GDPR question"],
    ["Marginal cost per call", "zero, forever", "per token, forever"],
    ["Capability ceiling", "whatever fits in RAM", "the largest model in production"],
    ["Battery", "your CPU / GPU / NPU burns it", "the radio burns it, and radios are expensive"],
    ["Updating the model", "an app update, or a download you own", "instant, server-side, no client involved"],
  ], { y: 1.9, labelW: 2.6, rowH: 0.48, fontSize: 10.5, focusCols: [0] });
  T.takeaway(s, "On-device first, cloud when it cannot cope.",
    "Privacy, offline and cost all point one way; only capability points the other.", 6.0);
}

// ---------------------------------------------- 7 CALLBACK TO LECTURE ONE ----
{
  const s = d.content("The decision", "Callback to Lecture 1: will the model fit?");
  T.statRow(s, [
    ["28 GB", "7B at float32", "one 4-byte float per parameter"],
    ["14 GB", "7B at float16", "half precision, the usual baseline"],
    ["3.5 GB", "7B at int4", "aggressive, with a real quality cost"],
    ["~1 GB", "2B at int4", "the class that ships inside a phone"],
  ], { y: 2.1, bigSize: 40 });
  T.hline(s, 0.9, 4.6, 11.53);
  T.lines(s, [
    "Weights come first: parameters × bytes-per-parameter is memory you must find before a single token is produced. The KV cache then grows on top of that, with every token of context you keep.",
    "A 2026 flagship has 8–16 GB of RAM in total, shared with the OS and every other app the user expects to still be running. Android will kill your process long before you can claim half of it.",
    { text: "This is Lecture 1's VRAM → RAM → fail flowchart with real numbers in it. On-device generative AI is a resource-allocation problem, exactly as promised.", options: { bold: true } },
  ], { x: 0.9, y: 4.85, w: 11.53, h: 1.9, fontSize: 12.5, paraSpaceAfter: 10 });
  s.addNotes("Do the arithmetic on the board: 7e9 parameters × 4 bytes = 28 GB. Then ask what a phone has. The point is not that on-device LLMs are impossible. The point is that the size class is 1–4B, quantized and specialized, and that a laptop and a phone are not the same device.");
}

// -------------------------------------------------------------- 8 HYBRID ----
{
  const s = d.content("The decision", "The pattern that ships: hybrid");
  T.flowDown(s, [
    ["Input arrives", "a camera frame, a document, a question", "black"],
    ["On-device model runs first", "free, offline, private, milliseconds", "hair"],
    ["Good enough?", "a confidence or capability threshold you measure", "panel"],
    ["Escalate to the cloud", "only for what the small model cannot do", "hair"],
  ], { x: 0.9, y: 2.0, w: 6.4, h: 0.92, gap: 0.3 });
  T.lines(s, [
    { text: "Scan locally, look up remotely.", options: { bold: true } },
    "ML Kit reads the barcode on the device; only the resulting 13 digits go to your API. The image never leaves.",
    { text: "Detect locally, understand remotely.", options: { bold: true } },
    "A face or object detector finds the region; you upload a small crop instead of a 12-megapixel frame.",
    { text: "Draft locally, refine remotely.", options: { bold: true } },
    "The on-device model writes the first version instantly; the cloud model is only called when the user asks for better.",
    { text: "Cache, then do not call at all.", options: { bold: true } },
    "The same barcode, the same photo, the same question. A local cache turns the second occurrence into zero latency and zero cost.",
  ], { x: 7.9, y: 2.0, w: 4.53, h: 3.5, fontSize: 12, paraSpaceAfter: 7 });
  T.hline(s, 7.9, 5.5, 4.53);
  s.addText([
    { text: "Know your escalation rate.", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "The share of requests that reach the cloud is your bill, your p95 latency and your privacy exposure, in one number. A hybrid system whose escalation rate you cannot quote is a cloud system with a cache.", options: { color: C.GRAY } },
  ], { x: 7.9, y: 5.72, w: 4.53, h: 1.2, fontFace: F, fontSize: 11.5, margin: 0, valign: "top" });
}

// ================================================================ SECTION 2 ==
d.divider(
  "Part 2 · On the device",
  "ML Kit, LiteRT, and making a model fit",
  "The problems Google already solved, and then your own"
);

// -------------------------------------------------------------- 10 ML KIT ---
{
  const s = d.content("On-device ML", "Google ML Kit: the solved problems");
  T.iconGrid(s, [
    ["scantext", "Text recognition",
      "google_mlkit_text_recognition: Latin, Chinese, Devanagari, Japanese and Korean script packs. Blocks → lines → elements, each with a box."],
    ["scan", "Barcode scanning",
      "google_mlkit_barcode_scanning: every common 1D and 2D symbology, plus the parsed payload for URLs, Wi-Fi and contacts."],
    ["user", "Face detection",
      "google_mlkit_face_detection: bounding boxes, landmarks, contours, smile and eye-open probabilities. Detection, never recognition."],
    ["languages", "Language ID & translation",
      "google_mlkit_language_id and google_mlkit_translation: per-language-pair models the device downloads once and keeps."],
    ["image", "Labeling & object detection",
      "google_mlkit_image_labeling and google_mlkit_object_detection: coarse classification, and tracking across frames."],
    ["package", "How you add it",
      "One plugin per feature. The google_ml_kit umbrella drags every model into your binary. Android and iOS only. There is no web support."],
  ], { y: 2.05, cw: 3.48, gx: 0.55, rowH: 2.5 });
  s.addNotes("These plugins are community-maintained Dart wrappers over the native ML Kit SDKs; they call across a platform channel per invocation (channel mechanics → Lecture 12). That is fine for a photo, and it is why the barcode slide is about back-pressure rather than throughput.");
}

// ------------------------------------------------ 11 TEXT RECOGNITION CODE ---
{
  const s = d.content("On-device ML", "Reading text from an image, end to end");
  T.codeBlock(s, [
    "// pubspec.yaml:  google_mlkit_text_recognition: ^0.15.0",
    "import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';",
    "",
    "class ReceiptScanner {",
    "  // One recognizer, reused. One per frame leaks native memory.",
    "  final _recognizer = TextRecognizer(script: TextRecognitionScript.latin);",
    "",
    "  Future<String> read(String filePath) async {",
    "    final input = InputImage.fromFilePath(filePath);",
    "    final RecognizedText result = await _recognizer.processImage(input);",
    "    for (final block in result.blocks) {",
    "      for (final line in block.lines) {",
    "        debugPrint('${line.text}  @ ${line.boundingBox}');",
    "      }",
    "    }",
    "    return result.text;",
    "  }",
    "",
    "  void dispose() => _recognizer.close();  // free the native detector",
    "}",
  ], { x: 0.9, y: 1.9, w: 7.5, h: 4.95, fontSize: 8.5 });
  T.lines(s, [
    "processImage is async and does its work off the Dart thread, so the UI keeps rendering while it runs.",
    "The result is a tree: blocks of lines of elements, every node carrying a bounding box you can draw over a preview.",
    "close() is not optional. The detector owns a native model; skipping it is a leak the Dart GC cannot see.",
    "The first call is the slow one: the model is loaded, and for some APIs downloaded, on first use.",
    "No network, no key, no per-call cost.",
  ], { x: 8.7, y: 2.0, w: 3.73, h: 4.6, fontSize: 11.5, paraSpaceAfter: 12 });
}

// -------------------------------------------------------- 12 CAMERA STREAM ---
{
  const s = d.content("On-device ML", "Barcodes from a live camera stream");
  T.codeBlock(s, [
    "final _scanner = BarcodeScanner(",
    "    formats: [BarcodeFormat.ean13, BarcodeFormat.qrCode]);",
    "bool _busy = false;",
    "",
    "Future<void> _onFrame(CameraImage frame) async {",
    "  if (_busy) return;      // drop frames, never queue them",
    "  _busy = true;",
    "  try {",
    "    final input = _toInputImage(frame);   // bytes + rotation",
    "    final codes = await _scanner.processImage(input);",
    "    if (codes.isNotEmpty) _onCode(codes.first.rawValue);",
    "  } finally {",
    "    _busy = false;",
    "  }",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 4.05, fontSize: 9 });
  T.lines(s, [
    "A camera hands you 30 frames a second. Inference does not always finish in 33 ms, so a queue grows without bound and the preview drifts behind reality.",
    "Dropping frames is correct: the next one is nearly identical and arrives in a moment.",
    "InputImage needs the raw planes plus the sensor rotation. Get the rotation wrong and detection silently returns nothing at all, with no error and no result.",
    "Stop the stream and close() the scanner in dispose(), and again when the app backgrounds. A live camera together with continuous inference drains the battery quickly (→ Lecture 11).",
  ], { x: 8.3, y: 2.0, w: 4.13, h: 4.4, fontSize: 11.5, paraSpaceAfter: 12 });
  T.takeaway(s, "Real-time on-device ML is a back-pressure problem.",
    "The model is fast enough; the frame pipeline around it is what breaks.", 6.15);
}

// ------------------------------------------------------ 13 ON-DEVICE GENAI ---
{
  const s = d.content("On-device ML", "On-device generative AI is a capability, not a device");
  T.lines(s, [
    "The step past classification: a small language model running on the phone's own accelerator: summarize a thread, proofread a message, rewrite a paragraph, describe a photo.",
    "Google exposes this through the ML Kit GenAI APIs backed by Gemini Nano; Apple exposes an equivalent on-device model to apps on supported hardware. Both are the same shape from your side.",
    "It is gated on the hardware and the OS, not on your app: enough accelerator, enough RAM, and the model itself present. The OS downloads that model and shares it between apps rather than shipping it in your binary.",
  ], { x: 0.9, y: 1.95, w: 6.9, h: 3.3, fontSize: 13, paraSpaceAfter: 13 });
  T.flowDown(s, [
    ["available", "run it locally", "black"],
    ["downloadable", "ask, show progress, or defer the feature", "hair"],
    ["unsupported", "fall back to cloud, or hide the feature", "panel"],
  ], { x: 8.4, y: 2.2, w: 4.03, h: 0.95, gap: 0.32 });
  s.addText("Ask the SDK: three answers.", {
    x: 8.4, y: 1.85, w: 4.03, h: 0.3, fontFace: F, fontSize: 12.5, bold: true, color: C.INK, margin: 0,
  });
  T.takeaway(s, "Feature-detect, never device-detect.",
    "A hard-coded list of phone models goes out of date with every hardware release. Availability is a runtime question, and the fallback path is part of the feature.", 5.55, { w: 6.9 });
  s.addNotes("The old deck pinned this slide to “a limited set of high-end devices as of mid-2024” and named two phone models. That sentence was already out of date when the deck was delivered. The durable version is the rule on this slide: query availability at runtime and always have a fallback.");
}

// ---------------------------------------------------------- 14 LITERT/TFLITE --
{
  const s = d.content("Custom models", "Your own model: TensorFlow Lite, now LiteRT");
  T.lines(s, [
    "ML Kit covers the problems Google already solved. When the task is yours, such as grading a weld, classifying a leaf, or scoring a window of accelerometer data, you bring your own model.",
    "LiteRT, the runtime published for years as TensorFlow Lite, executes a .tflite flatbuffer on the device. The file is the graph plus the weights: no training code, no ability to learn, fixed input and output shapes.",
    "In Flutter, tflite_flutter binds the LiteRT C API through dart:ffi, which is a direct call into native code rather than a platform-channel message per inference (→ Lecture 12).",
    "Delegates hand layers to the accelerator: GPU, NNAPI on Android, Core ML on iOS. Every delegate is allowed to refuse, and CPU is always the fallback, so you measure on the cheapest phone you support, not the newest.",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 4.3, fontSize: 12.5, paraSpaceAfter: 12 });
  T.flowDown(s, [
    ["Train", "TensorFlow or PyTorch, on a real GPU", "hair"],
    ["Convert", "→ model.tflite", "hair"],
    ["Quantize", "float32 → int8, about 4x smaller", "panel"],
    ["Ship & run", "asset or download, then Interpreter", "black"],
  ], { x: 8.5, y: 2.0, w: 3.93, h: 0.9, gap: 0.28 });
  s.addText("None of the first three steps happen in Dart.", {
    x: 8.5, y: 6.62, w: 3.93, h: 0.3, fontFace: F, fontSize: 11, color: C.GRAY, align: "center", margin: 0,
  });
}

// ------------------------------------------------------------ 15 TFLITE CODE --
{
  const s = d.content("Custom models", "tflite_flutter: load, run, get off the UI isolate");
  T.codeBlock(s, [
    "// tflite_flutter: ^0.11.0. The .tflite ships as a Flutter asset",
    "import 'package:tflite_flutter/tflite_flutter.dart';",
    "",
    "late final Interpreter _interp;",
    "late final IsolateInterpreter _iso;",
    "",
    "Future<void> load() async {",
    "  final o = InterpreterOptions()..threads = 2;",
    "  try { o.addDelegate(GpuDelegateV2()); } catch (_) {}   // CPU is fine",
    "  _interp = await Interpreter.fromAsset(",
    "      'assets/models/leaf_int8.tflite', options: o);",
    "  _iso = await IsolateInterpreter.create(address: _interp.address);",
    "}",
    "",
    "Future<List<double>> classify(List input) async {",
    "  final out = List.filled(5, 0.0).reshape([1, 5]);",
    "  await _iso.run([input], out);      // off the UI isolate",
    "  return out[0].cast<double>();",
    "}",
    "void dispose() { _iso.close(); _interp.close(); }",
  ], { x: 0.9, y: 1.9, w: 7.7, h: 4.95, fontSize: 8.5 });
  T.lines(s, [
    "Interpreter.run is synchronous and CPU-bound. On the UI isolate it drops frames, so hand the interpreter's native address to an isolate (→ Lecture 3).",
    "Shapes are baked into the file at conversion time. getInputTensors() tells you what the model wants; guessing produces a crash or silent nonsense.",
    "An int8 model expects int8 input, with the scale and zero-point traveling alongside the tensor.",
    "close() both. Native memory again, invisible to the Dart GC.",
  ], { x: 8.9, y: 2.0, w: 3.53, h: 4.6, fontSize: 11, paraSpaceAfter: 12 });
}

// ------------------------------------------------------- 16 QUANTIZATION -----
{
  const s = d.content("Custom models", "Quantization, and how the model reaches the phone");
  T.table(s, ["float32", "float16", "int8"], [
    ["Size", "1x, the baseline", "0.5x", "0.25x"],
    ["Accuracy", "reference", "loss is usually negligible", "small and task-dependent, so measure it"],
    ["CPU speed", "baseline", "about baseline", "2–4x faster on integer units"],
  ], { y: 1.95, labelW: 1.6, rowH: 0.55, fontSize: 11, focusCols: [2] });
  T.lines(s, [
    { text: "Bundled as an asset.", options: { bold: true } },
    "In the store binary, available on first launch, and re-downloaded by every user every time you change it. Install size is a conversion metric, so a 90 MB model is a product decision, not a detail.",
    { text: "Downloaded on first run.", options: { bold: true } },
    "A smaller install, but now you own a download, a cache, a version check, a retry, and a first-launch state where the feature does not work yet. Firebase ML custom model hosting does this for you, with rollout and rollback.",
  ], { x: 0.9, y: 4.3, w: 11.53, h: 1.6, fontSize: 11.5, paraSpaceAfter: 7 });
  T.takeaway(s, "Accelerator paths are int8-first.",
    "Quantization is often the difference between running on the NPU and running on the CPU.", 5.95);
}

// ================================================================ SECTION 3 ==
d.divider(
  "Part 3 · Cloud LLMs",
  "Calling a model you do not host",
  "Where the key lives determines the architecture; everything else is UI"
);

// ---------------------------------------------------------------- 18 TRAP ----
{
  const s = d.content("Cloud LLMs", "The prototyping trap: a key inside the app");
  s.addText("Do not ship this", {
    x: 0.9, y: 1.6, w: 7.1, h: 0.3, fontFace: F, fontSize: 12, bold: true, color: C.RED, charSpacing: 1.5, margin: 0,
  });
  T.codeBlock(s, [
    "// google_generative_ai is deprecated, and the wrong shape anyway.",
    "import 'package:google_generative_ai/google_generative_ai.dart';",
    "",
    "const apiKey = 'AIzaSyD-9tSrke72_EXAMPLE_KEY_xxxxxxxxxx';",
    "",
    "final model = GenerativeModel(",
    "  model: 'gemini-2.5-flash',",
    "  apiKey: apiKey,        // <- compiled into the APK / IPA",
    ");",
    "",
    "final res = await model.generateContent([Content.text(prompt)]);",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 3.15, fontSize: 9.5 });
  s.addText("Three separate things are wrong", {
    x: 8.3, y: 1.6, w: 4.13, h: 0.3, fontFace: F, fontSize: 12, bold: true, color: C.INK, charSpacing: 1.5, margin: 0,
  });
  T.lines(s, [
    { text: "The package.", options: { bold: true } },
    "google_generative_ai is deprecated; firebase_ai replaces it, and firebase_ai is also the fix for the other two problems.",
    { text: "The key.", options: { bold: true } },
    "Anything compiled into your app ships to every person who installs it. --dart-define, a .env file, base64, string obfuscation: all the same outcome.",
    { text: "The architecture.", options: { bold: true } },
    "The client is talking straight to a metered API, so nothing but the client limits who can spend against your account.",
  ], { x: 8.3, y: 1.95, w: 4.13, h: 4.5, fontSize: 11, paraSpaceAfter: 7 });
  T.takeaway(s, "This is fine for one afternoon on an emulator.",
    "It stops being fine once the build leaves your machine.", 5.35, { w: 7.1 });
  s.addNotes("The old deck named the package 'generative_ai', which does not exist; the real one was google_generative_ai, and it is now deprecated in favor of firebase_ai. Say that the deprecation strengthens the argument rather than weakening it: the replacement is the one with attestation built in.");
}

// -------------------------------------------------------- 19 KEY EXTRACTION --
{
  const s = d.content("Cloud LLMs", "A key in a binary is a published key");
  T.codeBlock(s, [
    "# Anyone can run this against any app, on their own phone.",
    "$ adb shell pm path com.example.app",
    "package:/data/app/~~a1b2.../base.apk",
    "",
    "$ adb pull /data/app/~~a1b2.../base.apk .",
    "$ unzip -o base.apk -d out/",
    "",
    "$ strings out/lib/arm64-v8a/libapp.so \\",
    "      | grep -E 'AIza[0-9A-Za-z_-]{35}'",
    "AIzaSyD-9tSrke72_EXAMPLE_KEY_xxxxxxxxxx",
    "",
    "# Elapsed: about a minute.",
    "# iOS is the same exercise on the .ipa payload.",
  ], { x: 0.9, y: 1.95, w: 6.6, h: 3.9, fontSize: 9.5 });
  T.lines(s, [
    "Release Dart is AOT-compiled into libapp.so, but string constants survive compilation. They have to: the program reads them at runtime.",
    "Obfuscation renames symbols. It does not remove the bytes your HTTP client eventually puts on the wire, and a proxy on the attacker's own device reads the request regardless.",
    "The bill is yours. A provider key is billed to the account that issued it, so a leaked key is someone else's inference at your expense until you happen to look.",
    "Rotating the key ships a new app version and leaves every old install broken.",
  ], { x: 7.9, y: 2.0, w: 4.53, h: 4.0, fontSize: 11.5, paraSpaceAfter: 12 });
  T.takeaway(s, "There is no secret you can ship inside a client.",
    "The same rule as Lecture 5, this time with a billing consequence.", 6.05);
  s.addNotes("Do this live if you have a device to hand: it takes about a minute on an app you built yourself. The demo convinces students in a way the sentence does not. If there is no device, at least run strings over a release build of the lab app.");
}

// ------------------------------------------------------- 20 TWO CORRECT SHAPES
{
  const s = d.content("Cloud LLMs", "Two correct shapes, and what each one costs");
  s.addText("A: your backend proxies the call", {
    x: 0.9, y: 1.9, w: 5.6, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0,
  });
  T.flowDown(s, [
    ["Flutter app", "sends the user's ID token, no key", "black"],
    ["Your backend", "verifies the token, holds the provider key", "hair"],
    ["Model provider", "billed to you, called only by you", "panel"],
  ], { x: 0.9, y: 2.4, w: 5.6, h: 0.82, gap: 0.26 });
  s.addText("Any provider, your own rate limits, your own logging and prompt control, plus a service you have to operate (→ Lecture 5).", {
    x: 0.9, y: 5.6, w: 5.6, h: 0.75, fontFace: F, fontSize: 11.5, color: C.GRAY, margin: 0, valign: "top",
  });

  s.addText("B: Firebase AI Logic + App Check", {
    x: 6.83, y: 1.9, w: 5.6, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0,
  });
  T.flowDown(s, [
    ["Flutter app", "firebase_ai, with no key to pass", "black"],
    ["Firebase AI Logic", "App Check attests the caller (→ Lecture 7)", "hair"],
    ["Gemini", "billed to your Firebase project", "panel"],
  ], { x: 6.83, y: 2.4, w: 5.6, h: 0.82, gap: 0.26 });
  s.addText("Working this afternoon, with attestation built in, but Google models only, and only if you press Enforce in App Check.", {
    x: 6.83, y: 5.6, w: 5.6, h: 0.75, fontFace: F, fontSize: 11.5, color: C.GRAY, margin: 0, valign: "top",
  });

  T.takeaway(s, "Both put the credential somewhere the user cannot reach.",
    "That is what separates them from the key-in-the-app version.", 6.35);
}

// ------------------------------------------------------------ 21 FIREBASE AI --
{
  const s = d.content("Cloud LLMs", "firebase_ai: the call with no key in it");
  T.codeBlock(s, [
    "// pubspec.yaml:  firebase_core, firebase_ai, firebase_app_check",
    "await Firebase.initializeApp(",
    "    options: DefaultFirebaseOptions.currentPlatform);",
    "",
    "// App Check first: it attests this is a genuine build of YOUR app.",
    "await FirebaseAppCheck.instance.activate(",
    "  androidProvider: AndroidProvider.playIntegrity,",
    "  appleProvider: AppleProvider.appAttest,",
    ");",
    "",
    "final model = FirebaseAI.googleAI().generativeModel(",
    "  model: 'gemini-2.5-flash',",
    "  systemInstruction: Content.system(",
    "      'Answer only from the catalog you are given.'),",
    "  generationConfig: GenerationConfig(",
    "      temperature: 0.2, maxOutputTokens: 512),",
    ");",
    "",
    "final res = await model.generateContent([Content.text(question)]);",
  ], { x: 0.9, y: 1.95, w: 7.5, h: 4.85, fontSize: 9 });
  T.lines(s, [
    "There is no apiKey parameter to pass. The credential is the project configuration, and the request is only served when it carries a valid App Check token (→ Lecture 7).",
    "activate() only measures. Enforcement is a separate switch in the console, per product. That is the step that keeps scripts out.",
    "maxOutputTokens is a cost control, not a style preference. It is the only hard cap you get.",
    "temperature low, systemInstruction narrow: the cheapest steering available, and it runs before any of your validation does.",
  ], { x: 8.7, y: 2.0, w: 3.73, h: 4.6, fontSize: 11, paraSpaceAfter: 12 });
}

// -------------------------------------------------------------- 22 STREAMING --
{
  const s = d.content("Cloud LLMs", "Stream the answer, do not freeze the screen");
  T.codeBlock(s, [
    "Stream<String> ask(String prompt) async* {",
    "  final buf = StringBuffer();",
    "  final s = _model.generateContentStream([Content.text(prompt)]);",
    "  await for (final chunk in s) {",
    "    buf.write(chunk.text ?? '');",
    "    yield buf.toString();   // the UI rebuilds per chunk",
    "  }",
    "}",
    "",
    "StreamBuilder<String>(",
    "  stream: _answer,",
    "  builder: (context, snap) => switch (snap.connectionState) {",
    "    ConnectionState.waiting => const ThinkingLine(),",
    "    _ => SelectableText(snap.data ?? ''),",
    "  },",
    ")",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 4.25, fontSize: 9 });
  T.lines(s, [
    "Time to first token is the latency users feel, not total time. Streaming turns a six-second wait into a 600 ms one without making anything faster.",
    "Show three distinct states: sent, thinking, writing. A spinner that never changes is indistinguishable from a hang.",
    "Give the user a cancel. Hold the StreamSubscription and cancel it on dispose, on navigation, and whenever a new question starts.",
    "Nothing here can jank the UI unless you do work inside the builder. Keep the builder to layout.",
  ], { x: 8.3, y: 2.0, w: 4.13, h: 4.4, fontSize: 11.5, paraSpaceAfter: 12 });
  T.takeaway(s, "A frozen screen is a bug, not a wait.",
    "A canceled request has still paid for the radio wake-up (→ Lecture 11).", 6.35);
}

// ================================================================ SECTION 4 ==
d.divider(
  "Part 4 · Engineering reality",
  "Cost, failure, and answers that are wrong",
  "The three areas to get right before you ship"
);

// -------------------------------------------------------------- 24 TOKENS ----
{
  const s = d.content("Engineering reality", "Tokens: the unit you are billed in");
  T.statRow(s, [
    ["~4", "characters per token", "for English prose; code and non-Latin scripts are worse"],
    ["in + out", "both are billed", "and the whole prompt is re-sent on every single turn"],
    ["quadratic", "cost of a naive chat", "resend the full history and n turns cost about n²/2 messages"],
  ], { y: 2.15, bigSize: 40 });
  T.hline(s, 0.9, 4.6, 11.53);
  T.lines(s, [
    "Cap the output with maxOutputTokens, and cap the input by summarizing or truncating the history instead of resending all of it.",
    "Route by difficulty: a small, cheap model answers most questions, and only its failures reach the expensive one. That is the hybrid slide again, one layer up.",
    "Identical prompts produce identical bills, so cache them, and cache the retrieval that built them.",
    { text: "Per-user quotas live on your backend. An app cannot enforce a quota against a user who controls the app (→ Lecture 5).", options: { bold: true } },
  ], { x: 0.9, y: 4.85, w: 11.53, h: 1.9, fontSize: 12, paraSpaceAfter: 8 });
}

// ------------------------------------------------------ 25 TIMEOUTS/RETRIES ---
{
  const s = d.content("Engineering reality", "The failures you will actually see");
  T.table(s, ["What it means", "What to do about it"], [
    ["429", "Rate limited, or over quota", "Back off exponentially with jitter; cap the attempts"],
    ["503 / 500", "The provider is failing", "Retry, but every retry is billed again"],
    ["400", "Your request is wrong", "Never retry. Fix the prompt, the schema or the size"],
    ["Timeout", "No answer inside your budget", "Cancel, say so, offer a retry. Do not hang silently"],
    ["Safety block", "The model declined to answer", "A normal outcome, not an exception. Handle it as a state"],
  ], { y: 1.95, labelW: 1.5, rowH: 0.55, fontSize: 11 });
  T.lines(s, [
    "Set a budget for the feature, not for the attempt: three tries of ten seconds each is a thirty-second stare at a spinner, which no user waits out.",
    "Streaming changes the shape of a timeout: you can time out on time-to-first-token and let a long answer keep flowing.",
  ], { x: 0.9, y: 5.4, w: 11.53, h: 1.0, fontSize: 12, paraSpaceAfter: 8 });
  T.takeaway(s, "Retries multiply load and cost, so they need a cap.",
    "Reuse the backoff-with-jitter machinery from Lecture 5.", 6.15);
}

// ------------------------------------------------------------ 26 WRONG ANSWERS
{
  const s = d.content("Engineering reality", "Models produce plausible wrong answers");
  T.lines(s, [
    { text: "It is not a bug you can prompt away.", options: { bold: true } },
    "A language model returns a likely continuation, not a true one. It will invent a product code, a price, a citation or an API method in exactly the same confident register as a correct answer.",
    { text: "Constrain the output space.", options: { bold: true } },
    "A value the model must choose from a fixed set cannot be hallucinated into something new. JSON mode plus a schema turns free text into a parseable contract.",
    { text: "Then validate it anyway.", options: { bold: true } },
    "Parse it, range-check it, and look every id up in your own data before you believe any of it.",
    { text: "Show where the answer came from.", options: { bold: true } },
    "If it came from your data, show the row. An answer the user can check is worth far more than one they have to trust.",
  ], { x: 0.9, y: 1.95, w: 5.9, h: 3.5, fontSize: 12, paraSpaceAfter: 7 });
  T.codeBlock(s, [
    "generationConfig: GenerationConfig(",
    "  responseMimeType: 'application/json',",
    "  responseSchema: Schema.object(properties: {",
    "    'category': Schema.enumString(",
    "        enumValues: ['food', 'travel', 'other']),",
    "    'amountCents': Schema.integer(),",
    "  }),",
    "),",
    "",
    "// A schema is a constraint, not a guarantee.",
    "final data = jsonDecode(res.text!);",
    "if (!_allowed.contains(data['category'])) {",
    "  return _askAHuman();",
    "}",
  ], { x: 7.1, y: 1.95, w: 5.33, h: 3.65, fontSize: 9 });
  s.addText([
    { text: "Never wire model output straight to consequence.", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "Money, a database write, a permission change, a message to another person, a device actuator: a rule or a human belongs in between.", options: { color: C.GRAY } },
  ], { x: 7.1, y: 5.8, w: 5.33, h: 0.9, fontFace: F, fontSize: 11.5, margin: 0, valign: "top" });
  T.takeaway(s, "Treat model output like user input from the internet.",
    "The same trust boundary as Lecture 5, this time on the way back in.", 5.6, { w: 5.9 });
}

// -------------------------------------------------------------- 27 CLOSING ---
d.closing([
  ["checklist", "Recap", [
    "On-device or cloud is an architecture decision: latency, privacy, offline, cost, ceiling",
    "ML Kit for solved problems, LiteRT for your own model, quantized so it fits",
    "No app ever holds a provider key: your backend holds it, or Firebase AI + App Check does",
    "Stream the answer, cap the tokens, and validate everything the model says",
  ]],
  ["calendar", "This week", [
    "Add ML Kit text or barcode scanning to your project app, and close the detector",
    "Put one cloud call behind firebase_ai with App Check activated",
    "Measure it: time to first token, tokens per call, cost per thousand users",
    "Run strings over your own release build once and look for your key",
  ]],
  ["bookopen", "Read more", [
    "firebase.google.com/docs/ai-logic",
    "developers.google.com/ml-kit",
    "ai.google.dev/edge/litert",
    "pub.dev/packages/tflite_flutter",
    "OWASP MASVS: Platform Interaction & Code Quality",
  ]],
]);

d.write(path.join(__dirname, "Mobile-and-Embedded-Lecture9-v2.pptx"))
  .then((f) => console.log("written:", f));
