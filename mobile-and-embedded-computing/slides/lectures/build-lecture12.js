// ============================================================================
// Lecture 12: Crossing Boundaries
// gRPC, platform channels & FFI, Kotlin Multiplatform.
// Built on the shared template (template.js). 29 source slides → 32.
// ============================================================================
const path = require("path");
const T = require("../assets/template");
const { Deck, C, F, MONO } = T;

const d = new Deck({
  lecture: 12,
  title: "Mobile and Embedded Computing",
  subtitle: "gRPC, platform channels & FFI, Kotlin Multiplatform",
});

// small helper: a stack of hairline boxes with no arrows (a list, not a pipeline)
function boxList(s, x, y, w, items, opts = {}) {
  const h = opts.h || 0.85, gap = opts.gap || 0.22;
  let yy = y;
  items.forEach(([head, sub, style]) => {
    if (style === "black") T.blackbox(s, x, yy, w, h);
    else if (style === "panel") T.panel(s, x, yy, w, h);
    else T.hairbox(s, x, yy, w, h);
    const dark = style === "black";
    s.addText([
      { text: head, options: { bold: true, color: dark ? C.WHITE : C.INK, breakLine: !!sub } },
      ...(sub ? [{ text: sub, options: { fontSize: 10.5, color: dark ? C.DGRAY : C.GRAY } }] : []),
    ], { x: x + 0.15, y: yy, w: w - 0.3, h, fontFace: F, fontSize: 13, align: "center", valign: "middle", margin: 0 });
    yy += h + gap;
  });
}

// ---------------------------------------------------------------- 1 TITLE ---
d.titleSlide();

// ------------------------------------------------------------------ 2 BIO ---
T.bioSlide(d);

// ----------------------------------------------------------- 3 OBJECTIVES ---
T.objectivesSlide(d, [
  ["network", "Cross the network", "A .proto contract, generated stubs, a Go server and a Dart client, and the transport under them"],
  ["arrowleftright", "Cross into native", "MethodChannel and dart:ffi: what each one really costs, measured on your own device"],
  ["blocks", "Share code across platforms", "A Kotlin Multiplatform module with expect/actual, consumed by Android and iOS"],
  ["scale", "Place the boundary", "Run time or compile time, and what each choice costs your team"],
]);

// -------------------------------------------------------------- 4 FRAMING ---
{
  const s = d.content("Crossing boundaries", "Four boundaries, one lecture");
  T.iconGrid(s, [
    ["cloud", "Between machines", "Your app and a server, one round trip apart. gRPC, protobuf, HTTP/2 and HTTP/3."],
    ["arrowleftright", "Between languages", "Dart asking Kotlin or Swift for something. Platform channels: messages, encoded and posted."],
    ["cable", "Between runtimes", "Dart calling C in the same process. dart:ffi: no encoding, no hop, no safety net."],
    ["blocks", "Between platforms", "One body of logic, two operating systems. Kotlin Multiplatform, compiled natively for each."],
  ], { cols: 4, x: 0.9, y: 2.15, cw: 2.6, gx: 0.37 });
  T.takeaway(s, "Every boundary has a cost:",
    "serialization, a thread hop, a round trip, or a second implementation. The engineering is choosing which one you pay.", 5.15);
  s.addNotes("Frame the whole lecture here. The three sections are the same problem at three scales: between machines, inside one process, and across two platforms at build time. Ask which boundary their project already crosses. Almost all of them cross the first two without noticing.");
}

// ================================================================ SECTION 1 ==
d.divider("Boundary one", "Between machines",
  "gRPC, Protocol Buffers, and the transport underneath them");

// ------------------------------------------------------- 6 RPC VS REST ------
{
  const s = d.content("gRPC", "RPC and REST answer different questions");
  T.lines(s, [
    { text: "REST models nouns.", options: { bold: true } },
    "You name resources and use a small fixed set of verbs on them. It is a wonderful fit for a public API that strangers must discover from a URL alone.",
    { text: "RPC models verbs.", options: { bold: true } },
    "You name the operation your app actually needs, such as GetDashboard or SubmitReading, and call it as if it were a local function. The client and the server agree on a list of procedures, not a URL space.",
    { text: "On a phone the difference is round trips.", options: { bold: true } },
    "A resource-shaped API often needs three or four sequential requests to fill one screen, and on cellular each one costs 40–200 ms before any byte of your data moves.",
  ], { x: 0.9, y: 1.95, w: 6.5, h: 3.5, fontSize: 12.5, paraSpaceAfter: 8 });
  T.codeBlock(s, [
    "# REST: four requests, four latencies",
    "GET /users/42",
    "GET /users/42/devices",
    "GET /devices/9/readings?limit=20",
    "GET /devices/9/alerts",
    "",
    "# RPC: one call, one round trip,",
    "# one response shaped like the screen",
    "GetDashboard(user_id: 42) -> Dashboard",
  ], { x: 7.9, y: 2.0, w: 4.53, h: 2.85, fontSize: 9.5 });
  T.lines(s, [
    "Neither one is “modern”. gRPC wins where you own both ends; REST wins where you do not.",
  ], { x: 7.9, y: 5.0, w: 4.53, h: 0.9, fontSize: 11.5, color: C.GRAY });
  T.takeaway(s, "Design the call around the screen,",
    "not around your database tables. The round trip is the expensive part.", 5.75, { w: 6.5 });
}

// -------------------------------------------------------------- 7 .PROTO ---
{
  const s = d.content("gRPC", "Contract first: the .proto file");
  T.codeBlock(s, [
    'syntax = "proto3";',
    "package telemetry.v1;",
    'option go_package = "example.com/telemetry/gen/telemetryv1";',
    "",
    "message Reading {",
    "  string device_id        = 1;   // numbers 1..15 cost one tag byte,",
    "  double temp_c           = 2;   // spend them on your hottest fields",
    "  int64  taken_at_unix_ms = 3;",
    "  bool   from_cache       = 4;",
    "}",
    "",
    "message SubmitReadingRequest  { Reading reading = 1; }",
    "message SubmitReadingResponse { string stored_id = 1; }",
    "message WatchDeviceRequest    { string device_id = 1; }",
    "",
    "service Telemetry {",
    "  rpc SubmitReading(SubmitReadingRequest) returns (SubmitReadingResponse);",
    "  rpc WatchDevice(WatchDeviceRequest) returns (stream Reading);",
    "}",
  ], { x: 0.9, y: 1.95, w: 8.1, h: 4.75, fontSize: 8.5 });
  T.lines(s, [
    { text: "One file, three teams.", options: { bold: true } },
    "The .proto is the only source of truth. Backend, Android and iOS generate from it and build in parallel.",
    { text: "The numbers are the wire format.", options: { bold: true } },
    "Field names never travel. The tag number does, so it can never change.",
    { text: "Enums need a zero.", options: { bold: true } },
    "In proto3 an absent enum decodes as 0, so 0 must mean UNSPECIFIED.",
    { text: "Version the package,", options: { bold: true } },
    "not the file: telemetry.v1 lets you ship a v2 alongside it.",
  ], { x: 9.35, y: 2.0, w: 3.08, h: 4.5, fontSize: 10.5, paraSpaceAfter: 6 });
  s.addNotes("Write this file live if you have five minutes. The thing students miss: proto3 enums must have a zero value, and it must mean 'unspecified', because an absent enum decodes as 0.");
}

// ------------------------------------------------------------- 8 PROTOC ----
{
  const s = d.content("gRPC", "Generating the stubs with protoc");
  T.codeBlock(s, [
    "# --- Go: two plugins, messages and service ---",
    "go install google.golang.org/protobuf/cmd/protoc-gen-go@latest",
    "go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest",
    "",
    "protoc -Iproto \\",
    "  --go_out=gen      --go_opt=paths=source_relative \\",
    "  --go-grpc_out=gen --go-grpc_opt=paths=source_relative \\",
    "  proto/telemetry/v1/telemetry.proto",
    "",
    "# --- Dart: the plugin is a Dart global executable ---",
    "dart pub global activate protoc_plugin",
    'export PATH="$PATH:$HOME/.pub-cache/bin"',
    "",
    "protoc -Iproto --dart_out=grpc:lib/gen \\",
    "  proto/telemetry/v1/telemetry.proto",
  ], { x: 0.9, y: 2.0, w: 7.2, h: 3.95, fontSize: 9 });
  T.lines(s, [
    { text: "What comes out", options: { bold: true } },
    "Reading, SubmitReadingRequest… as real classes with typed getters, equality and a binary codec.",
    "TelemetryClient: the client stub you call.",
    "TelemetryServiceBase / UnimplementedTelemetryServer: the skeleton you implement.",
    { text: "Generated code is build output.", options: { bold: true } },
    "Never edit it. Either commit it and regenerate on change, or run protoc in CI. Pick one and write it down.",
    { text: "pubspec.yaml needs protobuf and grpc.", options: { bold: true } },
  ], { x: 8.45, y: 2.0, w: 3.98, h: 4.0, fontSize: 11, paraSpaceAfter: 8 });
  T.takeaway(s, "The compiler writes the parsing code,",
    "which is the code you would otherwise get subtly wrong.", 6.1);
}

// ---------------------------------------------------------- 9 GO SERVER ----
{
  const s = d.content("gRPC · Go", "A Go server for that service");
  s.addText("Unary: the generated interface, implemented", {
    x: 0.9, y: 1.78, w: 6.5, h: 0.28, fontFace: F, fontSize: 12, bold: true, color: C.INK, margin: 0,
  });
  T.codeBlock(s, [
    "type server struct {",
    "    pb.UnimplementedTelemetryServer   // new RPCs keep compiling",
    "    store *Store",
    "}",
    "func (s *server) SubmitReading(ctx context.Context,",
    "    req *pb.SubmitReadingRequest) (*pb.SubmitReadingResponse, error) {",
    "    r := req.GetReading()",
    "    if r.GetDeviceId() == \"\" {",
    "        return nil, status.Error(codes.InvalidArgument, \"device_id\")",
    "    }",
    "    id, err := s.store.Save(ctx, r)   // ctx = the client's deadline",
    "    if err != nil {",
    "        return nil, status.Error(codes.Internal, \"save failed\")",
    "    }",
    "    return &pb.SubmitReadingResponse{StoredId: id}, nil",
    "}",
    "func main() {",
    "    lis, _ := net.Listen(\"tcp\", \":50051\")",
    "    g := grpc.NewServer()",
    "    pb.RegisterTelemetryServer(g, &server{store: NewStore()})",
    "    log.Fatal(g.Serve(lis))",
    "}",
  ], { x: 0.9, y: 2.08, w: 6.5, h: 4.7, fontSize: 7.5 });
  s.addText("Server streaming", {
    x: 7.75, y: 1.78, w: 4.68, h: 0.28, fontFace: F, fontSize: 12, bold: true, color: C.INK, margin: 0,
  });
  T.codeBlock(s, [
    "func (s *server) WatchDevice(",
    "    req *pb.WatchDeviceRequest,",
    "    stream pb.Telemetry_WatchDeviceServer,",
    ") error {",
    "    ctx := stream.Context()",
    "    for r := range s.store.Sub(ctx, req.DeviceId) {",
    "        if err := stream.Send(r); err != nil {",
    "            return err",
    "        }",
    "    }",
    "    return nil   // ends the stream cleanly",
    "}",
  ], { x: 7.75, y: 2.08, w: 4.68, h: 2.95, fontSize: 7.5 });
  T.lines(s, [
    { text: "The same Go you met in Lecture 5,", options: { bold: true } },
    "now speaking a generated interface instead of hand-written JSON handlers.",
    { text: "ctx is the deadline.", options: { bold: true } },
    "When the phone gives up after 2 s, ctx is canceled here and the query is abandoned, so no work continues for a call nobody is waiting on.",
    { text: "Errors are codes, not strings:", options: { bold: true } },
    "InvalidArgument, NotFound, Unauthenticated, Unavailable. The client branches on them.",
  ], { x: 7.75, y: 5.2, w: 4.68, h: 1.6, fontSize: 10.5, paraSpaceAfter: 5 });
  s.addNotes("Demo: go run ., then grpcurl -plaintext localhost:50051 telemetry.v1.Telemetry/SubmitReading. Point out that UnimplementedTelemetryServer embedding is what lets the server keep compiling when someone adds an RPC to the .proto.");
}

// -------------------------------------------------------- 10 DART CLIENT ---
{
  const s = d.content("gRPC · Dart", "The generated Dart client");
  s.addText("Unary: a deadline and an auth header", {
    x: 0.9, y: 1.78, w: 6.5, h: 0.28, fontFace: F, fontSize: 12, bold: true, color: C.INK, margin: 0,
  });
  T.codeBlock(s, [
    "final channel = ClientChannel('api.example.com', port: 443,",
    "  options: const ChannelOptions(",
    "    credentials: ChannelCredentials.secure(),",
    "    idleTimeout: Duration(seconds: 30),  // let an idle socket close",
    "  ));",
    "final client = TelemetryClient(channel);",
    "",
    "try {",
    "  final res = await client.submitReading(",
    "    SubmitReadingRequest(reading: Reading()",
    "      ..deviceId = id",
    "      ..tempC = 21.5",
    "      ..takenAtUnixMs = Int64(nowMs)),",
    "    options: CallOptions(",
    "      timeout: const Duration(seconds: 2),",
    "      metadata: {'authorization': 'Bearer $token'},",
    "    ),",
    "  );",
    "  debugPrint(res.storedId);",
    "} on GrpcError catch (e) {",
    "  if (e.code == StatusCode.deadlineExceeded) { /* retry */ }",
    "}",
  ], { x: 0.9, y: 2.08, w: 6.5, h: 4.7, fontSize: 7.5 });
  s.addText("Server streaming is just a Dart Stream", {
    x: 7.75, y: 1.78, w: 4.68, h: 0.28, fontFace: F, fontSize: 12, bold: true, color: C.INK, margin: 0,
  });
  T.codeBlock(s, [
    "final sub = client",
    "    .watchDevice(WatchDeviceRequest()..deviceId = id)",
    "    .listen(_onReading, onError: _onError);",
    "",
    "@override",
    "void dispose() {",
    "  sub.cancel();         // stop the server sending",
    "  channel.shutdown();   // and let the radio sleep",
    "  super.dispose();",
    "}",
  ], { x: 7.75, y: 2.08, w: 4.68, h: 2.6, fontSize: 7.5 });
  T.lines(s, [
    { text: "It looks like a local call.", options: { bold: true } },
    "That is the point of RPC, and the danger. It is still the network.",
    { text: "Always set a deadline.", options: { bold: true } },
    "Without one, a stalled call holds a UI state forever.",
    { text: "Cancel in dispose().", options: { bold: true } },
    "An open stream keeps the radio and the server busy for a screen the user already left.",
  ], { x: 7.75, y: 4.9, w: 4.68, h: 1.9, fontSize: 10.5, paraSpaceAfter: 6 });
}

// ------------------------------------------------------ 11 PROTOBUF WIRE ---
{
  const s = d.content("Protocol Buffers", "Why protobuf is smaller, and by how much");
  T.lines(s, [
    { text: "Four mechanisms, all of them structural:", options: { bold: true } },
    "It is binary: no quotes, commas, braces or whitespace, and numbers are not re-rendered as text.",
    "Fields are identified by number, not name: a tag byte packs the field number and a 3-bit wire type, so \"taken_at_unix_ms\" costs 1 byte on the wire instead of 18.",
    "Integers are varints: 7 bits of value per byte, so 300 is AC 02 rather than four fixed bytes, and small numbers cost one byte.",
    "Nothing is sent for a field left at its default.",
    { text: "How much smaller? That depends entirely on your data.", options: { bold: true } },
    "A message of short integers with long field names shrinks enormously. A message that is one long UTF-8 string barely shrinks at all, because the string is the same bytes in both formats. And gzip, which almost every JSON API and gRPC channel already applies, compresses away exactly the repetition protobuf never sends, narrowing the gap further.",
  ], { x: 0.9, y: 1.9, w: 7.1, h: 4.4, fontSize: 11.5, paraSpaceAfter: 8 });
  T.codeBlock(s, [
    "# JSON: 38 bytes, key names ride along",
    '{"device_id":"esp32-a1","temp_c":21.5}',
    "",
    "# protobuf: 19 bytes for this message",
    "0A 08 65 73 70 33 32 2D 61 31",
    "#  |  |  \\__ 'esp32-a1' ______/",
    "#  |  len=8",
    "#  field 1, wire type 2 (LEN)",
    "11 00 00 00 00 00 80 35 40",
    "#  field 2, wire type 1 (I64) = 21.5",
    "",
    "# varint: 300 -> AC 02   (2 bytes, not 4)",
  ], { x: 8.3, y: 2.0, w: 4.13, h: 3.35, fontSize: 8 });
  T.takeaway(s, "Quote the mechanism, not a multiplier.",
    "“3–10× smaller” and “30–50% smaller” are both somebody else's payload. Measure yours.", 5.65);
  s.addNotes("This slide replaces two contradicting claims in the old deck (p5 said 3-10x, p14 said 30-50%). Neither was sourced. The honest answer is that the ratio is a property of the schema and the data. Encourage students to serialize one real message both ways and print the byte counts.");
}

// ---------------------------------------------------- 12 SCHEMA EVOLUTION --
{
  const s = d.content("Protocol Buffers", "Schema evolution without breaking old apps");
  T.codeBlock(s, [
    "message Reading {",
    "  string device_id        = 1;",
    "  double temp_c           = 2;",
    "  int64  taken_at_unix_ms = 3;",
    "  bool   from_cache       = 4;",
    "",
    "  double humidity         = 5;   // added in v2",
    "  optional int32 rssi     = 6;   // explicit presence:",
    "                                 // tells 0 apart from absent",
    "",
    "  reserved 7;                    // 7 was battery_pct, deleted.",
    '  reserved "battery_pct";        // never reuse a number or a name',
    "}",
  ], { x: 0.9, y: 1.95, w: 6.5, h: 3.45, fontSize: 8.5 });
  T.lines(s, [
    { text: "Old app, new server (forward).", options: { bold: true } },
    "The parser hits tag 5, reads its wire type, and knows exactly how many bytes to skip. It does not crash; proto3 even keeps the unknown bytes and re-emits them if it echoes the message back.",
    { text: "New server, old app (backward).", options: { bold: true } },
    "The missing field decodes to its default: 0, empty string, empty list. Which means “absent” and “zero” are the same thing unless you mark the field optional.",
    { text: "The rules that keep both true:", options: { bold: true } },
    "never renumber a field, never reuse a deleted number, never change a field's type, and reserve what you remove.",
  ], { x: 7.9, y: 2.0, w: 4.53, h: 4.2, fontSize: 11, paraSpaceAfter: 8 });
  T.takeaway(s, "Users do not update.",
    "A year-old build is still on the network, and the wire format is the compatibility contract.", 5.65, { w: 6.5 });
}

// ------------------------------------------------------- 13 CALL SHAPES ----
{
  const s = d.content("gRPC", "Four call shapes, not one");
  const cell = (x, y, name, sig, body) => {
    s.addText(name, { x, y, w: 5.6, h: 0.32, fontFace: F, fontSize: 15, bold: true, color: C.INK, margin: 0 });
    s.addText(sig, { x, y: y + 0.36, w: 5.6, h: 0.3, fontFace: MONO, fontSize: 9.5, color: C.BLUE, margin: 0 });
    s.addText(body, { x, y: y + 0.72, w: 5.6, h: 0.85, fontFace: F, fontSize: 11.5, color: C.GRAY, margin: 0 });
  };
  cell(0.9, 2.0, "Unary", "rpc GetDevice(GetDeviceRequest) returns (Device);",
    "One request, one response. The default, and what almost every screen load should be.");
  cell(7.0, 2.0, "Server streaming", "rpc WatchDevice(WatchDeviceRequest) returns (stream Reading);",
    "One request, many responses. Live readings, a feed, or progress on a long job, instead of polling.");
  cell(0.9, 3.75, "Client streaming", "rpc UploadBatch(stream Reading) returns (UploadSummary);",
    "Many requests, one response. Flush a queue of offline readings, upload a file in chunks, and get one acknowledgement.");
  cell(7.0, 3.75, "Bidirectional streaming", "rpc Session(stream ClientMsg) returns (stream ServerMsg);",
    "Both directions, independently, on one connection. Chat, presence, live location: the WebSocket case from Lecture 8, with a schema.");
  T.hline(s, 6.45, 2.0, 0);
  T.takeaway(s, "The shape is part of the contract.",
    "Changing a method from unary to streaming is a breaking change: it changes the generated signature on every client.", 5.5);
  s.addNotes("The old deck listed only server-streaming and bidirectional. Client streaming is the one students actually need for offline sync: a queue of readings drained upstream with a single summary back.");
}

// ---------------------------------------------------------- 14 HTTP/2 ------
{
  const s = d.content("Transport", "HTTP/2: one connection, many streams");
  T.lines(s, [
    "HTTP/1.1 gives you one request at a time per connection. Browsers hid that by opening six connections; a phone pays for every one of them in handshakes and radio time.",
    "HTTP/2 splits everything into binary frames tagged with a stream id, so many calls interleave over a single TCP connection. gRPC does not add this. gRPC is defined on top of it: one RPC is one HTTP/2 stream.",
    "HPACK removes the other tax. Headers go into a static table of common names and a dynamic table shared by both ends, so a repeated Authorization header costs an index, not 800 bytes.",
    { text: "What HTTP/2 does not fix: TCP still delivers in order.", options: { bold: true } },
    "One lost packet stalls every stream on that connection until it is retransmitted. That is head-of-line blocking moved down a layer, and a lossy mobile link is where it shows.",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 4.0, fontSize: 12.5, paraSpaceAfter: 12 });
  boxList(s, 8.3, 2.05, 4.13, [
    ["One TCP + TLS connection", "handshake once, reuse for every call", "black"],
    ["Binary framing", "HEADERS and DATA frames, stream-tagged", "hair"],
    ["Many streams in flight", "interleaved, independently flow-controlled", "hair"],
    ["HPACK", "repeated headers cost a table index", "panel"],
  ], { h: 0.95, gap: 0.2 });
  T.takeaway(s, "One connection, kept warm.",
    "That is most of gRPC's mobile advantage, before a single byte of protobuf is counted.", 6.2, { w: 7.1 });
}

// ---------------------------------------------------------- 15 HTTP/3 ------
{
  const s = d.content("Transport", "HTTP/3 and QUIC: the mobile case");
  T.lines(s, [
    "QUIC moves the whole thing onto UDP and implements streams itself. A lost packet now stalls only the stream it belonged to, so the head-of-line blocking that HTTP/2 pushed into TCP goes away.",
    "TLS 1.3 is folded into the transport handshake: a new connection is one round trip, and a resumed one can be zero, with the first request riding along with the handshake. On a 150 ms link that is a visible difference.",
    { text: "The feature that only matters on a phone: connection migration.", options: { bold: true } },
    "A QUIC connection is identified by a connection ID, not by the IP/port pair. Walk out of Wi-Fi onto 5G and the connection survives; a TCP connection dies and every stream on it restarts.",
    { text: "Where gRPC stands today:", options: { bold: true } },
    "the wire protocol is specified over HTTP/2. HTTP/3 usually reaches you at the edge, where a load balancer or CDN speaks HTTP/3 to the device and HTTP/2 to your service, or through Cronet on Android. Treat it as a deployment choice, not a code change.",
  ], { x: 0.9, y: 1.9, w: 7.1, h: 4.3, fontSize: 11.5, paraSpaceAfter: 9 });
  boxList(s, 8.3, 2.0, 4.13, [
    ["QUIC over UDP", "independent streams, no shared stall", "black"],
    ["1-RTT handshake", "0-RTT when resuming a session", "hair"],
    ["Connection IDs", "survives Wi-Fi → 5G handover", "hair"],
    ["In practice", "HTTP/3 at the edge, HTTP/2 behind it", "panel"],
  ], { h: 0.95, gap: 0.2 });
  T.takeaway(s, "Handshakes and reconnects are the mobile cost.",
    "QUIC addresses both, which is why it belongs in the same argument as the radio tail.", 6.3, { w: 7.1 });
}

// -------------------------------------------- 16 DEADLINES / RADIO / iOS ---
{
  const s = d.content("gRPC on a phone", "Deadlines, cancellation and the radio tail");
  T.lines(s, [
    { text: "A deadline is not a client-side timeout.", options: { bold: true } },
    "It travels with the call and propagates through every service behind it. When it expires, work stops everywhere, so nothing keeps burning CPU for a screen nobody is looking at.",
    { text: "The radio does not switch off immediately.", options: { bold: true } },
    "After a transmission the cellular radio stays in a high-power state for several seconds before stepping down. That period is the tail, and its duration is set by the network operator, not by you. Four chatty requests spread over ten seconds keep it awake the whole time; one multiplexed burst lets it sleep.",
    { text: "Keepalive pings are not free.", options: { bold: true } },
    "They hold the connection open and wake the radio. Tune the interval; do not leave a 10-second ping running in the background.",
  ], { x: 0.9, y: 1.9, w: 7.1, h: 4.0, fontSize: 11.5, paraSpaceAfter: 8 });
  boxList(s, 8.3, 2.0, 4.13, [
    ["Burst", "everything the screen needs, at once", "black"],
    ["Tail", "radio stays high-power for seconds", "hair"],
    ["Idle", "back to low power, battery saved", "panel"],
  ], { h: 0.9, gap: 0.22 });
  s.addText([
    { text: "iOS caveat.  ", options: { bold: true, color: C.INK } },
    { text: "A suspended app gets no CPU and its sockets are torn down, so a long-lived gRPC stream does not survive backgrounding. URLSession background transfers cover plain HTTP uploads and downloads only, and cannot carry a gRPC stream. Design for it: reconnect on resume, use a silent push or BGTaskScheduler to be woken, and make the server's state resumable. Android's Doze and App Standby do the same thing with different names.",
      options: { color: C.GRAY } },
  ], { x: 8.3, y: 5.4, w: 4.13, h: 1.4, fontFace: F, fontSize: 9.5, margin: 0, valign: "top" });
  T.takeaway(s, "Batch, set a deadline, cancel on dispose.",
    "Three habits that show up as battery life in a review.", 6.05, { w: 7.1 });
}

// ------------------------------------------------------- 17 gRPC-WEB ------
{
  const s = d.content("gRPC", "gRPC-Web and Connect: the browser problem");
  T.lines(s, [
    { text: "A browser cannot speak gRPC.", options: { bold: true } },
    "Not for lack of trying: fetch and XHR give JavaScript no way to control HTTP/2 frames, and no way to read trailers. gRPC delivers the call's status in a trailer, after the body. Full-duplex streaming is not available either.",
    { text: "gRPC-Web", options: { bold: true } },
    "is a different wire encoding that puts the trailers in the body, works over HTTP/1.1, and supports unary and server-streaming only. It needs a translating proxy in front of your service, such as Envoy or grpcwebproxy.",
    { text: "Connect", options: { bold: true } },
    "is the pragmatic successor: one Go handler serves the gRPC, gRPC-Web and Connect protocols on the same route, and the Connect protocol is plain HTTP that curl can call. No proxy in the path.",
    { text: "Why you care in this course:", options: { bold: true } },
    "your Flutter app builds for web too, and that build cannot open a raw gRPC connection.",
  ], { x: 0.9, y: 1.9, w: 7.1, h: 4.3, fontSize: 11.5, paraSpaceAfter: 7 });
  T.codeBlock(s, [
    "// one Go server, three protocols",
    "mux := http.NewServeMux()",
    "path, h := telemetryv1connect.",
    "    NewTelemetryHandler(&server{})",
    "mux.Handle(path, h)",
    "",
    "// h2c: HTTP/2 without TLS, for local dev",
    "http.ListenAndServe(\":8080\",",
    "    h2c.NewHandler(mux, &http2.Server{}))",
  ], { x: 8.3, y: 2.0, w: 4.13, h: 2.75, fontSize: 8.5 });
  T.lines(s, [
    "Mobile keeps the fast path; the web build gets a protocol it can actually speak.",
  ], { x: 8.3, y: 4.95, w: 4.13, h: 0.9, fontSize: 11, color: C.GRAY });
  T.takeaway(s, "The boundary has a shape here too:",
    "what the browser sandbox will let you send is part of your architecture.", 6.3, { w: 7.1 });
}

// ================================================================ SECTION 2 ==
d.divider("Boundaries two and three", "Between languages and runtimes",
  "Platform channels, dart:ffi, and what each one costs");

// ------------------------------------------------------- 19 TWO RUNTIMES ---
{
  const s = d.content("Inside the app", "Two runtimes sharing one process");
  T.lines(s, [
    "Your Flutter app is a native application. On Android an Activity, on iOS a UIViewController. That embedder loads the Flutter engine and hands it a surface, a message loop and system events.",
    "Inside that process there are two managed worlds. Your Dart code runs in an isolate with its own heap and its own garbage collector. The platform runtime, ART on Android and the Objective-C/Swift runtime on iOS, has its own heap and its own rules. Neither can see the other's objects.",
    { text: "So every crossing is one of exactly two things:", options: { bold: true } },
    "encode a message and hand it to the other thread (a platform channel), or drop to the one thing both sides already agree on, the C ABI (dart:ffi).",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 3.6, fontSize: 12.5, paraSpaceAfter: 12 });
  boxList(s, 8.3, 2.0, 4.13, [
    ["Platform thread", "the Activity / ViewController, all OS APIs", "hair"],
    ["UI thread", "your Dart isolate: widgets, state, your heap", "black"],
    ["Raster thread", "Impeller submits the frame to the GPU", "hair"],
    ["I/O thread", "asset loading, image decoding", "panel"],
  ], { h: 0.95, gap: 0.2 });
  T.takeaway(s, "Different heaps, different threads.",
    "Everything in this section is a consequence of those two facts.", 5.85, { w: 7.1 });
}

// ------------------------------------------------- 20 METHODCHANNEL BOTH ---
{
  const s = d.content("Platform channels", "MethodChannel, both sides");
  s.addText("Dart", { x: 0.9, y: 1.78, w: 5.9, h: 0.28, fontFace: F, fontSize: 12, bold: true, color: C.INK, margin: 0 });
  T.codeBlock(s, [
    "class Battery {",
    "  static const _ch = MethodChannel('dev.upb.mec/battery');",
    "",
    "  static Future<int> level() async {",
    "    try {",
    "      return await _ch.invokeMethod<int>('getLevel') ?? -1;",
    "    } on PlatformException catch (e) {",
    "      // e.code is the string the native side chose",
    "      debugPrint('battery failed: ${e.code}');",
    "      return -1;",
    "    } on MissingPluginException {",
    "      return -1;   // not registered on this platform",
    "    }",
    "  }",
    "}",
  ], { x: 0.9, y: 2.08, w: 5.9, h: 3.55, fontSize: 8 });
  s.addText("Kotlin: MainActivity", { x: 7.0, y: 1.78, w: 5.43, h: 0.28, fontFace: F, fontSize: 12, bold: true, color: C.INK, margin: 0 });
  T.codeBlock(s, [
    "override fun configureFlutterEngine(engine: FlutterEngine) {",
    "  super.configureFlutterEngine(engine)",
    "  val ch = MethodChannel(engine.dartExecutor.binaryMessenger,",
    "                         \"dev.upb.mec/battery\")",
    "  ch.setMethodCallHandler { call, result ->",
    "    if (call.method == \"getLevel\") result.success(level())",
    "    else result.notImplemented()",
    "  }",
    "}",
  ], { x: 7.0, y: 2.08, w: 5.43, h: 2.35, fontSize: 7.5 });
  s.addText("Swift: AppDelegate", { x: 7.0, y: 4.52, w: 5.43, h: 0.28, fontFace: F, fontSize: 12, bold: true, color: C.INK, margin: 0 });
  T.codeBlock(s, [
    "let ch = FlutterMethodChannel(name: \"dev.upb.mec/battery\",",
    "        binaryMessenger: controller.binaryMessenger)",
    "ch.setMethodCallHandler { call, result in",
    "  guard call.method == \"getLevel\" else {",
    "    result(FlutterMethodNotImplemented); return",
    "  }",
    "  result(Int(UIDevice.current.batteryLevel * 100))",
    "}",
  ], { x: 7.0, y: 4.82, w: 5.43, h: 2.0, fontSize: 7 });
  T.lines(s, [
    "The channel name is a string on both sides, so a typo is a runtime MissingPluginException, not a compile error.",
    "The handler runs on the platform's main thread: do the work elsewhere and call result later. EventChannel for streams.",
  ], { x: 0.9, y: 5.8, w: 5.9, h: 1.0, fontSize: 9.5, paraSpaceAfter: 6 });
  s.addNotes("Live: add this to the sample app and hot-reload, then note that hot reload does not reload the Kotlin side; a native change needs a full restart.");
}

// ------------------------------------------------------ 21 CHANNEL COST ----
{
  const s = d.content("Platform channels", "What a channel call actually costs");
  T.lines(s, [
    { text: "Two things are being paid for, and only one of them is constant.", options: { bold: true } },
    "The thread hops are a roughly fixed overhead: two queue posts and two context switches, whose cost depends on how busy those threads already are. Because the call is asynchronous it also inherits the UI thread's queue: if a frame is being built, your result waits behind it. That is where tail latency comes from.",
    "The encoding is not fixed at all. StandardMessageCodec recurses over the object graph and writes every element, so the cost grows linearly with what you send. A map of five strings costs nothing; a list of 100,000 doubles is a different matter.",
    { text: "The Android trap:", options: { bold: true } },
    "a Dart List<double> decodes into 100,000 boxed java.lang.Double objects, and the garbage collector notices. Send a Float64List or Uint8List instead: the codec has a fast path that passes typed data through as a raw buffer, unboxed and copied once.",
  ], { x: 0.9, y: 1.95, w: 7.1, h: 3.9, fontSize: 11.5, paraSpaceAfter: 10 });
  T.flowDown(s, [
    ["invokeMethod", "arguments prepared on the UI thread", "black"],
    ["Encode", "the codec walks the object graph", "hair"],
    ["Hop", "posted to the platform thread's queue", "hair"],
    ["Native handler", "your Kotlin / Swift runs", "panel"],
    ["Encode + hop back", "result returns to the UI thread", "hair"],
  ], { x: 8.3, y: 2.0, w: 4.13, h: 0.75, gap: 0.2 });
  T.takeaway(s, "A channel call is a message, not a function call.",
    "Its cost scales with what you put in the message.", 5.95, { w: 7.1 });
}

// ------------------------------------------------------- 22 MEASURE IT -----
{
  const s = d.content("Platform channels vs FFI", "Measuring channel and FFI call cost");
  T.codeBlock(s, [
    "// release build, on a real device, never the simulator",
    "const ch = MethodChannel('dev.upb.mec/bench');",
    "const n = 10000;",
    "// 1. warm up: the first call also sets the channel up",
    "for (var i = 0; i < 200; i++) { await ch.invokeMethod('noop'); }",
    "",
    "// 2. empty round trip: the floor for a channel call",
    "var sw = Stopwatch()..start();",
    "for (var i = 0; i < n; i++) { await ch.invokeMethod('noop'); }",
    "print('channel noop: ${sw.elapsedMicroseconds / n} us/call');",
    "",
    "// 3. the slope: repeat with 1k, 16k, then 256k doubles",
    "final payload = Float64List(1024);",
    "sw = Stopwatch()..start();",
    "for (var i = 0; i < n; i++) { await ch.invokeMethod('echo', payload); }",
    "print('channel 1k:   ${sw.elapsedMicroseconds / n} us/call');",
    "",
    "// 4. the same nothing, through FFI: a direct C call",
    "final noop = lib.lookupFunction<Void Function(), void Function()>('nop');",
    "sw = Stopwatch()..start();",
    "for (var i = 0; i < n; i++) { noop(); }",
    "print('ffi noop:     ${sw.elapsedMicroseconds * 1000 / n} ns/call');",
  ], { x: 0.9, y: 1.9, w: 7.5, h: 4.85, fontSize: 7.5 });
  T.lines(s, [
    { text: "What you will find, and what you should say.", options: { bold: true } },
    "A channel call is dominated by serialization plus a thread hop, so it lands in the microseconds-to-low-milliseconds range and grows with payload size and with how busy the two threads are.",
    "An FFI call is a direct call into machine code already in your address space: no encoding, no hop, no queue. Orders of magnitude cheaper, and flat in payload size.",
    { text: "Quoted numbers disagree.", options: { bold: true } },
    "One slide of last year's deck said 0.5–2 ms; the next said 2 µs. Both unsourced, a factor of a thousand apart, and neither one described your phone.",
    { text: "Report the shape. Measure the number.", options: { bold: true } },
  ], { x: 8.7, y: 2.0, w: 3.73, h: 4.7, fontSize: 10.5, paraSpaceAfter: 8 });
  s.addNotes("This slide exists specifically to fix the contradiction between p27 and p28 of the old deck. Do not replace one invented number with another. Have students run this on their own phone and compare results across the room; the spread between devices is itself the lesson.");
}

// ----------------------------------------------------------- 23 dart:ffi ---
{
  const s = d.content("dart:ffi", "Calling C directly");
  T.codeBlock(s, [
    "// C: libsig.c, compiled and linked into the app",
    "// typedef struct { double mean; double peak; } Stats;",
    "// void analyze(const double *xs, int32_t n, Stats *out);",
    "final class Stats extends Struct {          // the Dart view of it",
    "  @Double() external double mean;",
    "  @Double() external double peak;",
    "}",
    "final lib = Platform.isAndroid",
    "    ? DynamicLibrary.open('libsig.so')      // Android: shared object",
    "    : DynamicLibrary.process();             // iOS: statically linked in",
    "final _analyze = lib.lookupFunction<",
    "    Void Function(Pointer<Double>, Int32, Pointer<Stats>),  // C signature",
    "    void Function(Pointer<Double>, int, Pointer<Stats>)     // Dart side",
    ">('analyze');",
    "(double, double) analyze(Float64List xs) {",
    "  final arena = Arena();                    // frees everything at the end",
    "  try {",
    "    final buf = arena<Double>(xs.length);",
    "    buf.asTypedList(xs.length).setAll(0, xs);   // one copy in",
    "    final out = arena<Stats>();",
    "    _analyze(buf, xs.length, out);             // <- the direct call",
    "    return (out.ref.mean, out.ref.peak);",
    "  } finally { arena.releaseAll(); }",
    "}",
  ], { x: 0.9, y: 1.9, w: 7.5, h: 4.9, fontSize: 7 });
  T.lines(s, [
    { text: "You own the memory.", options: { bold: true } },
    "There is no GC on the other side. Allocate, free, or let an Arena do it, and use NativeFinalizer when a native handle must outlive a function.",
    { text: "The call blocks the isolate.", options: { bold: true } },
    "The Dart thread becomes the native thread. A 30 ms C function is 30 ms of dropped frames, so run it on a worker isolate.",
    { text: "Android: FFI reaches C, not Java.", options: { bold: true } },
    "Calling a Kotlin API means Dart → C → JNI, with reference bookkeeping on top; for a one-shot call a MethodChannel is often cheaper. Use jnigen if you need it often.",
    { text: "iOS: Apple's toolchain links C, C++ and Objective-C into the same binary,", options: { bold: true } },
    "so the symbols are already in the process and DynamicLibrary.process() finds them.",
    { text: "Don't hand-write bindings:", options: { bold: true } },
    "ffigen generates all of the above from the C header.",
  ], { x: 8.7, y: 1.95, w: 3.73, h: 4.9, fontSize: 9.5, paraSpaceAfter: 6 });
}

// -------------------------------------------------------- 24 BIG BUFFERS ---
{
  const s = d.content("Crossing with data", "Big buffers: move the pointer, not the bytes");
  T.lines(s, [
    "A 4K camera frame is 3840 × 2160 × 4 bytes, about 33 MB, thirty times a second. Send that through a platform channel and it is copied at least three times: native buffer → codec buffer → Dart heap. The memory bus saturates, the CPU caches are flushed, and the frames you are rendering suffer for it.",
  ], { x: 0.9, y: 1.95, w: 11.53, h: 1.0, fontSize: 12.5 });
  T.iconGrid(s, [
    ["memory", "External typed data", "A Uint8List that is a view onto native memory instead of a copy of it. Dart reads the bytes the C code wrote: zero copies, and a finalizer frees them."],
    ["arrowleftright", "Ownership transfer", "Isolate.exit and TransferableTypedData hand a buffer to another isolate as an O(1) page remap, not a deep copy. The sender loses access, which is the guarantee that makes it safe."],
    ["image", "Texture registry", "The native side renders into a GPU texture and registers it; Flutter composites it straight into the scene. Camera preview and video never touch the Dart heap at all."],
  ], { x: 0.9, y: 3.15, cw: 3.53, gx: 0.47 });
  T.takeaway(s, "Data big enough to matter should not be serialized at all.",
    "Share it, or transfer it.", 5.85);
}

// -------------------------------------------------- 25 CONTROL / COMPUTE ---
{
  const s = d.content("Platform channels vs FFI", "Channels for control, FFI for compute");
  T.table(s, ["Platform channels", "dart:ffi"], [
    ["Call style", "asynchronous message passing", "synchronous direct call"],
    ["Cost", "encode + thread hop, grows with payload", "a function call; flat in payload"],
    ["Data", "copied and re-encoded on both sides", "shared memory through a pointer"],
    ["Threading", "hops to the platform thread and back", "runs on the calling isolate's thread"],
    ["Reaches", "any Kotlin / Swift API, plugins included", "C ABI only: C, C++, Rust, Go c-archive"],
    ["Fails as", "a PlatformException you can catch", "a segfault that takes the app with it"],
  ], { y: 2.05, labelW: 1.75, rowH: 0.5, fontSize: 11 });
  T.hline(s, 0.9, 5.6, 11.53);
  s.addText([
    { text: "Channels for control.", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "Low-frequency intents where the boundary is crossed once per user action: open a document, read the battery, ask for a permission, start a scan. Convenience beats speed, and the whole native SDK is available.", options: { color: C.GRAY } },
  ], { x: 0.9, y: 5.8, w: 5.6, h: 1.0, fontFace: F, fontSize: 12.5, margin: 0, valign: "top" });
  s.addText([
    { text: "FFI for compute.", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "Anything on a per-frame or per-sample path: audio, signal processing, on-device inference, image pipelines. No encoding, no hop, and no GC on the other side, so the memory is yours to manage.", options: { color: C.GRAY } },
  ], { x: 7.0, y: 5.8, w: 5.6, h: 1.0, fontFace: F, fontSize: 12.5, margin: 0, valign: "top" });
  s.addNotes("This is the sentence to leave the section on. If a student remembers one thing from the middle third of this lecture, it should be 'control vs compute'.");
}

// ================================================================ SECTION 3 ==
d.divider("Boundary four", "Between platforms",
  "Kotlin Multiplatform: the shared module from Lecture 1");

// --------------------------------------------------------- 27 KMP MODEL ---
{
  const s = d.content("Kotlin Multiplatform", "Share the logic, keep the UI");
  T.blackbox(s, 0.9, 2.0, 6.3, 0.95);
  s.addText([
    { text: "Shared Kotlin module", options: { bold: true, breakLine: true } },
    { text: "models · networking · storage · business rules", options: { fontSize: 11, color: C.DGRAY } },
  ], { x: 0.9, y: 2.0, w: 6.3, h: 0.95, fontFace: F, fontSize: 14, color: C.WHITE, align: "center", valign: "middle", margin: 0 });
  T.arrow(s, 2.45, 2.95, 0, 0.42);
  T.arrow(s, 5.65, 2.95, 0, 0.42);
  T.hairbox(s, 0.9, 3.4, 2.95, 1.05);
  s.addText([
    { text: "Android app", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "Jetpack Compose UI", options: { fontSize: 11, color: C.GRAY } },
  ], { x: 0.9, y: 3.4, w: 2.95, h: 1.05, fontFace: F, fontSize: 13, align: "center", valign: "middle", margin: 0 });
  T.hairbox(s, 4.25, 3.4, 2.95, 1.05);
  s.addText([
    { text: "iOS app", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "SwiftUI, or Compose Multiplatform", options: { fontSize: 11, color: C.GRAY } },
  ], { x: 4.25, y: 3.4, w: 2.95, h: 1.05, fontFace: F, fontSize: 13, align: "center", valign: "middle", margin: 0 });
  s.addText("expect / actual covers the few pieces that must differ", {
    x: 0.9, y: 4.65, w: 6.3, h: 0.32, fontFace: MONO, fontSize: 10.5, color: C.GRAY, align: "center", margin: 0,
  });
  T.lines(s, [
    "The Kotlin in that top box is not interpreted and not bridged. It is compiled by Kotlin/JVM for Android and by Kotlin/Native for iOS, into ordinary machine code the platform calls directly.",
    "You choose how much goes in it. A models-and-networking module is a perfectly good result; so is everything but the views.",
    { text: "Stable since November 2023.", options: { bold: true } },
    "Compose Multiplatform for iOS stable since May 2025; Kotlin 2.4 is current.",
    { text: "In production at McDonald's, Netflix and Forbes", options: { bold: true } },
    "so it is a mature, low-risk choice.",
  ], { x: 7.9, y: 2.0, w: 4.53, h: 4.0, fontSize: 11.5, paraSpaceAfter: 9 });
  T.takeaway(s, "Lecture 1 called this the third strategy.",
    "Here is what it actually looks like in a repository.", 5.5, { w: 6.3 });
}

// ---------------------------------------------------- 28 EXPECT / ACTUAL ---
{
  const s = d.content("Kotlin Multiplatform", "expect and actual, in real code");
  s.addText("commonMain: written once", { x: 0.9, y: 1.78, w: 6.0, h: 0.28, fontFace: F, fontSize: 12, bold: true, color: C.INK, margin: 0 });
  T.codeBlock(s, [
    "// the shape, with no implementation",
    "expect class KeyValueStore(name: String) {",
    "    fun put(key: String, value: String)",
    "    fun get(key: String): String?",
    "}",
    "",
    "// everything else is ordinary Kotlin, shared as-is",
    "class ReadingsRepository(",
    "    private val http: HttpClient,      // Ktor, multiplatform",
    "    private val store: KeyValueStore,",
    ") {",
    "    suspend fun latest(deviceId: String): Reading {",
    "        val cached = store.get(deviceId)",
    "        return runCatching {",
    "            http.get(\"$BASE/devices/$deviceId/latest\").body<Reading>()",
    "                .also { store.put(deviceId, Json.encodeToString(it)) }",
    "        }.getOrElse { cached?.let(Json::decodeFromString) ?: throw it }",
    "    }",
    "}",
  ], { x: 0.9, y: 2.08, w: 6.0, h: 4.35, fontSize: 7.5 });
  s.addText("androidMain", { x: 7.4, y: 1.78, w: 5.03, h: 0.28, fontFace: F, fontSize: 12, bold: true, color: C.INK, margin: 0 });
  T.codeBlock(s, [
    "actual class KeyValueStore actual constructor(name: String) {",
    "    private val prefs = appContext",
    "        .getSharedPreferences(name, Context.MODE_PRIVATE)",
    "    actual fun put(key: String, value: String) =",
    "        prefs.edit().putString(key, value).apply()",
    "    actual fun get(key: String): String? =",
    "        prefs.getString(key, null)",
    "}",
  ], { x: 7.4, y: 2.08, w: 5.03, h: 2.15, fontSize: 7.5 });
  s.addText("iosMain", { x: 7.4, y: 4.38, w: 5.03, h: 0.28, fontFace: F, fontSize: 12, bold: true, color: C.INK, margin: 0 });
  T.codeBlock(s, [
    "actual class KeyValueStore actual constructor(name: String) {",
    "    private val defaults = NSUserDefaults(suiteName = name)",
    "    actual fun put(key: String, value: String) =",
    "        defaults.setObject(value, forKey = key)",
    "    actual fun get(key: String): String? =",
    "        defaults.stringForKey(key)",
    "}",
  ], { x: 7.4, y: 4.68, w: 5.03, h: 1.95, fontSize: 7.5 });
  T.lines(s, [
    "iosMain calls NSUserDefaults directly: Kotlin/Native exposes the platform frameworks as Kotlin APIs, with no bridge and no wrapper library.",
  ], { x: 0.9, y: 6.55, w: 6.0, h: 0.4, fontSize: 10, color: C.GRAY });
  s.addNotes("Two warnings worth saying aloud: the compiler enforces that every expect has an actual for every target, so a missing implementation is a build error, not a crash. And most of the time you need far less expect/actual than you assume, because Ktor and kotlinx already ship multiplatform engines.");
}

// ------------------------------------------------------- 29 SOURCE SETS ----
{
  const s = d.content("Kotlin Multiplatform", "Source sets: where the code lives");
  T.codeBlock(s, [
    "shared/",
    "  build.gradle.kts",
    "  src/",
    "    commonMain/kotlin/     # most of the module lives here",
    "    commonTest/kotlin/     # tests that run on every target",
    "    androidMain/kotlin/",
    "    iosMain/kotlin/        # iosArm64 + iosSimulatorArm64",
    "androidApp/                # Compose UI",
    "iosApp/                    # Xcode project, SwiftUI",
  ], { x: 0.9, y: 1.95, w: 5.6, h: 2.75, fontSize: 9 });
  T.codeBlock(s, [
    "// shared/build.gradle.kts",
    "kotlin {",
    "    androidTarget()",
    "    listOf(iosArm64(), iosSimulatorArm64()).forEach { t ->",
    "        t.binaries.framework {",
    "            baseName = \"Shared\"",
    "            isStatic = true    // one framework for Xcode",
    "        }",
    "    }",
    "    sourceSets {",
    "        commonMain.dependencies {",
    "            implementation(libs.ktor.client.core)",
    "            implementation(libs.kotlinx.coroutines.core)",
    "        }",
    "        androidMain.dependencies {",
    "            implementation(libs.ktor.client.okhttp)",
    "        }",
    "        iosMain.dependencies {",
    "            implementation(libs.ktor.client.darwin)",
    "        }",
    "    }",
    "}",
  ], { x: 6.9, y: 1.95, w: 5.53, h: 4.85, fontSize: 7.5 });
  T.lines(s, [
    "A source set is just a folder the compiler includes for a given target. commonMain compiles for all of them, so anything platform-specific in it is a compile error, which is the point.",
    "Dependencies follow the same rule: one Ktor API in common, a different engine per platform.",
    { text: "The build file is the architecture diagram.", options: { bold: true } },
  ], { x: 0.9, y: 4.95, w: 5.6, h: 1.7, fontSize: 11, paraSpaceAfter: 9 });
}

// ---------------------------------------------------------- 30 iOS SIDE ----
{
  const s = d.content("Kotlin Multiplatform", "How the iOS app consumes it");
  T.codeBlock(s, [
    "# Kotlin/Native produces a real framework",
    "./gradlew :shared:assembleSharedXCFramework",
    "",
    "# then either:",
    "#   - add the XCFramework to the Xcode project directly",
    "#   - publish it as a Swift Package (SPM)",
    "#   - or use the CocoaPods plugin's generated podspec",
  ], { x: 0.9, y: 1.95, w: 6.1, h: 1.95, fontSize: 8 });
  T.codeBlock(s, [
    "import Shared     // the Kotlin module, as an Obj-C / Swift API",
    "",
    "struct DeviceView: View {",
    "  @State private var reading: Reading?",
    "  private let repo = ReadingsRepository(http: ..., store: ...)",
    "  var body: some View {",
    "    Text(reading.map { \"\\($0.tempC) °C\" } ?? \"n/a\")",
    "      // a Kotlin suspend fun arrives as Swift async/await",
    "      .task { reading = try? await repo.latest(deviceId: id) }",
    "  }",
    "}",
  ], { x: 0.9, y: 4.05, w: 6.1, h: 2.7, fontSize: 7.5 });
  T.lines(s, [
    { text: "There is no bridge at run time.", options: { bold: true } },
    "Kotlin classes are compiled to native code and exposed as Objective-C classes, so Swift calls them the way it calls any other framework. Compare that with a platform channel, which encodes a message for every single call.",
    { text: "suspend maps to async/await;", options: { bold: true } },
    "Flow needs a small wrapper, or a tool like SKIE, to feel natural in Swift.",
    { text: "What you still pay:", options: { bold: true } },
    "someone on the team writes SwiftUI. Kotlin/Native's memory model is a tracing GC shared across threads: no manual freeing, but object graphs held from Swift keep Kotlin objects alive.",
    { text: "And the iOS build needs a Mac with Xcode,", options: { bold: true } },
    "exactly like a Flutter iOS build does.",
  ], { x: 7.5, y: 2.0, w: 4.93, h: 4.5, fontSize: 10.5, paraSpaceAfter: 7 });
}

// ------------------------------------------------------- 31 KMP VS FLUTTER -
{
  const s = d.content("Kotlin Multiplatform", "Flutter and KMP, honestly compared");
  T.table(s, ["Flutter", "Kotlin Multiplatform"], [
    ["UI", "one UI, drawn by Impeller on both platforms", "each platform's native UI, or Compose on both"],
    ["Shared", "everything, including the pixels", "whatever you put in commonMain"],
    ["Boundary", "crossed at run time: a channel or FFI call per OS API", "crossed at compile time: shared code is native code"],
    ["Language", "Dart for the whole app", "Kotlin shared, plus Swift for the iOS UI"],
    ["Team", "one team can ship both platforms", "needs someone comfortable on each platform"],
    ["Maturity", "stable, very large plugin ecosystem", "stable since Nov 2023; Compose iOS since May 2025"],
  ], { y: 2.05, labelW: 1.5, rowH: 0.52, fontSize: 10.5 });
  T.takeaway(s, "Neither one deletes the boundary: they move it.",
    "Flutter crosses it at run time, once per call. KMP crosses it at compile time, once per build. Lecture 1 chose Flutter for one team and one UI; this is the trade you accepted.", 5.75);
  s.addNotes("Be even-handed here. The honest summary: if you have existing native apps and native teams, KMP is usually the better fit; if you have one small team and want one UI everywhere, Flutter is. Neither answer is a criticism of the other.");
}

// -------------------------------------------------------------- 32 CLOSING --
{
  const s = d.closing([
    ["checklist", "Looking back", [
      "Boundaries were the recurring cost all semester: process, network, language, platform",
      "gRPC: one .proto contract, four call shapes, one warm connection, with L5's Go backend on the far end",
      "Channels for control, FFI for compute, and measure both yourself",
      "KMP crosses at compile time; Flutter crosses at run time",
      "Every performance number in a slide deck is a property of someone else's hardware",
    ]],
    ["calendar", "Before the exam", [
      "Run the full chain once: .proto → protoc → Go server → generated Dart client",
      "Run the channel-vs-FFI benchmark on your own phone, in release mode",
      "Move one model and one repository from your project into a shared Kotlin module",
      "Re-read L5, L8 and L10 as one story about the wire",
      "Bring your project questions to the last office hours",
    ]],
    ["bookopen", "Read more", [
      "grpc.io/docs · protobuf.dev/programming-guides/encoding",
      "connectrpc.com · RFC 9114 (HTTP/3) · RFC 9000 (QUIC)",
      "docs.flutter.dev/platform-integration: channels, FFI, ffigen",
      "dart.dev/interop/c-interop",
      "kotlinlang.org/docs/multiplatform.html",
    ]],
  ], "Where the semester ends up");
  s.addText("That is the course. Project demos and the exam are what is left, and office hours stay open until both are done.", {
    x: 0.9, y: 6.6, w: 11.5, h: 0.4, fontFace: F, fontSize: 12.5, color: C.DIM, align: "center", margin: 0,
  });
}

d.write(path.join(__dirname, "Mobile-and-Embedded-Lecture12-v2.pptx"))
  .then((f) => console.log("written:", f, "slides:", d.n));
