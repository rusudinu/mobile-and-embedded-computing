// ============================================================================
// Mobile & Embedded Computing: Lecture 6
// "APIs & Observability": packages, feature flags, GraphQL & REST, Crashlytics
// Built on the shared template (template.js). 38 source slides -> 27.
// ============================================================================
const path = require("path");
const T = require("../assets/template");
const { Deck, C, F, MONO } = T;

const d = new Deck({
  lecture: 6,
  title: "APIs & Observability",
  subtitle: "packages, feature flags, GraphQL & REST, Crashlytics",
});

// ---------------------------------------------------------------- 1 TITLE ---
d.titleSlide();

// ------------------------------------------------------------------ 2 BIO ---
T.bioSlide(d);

// ----------------------------------------------------------- 3 OBJECTIVES ---
T.objectivesSlide(d, [
  ["package", "Add a package safely", "Read a pub.dev page, pin a constraint, and know what pubspec.lock is actually for"],
  ["toggle", "Ship behind a flag", "Firebase Remote Config: defaults, fetch and activate, plus staged rollout and a kill switch"],
  ["arrowleftright", "Compare REST and GraphQL", "Over- and under-fetching, caching, typing, N+1, and when each one wins"],
  ["radar", "See your app in production", "Events, p95 latency, crash-free users, and which alerts are worth firing"],
]);

// ================================================================ SECTION 1 ==
d.divider("Part 1 · Packages", "Depending on someone else's code",
  "pub.dev, version constraints, and the lockfile you must commit");

// ------------------------------------------------------ 5 CHOOSING A PACKAGE -
{
  const s = d.content("Packages", "Choosing a package you can live with");
  T.iconGrid(s, [
    ["search", "pub.dev is the registry", "Every Dart and Flutter package lives here. Each page carries the API docs, a runnable example, and the exact install command."],
    ["chart", "Read the scores critically", "Likes and downloads are popularity. Pub points are mechanical: docs, formatting and platform support. They are not a verdict on quality."],
    ["calendar", "Check the last publish date", "A plugin last released against Flutter 3.19 is maintenance you are taking on yourself."],
    ["smartphone", "Check the platforms", "The page lists Android · iOS · web · desktop. A plugin with native code often supports fewer of them than you assume."],
    ["boxes", "Open the dependency tree", "You adopt every transitive dependency too. Two packages that pin conflicting versions is the classic unresolvable pubspec."],
    ["scale", "Check the license", "MIT, BSD and Apache-2.0 are fine for your project. Anything copyleft is a conversation to have before you ship, not after."],
  ], { y: 2.0, rowH: 2.3 });
  T.hline(s, 0.9, 6.4, 11.53);
  s.addText("A dependency is quick to add and slow to remove, so spend a minute checking it first.", {
    x: 0.9, y: 6.5, w: 11.5, h: 0.3, fontFace: F, fontSize: 12, color: C.GRAY, margin: 0,
  });
  s.addNotes("Worth saying out loud: the project is graded on code you can explain. If nobody on the team can explain what a package does, that is a reason not to add it.");
}

// -------------------------------------------------------- 6 ADDING A PACKAGE -
{
  const s = d.content("Packages", "Adding a package");
  T.codeBlock(s, [
    "# pubspec.yaml",
    "dependencies:",
    "  flutter:",
    "    sdk: flutter",
    "  http: ^1.5.0",
    "  firebase_core: ^4.1.0",
    "  firebase_crashlytics: ^5.0.0",
    "",
    "dev_dependencies:",
    "  flutter_test:",
    "    sdk: flutter",
    "  build_runner: ^2.5.0",
  ], { x: 0.9, y: 1.95, w: 6.0, h: 4.05, fontSize: 11 });
  T.codeBlock(s, [
    "# Writes the constraint AND resolves it",
    "flutter pub add http",
    "flutter pub add dev:build_runner",
    "# Download exactly what the lockfile pins",
    "flutter pub get",
    "# Newest inside your constraints",
    "flutter pub upgrade",
    "# Raise the constraints themselves",
    "flutter pub upgrade --major-versions",
    "# What has moved on without you?",
    "flutter pub outdated",
  ], { x: 7.3, y: 1.95, w: 5.13, h: 4.05, fontSize: 10.5 });
  T.takeaway(s, "Do not hand-edit pubspec.yaml to add a package.",
    "flutter pub add writes the current constraint and resolves in one step; the versions above are illustrative, and will be stale by the time you read them.", 6.2);
}

// ------------------------------------------------------- 7 CONSTRAINTS/LOCK --
{
  const s = d.content("Packages", "Version constraints and the lockfile");
  T.table(s, ["What it allows", "What it blocks"], [
    ["^1.5.0", ">= 1.5.0  and  < 2.0.0", "2.0.0, a breaking major"],
    ["^0.3.2", ">= 0.3.2  and  < 0.4.0", "0.4.0; before 1.0, minors may break"],
    ["1.5.0", "exactly 1.5.0, forever", "every patch, including security fixes"],
    ["any", "whatever the resolver picks", "nothing at all; never ship this"],
  ], { y: 2.1, rowH: 0.55, labelW: 1.9, fontSize: 11.5 });
  T.lines(s, [
    { text: "pubspec.yaml says what you will accept. pubspec.lock records what you actually got.", options: { bold: true } },
    "Commit pubspec.lock for an application: it is what makes your build, your teammate's build and CI resolve to identical code.",
    "Do not commit it for a package you publish: there you want consumers to resolve against their own constraint set.",
    "flutter pub get obeys the lockfile. flutter pub upgrade rewrites it. That is the whole difference between the two commands.",
  ], { x: 0.9, y: 5.1, w: 11.53, h: 1.7, fontSize: 12.5, paraSpaceAfter: 10 });
}

// ================================================================ SECTION 2 ==
d.divider("Part 2 · Feature flags", "Deploy is not release",
  "Firebase Remote Config: staged rollout, kill switch, and flag debt");

// -------------------------------------------------- 9 DEPLOY IS NOT RELEASE --
{
  const s = d.content("Feature flags", "Deploy is not release");
  T.lines(s, [
    "A staged rollout ships a binary to 1% of users, then 5, 10, 50, 100. The store does this for you, and you can halt it if crashes spike. The store runs the rollout; your job is to watch the crash rate while it climbs.",
    "But a rollout only controls who gets the binary, and users who already have it keep it. You cannot take code back, and a fix takes another review cycle to reach them.",
    "A feature flag separates the two: the code ships to everyone, switched off. A server decides, per user and at runtime, whether it is on.",
    { text: "Deploy is a build step. Release is a runtime decision.", options: { bold: true } },
  ], { x: 0.9, y: 1.95, w: 6.9, h: 3.9, fontSize: 13.5, paraSpaceAfter: 13 });
  T.flowDown(s, [
    ["Merge to main", "flag defaults to off", "panel"],
    ["Ship to the store", "the code is on every device", "hair"],
    ["Flip the flag to 5%", "you release, without a build", "black"],
    ["Something breaks?", "back to 0% in one click", "hair", C.RED],
  ], { x: 8.2, y: 2.0, w: 4.3, h: 0.9, gap: 0.3 });
  T.takeaway(s, "The kill switch is the main benefit.",
    "A bad release you can turn off in thirty seconds is a different kind of incident from one that needs a store review.", 5.5, { w: 6.9 });
}

// ------------------------------------------------------- 10 REMOTE CONFIG ----
{
  const s = d.content("Feature flags", "The tool: Firebase Remote Config");
  T.lines(s, [
    "A key/value store hosted by Firebase. Your app ships with in-app defaults, then fetches overrides, so it behaves sensibly on first run, offline, and if the fetch fails.",
    "Values are typed: bool for a flag, int or double for a tuning knob, String or JSON for content you want to change without a release.",
    "Conditions in the console target by app version, platform, language, country, Analytics audience, and by a random percentile, which is how you stage a rollout of behavior rather than of binaries.",
    { text: "Same idea, other tools: LaunchDarkly, Unleash, PostHog, ConfigCat. We use Remote Config because the rest of this lecture is already Firebase.", options: { color: C.GRAY } },
  ], { x: 0.9, y: 1.95, w: 6.9, h: 3.9, fontSize: 13, paraSpaceAfter: 12 });
  T.flowDown(s, [
    ["setDefaults()", "baked into the binary", "panel"],
    ["fetch()", "download, then cache", "hair"],
    ["activate()", "make fetched values live", "hair"],
    ["getBool() / getInt()", "read at the call site", "black"],
  ], { x: 8.2, y: 2.0, w: 4.3, h: 0.9, gap: 0.3 });
  T.takeaway(s, "Fetch and activate are two steps on purpose.",
    "Values never change underneath a screen that is already rendered.", 5.5, { w: 6.9 });
}

// ------------------------------------------------- 11 REMOTE CONFIG IN DART --
{
  const s = d.content("Feature flags", "Remote Config in Dart");
  T.codeBlock(s, [
    "final rc = FirebaseRemoteConfig.instance;",
    "// Defaults ship inside the binary: the app works on first run.",
    "await rc.setDefaults(const {",
    "  'checkout_v2_enabled': false,",
    "  'feed_page_size': 20,",
    "});",
    "",
    "await rc.setConfigSettings(RemoteConfigSettings(",
    "  fetchTimeout: const Duration(seconds: 10),",
    "  // Production: 1-12 h. Debug: Duration.zero, or you get throttled.",
    "  minimumFetchInterval: const Duration(hours: 1),",
    "));",
    "await rc.fetchAndActivate();   // fetch, then swap the values in",
    "",
    "// Read at the call site, every time - never cache it in a global.",
    "if (rc.getBool('checkout_v2_enabled')) return const CheckoutV2();",
  ], { x: 0.9, y: 1.95, w: 7.5, h: 4.9, fontSize: 10 });
  s.addText("Rules that keep flags cheap", { x: 8.7, y: 1.98, w: 3.9, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "Fetches are throttled server-side. minimumFetchInterval exists so the backend is not called too often; set it to zero only in debug builds.",
    "Roll out by percentile: 1%, 10%, 50%, 100%, watching crash-free users at each step.",
    "Every live flag is a branch you must keep working. Delete the flag and the dead path as soon as it reaches 100%.",
    { text: "Flags are not security. The disabled code is still in the binary and the values are readable, so keep authorization on the server.", options: { color: C.INK } },
  ], { x: 8.7, y: 2.45, w: 3.9, h: 4.4, fontSize: 11, color: C.GRAY, paraSpaceAfter: 11 });
  s.addNotes("Demo opportunity: flip a boolean in the Firebase console, pull-to-refresh in the running app, and watch the UI change with no rebuild. Then set it back. That is the kill switch.");
}

// ================================================================ SECTION 3 ==
d.divider("Part 3 · APIs", "Talking to a server",
  "REST, GraphQL, and the cost of each round trip");

// --------------------------------------------------------- 13 REST VERBS -----
{
  const s = d.content("APIs", "REST, and what the verbs promise");
  s.addText("Resources named by URLs, acted on with standard HTTP methods; every request carries its own context, so any server can answer it.", {
    x: 0.9, y: 1.5, w: 11.5, h: 0.35, fontFace: F, fontSize: 13, color: C.GRAY, margin: 0,
  });
  T.table(s, ["Safe", "Idempotent", "What it is for"], [
    ["GET", "yes", "yes", "read a resource: /v1/users/42"],
    ["POST", "no", "no", "create; two sends create two things"],
    ["PUT", "no", "yes", "replace a resource wholesale"],
    ["PATCH", "no", "not in general", "partial update; depends on the payload"],
    ["DELETE", "no", "yes", "remove; deleting twice ends the same way"],
  ], { y: 2.1, rowH: 0.55, labelW: 1.5, fontSize: 11.5, focusCols: [1] });
  T.takeaway(s, "Safe and idempotent are two different questions.",
    "Safe means it changes nothing. Idempotent means doing it twice leaves the same state. PUT and DELETE are idempotent but not safe, which is why a client on a flaky mobile network may retry them but must not retry a POST.", 5.6);
}

// ------------------------------------------------------- 14 REST IN DART -----
{
  const s = d.content("APIs", "A REST call in Dart");
  T.codeBlock(s, [
    "import 'dart:convert';",
    "import 'package:http/http.dart' as http;",
    "Future<List<Post>> fetchPosts(String userId) async {",
    "  final uri = Uri.https('api.example.com',",
    "      '/v1/users/$userId/posts', {'limit': '20'});",
    "",
    "  final res = await http",
    "      .get(uri, headers: {'Authorization': 'Bearer $token'})",
    "      .timeout(const Duration(seconds: 10));",
    "",
    "  if (res.statusCode != 200) {",
    "    throw ApiException(res.statusCode, res.body);",
    "  }",
    "  final json = jsonDecode(res.body) as List<dynamic>;",
    "  return json.map((e) => Post.fromJson(e)).toList();",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.5, h: 4.9, fontSize: 10 });
  s.addText("Four things people forget", { x: 8.7, y: 1.98, w: 3.9, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "A timeout. The default on mobile is effectively forever, and a spinner that never ends is a common bug report.",
    "The status code. A 401 or a 500 also has a body, and jsonDecode will happily parse an error page into nonsense.",
    "Codegen. json_serializable + build_runner writes fromJson for you; hand-written parsers break silently when a field is renamed (→ Lecture 5).",
    "dio when you need interceptors, retries, cancellation and one place to refresh an expired token.",
  ], { x: 8.7, y: 2.45, w: 3.9, h: 4.4, fontSize: 11, color: C.GRAY, paraSpaceAfter: 11 });
}

// ------------------------------------------------------ 15 OVER/UNDER-FETCH --
{
  const s = d.content("APIs", "Over-fetching and under-fetching");
  s.addText("One profile screen: the user's name, their follower count, and their last 20 posts.", {
    x: 0.9, y: 1.5, w: 11.5, h: 0.35, fontFace: F, fontSize: 13, color: C.GRAY, margin: 0,
  });

  // --- left: REST, three round trips
  s.addText("REST: three round trips", { x: 0.9, y: 1.95, w: 5.6, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  const reqs = [
    ["GET /v1/users/42", "returns 38 fields; the screen shows 2"],
    ["GET /v1/users/42/posts?limit=20", "a second request, after the first returns"],
    ["GET /v1/users/42/followers/count", "and only now can the screen render"],
  ];
  let ry = 2.42;
  for (const [line, note] of reqs) {
    T.hairbox(s, 0.9, ry, 5.6, 0.78);
    s.addText(line, { x: 1.15, y: ry + 0.08, w: 5.1, h: 0.3, fontFace: MONO, fontSize: 11, color: C.INK, margin: 0 });
    s.addText(note, { x: 1.15, y: ry + 0.4, w: 5.1, h: 0.3, fontFace: F, fontSize: 10.5, color: C.GRAY, margin: 0 });
    ry += 0.95;
  }
  s.addText("over-fetching  ·  under-fetching  ·  3 × round-trip time", {
    x: 0.9, y: 5.3, w: 5.6, h: 0.3, fontFace: F, fontSize: 11.5, color: C.GRAY, margin: 0,
  });

  // --- right: GraphQL, one round trip
  s.addText("GraphQL: one round trip", { x: 6.9, y: 1.95, w: 5.5, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.blackbox(s, 6.9, 2.42, 5.5, 0.78);
  s.addText("POST /graphql", { x: 7.15, y: 2.42, w: 5.0, h: 0.78, fontFace: MONO, fontSize: 11, color: C.WHITE, valign: "middle", margin: 0 });
  T.panel(s, 6.9, 3.37, 5.5, 1.85);
  s.addText([
    { text: "user(id: 42) {", options: { breakLine: true } },
    { text: "  name", options: { breakLine: true } },
    { text: "  followerCount", options: { breakLine: true } },
    { text: "  posts(limit: 20) { id title }", options: { breakLine: true } },
    { text: "}", options: {} },
  ], { x: 7.25, y: 3.55, w: 5.0, h: 1.5, fontFace: MONO, fontSize: 11, color: C.INK, margin: 0, valign: "top", lineSpacing: 17 });
  s.addText("exactly the fields the screen renders  ·  1 × round-trip time", {
    x: 6.9, y: 5.3, w: 5.5, h: 0.3, fontFace: F, fontSize: 11.5, color: C.GRAY, margin: 0,
  });

  T.takeaway(s, "A round trip on a mobile network costs 50–150 ms, and far more on a bad one.",
    "GraphQL does not make the server faster. It moves the joins server-side, where a careless resolver turns one query into N+1 database calls.", 5.75);
}

// ----------------------------------------------------------- 16 GRAPHQL ------
{
  const s = d.content("APIs", "GraphQL: schema, query, mutation");
  T.codeBlock(s, [
    "# The schema is the contract: strongly typed and introspectable.",
    "type User {",
    "  id: ID!   name: String!   followerCount: Int!",
    "  posts(limit: Int): [Post!]!",
    "}",
    "# A query reads. The response JSON has exactly this shape.",
    "query ProfileScreen($id: ID!) {",
    "  user(id: $id) {",
    "    name  followerCount",
    "    posts(limit: 20) { id title createdAt }",
    "  }",
    "}",
    "",
    "# A mutation writes - and returns the new state, for your cache.",
    "mutation LikePost($postId: ID!) {",
    "  likePost(id: $postId) { id likeCount likedByMe }",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.5, h: 4.9, fontSize: 10 });
  s.addText("What the schema buys you", { x: 8.7, y: 1.98, w: 3.9, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "One endpoint, one schema, every client. iOS, Android and web each ask for the fields they render, so there are no per-client endpoints.",
    "Introspection means the tooling is generated, not written: GraphiQL, autocomplete, and Dart types straight from the schema.",
    "! means non-nullable. That maps cleanly onto Dart's null safety, so a nullable field in the schema is a nullable field in your model.",
    { text: "Everything is a POST to one URL, which is why HTTP caching stops helping here.", options: { color: C.INK } },
  ], { x: 8.7, y: 2.45, w: 3.9, h: 4.4, fontSize: 11, color: C.GRAY, paraSpaceAfter: 11 });
}

// -------------------------------------------------- 17 GRAPHQL IN FLUTTER ----
{
  const s = d.content("APIs", "GraphQL in a Flutter app");
  T.codeBlock(s, [
    "// pubspec: graphql_flutter: ^5.2.1",
    "final link = HttpLink('https://api.example.com/graphql');",
    "final client = ValueNotifier(GraphQLClient(",
    "  link: AuthLink(getToken: () async => 'Bearer $token').concat(link),",
    "  cache: GraphQLCache(store: HiveStore()),  // normalized by id",
    "));",
    "",
    "Query(",
    "  options: QueryOptions(document: gql(profileScreenQuery),",
    "                        variables: {'id': userId}),",
    "  builder: (result, {fetchMore, refetch}) {",
    "    if (result.isLoading) return const Spinner();",
    "    if (result.hasException) return ErrorView(result.exception!);",
    "    return ProfileView(User.fromJson(result.data!['user']));",
    "  },",
    ");",
  ], { x: 0.9, y: 1.95, w: 7.5, h: 4.8, fontSize: 10 });
  s.addText("Two clients, one caveat", { x: 8.7, y: 1.98, w: 3.9, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    { text: "graphql_flutter", options: { bold: true, color: C.INK } },
    "Widget-level Query and Mutation builders, a normalized cache, and dynamic maps. Fastest to start with.",
    { text: "ferry", options: { bold: true, color: C.INK } },
    "Generates Dart types from your schema and .graphql documents, so a wrong field name is a compile error rather than a runtime null.",
    { text: "GraphQL errors arrive with HTTP 200 and an errors array. Checking the status code is not enough; check result.hasException.", options: { color: C.INK } },
  ], { x: 8.7, y: 2.45, w: 3.9, h: 4.3, fontSize: 11, color: C.GRAY, paraSpaceAfter: 9 });
}

// ----------------------------------------------------- 18 REST vs GRAPHQL ----
{
  const s = d.content("APIs", "REST vs GraphQL, side by side");
  T.table(s, ["REST", "GraphQL"], [
    ["Endpoints", "one per resource, many URLs", "one URL, usually POST /graphql"],
    ["Payload", "fixed by the server; over- and under-fetching", "chosen by the client, in one request"],
    ["Caching", "HTTP caching, CDNs and ETags, for free", "normalized client cache that you configure"],
    ["Schema & typing", "OpenAPI, if someone keeps it current", "mandatory, introspectable, generates your types"],
    ["Server cost", "predictable per endpoint", "N+1 resolvers; needs dataloaders and depth limits"],
    ["Errors", "carried by the HTTP status code", "HTTP 200 plus an errors array"],
    ["Tooling", "curl, Postman, any proxy; decades of it", "GraphiQL and codegen; harder to read in a proxy"],
  ], { y: 2.0, rowH: 0.48, labelW: 1.9, fontSize: 11 });
  T.takeaway(s, "Neither one wins.",
    "Simple resources, heavy caching, third-party integrations → REST. Deeply related data, several clients with different needs, expensive round trips → GraphQL. Most real apps end up with both.", 6.05);
}

// ================================================================ SECTION 4 ==
d.divider("Part 4 · Observability", "You cannot debug a phone you do not own",
  "Events → metrics → crashes → alerts");

// ------------------------------------------------- 20 WHY MOBILE IS HARDER ---
{
  const s = d.content("Observability", "Why this is harder on a phone");
  T.lines(s, [
    "The code runs on hardware you have never seen: thousands of Android models, several OS versions, networks that drop mid-request, devices thermally throttled in a pocket.",
    "You cannot attach a debugger to a user's phone. There is no server log to grep: the log is on the device, and you have no access to it.",
    "Releases are staged and users update slowly, so four versions of your app are live at once and one of them is three months old.",
    { text: "So the app has to report on itself. The rest of this section is how.", options: { bold: true } },
  ], { x: 0.9, y: 1.95, w: 6.9, h: 3.9, fontSize: 13.5, paraSpaceAfter: 13 });
  T.flowDown(s, [
    ["Events", "what users did", "panel"],
    ["Metrics", "how slow, how often", "hair"],
    ["Crashes", "what broke, with a stack", "hair"],
    ["Alerts", "who finds out, and when", "black"],
  ], { x: 8.2, y: 2.0, w: 4.3, h: 0.9, gap: 0.3 });
  T.takeaway(s, "Monitoring tells you that something is wrong.",
    "Observability is having enough signal to work out why, without shipping a build to find out.", 5.5, { w: 6.9 });
}

// ------------------------------------------------------- 21 ANALYTICS CODE ---
{
  const s = d.content("Observability", "Logging an analytics event");
  T.codeBlock(s, [
    "import 'package:firebase_analytics/firebase_analytics.dart';",
    "final analytics = FirebaseAnalytics.instance;",
    "",
    "// snake_case, <= 40 chars; parameter values are String or num.",
    "await analytics.logEvent(",
    "  name: 'checkout_started',",
    "  parameters: {",
    "    'cart_value_ron': 249.90,",
    "    'item_count': 3,",
    "    'payment_method': 'card',",
    "  },",
    ");",
    "// screen_view for free - wire the observer in once.",
    "MaterialApp(",
    "  navigatorObservers: [FirebaseAnalyticsObserver(analytics: analytics)],",
    ");",
  ], { x: 0.9, y: 1.95, w: 7.5, h: 4.9, fontSize: 10 });
  s.addText("How to name and use them", { x: 8.7, y: 1.98, w: 3.9, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "first_open, session_start, screen_view and app_remove are collected for you. Everything else is a deliberate decision.",
    "Name events for the funnel you want to read later: checkout_started → payment_submitted → purchase_complete.",
    { text: "Never put personal data in a parameter. No emails, no names and no free text. Analytics is not a log, and this is a GDPR question.", options: { color: C.INK } },
    "Events are aggregated and delayed by hours. They answer “how many users”, never “what happened to this one user”.",
  ], { x: 8.7, y: 2.45, w: 3.9, h: 4.4, fontSize: 11, color: C.GRAY, paraSpaceAfter: 11 });
  s.addNotes("This replaces the old Android/Java version of this slide, which used getInstance(this) and a Bundle. In Flutter you never touch either: firebase_analytics is a Dart API with a Map of parameters.");
}

// ------------------------------------------------------ 22 CRASHLYTICS CODE --
{
  const s = d.content("Observability", "Catching crashes in Flutter");
  T.codeBlock(s, [
    "void main() async {",
    "  WidgetsFlutterBinding.ensureInitialized();",
    "  await Firebase.initializeApp(",
    "      options: DefaultFirebaseOptions.currentPlatform);",
    "  // Uncaught framework errors -> fatal report + widget stack.",
    "  FlutterError.onError =",
    "      FirebaseCrashlytics.instance.recordFlutterFatalError;",
    "",
    "  // Uncaught async errors from outside the framework.",
    "  PlatformDispatcher.instance.onError = (error, stack) {",
    "    FirebaseCrashlytics.instance",
    "        .recordError(error, stack, fatal: true);",
    "    return true;",
    "  };",
    "  runApp(const App());",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.5, h: 4.9, fontSize: 10 });
  s.addText("Errors you already caught", { x: 8.7, y: 1.98, w: 3.9, h: 0.35, fontFace: F, fontSize: 13.5, bold: true, color: C.INK, margin: 0 });
  T.codeBlock(s, [
    "try {",
    "  await api.pay(cart);",
    "} catch (e, s) {",
    "  await crashlytics.recordError(",
    "      e, s, reason: 'checkout');",
    "}",
  ], { x: 8.7, y: 2.4, w: 3.9, h: 2.05, fontSize: 9 });
  T.lines(s, [
    "log('card selected') adds breadcrumbs to the next report; setCustomKey and setUserIdentifier add state, for example a hashed id, never an email.",
    "Reports upload on the next launch, so a crash during startup still reaches you.",
    "Verify the wiring once with FirebaseCrashlytics.instance.crash(), then delete that line.",
  ], { x: 8.7, y: 4.65, w: 3.9, h: 2.2, fontSize: 10.5, color: C.GRAY, paraSpaceAfter: 9 });
  s.addNotes("Correction from the old deck: this slide used to show a Gradle dependency and Java-style Crashlytics.log calls. In Flutter the two handlers above are the whole setup: FlutterError.onError for framework errors and PlatformDispatcher.instance.onError for everything else.");
}

// -------------------------------------------------------- 23 CRASH-FREE % ----
{
  const s = d.content("Observability", "Crash-free users: the number to watch");
  T.statRow(s, [
    ["99.9%", "crash-free sessions", "the higher number vendors usually quote"],
    ["99.5%", "crash-free users", "a common floor for a consumer app"],
    ["1 in 200", "users hit a crash", "at 99.5%; on 400k installs, 2,000 people"],
  ], { y: 2.0, bigSize: 46 });
  T.hline(s, 0.9, 4.35, 11.53);
  T.lines(s, [
    "Crash-free users = users with no fatal crash ÷ all users, over a window. It counts people, not events: one user crashing fifty times still costs you one user.",
    "Crash-free sessions is always higher, because most sessions are short and uneventful. Quote users; act on users.",
    "Read it per app version, never in aggregate: a bad release hides inside a healthy overall number for days.",
    "Sort issues by users affected, not by crash count. One issue hitting 4,000 people beats thirty issues hitting two each.",
  ], { x: 0.9, y: 4.55, w: 11.53, h: 1.8, fontSize: 12.5, paraSpaceAfter: 9 });
  T.takeaway(s, "The metric you act on is crash-free users on the version you are rolling out.",
    "If it drops, halt the rollout or flip the flag.", 6.35);
}

// --------------------------------------------------------- 24 PERCENTILES ----
{
  const s = d.content("Observability", "Latency: read p95, not the average");
  const rows = [
    ["p50: the median", "The typical request. Half your users are faster than this. It is the last number to move when something starts breaking."],
    ["p95", "One request in twenty. This is where users start to notice, and where you should set a budget: “feed_load p95 under 1.5 s”."],
    ["p99", "The tail: cold starts, retries, 2 G, throttled devices. Real users, but noisy below roughly a thousand samples."],
    ["the average", "Almost useless here. One 30-second timeout skews it, and no individual user experiences the average."],
  ];
  let y = 1.98;
  rows.forEach(([head, body], i) => {
    s.addText(head, { x: 0.9, y, w: 6.6, h: 0.32, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
    s.addText(body, { x: 0.9, y: y + 0.34, w: 6.6, h: 0.62, fontFace: F, fontSize: 11.5, color: C.GRAY, margin: 0, valign: "top" });
    y += 1.06;
    if (i < rows.length - 1) T.hline(s, 0.9, y - 0.12, 6.6);
  });
  s.addText("Measuring it", { x: 7.9, y: 1.98, w: 4.5, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.codeBlock(s, [
    "final t = FirebasePerformance",
    "    .instance.newTrace('feed_load');",
    "await t.start();",
    "await loadFeed();",
    "t.putMetric('items', items.length);",
    "await t.stop();",
  ], { x: 7.9, y: 2.4, w: 4.53, h: 2.1, fontSize: 9 });
  T.lines(s, [
    "App start (cold, warm and hot) and screen rendering are captured for you as soon as the package is added.",
    "Dart HTTP calls are not: dart:io opens its own sockets and bypasses the instrumented platform stack. Wrap the client, or trace it yourself.",
  ], { x: 7.9, y: 4.7, w: 4.53, h: 1.9, fontSize: 10.5, color: C.GRAY, paraSpaceAfter: 9 });
  T.takeaway(s, "A percentile describes a defined share of your users.",
    "An average describes no particular user.", 6.15, { w: 6.6 });
}

// ------------------------------------------------------------- 25 ALERTS -----
{
  const s = d.content("Observability", "Which alerts are worth firing");
  T.table(s, ["Fire when", "Why that threshold"], [
    ["Crash-free users", "drops below 99.5% on the version rolling out", "one user in 200 is a visible outage, not noise"],
    ["New fatal issue", "a signature first seen in the build you shipped", "velocity alerts catch regressions, not the old backlog"],
    ["p95 latency", "doubles week-over-week on a key endpoint", "relative change survives traffic growth; fixed numbers do not"],
    ["Funnel conversion", "checkout_started → purchase drops 20%", "crash-free can be perfect while the feature is quietly broken"],
    ["Everything else", "no alert; put it on a dashboard", "an alert nobody acts on trains everyone to ignore all of them"],
  ], { y: 2.15, rowH: 0.62, labelW: 1.9, fontSize: 11 });
  T.takeaway(s, "Every alert needs an owner and an action.",
    "If the answer to “what would I do about this at 3 a.m.?” is “nothing”, it belongs on a dashboard rather than in an alert.", 6.05);
}

// -------------------------------------------------------- 26 ONE INCIDENT ----
{
  const s = d.content("Observability", "One incident, end to end");
  s.addText("Four minutes after a 10% rollout of checkout v2.", {
    x: 0.9, y: 1.5, w: 11.5, h: 0.35, fontFace: F, fontSize: 13, color: C.GRAY, margin: 0,
  });
  const steps = [
    ["14:02", "Analytics", "checkout_started is normal, purchase_complete is down 40%, but only on 4.2.0.", C.INK],
    ["14:05", "Performance", "p95 on the payment trace jumps from 0.4 s to 5.2 s. Something downstream is timing out.", C.INK],
    ["14:07", "Crashlytics", "A new fatal: null check operator used on a null value, in PaymentResponse.fromJson.", C.RED],
    ["14:09", "Remote Config", "checkout_v2_enabled → false. Zero users affected. Fix, ship, then re-ramp from 1%.", C.BLUE],
  ];
  const bw = 2.72, gap = 0.22;
  steps.forEach(([time, head, body, color], i) => {
    const x = 0.9 + i * (bw + gap);
    T.hairbox(s, x, 2.2, bw, 2.2);
    s.addText(time, { x: x + 0.25, y: 2.4, w: bw - 0.5, h: 0.3, fontFace: MONO, fontSize: 11, color: C.GRAY, margin: 0 });
    s.addText(head, { x: x + 0.25, y: 2.75, w: bw - 0.5, h: 0.4, fontFace: F, fontSize: 15, bold: true, color, margin: 0 });
    s.addText(body, { x: x + 0.25, y: 3.25, w: bw - 0.5, h: 1.25, fontFace: F, fontSize: 11, color: C.GRAY, margin: 0, valign: "top" });
    if (i < steps.length - 1) T.arrow(s, x + bw, 3.45, gap, 0);
  });
  T.takeaway(s, "Events show that something is wrong, metrics show where, crashes show why.",
    "The flag is what limits the damage without waiting for a store review, which is why the two halves of this lecture belong on the same slide.", 5.1);
  s.addNotes("Walk this backwards too: without the event you would not have looked; without the trace you would have blamed the client; without the crash report you would not have the stack. Each layer alone is not enough.");
}

// -------------------------------------------------------------- 27 CLOSING ---
{
  const s = d.closing([
    ["checklist", "Recap", [
      "pub add writes the constraint; commit pubspec.lock for an app",
      "Deploy ≠ release: flags give you a percentage rollout and a kill switch",
      "REST and GraphQL trade over-fetching against caching and N+1",
      "Safe ≠ idempotent: it decides what a retry is allowed to do",
      "Events → metrics → crashes → alerts, because you own no device",
    ]],
    ["calendar", "This week", [
      "Add firebase_analytics and log one event that matters to your project",
      "Wire both Crashlytics handlers, then force a crash and find the report",
      "Put one feature behind a Remote Config bool and flip it live",
      "Write the same profile screen twice: REST calls, then one GraphQL query",
    ]],
    ["bookopen", "Read more", [
      "dart.dev/tools/pub/dependencies",
      "firebase.google.com/docs/remote-config",
      "firebase.google.com/docs/crashlytics/get-started?platform=flutter",
      "graphql.org/learn  ·  pub.dev/packages/graphql_flutter",
    ]],
  ]);
}

d.write(path.join(__dirname, "Mobile-and-Embedded-Lecture6-v2.pptx")).then((f) => console.log("written:", f));
