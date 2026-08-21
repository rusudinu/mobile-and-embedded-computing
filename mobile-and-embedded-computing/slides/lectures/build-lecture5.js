// ============================================================================
// Lecture 5: Server & Client
// Built on the shared template (template.js). 25 source slides → 28.
// ============================================================================
const path = require("path");
const T = require("../assets/template");
const { Deck, C, F, MONO } = T;

const d = new Deck({
  lecture: 5,
  title: "Mobile and Embedded Computing",
  subtitle: "server vs client-side execution, serverless vs VPS, Go backends & Firebase",
});

// ---------------------------------------------------------------- 1 TITLE ---
d.titleSlide();

// ------------------------------------------------------------------ 2 BIO ---
T.bioSlide(d);

// ----------------------------------------------------------- 3 OBJECTIVES ---
T.objectivesSlide(d, [
  ["scale", "Split client and server", "What has to run on a machine you control, and why the client is untrusted input"],
  ["cloud", "Serverless or a VPS", "Cold starts, scaling and cost shape, and the case where each one wins"],
  ["code", "Talk HTTP properly", "Safe vs idempotent, timeouts and retries with jitter, in real dio code"],
  ["braces", "Stop hand-writing JSON", "@JsonSerializable and build_runner, then Firebase from a Flutter app"],
]);

// ================================================================ SECTION 1 ==
d.divider("Server & client", "Where does the code run?",
  "The same feature costs different things on either side of the wire");

// ------------------------------------------------------- 5 SERVER VS CLIENT --
{
  const s = d.content("Server & client", "Server-side and client-side execution");
  T.lines(s, [
    "Client-side code runs on the user's device: rendering, local state, caching, optimistic updates, and the checks that make a form feel fast.",
    "Server-side code runs on a machine you control: secrets, durable storage, authorization, billing, heavy compute, and anything that must be identical for every user.",
    "Between them sits one request/response cycle, and on mobile it is expensive: 40–200 ms round trip on a good connection, seconds on a bad one, nothing at all in a tunnel.",
    { text: "So the split is a latency decision as much as a security one.", options: { bold: true } },
  ], { x: 0.9, y: 1.95, w: 7.1, h: 3.6, fontSize: 13.5, paraSpaceAfter: 14 });
  T.flowDown(s, [
    ["Client", "builds the request, holds the token", "black"],
    ["Network", "TLS handshake, then the round trip", "hair"],
    ["Server", "authenticate → authorize → execute", "panel"],
    ["Response", "status code + body", "hair"],
  ], { x: 8.5, y: 2.0, w: 3.93, h: 0.8, gap: 0.3 });
  T.takeaway(s, "Put work on the client for latency.", "Put it on the server when the answer has to be correct for every user.", 5.75, { w: 7.1 });
  s.addNotes("Ask the room where they would put: password strength check (both), price calculation (server), dark-mode toggle (client), 'is this coupon still valid' (server, always). The point is that the client copy is a courtesy and the server copy is the rule.");
}

// -------------------------------------------------------- 6 TRUST BOUNDARY --
{
  const s = d.content("Server & client", "The client is untrusted input");
  T.lines(s, [
    "Everything that arrives from a client is user input, including the fields your own app filled in.",
    "An APK can be unpacked, release Dart can be inspected, and any user can proxy their own device's traffic. There is no secret you can ship inside a client.",
    "Client-side validation is a UX feature: an instant “that is not an email”, a disabled button, no wasted round trip.",
    "The server repeats every check it cares about, because it is the only copy nobody can edit.",
  ], { x: 0.9, y: 1.95, w: 7.0, h: 3.5, fontSize: 13.5, paraSpaceAfter: 14 });
  T.hairbox(s, 8.2, 1.95, 4.23, 2.95);
  s.addText("Server-side only", {
    x: 8.5, y: 2.2, w: 3.7, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0,
  });
  s.addText([
    { text: "API keys, and anything signed with one", options: { breakLine: true } },
    { text: "Who may read or write which record", options: { breakLine: true } },
    { text: "Prices, totals, discounts, balances", options: { breakLine: true } },
    { text: "Rate limits and quotas", options: { breakLine: true } },
    { text: "Anything you would be unhappy to see edited in a debugger", options: {} },
  ], { x: 8.5, y: 2.65, w: 3.7, h: 2.7, fontFace: F, fontSize: 11.5, color: C.GRAY, margin: 0, paraSpaceAfter: 10, valign: "top" });
  T.takeaway(s, "Validate on the client for speed, on the server for correctness.",
    "Any rule enforced only in the app can be bypassed.", 5.75, { w: 7.0 });
}

// ================================================================ SECTION 2 ==
d.divider("Where the server runs", "Serverless vs a VPS",
  "Two cost shapes, two failure modes and two different sets of operational work");

// ----------------------------------------------------------- 8 SERVERLESS ---
{
  const s = d.content("Serverless", "Functions as a service");
  T.lines(s, [
    "You deploy a function, not a machine. The platform provisions, scales, patches and terminates TLS for you.",
    "It creates instances on demand and destroys them when traffic stops, scaling all the way down to zero.",
    "Billing is per invocation plus resource-time (GB-seconds), so no traffic means no bill.",
    "AWS Lambda, Google Cloud Run functions (the former Cloud Functions), Azure Functions, Cloudflare Workers, and Firebase Cloud Functions, which is the same model packaged for Firebase.",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 3.6, fontSize: 13.5, paraSpaceAfter: 14 });
  T.flowDown(s, [
    ["Your handler", "one function, one job", "black"],
    ["The platform", "provision · scale · patch · TLS", "hair"],
    ["0 … n instances", "created on demand, killed when idle", "panel"],
  ], { x: 8.5, y: 2.05, w: 3.93, h: 1.0, gap: 0.36 });
  T.takeaway(s, "You stop operating servers.", "In exchange you work within the platform's limits.", 5.8, { w: 7.1 });
}

// ---------------------------------------------------------- 9 COLD STARTS ---
{
  const s = d.content("Serverless", "Cold starts: the latency of the first request");
  T.statRow(s, [
    ["0 ms", "Warm instance", "the container is already up, which covers most requests"],
    ["10–50 ms", "Go or Rust binary", "nothing to boot: one static executable and a syscall"],
    ["0.3–2 s", "JVM, .NET, large Node graphs", "runtime start, plus every dependency your handler imports"],
  ], { y: 2.1, bigSize: 44 });
  T.hline(s, 0.9, 4.45, 11.53);
  T.lines(s, [
    "A cold start is the platform building a new instance because no warm one was free: pull the image, start the runtime, run your top-level code, then finally your handler.",
    "It lands on the first user after a period of no traffic, and again on every traffic spike.",
    { text: "Mitigations all cost something.", options: { bold: true } },
  ], { x: 0.9, y: 4.7, w: 11.53, h: 1.4, fontSize: 13.5, paraSpaceAfter: 12 });
  s.addText("Minimum instances, or provisioned concurrency, means paying for idle capacity, which is the cost serverless removes in the first place. Smaller packages and a fast-starting runtime cost nothing extra, which is one reason for the Go section later in this lecture.", {
    x: 0.9, y: 6.25, w: 11.53, h: 0.6, fontFace: F, fontSize: 12, color: C.GRAY, margin: 0, valign: "top",
  });
  s.addNotes("Numbers are orders of magnitude, not benchmarks. Tell students to measure their own p99 on the platform they picked. The interesting bit is that cold-start cost is a language choice, which is unusual: almost nothing else about a small CRUD backend depends on the runtime.");
}

// ----------------------------------------------------------------- 10 VPS ---
{
  const s = d.content("VPS", "Renting the whole machine");
  T.lines(s, [
    "You rent a virtual machine from Hetzner Cloud, DigitalOcean or OVH, and what you get is root, an IP address, and nothing else.",
    "Everything above the hypervisor is yours: OS updates, firewall rules, TLS certificates, process supervision, backups, monitoring.",
    "Hetzner adds firewalls, snapshots and floating IPs. A floating IP is a movable address you can repoint at a fresh box during an upgrade.",
    "Billing is hourly or monthly for the machine, not for the requests it serves. An idle VPS costs what a busy one costs, which helps when traffic is steady and hurts when it is not.",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 3.6, fontSize: 13.5, paraSpaceAfter: 14 });
  T.flowDown(s, [
    ["Your binary", "systemd or Docker restarts it", "black"],
    ["The OS you patch", "Ubuntu LTS · firewall · TLS certs", "hair"],
    ["The VM you rent", "vCPU · RAM · disk · a public IP", "panel"],
  ], { x: 8.5, y: 2.05, w: 3.93, h: 1.0, gap: 0.36 });
  T.takeaway(s, "Nobody patches it for you.", "In exchange, no platform limits what you can run.", 5.8, { w: 7.1 });
}

// -------------------------------------------------------- 11 COMPARISON -----
{
  const s = d.content("Serverless vs VPS", "The same backend, two cost shapes");
  T.table(s, ["Serverless (FaaS)", "VPS"], [
    ["Scaling", "automatic, zero to peak and back", "you resize the box by hand, in advance"],
    ["Cost when idle", "nothing", "the full monthly price"],
    ["Cost under load", "per invocation + GB-second", "flat, until you outgrow the machine"],
    ["First request", "a cold start, unless you pay to avoid it", "already warm"],
    ["You operate", "your handler", "OS, runtime, TLS, backups, monitoring"],
    ["Long-running work", "capped by the platform timeout", "runs as long as you let it"],
    ["Wins when", "traffic is spiky, small or unknown", "traffic is steady, or state lives on disk"],
  ], { y: 2.0, labelW: 1.95, rowH: 0.5, fontSize: 11.5 });
  T.takeaway(s, "Pick by cost shape and operational load.",
    "Spiky, small or brand new → serverless. Steady and predictable → one small VPS is cheaper and simpler.  → Lecture 12, gRPC on the same backend", 6.05);
}

// ------------------------------------------------ 12 SERVERLESS CODING TIPS --
{
  const s = d.content("Serverless", "Writing code that survives a FaaS runtime");
  T.iconGrid(s, [
    ["package", "Ship a small package", "Every megabyte and every import is cold-start time. Trim the dependency list before you tune anything else."],
    ["refresh", "Initialize outside the handler", "Database pools and HTTP clients go at module scope, so warm invocations reuse them instead of rebuilding them."],
    ["database", "Keep the handler stateless", "Local disk and memory vanish between invocations. State belongs in a database, a cache or a bucket."],
    ["repeat", "Make it idempotent", "The platform retries on its own. A duplicate delivery must not charge the card a second time."],
    ["timer", "Respect the timeout", "Work that can exceed it belongs on a queue with a job record, not in a function with a longer limit."],
    ["cog", "Know your concurrency", "Lambda serves one request per instance; Cloud Run serves many at once, which changes what is safe to share."],
  ], { y: 2.0, rowH: 2.3 });
  s.addNotes("The old deck's version of this slide was a SmartArt graphic whose auto-labels read 'Move / Start / Prefer / Time', with ChatGPT citation chips pasted in as text. Everything here is the same advice written out properly.");
}

// -------------------------------------------------------- 13 VPS CODING TIPS --
{
  const s = d.content("VPS", "Running a box you will not regret");
  T.iconGrid(s, [
    ["terminal", "Rebuild it from a script", "A Dockerfile plus one provisioning script. The machine should be reproducible, never hand-tuned and remembered."],
    ["refresh", "Run it as a service", "systemd or Docker with a restart policy. A crash at 03:00 has to recover without manual intervention."],
    ["lock", "Lock down access", "Keys-only SSH, no root login, firewall down to 80/443, unattended security upgrades switched on."],
    ["shieldcheck", "Terminate TLS properly", "Caddy or nginx in front, with automatic certificates. Never serve an API over plain HTTP, not even internally."],
    ["save", "Test the restore", "Snapshots plus an off-box copy of the database. A backup you have never restored is unverified."],
    ["bell", "Make it page you", "Uptime check, log shipping, disk-full alert. Nothing on a bare VPS tells you it went down by default."],
  ], { y: 2.0, rowH: 2.3 });
}

// ================================================================ SECTION 3 ==
d.divider("Go backends", "A backend that fits in one binary",
  "One static binary, milliseconds to start, deployable anywhere");

// ------------------------------------------------------------- 15 WHY GO -----
{
  const s = d.content("Go backends", "Why Go for a small mobile backend");
  T.lines(s, [
    { text: "One static binary.", options: { bold: true } },
    "go build produces a single executable with no runtime, no interpreter and no dependency folder. Copy it to the server, or put it in a 15 MB container.",
    { text: "It starts in milliseconds.", options: { bold: true } },
    "Nothing to boot means cold starts on a scale-to-zero platform stay short.",
    { text: "It cross-compiles from your laptop.", options: { bold: true } },
    "One environment variable retargets the build: a Linux/arm64 server, or a Raspberry Pi on the same desk.",
    { text: "The standard library is already the server.", options: { bold: true } },
    "net/http, encoding/json and database/sql, plus the goroutines you already met in Lecture 3, one per request. → TinyGo on a microcontroller, Lecture 12",
  ], { x: 0.9, y: 1.95, w: 6.6, h: 3.6, fontSize: 12.5, paraSpaceAfter: 8 });
  T.codeBlock(s, [
    "# one static binary, nothing else on the box",
    "CGO_ENABLED=0 GOOS=linux GOARCH=arm64 \\",
    "    go build -o server ./cmd/server",
    "",
    "# VPS: copy it, let systemd own it",
    "scp server root@vps:/usr/local/bin/",
    "ssh root@vps 'systemctl restart api'",
    "",
    "# serverless: the same binary, in a tiny image",
    "gcloud run deploy api --source .",
  ], { x: 7.9, y: 1.95, w: 4.53, h: 3.4, fontSize: 9.5 });
  T.takeaway(s, "A small binary that starts fast.",
    "Those are the properties that matter for the service a mobile app talks to.", 5.7);
}

// ------------------------------------------------------ 16 GO HANDLER + DART --
{
  const s = d.content("Go backends", "A handler, and the Dart call that hits it");
  s.addText("Go: standard library only", {
    x: 0.9, y: 1.85, w: 7.0, h: 0.3, fontFace: F, fontSize: 12.5, bold: true, color: C.INK, margin: 0,
  });
  T.codeBlock(s, [
    "type Reading struct {",
    "    DeviceID string  `json:\"device_id\"`",
    "    TempC    float64 `json:\"temp_c\"`",
    "}",
    "func handleReading(w http.ResponseWriter, r *http.Request) {",
    "    var in Reading",
    "    if err := json.NewDecoder(r.Body).Decode(&in); err != nil {",
    "        http.Error(w, \"bad json\", http.StatusBadRequest)",
    "        return",
    "    }",
    "    w.WriteHeader(http.StatusCreated)",
    "    json.NewEncoder(w).Encode(in)   // echo the stored value",
    "}",
    "func main() {",
    "    http.HandleFunc(\"POST /readings\", handleReading)",
    "    log.Fatal(http.ListenAndServe(\":8080\", nil))",
    "}",
  ], { x: 0.9, y: 2.15, w: 7.0, h: 4.7, fontSize: 9 });
  s.addText("Dart: the client side of the same call", {
    x: 8.2, y: 1.85, w: 4.23, h: 0.3, fontFace: F, fontSize: 12.5, bold: true, color: C.INK, margin: 0,
  });
  T.codeBlock(s, [
    "final dio = Dio(BaseOptions(",
    "  baseUrl: 'https://api.example.com',",
    "));",
    "",
    "final res = await dio.post(",
    "  '/readings',",
    "  data: {'device_id': id, 'temp_c': 21.5},",
    ");",
    "final saved = Reading.fromJson(res.data);",
  ], { x: 8.2, y: 2.2, w: 4.23, h: 2.75, fontSize: 9 });
  T.lines(s, [
    "The JSON tags on the Go struct and the @JsonKey names on the Dart model are the contract. Change one, break the other.",
    "Routing patterns like \"POST /readings\" are built into net/http since Go 1.22, so no framework is required.",
    "201 Created, not 200. The status code is part of the API.",
  ], { x: 8.2, y: 5.15, w: 4.23, h: 1.6, fontSize: 11.5, paraSpaceAfter: 9 });
  s.addNotes("Live demo: go run ., then curl -X POST localhost:8080/readings with a JSON body, then point the Flutter app at it. Total moving parts: one file and one binary. This is the whole backend a semester project usually needs.");
}

// ================================================================ SECTION 4 ==
d.divider("HTTP from Flutter", "Requests, failures and JSON",
  "Methods, timeouts, retries, and generated JSON instead of a hand-written fromJson");

// -------------------------------------------------- 18 SAFE VS IDEMPOTENT ----
{
  const s = d.content("HTTP", "Safe is not the same as idempotent");
  s.addText([
    { text: "Safe", options: { bold: true, color: C.INK } },
    { text: ": the request does not modify state.      ", options: { color: C.GRAY } },
    { text: "Idempotent", options: { bold: true, color: C.INK } },
    { text: ": sending it twice has the same effect as sending it once.", options: { color: C.GRAY } },
  ], { x: 0.9, y: 1.9, w: 11.53, h: 0.4, fontFace: F, fontSize: 13.5, margin: 0 });
  T.table(s, ["Safe", "Idempotent", "What you use it for"], [
    ["GET", "yes", "yes", "read a resource"],
    ["HEAD", "yes", "yes", "the headers only: size, caching, existence"],
    ["PUT", "no", "yes", "replace the resource at a URL you chose"],
    ["DELETE", "no", "yes", "remove it; the second call still leaves it gone"],
    ["POST", "no", "no", "create, or anything that is none of the above"],
    ["PATCH", "no", "no", "partial update, not idempotent in general"],
  ], { y: 2.45, labelW: 1.5, rowH: 0.5, fontSize: 11.5, focusCols: [1] });
  T.takeaway(s, "Every safe method is idempotent; the reverse is false.",
    "PUT and DELETE do modify state, but a repeat does not change it further. That is what makes them safe to retry, and POST not.", 6.0);
  s.addNotes("This is the correction the old deck needed most: it listed PUT and DELETE as 'safe'. The practical consequence is the next slide: a retry wrapper may repeat GET/PUT/DELETE freely, but repeating a POST needs an idempotency key that the server remembers.");
}

// ------------------------------------------------------------ 19 DIO CLIENT --
{
  const s = d.content("HTTP", "dio: a request, and its failure paths");
  T.codeBlock(s, [
    "final dio = Dio(BaseOptions(",
    "  baseUrl: 'https://api.example.com',",
    "  connectTimeout: const Duration(seconds: 5),",
    "  receiveTimeout: const Duration(seconds: 10),",
    "));",
    "",
    "Future<Reading> fetchReading(String id) async {",
    "  try {",
    "    final res = await dio.get('/readings/$id');",
    "    return Reading.fromJson(res.data as Map<String, dynamic>);",
    "  } on DioException catch (e) {",
    "    if (e.type == DioExceptionType.connectionTimeout) {",
    "      throw ApiFailure('server did not answer in time');",
    "    }",
    "    if (e.response?.statusCode == 404) throw NotFound(id);",
    "    throw ApiFailure(e.message ?? 'network error');",
    "  }",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.9, fontSize: 9.5 });
  s.addText("http or dio?", {
    x: 8.85, y: 1.95, w: 3.58, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0,
  });
  T.lines(s, [
    "package:http is the minimal client: one function per request, and you assemble everything else yourself.",
    "package:dio adds base URLs, timeouts, interceptors (auth headers, logging, refresh), cancellation and multipart uploads.",
    "Set timeouts explicitly. The default on a mobile network is effectively no timeout at all, so a request can hang until the user closes the app.",
    "Map DioException to your own error type at the edge. The UI layer should never see a package's exception class.",
  ], { x: 8.85, y: 2.4, w: 3.58, h: 4.3, fontSize: 11.5, paraSpaceAfter: 10 });
}

// ------------------------------------------------------------- 20 RETRIES ----
{
  const s = d.content("HTTP", "Retry with exponential backoff and jitter");
  T.codeBlock(s, [
    "Future<T> withRetry<T>(Future<T> Function() call) async {",
    "  const base = 200;                    // milliseconds",
    "  for (var attempt = 0; ; attempt++) {",
    "    try {",
    "      return await call();",
    "    } on DioException catch (e) {",
    "      if (!_retryable(e) || attempt == 4) rethrow;",
    "      final expo = base * (1 << attempt);   // 200,400,800…",
    "      final wait = Random().nextInt(expo);  // full jitter",
    "      await Future.delayed(Duration(milliseconds: wait));",
    "    }",
    "  }",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 4.1, fontSize: 9.5 });
  T.table(s, ["Backoff", "Actual wait"], [
    ["Try 1", "200 ms", "0 – 200 ms"],
    ["Try 2", "400 ms", "0 – 400 ms"],
    ["Try 3", "800 ms", "0 – 800 ms"],
    ["Try 4", "1600 ms", "0 – 1600 ms"],
    ["Try 5", "3200 ms", "0 – 3200 ms"],
  ], { x: 8.3, y: 2.0, w: 4.13, labelW: 1.0, rowH: 0.42, fontSize: 10 });
  s.addText([
    { text: "Retry: ", options: { bold: true, color: C.INK } },
    { text: "408, 429, 500, 502, 503, 504, timeouts, connection resets.", options: { color: C.GRAY, breakLine: true } },
    { text: "Never: ", options: { bold: true, color: C.INK } },
    { text: "400, 401, 403, 404, 422: the answer will not change. And never repeat a POST without an idempotency key the server remembers.", options: { color: C.GRAY } },
  ], { x: 8.3, y: 4.75, w: 4.13, h: 1.9, fontFace: F, fontSize: 11, margin: 0, paraSpaceAfter: 9, valign: "top" });
  T.takeaway(s, "Jitter matters as much as the doubling.",
    "Doubling alone still lines every client up on the same millisecond.", 6.2, { w: 7.1 });
  s.addNotes("The old deck illustrated this with a chart of smooth staircases, which is the opposite of jitter: a staircase means every client waits the identical amount. Read the table aloud: the wait is a random draw from the interval, so a thousand clients spread across it.");
}

// ------------------------------------------------------------ 21 HEDGING -----
{
  const s = d.content("HTTP", "Thundering herds and hedged requests");
  T.lines(s, [
    "When a service fails briefly, ten thousand clients fail at once and every one of them retries after exactly one second. The retry wave is larger than the original load. That is a thundering herd, and it turns a brief outage into a long one.",
    "Full jitter spreads those retries across the whole interval, so the recovering server sees load ramp up instead of arriving all at once.",
    { text: "Hedging is the opposite problem.", options: { bold: true } },
    "A small fraction of requests are simply slow (p95, p99). Send a second copy after a short delay, take whichever answers first, cancel the other. gRPC has hedgingPolicy built in.",
  ], { x: 0.9, y: 1.95, w: 6.7, h: 3.9, fontSize: 12.5, paraSpaceAfter: 12 });
  T.blackbox(s, 7.9, 2.55, 1.25, 0.7);
  s.addText("Client", { x: 7.9, y: 2.55, w: 1.25, h: 0.7, fontFace: F, fontSize: 12.5, bold: true, color: C.WHITE, align: "center", valign: "middle", margin: 0 });
  T.arrow(s, 9.2, 2.9, 0.6, -0.55);
  T.arrow(s, 9.2, 2.9, 0.6, 0.85);
  T.hairbox(s, 9.85, 2.0, 2.58, 0.9);
  s.addText([
    { text: "Attempt 1, sent at t = 0", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "still silent at 250 ms → canceled", options: { fontSize: 10.5, color: C.RED } },
  ], { x: 9.85, y: 2.0, w: 2.58, h: 0.9, fontFace: F, fontSize: 12, align: "center", valign: "middle", margin: 0 });
  T.hairbox(s, 9.85, 3.35, 2.58, 0.9);
  s.addText([
    { text: "Attempt 2, sent at 250 ms", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "answers at 310 ms → used", options: { fontSize: 10.5, color: C.BLUE } },
  ], { x: 9.85, y: 3.35, w: 2.58, h: 0.9, fontFace: F, fontSize: 12, align: "center", valign: "middle", margin: 0 });
  s.addText("Cost: one extra request on the slow tail. Cap it: one hedge, only past p95, and only for safe or idempotent calls.", {
    x: 7.9, y: 4.5, w: 4.53, h: 1.2, fontFace: F, fontSize: 11, color: C.GRAY, margin: 0, valign: "top",
  });
  T.takeaway(s, "Retries fix failures. Hedges fix slowness.",
    "Both multiply load, so both need a cap.", 5.4, { w: 6.7 });
  s.addNotes("The old deck's hedging diagram put a red X on the request that actually won, which says the opposite of the text next to it. The winner is whichever replies first; the loser is canceled.");
}

// -------------------------------------------------------- 22 JSON CODEGEN ----
{
  const s = d.content("Code generation", "@JsonSerializable and the generated half");
  T.codeBlock(s, [
    "// lib/models/reading.dart",
    "part 'reading.g.dart';        // the generated half",
    "",
    "@JsonSerializable()",
    "class Reading {",
    "  const Reading({required this.deviceId, required this.tempC});",
    "",
    "  @JsonKey(name: 'device_id') final String deviceId;",
    "  @JsonKey(name: 'temp_c')    final double tempC;",
    "",
    "  factory Reading.fromJson(Map<String, dynamic> json) =>",
    "      _$ReadingFromJson(json);",
    "",
    "  Map<String, dynamic> toJson() => _$ReadingToJson(this);",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.3, h: 4.15, fontSize: 9.5 });
  T.codeBlock(s, [
    "# writes lib/models/reading.g.dart",
    "dart run build_runner build \\",
    "    --delete-conflicting-outputs",
    "",
    "# regenerate on every save",
    "dart run build_runner watch",
  ], { x: 8.5, y: 1.95, w: 3.93, h: 2.0, fontSize: 9 });
  T.lines(s, [
    "The round trip: Reading.fromJson(jsonDecode(body)) in, jsonEncode(reading.toJson()) out.",
    "part links your file to its generated twin; the _$ functions live there. Never edit a .g.dart.",
    "Hand-written mapping is where a renamed field silently becomes null. The generator fails the build instead.",
    "Commit the .g.dart files or generate them in CI. Pick one and write it down.",
  ], { x: 8.5, y: 4.15, w: 3.93, h: 2.5, fontSize: 11, paraSpaceAfter: 9 });
  T.takeaway(s, "Two files, one model.", "You write the class; build_runner writes the mapping code.", 6.2, { w: 7.3 });
}

// -------------------------------------------------------- 23 GENERATORS ------
{
  const s = d.content("Code generation", "The generators you will actually add");
  T.table(s, ["What it generates", "Why you would add it"], [
    ["json_serializable", "fromJson / toJson for annotated classes", "every project with an API has this one"],
    ["freezed", "immutable classes, copyWith, sealed unions", "modeling loading / data / error states → Lecture 4"],
    ["retrofit", "a typed dio client from an abstract class", "one place where the endpoints are declared"],
    ["riverpod_generator", "providers from annotated functions", "less boilerplate, and typos become build errors"],
    ["drift", "type-checked SQL, tables and migrations", "local storage that survives offline → Lecture 10"],
    ["mockito", "mocks for your own interfaces", "tests that do not touch the network"],
  ], { y: 2.05, labelW: 2.3, rowH: 0.52, fontSize: 11 });
  T.takeaway(s, "build_runner is an ordinary build step.",
    "It is slow on large projects, it fails when generated files go stale (--delete-conflicting-outputs), and it belongs in CI. It is still worth adding.", 5.95);
}

// ================================================================ SECTION 5 ==
d.divider("Firebase", "A backend you configure instead of writing",
  "flutterfire, Firestore, and the rules that are the only server you get");

// ------------------------------------------------------- 25 FLUTTERFIRE ------
{
  const s = d.content("Firebase", "Wiring Firebase into a Flutter app");
  T.codeBlock(s, [
    "# once per machine",
    "dart pub global activate flutterfire_cli",
    "",
    "# registers iOS/Android/web apps and writes",
    "# lib/firebase_options.dart for you",
    "flutterfire configure --project=my-app",
    "",
    "flutter pub add firebase_core cloud_firestore firebase_auth",
  ], { x: 0.9, y: 1.95, w: 7.4, h: 2.4, fontSize: 9.5 });
  T.codeBlock(s, [
    "// main.dart: before runApp, always",
    "WidgetsFlutterBinding.ensureInitialized();",
    "await Firebase.initializeApp(",
    "  options: DefaultFirebaseOptions.currentPlatform,",
    ");",
    "runApp(const MyApp());",
  ], { x: 0.9, y: 4.55, w: 7.4, h: 2.15, fontSize: 9.5 });
  s.addText("The packages, by name", {
    x: 8.6, y: 1.95, w: 3.83, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0,
  });
  T.lines(s, [
    "firebase_core: required by every other one; it is what initializeApp comes from",
    "cloud_firestore: the document database and its snapshot streams",
    "firebase_auth: sign-in, tokens, and the uid your rules compare against → Lecture 7",
    "firebase_analytics · firebase_crashlytics: Dart APIs, not Android Bundle code",
    "firebase_ai: Gemini from Flutter; it replaces the deprecated google_generative_ai → Lecture 9",
    "firebase_messaging: FCM push, plus a background handler you must register at top level",
  ], { x: 8.6, y: 2.4, w: 3.83, h: 4.3, fontSize: 10.5, paraSpaceAfter: 9 });
  s.addNotes("flutterfire configure is the step the old deck never mentioned. Without it there is no firebase_options.dart, and initializeApp cannot find the project. Run it live; it takes about thirty seconds and rewrites the platform config files for you.");
}

// --------------------------------------------------------- 26 FIRESTORE ------
{
  const s = d.content("Firebase", "Firestore: read, write, and the rule that guards it");
  T.codeBlock(s, [
    "final db = FirebaseFirestore.instance;",
    "",
    "// write: merge, so other fields survive",
    "await db.collection('readings').doc(uid).set(",
    "  {'temp_c': 21.5, 'at': FieldValue.serverTimestamp()},",
    "  SetOptions(merge: true),",
    ");",
    "",
    "// read once",
    "final snap = await db.collection('readings').doc(uid).get();",
    "final data = snap.data();",
    "",
    "// live: a Stream, so StreamBuilder can own it",
    "db.collection('readings').doc(uid).snapshots().listen(...);",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 4.0, fontSize: 9.5 });
  T.codeBlock(s, [
    "match /readings/{userId} {",
    "  // NOT: if request.auth != null",
    "  // that is every signed-in user,",
    "  // writing to everybody's document",
    "  allow read, write: if",
    "    request.auth != null &&",
    "    request.auth.uid == userId;",
    "}",
  ], { x: 8.3, y: 1.95, w: 4.13, h: 2.65, fontSize: 9 });
  T.lines(s, [
    "Firestore rules run on Google's side, so they are the only server-side check you have here.",
    "Reads are billed per document: a query that returns 500 docs costs 500 reads, on every rebuild.",
    "Never store a password or an API key in a document. → Lecture 7",
  ], { x: 8.3, y: 4.8, w: 4.13, h: 1.9, fontSize: 11, paraSpaceAfter: 9 });
  T.takeaway(s, "The rules file is your backend.", "Everything from slide five applies to it.", 6.1, { w: 7.1 });
}

// --------------------------------------------------- 27 CLOUD FUNCTIONS ------
{
  const s = d.content("Firebase", "Cloud Functions, and where Firebase stops");
  T.lines(s, [
    "Cloud Functions for Firebase are the FaaS from section two, wired to Firebase triggers: a Firestore write, a new Auth user, a scheduled job, or an HTTPS callable your app invokes directly.",
    "They are written in TypeScript, JavaScript or Python, not Dart. That is a second language in your repository, and a real cost.",
    "Use them for exactly what the client must not do: verifying a purchase receipt, sending FCM to someone else's device, calling a paid API with your secret key.",
    { text: "Where Firebase stops:", options: { bold: true } },
    "joins, aggregate reporting, anything you want to query in three ways next month, and any bill you need to predict. That is where the Go backend from section three fits.",
  ], { x: 0.9, y: 1.95, w: 7.4, h: 4.4, fontSize: 12.5, paraSpaceAfter: 11 });
  T.codeBlock(s, [
    "// calling one from Flutter",
    "final fn = FirebaseFunctions.instance",
    "    .httpsCallable('verifyPurchase');",
    "",
    "final res = await fn.call({",
    "  'token': purchaseToken,",
    "});",
  ], { x: 8.6, y: 1.95, w: 3.83, h: 2.3, fontSize: 9 });
  s.addText("The auth token travels with the call, so the function knows who is asking without you passing a uid, and without trusting one the client sent.", {
    x: 8.6, y: 4.45, w: 3.83, h: 1.4, fontFace: F, fontSize: 11, color: C.GRAY, margin: 0, valign: "top",
  });
  T.takeaway(s, "Firebase is a backend you configure; Go is one you write.",
    "Most projects start with the first and move the parts it cannot cover to the second.", 5.9);
}

// -------------------------------------------------------------- 28 CLOSING ---
{
  const s = d.closing([
    ["checklist", "Recap", [
      "The client is untrusted input; the server is the only place a rule actually holds",
      "Serverless bills per request and cold-starts; a VPS bills per month and never does",
      "Safe ≠ idempotent: GET and HEAD are safe, PUT and DELETE are only idempotent",
      "Backoff without jitter is still a thundering herd",
      "Generate JSON; never hand-write a fromJson again",
    ]],
    ["calendar", "This week", [
      "Run the Go handler locally and call it from your app with dio",
      "Add explicit timeouts and one retry wrapper to every request in your project",
      "Convert one hand-written model to @JsonSerializable and run build_runner",
      "Open your Firestore rules and check every one compares request.auth.uid",
    ]],
    ["bookopen", "Read more", [
      "go.dev/doc/tutorial/web-service-gin · pkg.go.dev/net/http",
      "pub.dev/packages/dio · pub.dev/packages/json_serializable",
      "firebase.google.com/docs/flutter/setup",
      "developer.mozilla.org · HTTP request methods",
      "aws.amazon.com/builders-library · timeouts, retries and backoff with jitter",
    ]],
  ]);
}

d.write(path.join(__dirname, "Mobile-and-Embedded-Lecture5-v2.pptx"))
  .then((f) => console.log("written:", f, "slides:", d.n));
