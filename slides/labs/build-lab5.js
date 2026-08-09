// ===========================================================================
// Laboratory 5: Serialization & Networking
// Rebuilt on the shared template. Source: srclabs/lab5.md (3 slides).
// Review fixes: title slide names the topic; scaffolding for the difficulty
// jump (pubspec block, part directive, build_runner command); submission is
// the GitHub repo, not a Word document; hints + acceptance criteria per task.
// ===========================================================================
const path = require("path");
const T = require("../assets/template");
const { C, F } = T;

const d = new T.Lab({
  lab: 5,
  title: "Serialization & Networking",
  subtitle: "json_serializable, Equatable, HTTP and retries",
});

// ------------------------------------------------------------- 1 TITLE -----
d.titleSlide();

// -------------------------------------------------------- 2 OBJECTIVES -----
{
  const s = T.objectivesSlide(d, [
    ["braces", "Generate the boring half", "Let json_serializable write fromJson and toJson so you never hand-parse a map again"],
    ["scale", "Compare by value", "Use Equatable so two instances holding the same data are actually equal"],
    ["clouddownload", "Fetch and map", "Turn a live REST response into a typed List<Post> your UI can render"],
    ["repeat", "Fail well", "Retry with exponential backoff and jitter instead of hammering a server that is down"],
  ], "Laboratory 5", "What you'll build today");
  T.takeaway(s, "This lab puts Lectures 5 and 6 to work.",
    "HTTP and code generation from Lecture 5; REST and the shape of an API from Lecture 6.", 5.5);
}

// ---------------------------------------------------- 3 STARTING POINT -----
{
  const s = d.content("Starting point", "Where this lab's code lives");
  T.lines(s, [
    { text: "This lab does not extend the todo app. Create a new Flutter project inside your course repository.", options: { bold: true } },
    "flutter create lab5_networking, then work on a branch named lab5 in the same repository you have used all semester.",
    "Two files carry the whole lab: lib/models/post.dart for Task I, and lib/api/post_client.dart for Task II. Keep them separate: the model must not know that HTTP exists.",
    "Everything you call today is public and needs no API key, no account and no token. If a step asks you for credentials, you are on the wrong URL.",
  ], { x: 0.9, y: 1.95, w: 7.3, h: 3.5, fontSize: 13.5, paraSpaceAfter: 13 });

  T.panel(s, 8.6, 1.95, 3.85, 2.8);
  s.addText("Files you will create", {
    x: 8.9, y: 2.2, w: 3.3, h: 0.32, fontFace: F, fontSize: 11, bold: true, color: C.GRAY, charSpacing: 1.5, margin: 0,
  });
  s.addText([
    { text: "lib/models/post.dart", options: { breakLine: true } },
    { text: "lib/models/post.g.dart", options: { breakLine: true, color: C.GRAY } },
    { text: "generated, never edit it", options: { breakLine: true, fontSize: 10.5, color: C.GRAY } },
    { text: "lib/api/post_client.dart", options: { breakLine: true } },
    { text: "lib/main.dart", options: {} },
  ], { x: 8.9, y: 2.65, w: 3.3, h: 1.9, fontFace: T.MONO, fontSize: 11.5, color: C.INK, margin: 0, paraSpaceAfter: 8, valign: "top" });

  T.takeaway(s, "The whole lab is two files in your course repository.",
    "The model is pure Dart; only the client touches the network.", 5.6);
}

// -------------------------------------------------------- 4 PUBSPEC --------
{
  const s = d.content("Setup", "The packages this lab needs");
  T.codeBlock(s, [
    "# Let pub write the current versions for you. Run this in the project folder:",
    "flutter pub add json_annotation equatable dio",
    "flutter pub add dev:build_runner dev:json_serializable",
  ], { x: 0.9, y: 1.95, w: 11.53, h: 1.35, fontSize: 11 });
  T.codeBlock(s, [
    "# pubspec.yaml: what they leave behind. The flutter: sdk entry stays as it is.",
    "dependencies:",
    "  json_annotation: ^4.9.0     # the annotations you write",
    "  equatable: ^2.0.5           # value equality",
    "  dio: ^5.7.0                 # or:  http: ^1.2.0",
    "dev_dependencies:",
    "  build_runner: ^2.4.13       # runs the generators, never ships in the app",
    "  json_serializable: ^6.8.0   # the generator that writes post.g.dart",
  ], { x: 0.9, y: 3.5, w: 11.53, h: 2.95, fontSize: 11 });
  s.addNotes("Version numbers here are indicative; flutter pub add writes whatever is current. The point students must take away is which packages are runtime dependencies and which are dev_dependencies.");
}

// ------------------------------------------------------ 5 CODEGEN ----------
{
  const s = d.content("Setup", "The generated half, and how to make it");
  T.codeBlock(s, [
    "// lib/models/post.dart: top of the file",
    "import 'package:json_annotation/json_annotation.dart';",
    "import 'package:equatable/equatable.dart';",
    "",
    "// The generated half. Same base name as this file, .g.dart suffix.",
    "// It does not exist yet, so your editor underlines this line in red",
    "// until you run the generator. That red is expected.",
    "part 'post.g.dart';",
    "",
    "# Generate it. Run again after every change to a model:",
    "dart run build_runner build --delete-conflicting-outputs",
    "",
    "# Or leave this running in a second terminal while you work:",
    "dart run build_runner watch --delete-conflicting-outputs",
  ], { x: 0.9, y: 1.95, w: 11.53, h: 4.4, fontSize: 11 });
  T.takeaway(s, "--delete-conflicting-outputs is not optional.",
    "Without it the second run fails on the files the first one wrote.", 6.45);
}

// --------------------------------------------------------- 6 MODEL --------
{
  const s = d.content("Task I", "A model the generator can see");
  T.codeBlock(s, [
    "// lib/models/post.dart: the half you write by hand",
    "@JsonSerializable()",
    "class Post {",
    "  const Post({required this.id, required this.authorId, required this.title});",
    "",
    "  final int id;",
    "  final String title;",
    "  @JsonKey(name: 'userId')   // when the JSON key and the Dart field differ",
    "  final int authorId;",
    "",
    "  factory Post.fromJson(Map<String, dynamic> json) => _$PostFromJson(json);",
    "  Map<String, dynamic> toJson() => _$PostToJson(this);",
    "}",
  ], { x: 0.9, y: 1.95, w: 11.53, h: 4.15, fontSize: 11 });
  T.takeaway(s, "You write the annotations; the generator writes the parsing.",
    "_$PostFromJson and _$PostToJson live in post.g.dart and appear only after build_runner runs.", 6.2);
}

// ----------------------------------------------------- 7 EQUATABLE --------
{
  const s = d.content("Task I", "Value equality with Equatable");
  T.codeBlock(s, [
    "// By default == in Dart is identity: same data, different object, not equal.",
    "class Post extends Equatable {",
    "  // ...the same fields and constructor as the previous slide...",
    "  @override",
    "  List<Object?> get props => [id, authorId, title];",
    "}",
    "",
    "// In main(), prove it:",
    "final a = Post(id: 1, authorId: 1, title: 'hello');",
    "final b = Post(id: 1, authorId: 1, title: 'hello');",
    "print(a == b);          // false without Equatable, true with it",
    "print({a, b}.length);   // 2 without, 1 with: a Set uses == and hashCode",
  ], { x: 0.9, y: 1.95, w: 11.53, h: 4.0, fontSize: 11 });
  T.takeaway(s, "A field you forget to list in props is a field == will ignore.",
    "That is the bug this package quietly introduces, so keep props complete.", 6.1);
}

// -------------------------------------------------------- 8 TASK I --------
T.taskSlide(d, {
  n: "Task I",
  title: "A model with generated JSON and equality",
  intro: "In lib/models/post.dart. Pick one model, Post or User, and stay with it for the rest of the lab.",
  steps: [
    "Define the model class with at least four fields, all of them final",
    "Annotate the class with @JsonSerializable() and add the matching part directive",
    "Add the fromJson factory and the toJson method that delegate to the generated functions",
    "Run build_runner and confirm post.g.dart appears containing _$PostFromJson and _$PostToJson",
    "Rename one Dart field so it no longer matches its JSON key, and map it back with @JsonKey(name:)",
    "Make the class extend Equatable and list every field in props",
    "In main(), build two instances holding identical data and print the result of a == b",
  ],
  hints: [
    "@JsonSerializable() on the class",
    "part 'post.g.dart';",
    "@JsonKey(name: 'userId')",
    "extends Equatable, override props",
    "dart run build_runner build",
  ],
  done: [
    "post.g.dart is generated and committed",
    "a == b prints true",
    "flutter analyze reports no issues",
  ],
});

// ---------------------------------------------------------- 9 THE API ------
{
  const s = d.content("Task II", "The API you will call");
  T.codeBlock(s, [
    "# JSONPlaceholder: public, free, no key, no account.",
    "GET  https://jsonplaceholder.typicode.com/posts      # 100 posts",
    "GET  https://jsonplaceholder.typicode.com/posts/1    # a single post",
    "GET  https://jsonplaceholder.typicode.com/nope       # 404, your failure case",
    "",
    "# One element of the /posts response:",
    "{",
    "  \"userId\": 1,",
    "  \"id\": 1,",
    "  \"title\": \"sunt aut facere repellat provident\",",
    "  \"body\": \"quia et suscipit suscipit recusandae...\"",
    "}",
  ], { x: 0.9, y: 1.95, w: 11.53, h: 4.15, fontSize: 11 });
  T.takeaway(s, "Read the JSON before you write the model.",
    "The keys in that payload are exactly what @JsonKey has to match.", 6.2);
}

// ------------------------------------------------------- 10 FETCHING -------
{
  const s = d.content("Task II", "Fetching and decoding");
  T.codeBlock(s, [
    "// lib/api/post_client.dart",
    "final _dio = Dio(BaseOptions(",
    "  baseUrl: 'https://jsonplaceholder.typicode.com',",
    "  connectTimeout: const Duration(seconds: 5),",
    "));",
    "",
    "Future<List<Post>> fetchPosts() async {",
    "  final res = await _dio.get('/posts');    // Dio throws on 4xx and 5xx",
    "  final raw = res.data as List<dynamic>;",
    "  return raw.map((j) => Post.fromJson(j as Map<String, dynamic>)).toList();",
    "}",
    "// Using package:http instead? jsonDecode(res.body) first, then the same map().",
  ], { x: 0.9, y: 1.95, w: 11.53, h: 4.0, fontSize: 11 });
  T.takeaway(s, "Decode once, at the edge.",
    "Past this function nothing in your app should ever see a Map<String, dynamic>.", 6.1);
}

// --------------------------------------------------------- 11 RETRY --------
{
  const s = d.content("Task II", "Retry with backoff and jitter");
  T.codeBlock(s, [
    "// import 'dart:math';",
    "Future<T> withRetry<T>(Future<T> Function() op, {int maxAttempts = 5}) async {",
    "  final rng = Random();",
    "  for (var attempt = 0; ; attempt++) {",
    "    try {",
    "      return await op();",
    "    } catch (e) {",
    "      if (attempt >= maxAttempts - 1) rethrow;",
    "      final backoff = 400 * (1 << attempt);   // 400, 800, 1600, 3200 ms",
    "      final delay = backoff ~/ 2 + rng.nextInt(backoff ~/ 2 + 1);  // jitter",
    "      debugPrint('attempt $attempt failed: $e, waiting ${delay}ms');",
    "      await Future.delayed(Duration(milliseconds: delay));",
    "    }",
    "  }",
    "}",
  ], { x: 0.9, y: 1.95, w: 11.53, h: 4.4, fontSize: 10.5 });
  T.takeaway(s, "Backoff spreads the retries out; jitter stops every client retrying in step.",
    "", 6.45);
  s.addNotes("Worth saying aloud: in production you retry what can succeed later: timeouts, 5xx, connection resets. A 404 will still be a 404 on attempt five. Today you retry it anyway, purely to watch the delays grow in the log.");
}

// -------------------------------------------------------- 12 TASK II -------
T.taskSlide(d, {
  n: "Task II",
  title: "Fetch, map and survive a failing endpoint",
  intro: "In lib/api/post_client.dart, plus a screen in lib/main.dart that shows the result.",
  steps: [
    "Fetch https://jsonplaceholder.typicode.com/posts with dio or package:http",
    "Map the response onto a List<Post> using the fromJson generated in Task I",
    "Render those posts in a ListView so a successful fetch is visible in the running app",
    "Wrap the call in a retry helper that gives up after a fixed number of attempts",
    "Make the delay grow exponentially between attempts, starting from a few hundred milliseconds",
    "Add random jitter to each delay so two clients retrying never line up",
    "Point the client at an invalid endpoint and log every attempt together with its delay",
  ],
  hints: [
    "Dio.get / http.get",
    "Future.delayed(Duration(...))",
    "Random().nextInt(...) from dart:math",
    "1 << attempt doubles the delay",
    "debugPrint, not print",
  ],
  done: [
    "Posts from the live API render on screen",
    "The log shows five attempts with growing, non-identical delays",
    "That log screenshotted into /screenshots",
  ],
});

// ---------------------------------------------------- 13 TROUBLESHOOTING ---
{
  const s = d.content("Troubleshooting", "When it goes wrong");
  T.table(s,
    ["What it means", "What to do"],
    [
      ["Target of URI hasn't been generated", "You have not run the generator yet", "dart run build_runner build --delete-conflicting-outputs"],
      ["Conflicting outputs were detected", "Generated files from an earlier run are in the way", "Add --delete-conflicting-outputs to the command"],
      ["Undefined name '_$PostFromJson'", "The part directive is missing or names the wrong file", "part 'post.g.dart'; must match this file's name exactly"],
      ["a == b still prints false", "props is incomplete, or the class does not extend Equatable", "List every field in props and rerun"],
      ["List<dynamic> is not a subtype", "You passed the decoded body straight into fromJson", "Cast each element to Map<String, dynamic> while mapping"],
    ],
    { y: 2.1, labelW: 3.5, rowH: 0.66, fontSize: 11 }
  );
  T.takeaway(s, "Rerun the generator after every model change.",
    "Most of these are one stale post.g.dart in five disguises.", 6.15);
}

// ------------------------------------------------------- 14 SUBMISSION -----
T.submissionSlide(d, {
  labNumber: 5,
  extra: [
    "Expected in /screenshots: the console output showing a == b is true, and the retry log with its growing delays against the invalid endpoint.",
    "Commit post.g.dart along with everything else, because the grader needs to see what the generator produced.",
  ],
});

// --------------------------------------------------------- 15 CLOSING ------
d.closing([
  ["checklist", "Recap", [
    "You write annotations; build_runner writes fromJson and toJson",
    "Equatable gives value equality and a matching hashCode from props",
    "Backoff spreads retries out in time; jitter keeps clients from syncing up",
  ]],
  ["calendar", "Before next lab", [
    "Push branch lab5 and open the pull request",
    "Screenshots of the retry log in /screenshots",
    "Bring questions: the project needs every piece of this",
  ]],
  ["bookopen", "Read more", [
    "pub.dev/packages/json_serializable",
    "pub.dev/packages/equatable",
    "jsonplaceholder.typicode.com",
  ]],
], "Wrapping up");

d.write(path.join(__dirname, "Mobile-and-Embedded-Lab5-v2.pptx")).then((f) => console.log("wrote", f));
