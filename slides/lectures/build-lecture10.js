// ============================================================================
// Lecture 10: Offline-First
// Built on the shared template (template.js).
// Source: src/lecture10.md, TWO concatenated decks (offline-first + CRDTs),
// de-duplicated into one narrative. 30 source slides -> 28.
// ============================================================================
const path = require("path");
const T = require("../assets/template");
const { Deck, C, F, MONO } = T;

const d = new Deck({
  lecture: 10,
  title: "Offline-First",
  subtitle: "local-first data, sync and conflict resolution",
});

// ---------------------------------------------------------------- 1 TITLE ---
d.titleSlide();

// ------------------------------------------------------------------ 2 BIO ---
T.bioSlide(d);

// ----------------------------------------------------------- 3 OBJECTIVES ---
T.objectivesSlide(d, [
  ["cloudoff", "Design for offline", "Why offline is a normal state, and why the UI reads local data, never the server"],
  ["database", "Build the local layer", "A Drift schema with sync metadata, a reactive watch() query, and an outbox table"],
  ["foldersync", "Write the sync engine", "Push loop, delta pull, checkpoints, and the background triggers you can actually rely on"],
  ["merge", "Resolve conflicts honestly", "Clock skew, hybrid logical clocks, merge by field, and what a CRDT guarantees"],
]);

// ================================================================ SECTION 1 ==
d.divider("Why offline-first", "The network is not a dependency",
  "It is a background utility that is often, briefly, absent");

// ----------------------------------------------- 5 OFFLINE IS NORMAL --------
{
  const s = d.content("Why offline-first", "Offline is a state, not an error");
  T.statRow(s, [
    ["< 1 ms", "A local read", "an indexed SQLite query on the device: no radio, no server, no failure mode"],
    ["40–200 ms", "A good round trip", "4G or 5G, warm connection, server in the same region. On a bad link: seconds"],
    ["30 s", "Your timeout", "how long the user waits before the request is abandoned"],
  ], { y: 2.05, bigSize: 40 });
  T.hline(s, 0.9, 4.35, 11.53);
  T.lines(s, [
    "Lifts, tunnels, basements, planes, trains, festivals, hospital wards, rural roads, and the hotel Wi-Fi that resolves DNS and then routes nothing. All of them are ordinary conditions for your users.",
    "Worse than no signal is “lie-fi”: the interface is up, the TCP connection opens, and the request hangs until your timeout fires. An app that treats the network as available-or-not gets this wrong every time.",
    { text: "An offline-first app has no offline error path, because being offline is not an error.", options: { bold: true } },
  ], { x: 0.9, y: 4.6, w: 11.53, h: 1.9, fontSize: 13, paraSpaceAfter: 12 });
  s.addNotes("This is the lecture your semester project needs: the project brief requires persistence, offline behavior and cross-device sync, and no lab covers it. Everything from here to the closing slide is buildable in an evening.");
}

// -------------------------------------------- 6 INVERSION OF TRUTH ----------
{
  const s = d.content("Why offline-first", "The inversion of truth");
  s.addText("The same user action, in the two architectures. Only one of them still works in a lift.", {
    x: 0.9, y: 1.9, w: 11.53, h: 0.35, fontFace: F, fontSize: 13.5, color: C.GRAY, margin: 0,
  });
  s.addText("Online-first: UI = f(network response)", {
    x: 0.9, y: 2.35, w: 5.3, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0,
  });
  s.addText("Offline-first: UI = f(local database)", {
    x: 7.13, y: 2.35, w: 5.3, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0,
  });
  T.flowDown(s, [
    ["User taps Save", "spinner appears", "hair"],
    ["Request goes out", "latency, retries, timeout", "panel"],
    ["Server answers 200", "or it does not", "hair"],
    ["UI finally updates", "or shows an error the user cannot act on", "panel"],
  ], { x: 0.9, y: 2.72, w: 5.3, h: 0.70, gap: 0.20 });
  T.flowDown(s, [
    ["User taps Save", "no spinner at all", "black"],
    ["Local DB write", "committed in one transaction", "hair"],
    ["UI rebuilds instantly", "watch() re-emits from the database", "panel"],
    ["Sync, at some point", "background, retried, invisible", "hair"],
  ], { x: 7.13, y: 2.72, w: 5.3, h: 0.70, gap: 0.20 });
  s.addText("The network stops being on the critical path of a user action. It becomes a background job that reconciles two copies of the truth, and the user never waits for it.", {
    x: 0.9, y: 6.3, w: 11.53, h: 0.5, fontFace: F, fontSize: 12.5, color: C.GRAY, margin: 0, valign: "top",
  });
}

// ------------------------------------------------------------ 7 CAP --------
{
  const s = d.content("Why offline-first", "CAP, on a device in your pocket");
  s.addText("CAP is a statement about what happens during a partition: when the two sides cannot talk, you either refuse to answer, or you answer with data that may be stale. You cannot have both.", {
    x: 0.9, y: 1.9, w: 11.53, h: 0.5, fontFace: F, fontSize: 13.5, color: C.INK, margin: 0, valign: "top",
  });
  T.iconGrid(s, [
    ["network", "Partition tolerance", "Not a choice on mobile. The partition is not a rare fault you engineer against. It is the resting state of a phone in a lift."],
    ["circlecheck", "Availability", "You keep it. Every read is answered from the local database and every write is accepted, signal or no signal."],
    ["scale", "Consistency", "You give it up. What you get instead is eventual consistency, and the cost of it is the whole second half of this lecture."],
  ], { y: 2.6, rowH: 2.2 });
  T.takeaway(s, "The network picks P for you.",
    "The only thing you choose is whether the app stays useful while partitioned, or freezes waiting for data it cannot reach.", 5.5);
  s.addNotes("The source deck taught CAP twice, once for the offline-first half and again for the CRDT half, with slightly different framing each time. This is the single version. Note the common misreading: CAP does not say 'pick two of three'; it says 'during a partition, pick one of two'.");
}

// ================================================================ SECTION 2 ==
d.divider("The local database", "One source of truth, on the device",
  "Schema, reactive reads, and an outbox for every write");

// ------------------------------------------------ 9 CHOOSING THE STORE ------
{
  const s = d.content("The local database", "Firestore's cache, or your own SQLite");
  T.table(s, ["Firestore offline cache", "Drift (SQLite)"], [
    ["Types", "dynamic maps, checked at runtime", "compile-time checked SQL and rows"],
    ["Reactive UI", "snapshots() streams", "watch() streams, on any query you can write"],
    ["Offline queries", "no local indexes: full scans, and jank", "your indexes work offline too"],
    ["Transactions", "online only, no offline atomicity", "full local ACID transactions"],
    ["Cache control", "opaque LRU; you cannot pin a document", "it is your file; nothing is evicted"],
    ["Cost", "billed per document read, sync catch-up included", "flat: whatever your backend costs"],
  ], { y: 1.98, labelW: 1.65, rowH: 0.5, fontSize: 11.5, focusCols: [1] });
  T.takeaway(s, "Firestore is a managed sync engine you cannot open.",
    "For a project that must query, transact and search offline, own the database, or take a middle path like PowerSync.  → Lecture 5, the backend it syncs with", 5.75);
}

// ------------------------------------------------------- 10 DRIFT SCHEMA ----
{
  const s = d.content("The local database", "Every synced table carries sync metadata");
  T.codeBlock(s, [
    "// lib/db/tables.dart",
    "class Notes extends Table {",
    "  // client-generated UUID: two offline devices must never",
    "  // invent the same primary key",
    "  TextColumn get id => text()();",
    "  TextColumn get title => text().withDefault(const Constant(''))();",
    "  TextColumn get body  => text().withDefault(const Constant(''))();",
    "",
    "  // ---- the four columns that make a table syncable ----",
    "  DateTimeColumn get updatedAt   => dateTime()();",
    "  DateTimeColumn get deletedAt   => dateTime().nullable()();",
    "  BoolColumn get pendingSync =>",
    "      boolean().withDefault(const Constant(true))();",
    "  IntColumn  get serverVersion =>",
    "      integer().withDefault(const Constant(0))();",
    "",
    "  @override",
    "  Set<Column> get primaryKey => {id};",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.5, h: 4.8, fontSize: 8.5 });
  T.lines(s, [
    { text: "id: a UUID, made on the client", options: { bold: true } },
    "Auto-increment collides: two offline devices both create row 42, and one of them loses.",
    { text: "updatedAt: when this device last edited", options: { bold: true } },
    "The input to any timestamp-based resolution. Its weakness is slide 21.",
    { text: "deletedAt: the tombstone", options: { bold: true } },
    "A delete is a write. Never issue a local DELETE for a synced row.",
    { text: "pendingSync: the isDirty flag", options: { bold: true } },
    "True from the moment you touch the row until the server has acknowledged it.",
    { text: "serverVersion: what we last saw", options: { bold: true } },
    "Lets the resolver tell “we are ahead” from “both sides moved”.",
  ], { x: 8.7, y: 1.95, w: 3.73, h: 4.9, fontSize: 10.5, paraSpaceAfter: 6 });
  s.addNotes("dart run build_runner build generates the DAO mixin and the row classes. Show the generated schema version bump when a column is added, because migrations are the part students discover when they ship an update.");
}

// ------------------------------------------------------ 11 REACTIVE READ ----
{
  const s = d.content("The local database", "The UI reads local data");
  T.codeBlock(s, [
    "@DriftAccessor(tables: [Notes])",
    "class NotesDao extends DatabaseAccessor<AppDb> with _$NotesDaoMixin {",
    "  NotesDao(super.db);",
    "",
    "  // A live query. Drift re-runs it and re-emits whenever the",
    "  // notes table changes, no matter who changed it: the user,",
    "  // or the sync engine writing rows it pulled from the server.",
    "  Stream<List<Note>> watchActive() =>",
    "      (select(notes)",
    "            ..where((n) => n.deletedAt.isNull())",
    "            ..orderBy([(n) => OrderingTerm.desc(n.updatedAt)]))",
    "          .watch();",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.5, h: 3.3, fontSize: 8.5 });
  T.codeBlock(s, [
    "StreamBuilder<List<Note>>(",
    "  stream: dao.watchActive(),",
    "  builder: (_, snap) => NoteList(snap.data ?? const []),",
    ")",
  ], { x: 0.9, y: 5.45, w: 7.5, h: 1.35, fontSize: 9 });
  T.lines(s, [
    "One stream, two writers. The user edits a note and the list updates; the sync engine pulls a change from the server and the same list updates. The widget never knows which happened.",
    "There is no loading state for the network here, only the first-launch case where the database is genuinely empty.",
    "Filtering deletedAt IS NULL in the query is what makes tombstones invisible to the UI while they stay visible to the sync engine.",
    "Drift's watch() is a Stream, so everything you learned about StreamBuilder and Riverpod still applies.  → Lecture 4",
  ], { x: 8.7, y: 1.95, w: 3.73, h: 4.9, fontSize: 11, paraSpaceAfter: 11 });
}

// ----------------------------------------------------------- 12 OUTBOX ------
{
  const s = d.content("The local database", "Writes go to the table and an outbox");
  T.codeBlock(s, [
    "// One transaction. Either both rows land, or neither does.",
    "Future<void> saveNote(Note n) => db.transaction(() async {",
    "  final row = n.copyWith(",
    "      updatedAt: DateTime.now(), pendingSync: true);",
    "  await into(notes).insertOnConflictUpdate(row);",
    "  await into(outbox).insert(OutboxCompanion.insert(",
    "    id: uuid.v4(), entity: 'note', entityId: n.id,",
    "    op: 'upsert', payload: jsonEncode(row.toJson()),",
    "    queuedAt: DateTime.now(),",
    "  ));",
    "});",
    "",
    "// A delete is a write. Never a DELETE statement.",
    "Future<void> deleteNote(String id) => db.transaction(() async {",
    "  await (update(notes)..where((n) => n.id.equals(id))).write(",
    "      NotesCompanion(deletedAt: Value(DateTime.now()),",
    "                     pendingSync: const Value(true)));",
    "  await into(outbox).insert(/* op: 'delete', entityId: id */);",
    "});",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.85, fontSize: 8.5 });
  T.lines(s, [
    { text: "Why not just call the API?", options: { bold: true } },
    "Because the call can fail, and then your local row and the server disagree with nothing recording that fact.",
    "The outbox is that record: a durable, ordered list of intents that survives the process being killed mid-request.",
    { text: "One transaction, two effects.", options: { bold: true } },
    "The data row and the intent to sync it commit together, so the queue can never drift out of step with the data.",
    "The UI already updated: watch() fired the moment the transaction committed, long before any packet left the device.",
  ], { x: 8.9, y: 1.95, w: 3.53, h: 4.9, fontSize: 11, paraSpaceAfter: 11 });
  s.addNotes("This is the outbox pattern, exactly as it is used in backend services. The subtlety worth saying aloud: the transaction is what makes it safe. Writing the row and then enqueueing outside a transaction gives you a window where the app can be killed and the change is silently never synced.");
}

// ================================================================ SECTION 3 ==
d.divider("The sync engine", "Two loops and a checkpoint",
  "Push what we changed, pull what they changed, remember where we got to");

// ------------------------------------------------------- 14 ARCHITECTURE ----
{
  const s = d.content("The sync engine", "The two loops");
  s.addText("Nothing here runs while the user is waiting. Both loops are triggered by events, and both are safe to interrupt.", {
    x: 0.9, y: 1.9, w: 11.53, h: 0.35, fontFace: F, fontSize: 13.5, color: C.GRAY, margin: 0,
  });
  s.addText("Push: what this device changed", {
    x: 0.9, y: 2.32, w: 5.3, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0,
  });
  s.addText("Pull: what everyone else changed", {
    x: 7.13, y: 2.32, w: 5.3, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0,
  });
  T.flowDown(s, [
    ["Read the outbox", "oldest first, in batches", "hair"],
    ["POST it", "with an idempotency key", "panel"],
    ["Server accepts", "assigns a version, stamps its own clock", "hair"],
    ["Drop the row, clear pendingSync", "in one transaction", "black"],
  ], { x: 0.9, y: 2.7, w: 5.3, h: 0.72, gap: 0.20 });
  T.flowDown(s, [
    ["GET /sync?since=…", "the last checkpoint we were given", "hair"],
    ["Server returns a delta", "rows changed after that point, tombstones included", "panel"],
    ["Upsert, or resolve", "conflict only if pendingSync is set", "hair"],
    ["Save the new checkpoint", "the server's time, never ours", "black"],
  ], { x: 7.13, y: 2.7, w: 5.3, h: 0.72, gap: 0.20 });
  s.addText("The checkpoint is the whole protocol. Store the timestamp the server reported, not the one your device read. Otherwise clock skew makes you skip rows you never downloaded.", {
    x: 0.9, y: 6.3, w: 11.53, h: 0.45, fontFace: F, fontSize: 12.5, color: C.GRAY, margin: 0, valign: "top",
  });
}

// ------------------------------------------------------- 15 PUSH LOOP -------
{
  const s = d.content("The sync engine", "Draining the outbox");
  T.codeBlock(s, [
    "Future<void> drainOutbox() async {",
    "  final batch = await (select(outbox)",
    "        ..orderBy([(o) => OrderingTerm.asc(o.queuedAt)])",
    "        ..limit(50)).get();",
    "",
    "  for (final item in batch) {",
    "    try {",
    "      await api.push(item, idempotencyKey: item.id);",
    "      await db.transaction(() async {",
    "        await (delete(outbox)..where((o) => o.id.equals(item.id))).go();",
    "        await (update(notes)",
    "              ..where((n) => n.id.equals(item.entityId)))",
    "            .write(const NotesCompanion(pendingSync: Value(false)));",
    "      });",
    "    } on ApiFailure catch (e) {",
    "      if (e.permanent) { await _park(item); continue; }  // 4xx",
    "      break;   // transient: stop, keep the order, try again later",
    "    }",
    "  }",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.85, fontSize: 8.5 });
  T.lines(s, [
    { text: "FIFO, and stop on the first transient failure.", options: { bold: true } },
    "Skipping ahead reorders the user's edits, and the server sees an update for a row it has not been told about yet.",
    { text: "The idempotency key is the outbox row id.", options: { bold: true } },
    "A reply lost on the way back means you push the same intent twice. The server must recognize it and do nothing.  → Lecture 5",
    { text: "Park poison messages.", options: { bold: true } },
    "A permanent 4xx will fail identically forever. Move it aside, surface it, and let the rest of the queue through.",
  ], { x: 8.9, y: 1.95, w: 3.53, h: 4.9, fontSize: 10.5, paraSpaceAfter: 9 });
}

// ------------------------------------------------------- 16 PULL LOOP -------
{
  const s = d.content("The sync engine", "Delta sync: only what changed");
  T.codeBlock(s, [
    "Future<void> pull() async {",
    "  var cursor = await meta.checkpoint();   // the server's clock",
    "  while (true) {",
    "    final page = await api.get('/sync', {'since': cursor});",
    "    await db.transaction(() async {",
    "      for (final r in page.rows) {",
    "        final local = await notesDao.findById(r.id);",
    "        if (local != null && local.pendingSync) {",
    "          await notesDao.put(resolve(local, r));  // slide 24",
    "        } else {",
    "          await notesDao.put(fromServer(r));      // incl. deletedAt",
    "        }",
    "      }",
    "      await meta.setCheckpoint(page.serverCursor);",
    "    });",
    "    if (!page.hasMore) break;",
    "    cursor = page.serverCursor;",
    "  }",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.85, fontSize: 8.5 });
  T.codeBlock(s, [
    "GET /sync?since=2026-08-01T09:14:22Z",
    "",
    "{ \"serverCursor\": \"...:31Z\",",
    "  \"hasMore\": false,",
    "  \"rows\": [",
    "   {\"id\":\"a1\",\"title\":\"Milk\",",
    "    \"deletedAt\":null,\"version\":7},",
    "   {\"id\":\"b2\",\"deletedAt\":\"...\"}",
    "  ]}",
  ], { x: 8.9, y: 1.95, w: 3.53, h: 2.5, fontSize: 8 });
  T.lines(s, [
    "Deleted rows come down as rows. A row that is simply absent means “not changed”, never “gone”.",
    "Page it. A device offline for a fortnight will not get its backlog in one response.",
    "Whole transaction per page, so an interrupted sync leaves a consistent database and a usable checkpoint.",
  ], { x: 8.9, y: 4.65, w: 3.53, h: 2.2, fontSize: 10.5, paraSpaceAfter: 9 });
}

// -------------------------------------------------- 17 TOPOLOGIES -----------
{
  const s = d.content("The sync engine", "When to wake the radio");
  T.table(s, ["How it works", "Latency", "Radio cost", "Use it for"], [
    ["Push", "server holds a socket open, or sends a data push", "real time", "high: keep-alives, constant wake-ups", "chat, live tracking, shared editing"],
    ["Poll", "a timer fires a request whether or not anything changed", "half the interval", "high and wasted: most calls return nothing", "legacy backends with no push"],
    ["Delta on trigger", "sync when something happened: resume, reconnect, pull-to-refresh", "seconds", "low: one exchange per real event", "almost every app, including yours"],
    ["Nudge + delta", "a silent push says “there is news”, the client then pulls a delta", "near real time", "low: the payload rides an existing channel", "feeds, inboxes, shared lists"],
  ], { y: 2.1, labelW: 1.75, rowH: 0.72, fontSize: 10.5, focusCols: [3] });
  T.takeaway(s, "Sync on events, not on a timer.",
    "App resumed, connectivity returned, user pulled down, or the server said something changed. A fixed interval spends battery on requests that return nothing.  → Lecture 8, WebSockets for the push channel  ·  → Lecture 11, what a radio wake-up actually costs", 5.6);
}

// -------------------------------------------------- 18 BACKGROUND -----------
{
  const s = d.content("The sync engine", "Background sync, and what it gives you");
  T.lines(s, [
    { text: "Android: WorkManager.", options: { bold: true } },
    "Periodic work with a 15-minute floor, constraints you can declare (network connected, charging, battery not low), and survival across reboots. Doze still batches it, so 15 minutes means “no sooner than”.",
    { text: "iOS: BGTaskScheduler.", options: { bold: true } },
    "You register an identifier and submit a request. The system decides, based on how often the user opens your app, whether you run at all. Execution is never guaranteed and the window is short.",
    { text: "So do not depend on it.", options: { bold: true } },
    "Treat background sync as an optimization. The syncs you can rely on are the ones you trigger yourself, in the foreground.",
  ], { x: 0.9, y: 1.95, w: 6.5, h: 4.4, fontSize: 12, paraSpaceAfter: 9 });
  T.codeBlock(s, [
    "// the triggers that actually fire",
    "void didChangeAppLifecycleState(AppLifecycleState s) {",
    "  if (s == AppLifecycleState.resumed) sync.now();",
    "}",
    "",
    "Connectivity().onConnectivityChanged.listen((r) {",
    "  if (!r.contains(ConnectivityResult.none)) sync.now();",
    "});",
    "",
    "// best effort, on top of those",
    "Workmanager().registerPeriodicTask(",
    "  'sync', 'sync',",
    "  frequency: const Duration(minutes: 15),",
    "  constraints: Constraints(",
    "    networkType: NetworkType.connected),",
    ");",
  ], { x: 7.7, y: 1.95, w: 4.73, h: 4.05, fontSize: 8.5 });
  T.takeaway(s, "Foreground triggers are the contract; background work is a bonus.",
    "→ Lecture 11: every wake-up costs a radio ramp-up you pay for in battery.", 6.15);
}

// ================================================================ SECTION 4 ==
d.divider("Conflicts", "Two devices editing the same row",
  "Clocks, resolution strategies, and data types that cannot conflict");

// -------------------------------------------------- 20 WHERE CONFLICTS ------
{
  const s = d.content("Conflicts", "Where conflicts actually come from");
  T.lines(s, [
    "A conflict is not a bug and not a race in your code. It is two edits to the same row that were made without either side being able to see the other.",
    "Offline-first guarantees they will happen: the whole design is “accept the write now, reconcile later”. A single user with a phone and a laptop is enough.",
    "The server sees both updates arrive claiming to modify version 7. It has to pick, merge, or reject, and each of those affects someone's work.",
    { text: "You cannot prevent conflicts. You can only decide, in advance and in writing, what happens when one occurs.", options: { bold: true } },
  ], { x: 0.9, y: 1.95, w: 6.7, h: 3.5, fontSize: 13, paraSpaceAfter: 13 });
  T.hairbox(s, 7.9, 2.15, 2.1, 1.05);
  s.addText([
    { text: "Phone", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "title → “Groceries”", options: { fontSize: 11, color: C.GRAY } },
  ], { x: 7.9, y: 2.15, w: 2.1, h: 1.05, fontFace: F, fontSize: 13, align: "center", valign: "middle", margin: 0 });
  T.hairbox(s, 10.33, 2.15, 2.1, 1.05);
  s.addText([
    { text: "Laptop", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "title → “Shopping”", options: { fontSize: 11, color: C.GRAY } },
  ], { x: 10.33, y: 2.15, w: 2.1, h: 1.05, fontFace: F, fontSize: 13, align: "center", valign: "middle", margin: 0 });
  T.arrow(s, 8.95, 3.2, 0, 0.75);
  T.arrow(s, 11.38, 3.2, 0, 0.75);
  T.blackbox(s, 7.9, 3.95, 4.53, 0.95);
  s.addText([
    { text: "Server: note #7, version 7", options: { bold: true, color: C.WHITE, breakLine: true } },
    { text: "two updates, both claim to follow version 7", options: { fontSize: 11, color: C.DGRAY } },
  ], { x: 7.9, y: 3.95, w: 4.53, h: 0.95, fontFace: F, fontSize: 13, align: "center", valign: "middle", margin: 0 });
  s.addText("Both edits were made while offline. Neither device saw the other. Nothing has been overwritten yet. That decision is still yours to make.", {
    x: 7.9, y: 5.1, w: 4.53, h: 0.9, fontFace: F, fontSize: 11, color: C.GRAY, margin: 0, valign: "top",
  });
  T.takeaway(s, "Design the resolution rule before you need it.",
    "Otherwise the rule is whatever your ORM happened to do.", 5.7, { w: 6.7 });
}

// -------------------------------------------------- 21 CLOCK SKEW -----------
{
  const s = d.content("Conflicts", "Device clocks cannot order events");
  s.addText("Every device believes its own clock. NTP drift, a user setting the time by hand, a flat battery, a cheap RTC: a few seconds of disagreement is normal, and minutes is not rare.", {
    x: 0.9, y: 1.9, w: 11.53, h: 0.45, fontFace: F, fontSize: 13.5, color: C.INK, margin: 0, valign: "top",
  });

  // --- lane 1: phone ---
  s.addText([
    { text: "Phone clock", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "12 s ahead", options: { fontSize: 10.5, color: C.GRAY } },
  ], { x: 0.9, y: 2.9, w: 1.5, h: 0.6, fontFace: F, fontSize: 12.5, margin: 0, valign: "middle" });
  T.hline(s, 2.6, 3.2, 9.6);
  T.blackbox(s, 4.75, 3.12, 0.16, 0.16);
  s.addText([
    { text: "writes “Milk”  ·  stamps 09:14:07", options: { color: C.INK } },
  ], { x: 3.5, y: 2.78, w: 3.6, h: 0.32, fontFace: F, fontSize: 11.5, align: "center", margin: 0 });

  // --- lane 2: laptop ---
  s.addText([
    { text: "Laptop clock", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "40 s behind", options: { fontSize: 10.5, color: C.GRAY } },
  ], { x: 0.9, y: 4.05, w: 1.5, h: 0.6, fontFace: F, fontSize: 12.5, margin: 0, valign: "middle" });
  T.hline(s, 2.6, 4.35, 9.6);
  T.blackbox(s, 8.45, 4.27, 0.16, 0.16);
  s.addText([
    { text: "writes “Oat milk”  ·  stamps 09:13:55", options: { color: C.INK } },
  ], { x: 7.1, y: 3.93, w: 3.8, h: 0.32, fontFace: F, fontSize: 11.5, align: "center", margin: 0 });

  // --- real time axis ---
  s.addText("Real time", { x: 0.9, y: 4.85, w: 1.5, h: 0.35, fontFace: F, fontSize: 12.5, bold: true, color: C.INK, margin: 0 });
  T.arrow(s, 2.6, 5.02, 9.6, 0);
  s.addText("t = 0", { x: 4.1, y: 5.1, w: 1.5, h: 0.3, fontFace: F, fontSize: 11, color: C.GRAY, align: "center", margin: 0 });
  s.addText("t = +40 s", { x: 7.78, y: 5.1, w: 1.5, h: 0.3, fontFace: F, fontSize: 11, color: C.GRAY, align: "center", margin: 0 });

  T.takeaway(s, "The later write carries the earlier timestamp.",
    "Last-write-wins compares 09:14:07 with 09:13:55 and keeps “Milk”. The user's newest edit is discarded with no error, no log and no undo. That happens whenever two clocks disagree by more than the gap between two edits.", 5.6);
  s.addNotes("The original deck illustrated this with a digital-circuit clock-skew diagram: CLKA and CLKB waveforms from a hardware textbook. That is the wrong domain, because it describes signal propagation inside a chip, not two machines disagreeing about what time it is.");
}

// -------------------------------------------------- 22 LOGICAL CLOCKS -------
{
  const s = d.content("Conflicts", "Logical clocks: order without a clock");
  T.codeBlock(s, [
    "// Hybrid Logical Clock: readable time, trustworthy order.",
    "class Hlc implements Comparable<Hlc> {",
    "  final int wallMs;    // milliseconds since epoch",
    "  final int counter;   // ties inside the same millisecond",
    "  final String node;   // replica id, deterministic tiebreak",
    "",
    "  Hlc tick(int nowMs) => nowMs > wallMs      // a local event",
    "      ? Hlc(nowMs, 0, node)",
    "      : Hlc(wallMs, counter + 1, node);",
    "  // a timestamp arrived from another replica",
    "  Hlc receive(Hlc r, int nowMs) {",
    "    final w = [nowMs, wallMs, r.wallMs].reduce(max);",
    "    if (w == wallMs && w == r.wallMs)",
    "      return Hlc(w, max(counter, r.counter) + 1, node);",
    "    if (w == wallMs)   return Hlc(w, counter + 1, node);",
    "    if (w == r.wallMs) return Hlc(w, r.counter + 1, node);",
    "    return Hlc(w, 0, node);",
    "  }",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.5, h: 4.85, fontSize: 8.5 });
  T.lines(s, [
    { text: "Lamport clock: a counter, not a time.", options: { bold: true } },
    "Local event: L = L + 1. Send: attach L. Receive: L = max(L, L received) + 1.",
    "Guarantee: if a caused b, then L(a) is less than L(b). The converse is false: a smaller counter does not prove causality, and may just mean the two events were concurrent.",
    { text: "Vector clock: one counter per replica.", options: { bold: true } },
    "Can actually detect concurrency, at the cost of state that grows with the number of devices.",
    { text: "HLC: the practical compromise.", options: { bold: true } },
    "Ordering that never contradicts causality, timestamps that still read like real times, 64 bits on the wire. Use it as your updatedAt.",
  ], { x: 8.7, y: 1.95, w: 3.73, h: 4.9, fontSize: 10.5, paraSpaceAfter: 8 });
  s.addNotes("The math students usually want spelled out: Lamport gives a total order consistent with causality, not a reconstruction of real time. Two concurrent events get some order, arbitrary but consistent, which is what you need to make a merge deterministic.");
}

// -------------------------------------------------- 23 STRATEGIES -----------
{
  const s = d.content("Conflicts", "Four strategies, honestly ranked");
  T.table(s, ["How it decides", "What it costs you", "Reach for it when"], [
    ["Last-write-wins", "the whole row with the highest timestamp wins", "silent data loss: the loser's edit is gone and nobody is told", "one user, one device at a time, low-value fields"],
    ["Server-authoritative", "the server recomputes and its answer is final", "an accepted offline edit can be rejected later; you must show the user", "money, stock, bookings, anything with an invariant"],
    ["Merge by field", "compare column by column; only changed fields overwrite", "one resolver per entity, written and tested by you", "documents and forms with independent fields"],
    ["CRDT", "merge() is defined so every order of arrival converges", "metadata: tags, tombstones, version vectors, and their growth", "counters, sets, and collaborative text"],
  ], { y: 2.1, labelW: 1.95, rowH: 0.74, fontSize: 10.5, focusCols: [2] });
  T.takeaway(s, "Most apps need two of these, not one.",
    "Merge by field for the user's own documents, server-authoritative for anything that must add up. Reach for a CRDT when the data type genuinely fits one.", 5.7);
}

// -------------------------------------------------- 24 RESOLVER CODE --------
{
  const s = d.content("Conflicts", "A resolver you can actually ship");
  T.codeBlock(s, [
    "/// Merge by field. Needs a per-field timestamp: the row stores",
    "/// titleAt / bodyAt as well as updatedAt.",
    "Note resolve(Note local, ServerNote remote) {",
    "  // nothing pending locally: the server is simply newer",
    "  if (!local.pendingSync) return fromServer(remote);",
    "  // we already have everything they have: keep ours, push it",
    "  if (remote.version <= local.serverVersion) return local;",
    "",
    "  // real conflict: both sides moved past version N",
    "  return local.copyWith(",
    "    title: _pick(local.title, local.titleAt,",
    "                 remote.title, remote.titleAt),",
    "    body:  _pick(local.body,  local.bodyAt,",
    "                 remote.body,  remote.bodyAt),",
    "    deletedAt: local.deletedAt ?? remote.deletedAt, // delete wins",
    "    serverVersion: remote.version,",
    "    pendingSync: true,  // a new value, push it back",
    "  );",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.6, fontSize: 8.5 });
  T.codeBlock(s, [
    "T _pick<T>(T mine, Hlc mineAt,",
    "           T theirs, Hlc theirsAt) =>",
    "    mineAt.compareTo(theirsAt) >= 0",
    "        ? mine : theirs;",
  ], { x: 8.9, y: 1.95, w: 3.53, h: 1.55, fontSize: 8 });
  T.lines(s, [
    "Per field it is still last-write-wins, but only one column is affected instead of the whole record. A concurrent title and body edit now both survive.",
    "_pick compares HLCs, so it is deterministic: both devices reach the same answer without talking to each other.",
    "Delete beats edit here. That is a product decision, not a technical one. Write it down, and consider an undo instead.",
    { text: "Push the merged row back.", options: { bold: true } },
    "If the resolver only fixes the local copy, the two sides never converge.",
  ], { x: 8.9, y: 3.75, w: 3.53, h: 3.1, fontSize: 10.5, paraSpaceAfter: 9 });
}

// -------------------------------------------------- 25 CRDT PROPERTIES ------
{
  const s = d.content("Conflicts", "CRDTs: convergence without coordination");
  s.addText("A CRDT is a data type whose merge function is defined so that replicas which have received the same set of updates end up in the same state, with no leader, no locks and no round trip. That property is called strong eventual consistency.", {
    x: 0.9, y: 1.9, w: 11.53, h: 0.55, fontFace: F, fontSize: 13.5, color: C.INK, margin: 0, valign: "top",
  });
  T.iconGrid(s, [
    ["arrowleftright", "Commutative", "merge(a, b) equals merge(b, a). Messages may arrive in any order, from any device, over any path."],
    ["combine", "Associative", "Grouping does not matter, so replicas can gossip in whatever topology the network gives them."],
    ["repeat", "Idempotent", "merge(a, a) equals a. Receiving the same update twice is a no-op, which is what makes retries free."],
  ], { y: 2.65, rowH: 2.2 });
  T.takeaway(s, "Convergent is not the same as correct.",
    "A CRDT guarantees every replica agrees on the answer. It does not guarantee the answer is what the user meant, and it cannot enforce “the balance must never go below zero”, because that needs coordination by definition.", 5.5);
  s.addNotes("Two flavors worth naming: state-based (send the whole state, merge on arrival, robust over lossy links) and operation-based (send individual operations, far smaller, but requires exactly-once causal delivery). Delta-state CRDTs are the practical middle: send only the fragment that changed, keep state-based robustness.");
}

// -------------------------------------------------- 26 G-COUNTER ------------
{
  const s = d.content("Conflicts", "A counter that survives being merged");
  s.addText("A plain integer cannot merge. Phone says 4, laptop says 3: is the answer 4, or 7? You cannot tell without the history. So keep the history: one slot per replica, each replica only ever increments its own slot.", {
    x: 0.9, y: 1.9, w: 11.53, h: 0.5, fontFace: F, fontSize: 13.5, color: C.INK, margin: 0, valign: "top",
  });
  T.table(s, ["Phone's slot", "Laptop's slot", "Tablet's slot", "Value = sum"], [
    ["Phone's state", "3", "1", "0", "4"],
    ["Laptop's state", "1", "2", "0", "3"],
    ["Merge = max per slot", "3", "2", "0", "5"],
    ["Tablet then adds 1", "3", "2", "1", "6"],
  ], { y: 2.6, labelW: 2.4, rowH: 0.5, fontSize: 11.5, focusCols: [3] });
  T.lines(s, [
    "The merge is a maximum, not an addition, which is why receiving the same state twice changes nothing. The value is the sum of the slots.",
    "This is a G-Counter: grow-only. To support decrements you keep two of them, one for increments and one for decrements, and subtract the totals: that is a PN-Counter. A maximum cannot un-count.",
  ], { x: 0.9, y: 5.3, w: 11.53, h: 1.35, fontSize: 12.5, paraSpaceAfter: 10 });
}

// -------------------------------------------------- 27 TOMBSTONES -----------
{
  const s = d.content("Conflicts", "Deleted is a row, not a missing row");
  T.lines(s, [
    "Delete a row locally and the next pull cannot tell “this was deleted here” from “this has not reached me yet”. The server sends it back, and the item the user deleted reappears.",
    "So a delete is a write: set deletedAt, keep the row, filter it out of every query the UI runs. The tombstone is what propagates the deletion.",
    { text: "The same problem inside a set.", options: { bold: true } },
    "An OR-Set gives every add a unique tag. A remove takes away only the tags that replica has observed. A concurrent add survives: the remover never saw its tag, so it could not have meant to remove it.",
    { text: "Tombstones are not free.", options: { bold: true } },
    "They accumulate forever unless you collect them. Either prove every replica has seen the deletion, or set a retention window: purge tombstones older than, say, 90 days, and make any device that has been offline longer do a full resync instead of a delta.",
  ], { x: 0.9, y: 1.95, w: 6.9, h: 4.4, fontSize: 12, paraSpaceAfter: 10 });
  T.hairbox(s, 8.1, 1.95, 4.33, 2.9);
  s.addText("OR-Set, one worked case", {
    x: 8.4, y: 2.15, w: 3.8, h: 0.35, fontFace: F, fontSize: 13.5, bold: true, color: C.INK, margin: 0,
  });
  s.addText([
    { text: "A: add “milk”", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "adds = {(milk, a1)}", options: { color: C.GRAY, breakLine: true, fontFace: MONO, fontSize: 10 } },
    { text: "B: sees a1, removes “milk”", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "removed = {a1}", options: { color: C.GRAY, breakLine: true, fontFace: MONO, fontSize: 10 } },
    { text: "A, concurrently: add “milk” again", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "adds = {(milk, a1), (milk, a2)}", options: { color: C.GRAY, breakLine: true, fontFace: MONO, fontSize: 10 } },
    { text: "merge: adds minus removed", options: { bold: true, color: C.BLUE, breakLine: true } },
    { text: "= {(milk, a2)}, milk is present", options: { color: C.GRAY, fontFace: MONO, fontSize: 10 } },
  ], { x: 8.4, y: 2.6, w: 3.8, h: 2.6, fontFace: F, fontSize: 11.5, margin: 0, paraSpaceAfter: 5, valign: "top" });
  T.takeaway(s, "Add wins, because the remover could not have observed it.",
    "That is a defensible default for a shopping list, and the wrong one for a bank ledger.", 5.7, { w: 6.9 });
}

// -------------------------------------------------------------- 28 CLOSING ---
{
  const s = d.closing([
    ["checklist", "Recap", [
      "Offline is a normal state; the local database is what the UI reads, always",
      "One transaction writes the row and the outbox intent together",
      "Delta sync on a server-issued checkpoint, never on your device's clock",
      "Wall clocks cannot order events; HLCs can, and still read like times",
      "Deleted is a row. LWW is simple and lossy. CRDTs converge, but convergence is not correctness",
    ]],
    ["calendar", "This week: on your project", [
      "Add Drift, with id (UUID), updatedAt, deletedAt and pendingSync on every synced table",
      "Replace one FutureBuilder with a watch() stream",
      "Add the outbox table and drain it on resume and on reconnect",
      "Then turn on airplane mode and use your own app for five minutes",
    ]],
    ["bookopen", "Read more", [
      "drift.simonbinder.eu: schema, DAOs, migrations",
      "crdt.tech: the CRDT catalog and the original papers",
      "Kleppmann, Designing Data-Intensive Applications, ch. 5",
      "inkandswitch.com/local-first",
      "pub.dev/packages/workmanager · powersync.com",
    ]],
  ]);
}

d.write(path.join(__dirname, "Mobile-and-Embedded-Lecture10-v2.pptx"))
  .then((f) => console.log("written:", f, "slides:", d.n));
