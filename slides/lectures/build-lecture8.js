// ============================================================================
// Mobile & Embedded Computing: Lecture 8
// "Realtime, Permissions & Routing": WebSockets, runtime permissions, navigation.
// Built on the shared template (template.js). Do not restyle.
// ============================================================================
const path = require("path");
const T = require("../assets/template");
const { Deck, C, F, MONO } = T;

const d = new Deck({
  lecture: 8,
  title: "Realtime, Permissions & Routing",
  subtitle: "WebSockets, runtime permissions, navigation",
});

// ---------------------------------------------------------------- 1 TITLE ---
d.titleSlide();

// ------------------------------------------------------------------ 2 BIO ---
T.bioSlide(d);

// ----------------------------------------------------------- 3 OBJECTIVES ---
T.objectivesSlide(d, [
  ["waves", "Realtime transport", "Which of WebSocket, SSE, long-polling and MQTT fits a problem, and the handshake that makes a socket"],
  ["refresh", "Connections that survive", "Backoff, heartbeats, wss://, and what the OS does to your socket when the app leaves the screen"],
  ["lock", "Permissions, end to end", "Manifest and plist entries, Android 13+ granular media, and every state permission_handler returns"],
  ["route", "Routing with go_router", "Routes as data, parameters, nested shells, plus a redirect guard wired to your auth state"],
]);

// -------------------------------------------------------------- 4 DIVIDER ---
d.divider(
  "Part 1 · Realtime",
  "Keeping a connection open",
  "WebSockets, and the three other ways to push data to a phone"
);

// ---------------------------------------------------------- 5 WHY NOT HTTP --
{
  const s = d.content("Realtime", "Why HTTP alone cannot push");
  T.lines(s, [
    "HTTP is request–response. The client asks, the server answers, the exchange is over. Keep-alive reuses the TCP connection, but the server still has no way to speak first.",
    "So apps fake it by polling: ask every two seconds, and be told “nothing new” ninety-nine times out of a hundred. You pay for a full request (headers, TLS bookkeeping, a server handler) every time, on every device.",
  ], { x: 0.9, y: 1.82, w: 11.53, h: 1.25, fontSize: 13, paraSpaceAfter: 9 });
  T.table(s, ["Polling over HTTP", "WebSocket"], [
    ["Connection", "a request per poll, or a reused keep-alive socket", "one socket, opened once, held open"],
    ["Who may speak", "the client only", "either side, at any moment"],
    ["Worst-case latency", "one full poll interval", "one network hop"],
    ["Cost while idle", "a request every interval, forever", "a few bytes of keepalive"],
  ], { y: 3.15, rowH: 0.5, labelW: 2.4, fontSize: 11.5 });
  T.takeaway(s,
    "A WebSocket is not “faster HTTP”. It is a different conversation shape.",
    "Use it when the server has data before the client would have asked for it.",
    5.85);
}

// ---------------------------------------------------------- 6 HANDSHAKE -----
{
  const s = d.content("Realtime", "The handshake: HTTP 101 Switching Protocols");
  T.codeBlock(s, [
    "GET /chat HTTP/1.1",
    "Host: realtime.example.com",
    "Upgrade: websocket",
    "Connection: Upgrade",
    "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==",
    "Sec-WebSocket-Version: 13",
    "",
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    "Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=",
    "",
    "// same TCP connection, now carrying WebSocket frames",
  ], { x: 0.9, y: 1.95, w: 7.2, h: 4.15, fontSize: 10.5 });
  s.addText("What just happened", { x: 8.5, y: 1.98, w: 3.93, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "A WebSocket starts life as an ordinary HTTP request. That is why it travels over port 443 and through every proxy and firewall that already allows HTTPS.",
    "The 101 response ends the HTTP part. Nothing is re-negotiated; the same TCP connection is handed over to a binary framing protocol (RFC 6455).",
    "Because the opening request is HTTP, it carries cookies, an Origin header and a query string, which is how you authenticate the socket.",
  ], { x: 8.5, y: 2.45, w: 3.93, h: 3.9, fontSize: 11.5, color: C.GRAY, paraSpaceAfter: 12 });
  s.addNotes("Sec-WebSocket-Accept is the client key concatenated with a fixed GUID, SHA-1'd and base64'd. It proves the server actually understood the upgrade rather than a cache replaying a 101. It is not security; it is a cache-poisoning guard.");
}

// -------------------------------------------------------- 7 TRANSPORT MENU --
{
  const s = d.content("Realtime", "Four ways to push, and when each one fits");
  T.table(s, ["Direction", "Runs over", "Reach for it when"], [
    ["WebSocket", "full duplex", "one TCP socket, HTTP upgrade", "both sides talk: chat, presence, collaborative editing, games"],
    ["SSE", "server → client", "a plain HTTP response that never ends", "a one-way feed. Auto-reconnect and event ids are in the browser spec, free"],
    ["Long polling", "server → client", "ordinary HTTP requests", "a restrictive network blocks everything else. The universal fallback"],
    ["MQTT", "pub/sub, both ways", "TCP, or tunneled over WebSocket", "devices: tiny frames, QoS levels, retained messages, last-will messages"],
  ], { y: 2.2, rowH: 0.72, labelW: 1.75, fontSize: 11.5 });
  T.takeaway(s,
    "MQTT is the one you will meet on hardware.",
    "A broker fans one sensor reading out to every subscriber, and a 2-byte header suits a device with 520 KB of RAM. → Lecture 11: a TinyGo program on an ESP32-C3 publishes readings, and your Flutter app subscribes with mqtt_client.",
    5.78);
  s.addNotes("If a student asks 'why not just use WebSockets for the sensor too': a broker gives you fan-out, retained last-known-value, and offline queueing that you would otherwise write yourself. Also, MQTT over WebSocket is common: the transport and the protocol are separate choices.");
}

// ------------------------------------------------------------ 8 LIFECYCLE ---
{
  const s = d.content("Realtime", "web_socket_channel: the whole lifecycle");
  T.codeBlock(s, [
    "// 1. connect.  wss:// only.  connect() itself is lazy.",
    "final channel = WebSocketChannel.connect(",
    "  Uri.parse('wss://realtime.example.com/chat'),",
    ");",
    "await channel.ready;   // throws if the handshake fails",
    "// 2. listen.  One stream, one subscription.",
    "final sub = channel.stream.listen(",
    "  (data) => onMessage(data as String),",
    "  onError: (e, st) => scheduleReconnect(),",
    "  onDone: () => scheduleReconnect(),",
    ");",
    "// 3. send.  String or List<int>, nothing else.",
    "channel.sink.add(jsonEncode({'type': 'msg', 'body': text}));",
    "// 4. close.  In dispose(), every time.",
    "await sub.cancel();",
    "await channel.sink.close(status.goingAway);",
  ], { x: 0.9, y: 1.95, w: 7.5, h: 4.85, fontSize: 10.5 });
  s.addText("The two lines everyone forgets", { x: 8.6, y: 1.98, w: 3.83, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    { text: "await channel.ready", options: { fontFace: MONO, fontSize: 11, color: C.INK } },
    "connect() returns instantly and never throws. Without ready you find out the server rejected you three screens later, as a stream error.",
    { text: "sink.close() in dispose()", options: { fontFace: MONO, fontSize: 11, color: C.INK } },
    "A socket is not garbage-collected away. Leave it open and every abandoned screen leaks a radio wake-up, a server connection slot and battery.",
    { text: "channel.closeCode tells you why it ended: 1000 clean, 1006 abnormal (no close frame, the usual mobile case).", options: { color: C.INK } },
  ], { x: 8.6, y: 2.45, w: 3.83, h: 4.2, fontSize: 11.5, color: C.GRAY, paraSpaceAfter: 8 });
  s.addNotes("Demo opportunity: point wss:// at wss://echo.websocket.org (or a two-line Dart shelf_web_socket server) and show ready throwing on a bad host. The old deck showed listening and sending but never showed connect(), so students could not run anything.");
}

// ----------------------------------------------------------------- 9 WSS ----
{
  const s = d.content("Realtime", "wss://, and who is allowed to connect");
  T.lines(s, [
    { text: "ws:// is plaintext.", options: { bold: true, color: C.INK } },
    "Every frame (messages, ids, the token in your query string) crosses shared Wi-Fi in the clear, and any middlebox can rewrite it. wss:// is the same protocol inside TLS, on port 443.",
    "You do not get a choice anyway: iOS App Transport Security and Android's cleartext policy both block ws:// by default. Do not add a platform exception to work around it.",
    { text: "A socket is authenticated once, at the handshake, and then trusted for hours.", options: { bold: true, color: C.INK } },
    "So the server must check the token on the upgrade request, and must re-check it when it expires rather than trusting the connection forever.",
  ], { x: 0.9, y: 1.9, w: 6.9, h: 4.3, fontSize: 13.5, paraSpaceAfter: 12 });

  s.addText("Three ways to carry the token", { x: 8.2, y: 1.92, w: 4.23, h: 0.35, fontFace: F, fontSize: 13.5, bold: true, color: C.INK, margin: 0 });
  const items = [
    ["Query string", "?token=… is simplest and works in browsers, but it lands in server access logs. Use short-lived tokens."],
    ["Subprotocol header", "Sec-WebSocket-Protocol carries the credential. Not logged; awkward in some proxies."],
    ["First message", "Connect anonymously, send an auth frame, and let the server close the socket if it does not arrive within a second."],
  ];
  let y = 2.45;
  items.forEach(([head, body], i) => {
    s.addText(head, { x: 8.2, y, w: 4.23, h: 0.32, fontFace: F, fontSize: 12.5, bold: true, color: C.INK, margin: 0 });
    s.addText(body, { x: 8.2, y: y + 0.34, w: 4.23, h: 0.95, fontFace: F, fontSize: 11, color: C.GRAY, margin: 0, valign: "top" });
    y += 1.42;
    if (i < items.length - 1) T.hline(s, 8.2, y - 0.16, 4.23);
  });
  T.takeaway(s,
    "Short-lived tokens, re-checked.",
    "A socket opened at nine with a one-hour token must not still be trusted at noon. The server closes it and the client reconnects with a fresh one.",
    5.35, { w: 6.9 });
}

// ---------------------------------------------------------- 10 HEARTBEATS ---
{
  const s = d.content("Realtime", "A dead socket still looks open");
  T.lines(s, [
    "TCP does not tell you the peer is gone. It tells you when the peer sends a FIN or an RST, and a phone that has moved out of Wi-Fi range sends neither.",
    "Carrier NAT rebinds your port after a couple of minutes of silence. A Wi-Fi → LTE handover changes your source address mid-connection. The radio sleeps. Every one of those leaves a socket that is open on your side and gone on the server's.",
    "OS TCP keepalive defaults to two hours, which is far too long to detect this.",
    { text: "So you prove liveness yourself: send a ping, expect a reply, and treat silence as a closed connection.", options: { bold: true, color: C.INK } },
  ], { x: 0.9, y: 1.9, w: 6.6, h: 3.5, fontSize: 13, paraSpaceAfter: 12 });
  T.codeBlock(s, [
    "// dart:io only: real protocol ping/pong frames",
    "IOWebSocketChannel.connect(uri,",
    "  pingInterval: const Duration(seconds: 20));",
    "",
    "// Anywhere, incl. web: your own heartbeat",
    "const beat = Duration(seconds: 20);",
    "_hb = Timer.periodic(beat, (_) {",
    "  if (_awaitingPong) {",
    "    reconnect();     // no pong: treat it as closed",
    "    return;",
    "  }",
    "  _awaitingPong = true;",
    "  channel.sink.add('{\"t\":\"ping\"}');",
    "});",
  ], { x: 7.7, y: 1.95, w: 4.73, h: 4.0, fontSize: 9 });
  T.takeaway(s,
    "A half-open connection is worse than a closed one.",
    "Messages you “sent” sit in a kernel buffer and the UI shows them as delivered.",
    5.6, { w: 6.6 });
}

// ------------------------------------------------------------- 11 BACKOFF ---
{
  const s = d.content("Realtime", "Reconnecting without taking down your server");
  T.codeBlock(s, [
    "// Never reconnect in a tight loop: it overloads your own server.",
    "Duration _backoff() {",
    "  const base = Duration(seconds: 1), cap = Duration(minutes: 2);",
    "  final expo = base * math.pow(2, _attempt);  // 1s 2s 4s 8s …",
    "  final ceiling = expo > cap ? cap : expo;",
    "  // Full jitter: pick anywhere in [0, ceiling].",
    "  return Duration(milliseconds: _rng.nextInt(ceiling.inMilliseconds));",
    "}",
    "",
    "void scheduleReconnect() {",
    "  if (_disposed || (_timer?.isActive ?? false)) return;",
    "  _attempt++;",
    "  _timer = Timer(_backoff(), _connect);",
    "}",
    "",
    "void onReady() => _attempt = 0;  // reset once a connection sticks",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.85, fontSize: 10 });
  s.addText("Why jitter, not just doubling", { x: 8.8, y: 1.98, w: 3.63, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "A server restarts. Ten thousand clients notice at the same instant, so they all retry at t+1s, then all at t+2s, and overload it again. That is a thundering herd, and plain exponential backoff does not fix it.",
    "Full jitter spreads the same clients evenly across the whole window.",
    { text: "Reset the counter on a connection that lasted, not on one that merely opened, because a server that accepts and immediately drops the connection would otherwise reset it every time.", options: { color: C.INK } },
  ], { x: 8.8, y: 2.45, w: 3.63, h: 4.2, fontSize: 11.5, color: C.GRAY, paraSpaceAfter: 11 });
}

// --------------------------------------------------------- 12 BACKGROUND ----
{
  const s = d.content("Realtime", "When the app goes to the background");
  T.lines(s, [
    "iOS gives a backgrounded app a few seconds and then suspends the process. Your isolate stops; your socket stops being serviced. No close frame is sent, so the server simply stops receiving from you.",
    "Android does the same more gradually, through Doze and background restrictions.",
    { text: "A WebSocket is a foreground affordance.", options: { bold: true, color: C.INK } },
    "Anything that must reach the user while the app is away is a push notification, FCM or APNs, not a frame on your stream. The socket only serves the live screen.",
  ], { x: 0.9, y: 1.9, w: 6.9, h: 3.6, fontSize: 13, paraSpaceAfter: 12 });
  T.flowDown(s, [
    ["paused", "close the socket yourself, cleanly", "hair"],
    ["backgrounded", "FCM / APNs carries what matters", "black"],
    ["resumed", "reconnect, then resync what you missed", "hair"],
  ], { x: 8.4, y: 2.1, w: 4.03, h: 1.0, gap: 0.36 });
  T.takeaway(s,
    "This is a common realtime bug on mobile.",
    "It works while the app is in the foreground and breaks as soon as the phone is locked. Handle it in AppLifecycleListener, and give every message a server-side id so resync is a gap query, not a guess.",
    5.6, { w: 6.9 });
  s.addNotes("Ask the room how they would resync: the answer is a monotonic cursor: the client sends the last id it saw on reconnect and the server replays the gap. Without that, a reconnect either duplicates messages or silently loses them.");
}

// ------------------------------------------------------------- 13 DIVIDER ---
d.divider(
  "Part 2 · Permissions",
  "Asking the OS for the device",
  "Manifest, plist, and every answer permission_handler can give you"
);

// -------------------------------------------------------------- 14 TWO STEPS
{
  const s = d.content("Permissions", "Two steps, and both are mandatory");
  T.lines(s, [
    "Step one is static. You declare, at build time, what your app might ever ask for. Android reads it from the manifest; iOS reads it from Info.plist, together with the exact sentence the user will be shown.",
    "Step two is at runtime. The user is asked, once, in a system dialog you cannot style, move or re-word, and can say no.",
    { text: "Skip step one and step two does not fail gracefully.", options: { bold: true, color: C.INK } },
    "On Android an undeclared permission is simply denied, forever, with no dialog. On iOS a missing usage-description string is not a warning: the app is terminated the moment it touches the API, and App Store review rejects the build.",
  ], { x: 0.9, y: 1.9, w: 6.9, h: 3.9, fontSize: 13, paraSpaceAfter: 12 });
  T.flowDown(s, [
    ["Declare", "AndroidManifest.xml · Info.plist", "hair"],
    ["Ask, in context", "permission_handler request()", "black"],
    ["Handle every answer", "including the one you cannot retry", "hair"],
  ], { x: 8.4, y: 2.1, w: 4.03, h: 1.0, gap: 0.36 });
  T.takeaway(s,
    "Permissions are a build-config problem before they are a code problem.",
    "",
    5.95, { w: 6.9 });
}

// ------------------------------------------------------------- 15 MANIFEST --
{
  const s = d.content("Permissions", "Android: AndroidManifest.xml");
  T.codeBlock(s, [
    "<!-- android/app/src/main/AndroidManifest.xml -->",
    "<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\">",
    "",
    "  <uses-permission android:name=\"android.permission.CAMERA\"/>",
    "  <uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\"/>",
    "  <uses-permission android:name=\"android.permission.POST_NOTIFICATIONS\"/>",
    "",
    "  <uses-permission android:name=\"android.permission.READ_MEDIA_IMAGES\"/>",
    "  <uses-permission android:name=\"android.permission.READ_MEDIA_VIDEO\"/>",
    "  <uses-permission android:name=\"android.permission.READ_EXTERNAL_STORAGE\"",
    "                   android:maxSdkVersion=\"32\"/>",
    "",
    "  <uses-feature android:name=\"android.hardware.camera\"",
    "                android:required=\"false\"/>",
  ], { x: 0.9, y: 1.95, w: 7.85, h: 4.3, fontSize: 9.5 });
  s.addText("Line by line", { x: 8.95, y: 1.98, w: 3.48, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "Declaring is not requesting. These entries only make the runtime request legal.",
    "maxSdkVersion=\"32\" keeps the old storage permission for old phones without asking for it on Android 13+, where it no longer exists.",
    "uses-feature with required=\"false\" keeps the app installable on hardware without a camera. Leave it out and Play filters those devices away.",
    { text: "Flutter merges the plugin manifests into yours at build time, so check the merged manifest in build/ before you ship.", options: { color: C.INK } },
  ], { x: 8.95, y: 2.45, w: 3.48, h: 4.2, fontSize: 11, color: C.GRAY, paraSpaceAfter: 10 });
  s.addNotes("This slide exists because the original deck's manifest box rendered completely empty: the angle brackets were removed by HTML escaping, so students saw a blank gray rectangle where the answer was meant to be.");
}

// ---------------------------------------------------------------- 16 PLIST --
{
  const s = d.content("Permissions", "iOS: Info.plist");
  T.codeBlock(s, [
    "<!-- ios/Runner/Info.plist -->",
    "<key>NSCameraUsageDescription</key>",
    "<string>MapChat uses the camera to send photos in a chat.</string>",
    "",
    "<key>NSMicrophoneUsageDescription</key>",
    "<string>MapChat records voice notes while you hold the button.</string>",
    "",
    "<key>NSLocationWhenInUseUsageDescription</key>",
    "<string>MapChat shows friends near you while the app is open.</string>",
    "",
    "<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>",
    "<string>MapChat alerts you when a friend arrives nearby.</string>",
    "",
    "<key>NSPhotoLibraryUsageDescription</key>",
    "<string>Pick a photo you already have and send it.</string>",
  ], { x: 0.9, y: 1.95, w: 7.85, h: 4.45, fontSize: 9.5 });
  s.addText("The string is the product", { x: 8.95, y: 1.98, w: 3.48, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "That sentence is printed inside the system dialog. It is the only explanation you get, and you get it once.",
    "Say what the user gains, not what the app needs. “To access your camera” earns a no; the sentences above earn a yes.",
    "A missing key causes a hard crash: not an exception you can catch, but a termination.",
    { text: "permission_handler also needs the matching PERMISSION_ macros enabled in ios/Podfile, or every permission you did not opt into reports permanentlyDenied.", options: { color: C.INK } },
  ], { x: 8.95, y: 2.45, w: 3.48, h: 4.3, fontSize: 11, color: C.GRAY, paraSpaceAfter: 10 });
}

// ------------------------------------------------------------ 17 ANDROID 13 -
{
  const s = d.content("Permissions", "Android 13+ split storage into media types");
  s.addText("One coarse “read everything” permission became several narrow ones, and notifications stopped being granted at install.", {
    x: 0.9, y: 1.82, w: 11.53, h: 0.4, fontFace: F, fontSize: 13, color: C.INK, margin: 0,
  });
  T.table(s, ["Before: API 32 and below", "Android 13+ (API 33+)"], [
    ["Photos", "READ_EXTERNAL_STORAGE", "READ_MEDIA_IMAGES"],
    ["Video", "READ_EXTERNAL_STORAGE", "READ_MEDIA_VIDEO"],
    ["Audio and music", "READ_EXTERNAL_STORAGE", "READ_MEDIA_AUDIO"],
    ["Notifications", "granted at install, silently", "POST_NOTIFICATIONS, a runtime prompt"],
    ["Part of the library", "not possible", "READ_MEDIA_VISUAL_USER_SELECTED, API 34+"],
  ], { y: 2.35, rowH: 0.54, labelW: 2.5, fontSize: 11.5 });
  T.takeaway(s,
    "POST_NOTIFICATIONS is the one that matters for this course.",
    "Your FCM push, which is what reaches the user while the socket is closed, silently delivers nothing on an Android 13+ phone until the user grants it at runtime.",
    5.75);
}

// -------------------------------------------------------------- 18 STATES ---
{
  const s = d.content("Permissions", "Every answer you have to handle");
  T.table(s, ["What it means", "What you do about it"], [
    ["isGranted", "you may call the API", "proceed"],
    ["isDenied", "asked and refused; on Android you may ask again", "show a rationale, then request() once more"],
    ["isPermanentlyDenied", "Android: “Don't ask again”. iOS: any refusal, ever.", "request() is now a no-op; use openAppSettings()"],
    ["isRestricted", "blocked by policy: Screen Time, MDM, parental controls", "hide the feature; there is no path forward"],
    ["isLimited", "a subset the user picked: iOS Photos, Android 14+ media", "treat as granted, and offer “select more photos”"],
    ["isProvisional", "iOS notifications: delivered quietly, no prompt shown", "you are already delivering; ask for the upgrade later"],
  ], { y: 2.0, rowH: 0.58, labelW: 2.35, fontSize: 11 });
  s.addText([
    { text: "isLimited and isProvisional are not edge cases. ", options: { bold: true, color: C.INK } },
    { text: "They are the default outcome of two common iOS prompts, and a status.isGranted check treats both as a refusal.", options: { color: C.GRAY } },
  ], { x: 0.9, y: 6.25, w: 11.53, h: 0.55, fontFace: F, fontSize: 12.5, margin: 0, valign: "top" });
}

// -------------------------------------------------------------- 19 HANDLER --
{
  const s = d.content("Permissions", "permission_handler, including the dead end");
  T.codeBlock(s, [
    "Future<bool> ensureCamera(BuildContext context) async {",
    "  var status = await Permission.camera.status;",
    "  if (status.isGranted || status.isLimited) return true;",
    "",
    "  // iOS prompts once only. Show your rationale before requesting.",
    "  if (status.isDenied) {",
    "    if (!await showRationaleSheet(context)) return false;",
    "    status = await Permission.camera.request();",
    "  }",
    "",
    "  if (status.isPermanentlyDenied || status.isRestricted) {",
    "    // request() does nothing now. Settings is the only route.",
    "    if (await confirmOpenSettings(context)) await openAppSettings();",
    "    return false;",
    "  }",
    "  return status.isGranted || status.isLimited;",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.85, fontSize: 9.5 });
  s.addText("Three traps", { x: 8.8, y: 1.98, w: 3.63, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "On Android, permanentlyDenied is only meaningful after you have asked at least once. Before that you get denied, so a check-on-launch reports the wrong thing.",
    "openAppSettings() hands control away completely. The user may come back granted, denied, or not at all, so re-read the status on resume.",
    { text: "There is no API to open the system prompt twice, so a skipped rationale can cost you the permission permanently.", options: { color: C.INK } },
  ], { x: 8.8, y: 2.45, w: 3.63, h: 4.3, fontSize: 11.5, color: C.GRAY, paraSpaceAfter: 12 });
  s.addNotes("Live demo: deny camera twice on an Android emulator and watch request() return instantly with no dialog. Then walk to Settings and back.");
}

// ------------------------------------------------------------------ 20 UX ---
{
  const s = d.content("Permissions", "How to get a permission granted");
  T.iconGrid(s, [
    ["clock", "Ask at the moment of need", "Never on launch. Request the camera when the user taps the camera button, where the reason is obvious"],
    ["messagesquare", "Show your own screen first", "A dismissible in-app sheet before the system dialog. If they say no to yours, you have spent nothing"],
    ["split", "Degrade, don't dead-end", "Camera denied? Offer the gallery. Location denied? Let them type a city name. The feature still has to work"],
    ["settings", "Give them a way back", "When permanentlyDenied, show a button that opens Settings, not an error message with no next step"],
    ["target", "Ask for the narrower one", "ACCESS_COARSE_LOCATION and READ_MEDIA_IMAGES are accepted more often than the broader permissions"],
    ["eye", "Never ask for what you don't use", "Store reviewers check declared permissions against what the app actually does. An unused entry is a rejection risk"],
  ], { y: 2.05, cw: 3.7, gx: 0.5, rowH: 2.3 });
}

// ------------------------------------------------------------- 21 DIVIDER ---
d.divider(
  "Part 3 · Routing",
  "Navigation as data",
  "go_router: routes, parameters, shells, and a guard wired to auth"
);

// ------------------------------------------------------------ 22 NAV 1.0 ----
{
  const s = d.content("Routing", "Navigator 1.0, and why the docs steer you off it");
  T.codeBlock(s, [
    "// Imperative. Still perfectly fine for a local dialog or sheet.",
    "Navigator.of(context).push(",
    "  MaterialPageRoute(builder: (_) => ChatScreen(id: id)),",
    ");",
    "",
    "// Named routes: no longer recommended by the Flutter team.",
    "MaterialApp(routes: {'/chat': (_) => const ChatScreen()});",
    "Navigator.pushNamed(context, '/chat');",
  ], { x: 0.9, y: 1.95, w: 7.5, h: 2.9, fontSize: 10.5 });
  s.addText("What it cannot do", { x: 8.6, y: 1.98, w: 3.83, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "Deep links. A notification that should open /chat/42 has to be turned into a sequence of pushes, by hand, in the right order.",
    "Whole-stack changes. “Sign the user out and throw away every screen behind them” is awkward at best.",
    "The web. Named routes do not become URLs, so the address bar and the browser back button are wrong.",
  ], { x: 8.6, y: 2.45, w: 3.83, h: 3.3, fontSize: 11.5, color: C.GRAY, paraSpaceAfter: 12 });
  T.takeaway(s,
    "Navigator 2.0 fixed all three, but its API was hard to use directly.",
    "go_router is the Flutter team's answer: it implements Navigator 2.0 for you and gives you a URL-shaped API on top.",
    5.35);
}

// ---------------------------------------------------------- 23 GO_ROUTER ----
{
  const s = d.content("Routing", "go_router: your navigation, as data");
  T.codeBlock(s, [
    "final router = GoRouter(",
    "  initialLocation: '/',",
    "  routes: [",
    "    GoRoute(path: '/', builder: (c, s) => const HomeScreen()),",
    "    GoRoute(path: '/login', builder: (c, s) => const LoginScreen()),",
    "    GoRoute(",
    "      path: '/chat/:id',",
    "      builder: (c, s) => ChatScreen(",
    "        roomId: s.pathParameters['id']!,",
    "        draft: s.uri.queryParameters['draft'],",
    "      ),",
    "    ),",
    "  ],",
    "  errorBuilder: (c, s) => NotFoundScreen(uri: s.uri),",
    ");",
  ], { x: 0.9, y: 1.95, w: 7.5, h: 4.65, fontSize: 10.5 });
  s.addText("Stack = f(state)", { x: 8.6, y: 1.98, w: 3.83, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "You stop saying “go here” and start declaring what exists. The router turns a location into a stack.",
    { text: "MaterialApp.router(routerConfig: router)", options: { fontFace: MONO, fontSize: 10.5, color: C.INK } },
    "One line wires it in, and the same tree then works from a deep link, a push notification and a browser URL bar.",
    { text: "context.go() replaces the stack. context.push() adds to it. Use go for destinations and push for detours.", options: { color: C.INK } },
  ], { x: 8.6, y: 2.45, w: 3.83, h: 4.1, fontSize: 11.5, color: C.GRAY, paraSpaceAfter: 11 });
}

// ------------------------------------------------------------- 24 PARAMS ----
{
  const s = d.content("Routing", "Three ways to carry data into a route");
  T.table(s, ["Path", "Navigate with", "Read it back as", "Survives a link?"], [
    ["Path param", "/chat/:id", "context.go('/chat/42')", "state.pathParameters['id']", "yes"],
    ["Query param", "/search", "context.go('/search?q=ws')", "state.uri.queryParameters['q']", "yes"],
    ["Extra", "any", "context.go('/chat/42', extra: room)", "state.extra as Room", "no"],
  ], { y: 2.3, rowH: 0.8, labelW: 1.55, fontSize: 10.5 });
  T.takeaway(s,
    "Pass ids, not objects.",
    "extra is an in-memory pointer: it does not survive a cold start from a notification, a browser refresh, or Android killing your process. Put the id in the URL and look the object up from your state manager on the other side, so the screen works however the user arrived. (→ Lecture 4, state management)",
    5.35);
}

// -------------------------------------------------------------- 25 SHELL ----
{
  const s = d.content("Routing", "ShellRoute: chrome that does not rebuild");
  T.lines(s, [
    "A bottom navigation bar is not a screen, it is a frame around screens. ShellRoute gives you a nested Navigator: the Scaffold and its bar are built once, and only the body swaps.",
    { text: "StatefulShellRoute.indexedStack goes further:", options: { bold: true, color: C.INK } },
    "each branch keeps its own navigation stack and its own scroll position. Go three screens deep in Chats, switch to Map and come back, and you are still three screens deep, at the same scroll position.",
    "That is the behavior users expect from a tabbed app, and re-implementing it by hand is a common source of navigation bugs.",
  ], { x: 0.9, y: 1.9, w: 6.6, h: 3.6, fontSize: 13, paraSpaceAfter: 12 });

  // right: shell diagram
  T.hairbox(s, 7.9, 2.0, 4.53, 3.5);
  s.addText("StatefulShellRoute", { x: 7.9, y: 2.15, w: 4.53, h: 0.3, fontFace: F, fontSize: 11.5, bold: true, color: C.GRAY, align: "center", margin: 0 });
  const bw = 1.31, bx0 = 8.14;
  const branches = [["Chats", "/chat"], ["Map", "/map"], ["You", "/me"]];
  branches.forEach(([nm, p], i) => {
    const bx = bx0 + i * (bw + 0.15);
    T.panel(s, bx, 2.6, bw, 1.75);
    s.addText([
      { text: nm, options: { bold: true, color: C.INK, breakLine: true } },
      { text: p, options: { fontFace: MONO, fontSize: 9.5, color: C.GRAY, breakLine: true } },
      { text: "own stack", options: { fontSize: 9.5, color: C.GRAY } },
    ], { x: bx, y: 2.6, w: bw, h: 1.75, fontFace: F, fontSize: 12, align: "center", valign: "middle", margin: 0 });
  });
  T.blackbox(s, 8.14, 4.6, 4.05, 0.62);
  s.addText("NavigationBar, built once", { x: 8.14, y: 4.6, w: 4.05, h: 0.62, fontFace: F, fontSize: 11.5, color: C.WHITE, align: "center", valign: "middle", margin: 0 });
  s.addText("one Scaffold, three independent stacks", { x: 7.9, y: 5.55, w: 4.53, h: 0.3, fontFace: F, fontSize: 10.5, color: C.GRAY, align: "center", margin: 0 });

  T.takeaway(s, "Never nest a Navigator by hand.", "The shell already is one.", 5.75, { w: 6.6 });
}

// ------------------------------------------------------------ 26 REDIRECT ---
{
  const s = d.content("Routing", "redirect: one guard for the whole app");
  T.codeBlock(s, [
    "final router = GoRouter(",
    "  // Re-runs redirect on every sign-in and sign-out.",
    "  refreshListenable: GoRouterRefreshStream(",
    "      FirebaseAuth.instance.authStateChanges()),",
    "  redirect: (context, state) {",
    "    final signedIn = FirebaseAuth.instance.currentUser != null;",
    "    final atLogin = state.matchedLocation == '/login';",
    "",
    "    // Keep where they were headed, so login can finish the trip.",
    "    if (!signedIn && !atLogin) return '/login?from=${state.uri}';",
    "    if (signedIn && atLogin) return '/';",
    "    return null;   // null means: stay exactly where you are",
    "  },",
    "  routes: [ /* … */ ],",
    ");",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.65, fontSize: 9.5 });
  s.addText("The bridge back to Lecture 7", { x: 8.8, y: 1.98, w: 3.63, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "redirect runs before every navigation, including the very first one and every deep link. One place decides who may see what, so there are no per-screen checks to forget.",
    "refreshListenable is what makes it reactive: without it the guard is only consulted when the user navigates, so a sign-out in the background leaves the private screen on display.",
    { text: "Return null to allow. Return a location to send them elsewhere. Never return the location you are already on: that is an infinite redirect, and go_router reports it.", options: { color: C.INK } },
  ], { x: 8.8, y: 2.45, w: 3.63, h: 4.3, fontSize: 11, color: C.GRAY, paraSpaceAfter: 11 });
  s.addNotes("GoRouterRefreshStream is a tiny ChangeNotifier that calls notifyListeners on every stream event; it is in the go_router examples, about ten lines. Tie this back to Lecture 7: authStateChanges() is the source of truth, and this is where the router subscribes to it.");
}

// ----------------------------------------------------------- 27 SYNTHESIS ---
{
  const s = d.content("Putting it together", "One tap through all three parts");
  T.iconGrid(s, [
    ["mappin", "1 · Permission", "The user taps “Nearby”. You show your own rationale sheet, then request location, and handle limited, denied and permanentlyDenied before you draw a map"],
    ["route", "2 · Route", "They tap a friend. context.go('/chat/alice') builds the screen. redirect has already checked they are signed in, and the same URL works from a push notification"],
    ["waves", "3 · Socket", "ChatScreen opens wss://…/chat with a token, listens, sends, heartbeats, reconnects with jitter, and closes cleanly in dispose()"],
  ], { y: 2.05, cw: 3.7, gx: 0.5 });
  T.takeaway(s,
    "Three subsystems, one user gesture.",
    "Each of them fails in a way the user can see, and each of them has exactly one correct place to be handled.",
    5.45);
}

// ------------------------------------------------------------- 28 CLOSING ---
d.closing([
  ["checklist", "Recap", [
    "WebSocket for two-way, SSE for one-way, MQTT for devices",
    "connect → ready → listen → send → close, and close in dispose()",
    "wss:// only; heartbeats, jittered backoff, and push for the background",
    "Declare in manifest and plist; handle all six permission states",
    "go_router: routes as data, ids in URLs, one redirect guard",
  ]],
  ["calendar", "This week", [
    "Add a live chat screen to your project over wss://",
    "Make it survive airplane-mode on and off, and a locked screen",
    "Request one real permission with a rationale and a settings path",
    "Replace every Navigator.push with a go_router route",
  ]],
  ["bookopen", "Read more", [
    "pub.dev/packages/web_socket_channel",
    "pub.dev/packages/permission_handler",
    "docs.flutter.dev/ui/navigation",
    "RFC 6455 · the WebSocket Protocol",
    "developer.android.com/about/versions/13/behavior-changes-13",
  ]],
]);

d.write(path.join(__dirname, "Mobile-and-Embedded-Lecture8-v2.pptx"))
  .then((f) => console.log("written:", f, "slides:", d.n));
