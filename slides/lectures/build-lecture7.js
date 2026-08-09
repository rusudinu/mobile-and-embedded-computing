// ============================================================================
// Mobile & Embedded Computing: Lecture 7
// "Authentication": Firebase Auth, OAuth providers, App Check.
// Built on the shared template (template.js). Do not restyle.
// ============================================================================
const path = require("path");
const T = require("../assets/template");
const { Deck, C, F, MONO } = T;

const d = new Deck({
  lecture: 7,
  title: "Authentication",
  subtitle: "Firebase Auth, OAuth providers, App Check",
});

// ---------------------------------------------------------------- 1 TITLE ---
d.titleSlide();

// ------------------------------------------------------------------ 2 BIO ---
T.bioSlide(d);

// ----------------------------------------------------------- 3 OBJECTIVES ---
T.objectivesSlide(d, [
  ["fingerprint", "AuthN vs AuthZ", "Who the user is versus what they may do, and which layer answers each"],
  ["code", "Firebase Auth in Dart", "Sign-up, sign-in, reset, verification, sign-out, and authStateChanges()"],
  ["key", "OAuth and tokens", "The client-side credential handoff, and what an ID token proves"],
  ["shieldcheck", "Rules and App Check", "Rules that bind a request to a uid, and enforcement that keeps scripts out"],
]);

// -------------------------------------------------------------- 4 DIVIDER ---
d.divider(
  "Part 1 · Fundamentals",
  "Who you are, and what you may do",
  "Two different questions, answered by two different systems"
);

// ------------------------------------------------------ 5 AUTHN vs AUTHZ ----
{
  const s = d.content("Fundamentals", "Authentication is not authorization");
  const card = (x, ic, head, question, body) => {
    T.hairbox(s, x, 1.95, 5.6, 2.95);
    s.addImage({ path: T.icon(ic, "ink"), x: x + 0.42, y: 2.3, w: 0.44, h: 0.44 });
    s.addText(head, { x: x + 0.42, y: 2.9, w: 4.8, h: 0.4, fontFace: F, fontSize: 19, bold: true, color: C.INK, margin: 0 });
    s.addText(question, { x: x + 0.42, y: 3.35, w: 4.8, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.BLUE, margin: 0 });
    s.addText(body, { x: x + 0.42, y: 3.8, w: 4.8, h: 0.95, fontFace: F, fontSize: 12.5, color: C.GRAY, margin: 0, valign: "top" });
  };
  card(0.9, "fingerprint", "Authentication",
    "“Is this user really who they claim to be?”",
    "It checks a credential (a password, a provider token, a passkey) and issues a session.");
  card(6.83, "key", "Authorization",
    "“Now that I know who this is, what may they touch?”",
    "It decides, per request, which documents this identity is allowed to read, create, update or delete.");
  T.takeaway(s,
    "Firebase Auth only answers the first question.",
    "The second is answered by your Security Rules and by your own backend. A signed-in user is not an authorized user, and confusing the two is a common Firebase mistake.",
    5.15);
  s.addNotes("Push the room on this: 'request.auth != null' is authentication. It says nothing at all about authorization. We come back to exactly that rule later in this lecture.");
}

// ------------------------------------------------------------- 6 FACTORS ----
{
  const s = d.content("Fundamentals", "The three factors, and what MFA means");
  T.table(s, ["What it means", "Examples", "How it fails"], [
    ["Knowledge", "something you know", "password, PIN, security answer", "phished, reused, leaked in someone else's breach"],
    ["Possession", "something you have", "phone for an OTP, passkey, hardware key", "SMS is SIM-swappable; a passkey is not phishable"],
    ["Inherence", "something you are", "fingerprint, Face ID, iris", "unlocks a local secret; the biometric never leaves the device"],
  ], { y: 2.25, rowH: 0.85, labelW: 1.5, fontSize: 12 });
  T.takeaway(s,
    "Multi-factor means factors from different rows.",
    "A password plus a security question is one factor twice. Firebase supports SMS and TOTP second factors on the Identity Platform tier. Biometrics on the device are a screen lock, not a second factor.",
    5.35);
}

// -------------------------------------------------------- 7 BUILD vs BUY ----
{
  const s = d.content("Fundamentals", "Why you do not write this yourself");
  T.prosCons(s, [
    "Password hashing, salting and algorithm rotation you never touch",
    "Verification, reset and OTP delivery, deliverable and rate-limited",
    "20+ federated providers behind one Dart API",
    "Token minting, refresh and revocation, plus enumeration protection on by default",
  ], [
    "Your identity records live in a Google project, not in your database",
    "Pricing tracks monthly active users once you leave the free tier",
    "Their email templates and flows: customizable, not arbitrary",
    "The uid becomes your primary key: export exists, migration is still work",
  ], { headL: "What Firebase gives you", headR: "What you hand over", y: 1.95 });
  T.takeaway(s,
    "Identity is a specialty, not a sprint task.",
    "Everything on the left is a place where a subtle bug becomes a breach. The right-hand column is the price, and for a semester project it is worth paying.",
    4.95);
}

// -------------------------------------------------------------- 8 DIVIDER ---
d.divider(
  "Part 2 · Firebase Auth",
  "firebase_auth, in Dart",
  "Sign-up, sign-in, the auth gate, and the rest of the lifecycle"
);

// ------------------------------------------------------------ 9 PROVIDERS ---
{
  const s = d.content("Firebase Auth", "Providers, and the packages they need");
  T.table(s, ["Provider", "Flutter packages", "Worth knowing"], [
    ["Native", "Email & password", "firebase_auth", "enumeration protection is on by default"],
    ["Native", "Phone (SMS)", "firebase_auth", "costs money per message; SIM-swappable"],
    ["Federated", "Google", "firebase_auth + google_sign_in", "the flow we implement today"],
    ["Federated", "Apple", "firebase_auth + sign_in_with_apple", "required on iOS alongside other social logins"],
    ["Anonymous", "Anonymous", "firebase_auth", "a real uid before sign-up; link it later"],
  ], { y: 2.15, rowH: 0.6, labelW: 1.5, fontSize: 11.5 });
  T.takeaway(s,
    "One user, one uid, however many providers.",
    "Firebase keys the account on the email by default, so signing in with Google after signing up with that address lands on the same user.",
    5.85);
}

// -------------------------------------------------------------- 10 SIGNUP ---
{
  const s = d.content("Firebase Auth", "Creating an account");
  T.codeBlock(s, [
    "final auth = FirebaseAuth.instance;",
    "",
    "Future<void> signUp(String email, String password) async {",
    "  try {",
    "    final cred = await auth.createUserWithEmailAndPassword(",
    "        email: email.trim(), password: password);",
    "    await cred.user!.sendEmailVerification();",
    "  } on FirebaseAuthException catch (e) {",
    "    throw AuthFailure(switch (e.code) {",
    "      'email-already-in-use' => 'That email is already registered.',",
    "      'weak-password' => 'Use at least 8 characters.',",
    "      'invalid-email' => 'Enter a valid email address.',",
    "      _ => 'Sign-up could not be completed.',",
    "    });",
    "  }",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.4, h: 4.65, fontSize: 10.5 });
  s.addText("Three things to notice", { x: 8.6, y: 1.98, w: 3.85, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "createUserWithEmailAndPassword signs the new user in immediately. The password never reaches your code again after this line returns.",
    "Send the verification mail here, not later. An unverified account should not reach your data.",
    "Sign-up is the one endpoint that still reveals existence: email-already-in-use is unavoidable on a usable form. Rate limiting and App Check are the mitigation, not a vaguer message.",
  ], { x: 8.6, y: 2.45, w: 3.85, h: 4.0, fontSize: 11.5, color: C.GRAY, paraSpaceAfter: 12 });
  s.addNotes("The switch expression is Dart 3 syntax. Point out that the failure type you throw is your own. Never let a FirebaseAuthException reach the widget layer, because e.message is written for developers, not users.");
}

// ------------------------------------------------------------- 11 SIGN IN ---
{
  const s = d.content("Firebase Auth", "Signing in, and the one message you show");
  T.codeBlock(s, [
    "Future<void> signIn(String email, String password) async {",
    "  try {",
    "    await auth.signInWithEmailAndPassword(",
    "        email: email.trim(), password: password);",
    "  } on FirebaseAuthException catch (e) {",
    "    // One message for every credential failure.",
    "    const generic = 'Email or password is incorrect.';",
    "    throw AuthFailure(switch (e.code) {",
    "      'too-many-requests' => 'Too many attempts. Try again later.',",
    "      'network-request-failed' => 'You appear to be offline.',",
    "      // invalid-credential, invalid-email, user-disabled, ...",
    "      _ => generic,",
    "    });",
    "  }",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.4, h: 4.4, fontSize: 10.5 });
  s.addText("Why one message", { x: 8.6, y: 1.98, w: 3.85, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "Since late 2023 Firebase no longer tells you which half was wrong: unknown email and wrong password both arrive as invalid-credential.",
    "That is deliberate. Your job is to keep it that way in the UI.",
    "Only two codes deserve their own message, and neither of them says anything about whether the account exists.",
    { text: "Never map user-disabled to its own message either: it confirms the account exists.", options: { color: C.INK, bold: true } },
  ], { x: 8.6, y: 2.45, w: 3.85, h: 4.0, fontSize: 11.5, color: C.GRAY, paraSpaceAfter: 11 });
}

// -------------------------------------------------------- 12 ENUMERATION ----
{
  const s = d.content("Firebase Auth", "Account enumeration through the login form");
  T.lines(s, [
    "“No user found for that email” turns the login form into a lookup service. Send it ten thousand addresses and it reports which ones have accounts, with no password and no breach involved.",
    "The resulting list is itself sensitive data. On a dating app, a health app or a debt-management app, membership alone is the sensitive fact. It is also the first step of a credential-stuffing run: confirm which accounts exist, then attack only those addresses.",
  ], { x: 0.9, y: 1.85, w: 11.53, h: 1.35, fontSize: 13, paraSpaceAfter: 10 });
  T.table(s, ["The old deck taught", "What you get today"], [
    ["Unknown email", "user-not-found", "invalid-credential"],
    ["Wrong password", "wrong-password", "invalid-credential"],
    ["Reset for an unknown email", "user-not-found", "succeeds silently"],
    ["fetchSignInMethodsForEmail", "the list of providers", "an empty list, and deprecated"],
  ], { y: 3.05, rowH: 0.5, labelW: 3.0, fontSize: 11.5 });
  T.takeaway(s,
    "Identical message and identical behavior, whatever went wrong.",
    "Back it with rate limiting and App Check, and check the protection is still on in Console → Authentication → Settings.",
    5.75);
  s.addNotes("This slide replaces the old p9 table, which listed a distinct user-facing message per error code. That is an account-enumeration vulnerability taught as good practice, in a security lecture. If a student objects that the generic message is worse UX: yes, marginally, and that is the accepted trade-off.");
}

// -------------------------------------------------------- 13 AUTH GATE ------
{
  const s = d.content("Firebase Auth", "authStateChanges() is the source of truth");
  T.codeBlock(s, [
    "// Don't check-and-push. Listen, and let the UI follow.",
    "StreamBuilder<User?>(",
    "  stream: FirebaseAuth.instance.authStateChanges(),",
    "  builder: (context, snapshot) {",
    "    if (snapshot.connectionState == ConnectionState.waiting) {",
    "      return const SplashScreen();   // session still restoring",
    "    }",
    "    final user = snapshot.data;",
    "    if (user == null) return const LoginScreen();",
    "    if (!user.emailVerified) return const VerifyEmailScreen();",
    "    return const HomeScreen();",
    "  },",
    ")",
  ], { x: 0.9, y: 1.95, w: 7.4, h: 3.95, fontSize: 10.5 });
  s.addText("Three streams, not one", { x: 8.6, y: 1.98, w: 3.85, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "authStateChanges(): sign-in, sign-out, and once at startup when the SDK restores the session from disk.",
    "idTokenChanges(): all of that, plus every hourly token refresh and every custom-claim change.",
    "userChanges(): plus profile edits such as displayName.",
    { text: "Never cache currentUser in a field of your own. It goes stale, and stale auth state is a security bug.", options: { color: C.INK, bold: true } },
  ], { x: 8.6, y: 2.45, w: 3.85, h: 3.5, fontSize: 11.5, color: C.GRAY, paraSpaceAfter: 11 });
  T.takeaway(s,
    "Route guards belong to the router, not to this widget.",
    "With go_router you feed this stream into refreshListenable and decide in redirect (→ Lecture 8).",
    6.0, { w: 7.4 });
}

// ----------------------------------------------- 14 RESET / VERIFY / OUT ----
{
  const s = d.content("Firebase Auth", "Reset, verification, sign-out");
  T.codeBlock(s, [
    "// Password reset: never reveal whether the address exists.",
    "await auth.sendPasswordResetEmail(email: email.trim());",
    "showMessage('If that email has an account, a link is on its way.');",
    "",
    "// Email verification: send it, then re-read after they tap.",
    "await auth.currentUser?.sendEmailVerification();",
    "await auth.currentUser?.reload();",
    "final verified = auth.currentUser?.emailVerified ?? false;",
    "",
    "// Sign-out: authStateChanges() then emits null.",
    "await auth.signOut();",
    "await GoogleSignIn.instance.signOut();  // end the provider session",
  ], { x: 0.9, y: 1.95, w: 7.4, h: 3.85, fontSize: 10.5 });
  s.addText("The parts people get wrong", { x: 8.6, y: 1.98, w: 3.85, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "emailVerified on the cached User object does not update by itself. Call reload(), or listen to the stream, after the user follows the link.",
    "signOut() clears the local session only. It does not revoke the refresh token server-side; that is an Admin SDK call.",
    "Sign out of the federated provider too, or the next tap silently signs the same account straight back in.",
  ], { x: 8.6, y: 2.45, w: 3.85, h: 3.6, fontSize: 11.5, color: C.GRAY, paraSpaceAfter: 12 });
  T.takeaway(s,
    "Verification is a gate, not a notification.",
    "Enforce it in the auth gate and again in your security rules, with request.auth.token.email_verified.",
    5.95, { w: 7.4 });
}

// ----------------------------------------------------------- 15 LIFECYCLE ---
{
  const s = d.content("Firebase Auth", "Linking, re-authentication, second factors");
  T.iconGrid(s, [
    ["combine", "Account linking", "One person, one uid. linkWithCredential attaches Google to an existing email account, or upgrades an anonymous user without losing a single document."],
    ["history", "Re-authentication", "Changing an email or password, or deleting an account, needs a recent login. Catch requires-recent-login and call reauthenticateWithCredential."],
    ["scan", "Second factors", "SMS and TOTP enrollment via multiFactor, on the Identity Platform tier. local_auth's Face ID is a device lock on a session you already hold. It is useful, but it is not a factor."],
  ], { y: 2.0, rowH: 2.4 });
  T.codeBlock(s, [
    "// Anonymous → real account: same uid, same data, nothing migrated.",
    "final cred = GoogleAuthProvider.credential(idToken: idToken);",
    "await FirebaseAuth.instance.currentUser!.linkWithCredential(cred);",
    "// on 'credential-already-in-use' the identity is taken: sign in with it",
  ], { x: 0.9, y: 4.75, w: 11.53, h: 1.75, fontSize: 10.5 });
}

// ------------------------------------------------------------- 16 DIVIDER ---
d.divider(
  "Part 3 · OAuth & tokens",
  "Borrowing an identity you did not verify",
  "The credential handoff, and what the resulting token proves"
);

// ------------------------------------------------------------- 17 HANDOFF ---
{
  const s = d.content("OAuth", "The credential handoff, client-side");
  const rows = [
    ["1 · App asks Google to sign the user in", "GoogleSignIn.instance.authenticate()", "black"],
    ["2 · Google returns an OAuth ID token", "a JWT signed by Google, naming this user", "hair"],
    ["3 · App wraps it as an AuthCredential", "GoogleAuthProvider.credential(idToken: …)", "panel"],
    ["4 · Firebase verifies it, opens a session", "signInWithCredential(credential)", "black"],
    ["5 · Your backend verifies the Firebase token", "admin.auth().verifyIdToken(idToken)", "hair"],
  ];
  let y = 1.98;
  const bx = 0.9, bw = 6.5, bh = 0.68, gap = 0.18;
  rows.forEach(([head, sub, style], i) => {
    if (style === "black") T.blackbox(s, bx, y, bw, bh);
    else if (style === "panel") T.panel(s, bx, y, bw, bh);
    else T.hairbox(s, bx, y, bw, bh);
    const dark = style === "black";
    s.addText(head, {
      x: bx + 0.32, y: y + 0.08, w: bw - 0.6, h: 0.3, fontFace: F, fontSize: 12.5,
      bold: true, color: dark ? C.WHITE : C.INK, margin: 0, valign: "middle",
    });
    s.addText(sub, {
      x: bx + 0.32, y: y + 0.36, w: bw - 0.6, h: 0.27, fontFace: MONO, fontSize: 10,
      color: dark ? C.DGRAY : C.GRAY, margin: 0, valign: "middle",
    });
    if (i < rows.length - 1) T.arrow(s, bx + bw / 2, y + bh, 0, gap);
    y += bh + gap;
  });
  s.addText("Every step runs on the device", { x: 7.9, y: 1.98, w: 4.5, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "This is the flow a Flutter app uses. Nothing here needs a server: the redirect-and-Cloud-Function variant is a different flow, for the web.",
    "Firebase never sees the user's Google password. It checks Google's signature on the token, then mints a session of its own.",
    "Same shape for Apple, Microsoft, GitHub and Facebook: obtain the provider credential, then hand it to signInWithCredential.",
    { text: "Step 5 is the one people skip. Your own API still has to verify the token it receives.", options: { color: C.INK, bold: true } },
  ], { x: 7.9, y: 2.45, w: 4.5, h: 3.9, fontSize: 11.5, color: C.GRAY, paraSpaceAfter: 12 });
  s.addNotes("The old deck's diagram showed a server-side Cloud Functions flow while the body text described client-side google_sign_in, and the heading said 'two-step' above four steps. This is the client-side flow, in five steps, and it matches the code on the next slide.");
}

// -------------------------------------------------------- 18 GOOGLE CODE ----
{
  const s = d.content("OAuth", "Google sign-in, end to end");
  T.codeBlock(s, [
    "import 'package:google_sign_in/google_sign_in.dart';",
    "",
    "// google_sign_in 7.x: initialize once, at app start.",
    "await GoogleSignIn.instance.initialize();",
    "",
    "Future<UserCredential> signInWithGoogle() async {",
    "  // 1. provider sign-in: the system account picker",
    "  final account = await GoogleSignIn.instance.authenticate();",
    "  // 2. Google's ID token for this user",
    "  final idToken = account.authentication.idToken;",
    "  // 3. wrap it as a Firebase credential",
    "  final credential = GoogleAuthProvider.credential(idToken: idToken);",
    "  // 4. exchange it for a Firebase session",
    "  return FirebaseAuth.instance.signInWithCredential(credential);",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.7, h: 4.55, fontSize: 10.5 });
  s.addText("Before it works", { x: 8.85, y: 1.98, w: 3.58, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "Android release builds need the SHA-1 and SHA-256 fingerprints registered in the Firebase console, or sign-in fails silently.",
    "A canceled picker throws GoogleSignInException with code canceled. That is a user action, not an error to report.",
    "Apple: sign_in_with_apple, then OAuthProvider('apple.com').credential with the idToken and the rawNonce you generated.",
    { text: "Offer Sign in with Apple on iOS whenever you offer any other social login; App Review enforces it.", options: { color: C.INK, bold: true } },
  ], { x: 8.85, y: 2.45, w: 3.58, h: 4.1, fontSize: 11, color: C.GRAY, paraSpaceAfter: 11 });
}

// ---------------------------------------------------------- 19 TOKEN TYPES --
{
  const s = d.content("Tokens", "ID token vs refresh token");
  T.table(s, ["ID token", "Refresh token"], [
    ["Lifetime", "one hour, then the SDK refreshes it silently", "until revoked, or the password changes"],
    ["Format", "a signed JWT: header.payload.signature", "an opaque string, meaningful only to Google"],
    ["Lives", "in memory, handed out by getIdToken()", "platform secure storage: Keychain, Keystore"],
    ["Goes to your API", "yes, as Authorization: Bearer <token>", "never; it must not leave the device"],
    ["Carries", "uid, email, sign-in time, custom claims", "nothing you can read"],
  ], { y: 2.2, rowH: 0.6, labelW: 1.9, fontSize: 11.5 });
  T.takeaway(s,
    "A JWT is signed, not encrypted.",
    "Anyone holding it can read the claims, so put nothing secret in a custom claim and treat a leaked ID token as a one-hour session hijack. getIdToken(true) forces a refresh, which you need after setting claims.",
    5.9);
}

// --------------------------------------------------------- 20 VERIFICATION --
{
  const s = d.content("Tokens", "Verify on the backend; never trust a client uid");
  s.addText("Client · Flutter", { x: 0.9, y: 1.55, w: 5.6, h: 0.3, fontFace: F, fontSize: 11, color: C.GRAY, charSpacing: 2, margin: 0 });
  T.codeBlock(s, [
    "// Send the token. Never send the uid: it proves nothing.",
    "final token = await FirebaseAuth.instance.currentUser!.getIdToken();",
    "await http.post(url,",
    "    headers: {'Authorization': 'Bearer $token'},",
    "    body: jsonEncode({'item': itemId}));",
  ], { x: 0.9, y: 1.88, w: 11.53, h: 2.0, fontSize: 11 });
  s.addText("Server · Node with firebase-admin", { x: 0.9, y: 4.0, w: 6.6, h: 0.3, fontFace: F, fontSize: 11, color: C.GRAY, charSpacing: 2, margin: 0 });
  T.codeBlock(s, [
    "// Checks the signature, the expiry and the audience.",
    "const token = req.get('Authorization').split(' ')[1];",
    "const decoded = await admin.auth().verifyIdToken(token, true);",
    "const uid = decoded.uid;   // trusted: Google signed this",
    "await db.collection('orders').add({ uid, item: req.body.item });",
  ], { x: 0.9, y: 4.33, w: 11.53, h: 2.0, fontSize: 11 });
  s.addText([
    { text: "Anyone can POST {\"uid\": \"someone-else\"}. ", options: { bold: true, color: C.INK } },
    { text: "The uid you act on must come out of a token you verified, in Firestore rules or in the Admin SDK, and from nowhere else. (→ Lecture 5, backends)", options: { color: C.GRAY } },
  ], { x: 0.9, y: 6.5, w: 11.53, h: 0.4, fontFace: F, fontSize: 13, margin: 0 });
}

// -------------------------------------------------------------- 21 DIVIDER --
d.divider(
  "Part 4 · Data, rules & App Check",
  "Guarding the data, and the app itself",
  "Where profiles live, rules that actually bind, and keeping scripts out"
);

// -------------------------------------------------- 22 NEVER STORE PASSWORDS
{
  const s = d.content("User data", "Never store the password");
  T.lines(s, [
    "The identity provider holds the credential. Firebase keeps a salted scrypt hash on Google's infrastructure; after createUserWithEmailAndPassword returns, the plaintext is gone from your process and never comes back.",
    "Your database stores an identifier and profile data, and nothing that could authenticate anybody: no password, no PIN, no “security answer”, no copy of a token.",
    "A password in Firestore is readable by everyone on your team in the console, and it ships to every client that one wrong rule lets through. Because users reuse passwords, one misconfiguration also exposes their accounts elsewhere.",
    { text: "The Firebase User object is for identity: uid, email, displayName, photoURL. Application data goes in your own collection, keyed by the uid.", options: { bold: true } },
  ], { x: 0.9, y: 1.95, w: 5.9, h: 4.3, fontSize: 12.5, paraSpaceAfter: 12 });
  T.codeBlock(s, [
    "// After sign-up: a profile doc keyed by the uid.",
    "final uid = cred.user!.uid;",
    "await FirebaseFirestore.instance",
    "    .doc('users/$uid')",
    "    .set({",
    "  'displayName': name,",
    "  'createdAt': FieldValue.serverTimestamp(),",
    "});",
    "// No password. No token. No PIN.",
  ], { x: 7.0, y: 1.95, w: 5.43, h: 3.05, fontSize: 10 });
  s.addText([
    { text: "One document per uid.", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "The uid is the join key between the identity system and your data, which is what the next slide has to defend.", options: { color: C.GRAY } },
  ], { x: 7.0, y: 5.25, w: 5.43, h: 1.1, fontFace: F, fontSize: 12, margin: 0, valign: "top" });
  s.addNotes("The old deck illustrated this slide with a screenshot of a Firestore document containing Password: 'qwerty'. That image modeled precisely the anti-pattern the lecture is warning against, so it is gone. Say out loud why: students copy screenshots, not prose.");
}

// ---------------------------------------------------------------- 23 RULES --
{
  const s = d.content("Authorization", "Security rules that actually bind");
  T.codeBlock(s, [
    "// firestore.rules",
    "match /users/{userId} {",
    "  function isOwner() {",
    "    return request.auth != null && request.auth.uid == userId;",
    "  }",
    "  allow read:   if isOwner();",
    "  allow create: if isOwner()",
    "                && !request.resource.data.keys().hasAny(['role']);",
    "  allow update: if isOwner()",
    "                && request.resource.data.diff(resource.data)",
    "                     .affectedKeys().hasOnly(['displayName']);",
    "  allow delete: if false;   // deletion runs on the backend",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.4, h: 3.95, fontSize: 10.5 });
  s.addText("A rule that does not bind", { x: 8.6, y: 1.98, w: 3.85, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.RED, margin: 0 });
  T.panel(s, 8.6, 2.4, 3.85, 0.62);
  s.addText("allow create: if request.auth != null;", {
    x: 8.75, y: 2.4, w: 3.6, h: 0.62, fontFace: MONO, fontSize: 9.5, color: C.INK, valign: "middle", margin: 0,
  });
  T.lines(s, [
    "Any signed-in user, including an account created seconds ago, can write a document at someone else's uid and take over their profile.",
    "request.auth != null is authentication. Authorization is binding the request to the path it is touching.",
    "Split the verbs. create, update and delete need different conditions, and a blanket write hides all three.",
    "Test in the console's Rules Playground, and in CI against the emulator suite (→ Lecture 5).",
  ], { x: 8.6, y: 3.2, w: 3.85, h: 3.2, fontSize: 11, color: C.GRAY, paraSpaceAfter: 11 });
  T.takeaway(s,
    "Rules run on Google's servers, so they cannot be bypassed.",
    "That is why they must be written as if every client is hostile.",
    6.0, { w: 7.4 });
  s.addNotes("The rule in the old deck was allow create: if request.auth != null, which is a real, exploitable hole. Demo it in the Rules Playground: authenticate as uid A, write to /users/B, watch it succeed.");
}

// ------------------------------------------------------- 24 IMPERSONATION ---
{
  const s = d.content("App Check", "The other question: is this request from my app?");
  T.lines(s, [
    "Your Firebase configuration (API key, project id, app id) ships inside the binary. It identifies the project. It was never a secret, and it never protected anything.",
    "An attacker unzips the APK, reads it, and calls the Firestore or Storage REST API from a Python script, so none of the limits your UI imposes apply.",
    "The cost is yours: millions of reads, a poisoned collection, a scraped user table. Auth does not help here, because the script can sign up like any other user.",
    { text: "Auth answers who. App Check answers where from: is this request coming from a genuine build of my app, on a genuine device?", options: { bold: true } },
  ], { x: 0.9, y: 1.95, w: 6.6, h: 4.0, fontSize: 12.5, paraSpaceAfter: 13 });
  const layers = [
    ["App Check", "“Is this my real, unmodified app?”", "protects the developer: abuse, billing fraud", "black"],
    ["Firebase Auth", "“Is this a known, valid user?”", "protects the user: unauthorized access", "hair"],
    ["Security Rules", "“May this user do this, here?”", "protects the data: misuse by valid users", "panel"],
  ];
  let ly = 1.95;
  for (const [head, q, who, style] of layers) {
    if (style === "black") T.blackbox(s, 7.9, ly, 4.53, 1.2);
    else if (style === "panel") T.panel(s, 7.9, ly, 4.53, 1.2);
    else T.hairbox(s, 7.9, ly, 4.53, 1.2);
    const dark = style === "black";
    s.addText([
      { text: head, options: { bold: true, fontSize: 14, color: dark ? C.WHITE : C.INK, breakLine: true } },
      { text: q, options: { fontSize: 11.5, color: dark ? C.DGRAY : C.INK, breakLine: true } },
      { text: who, options: { fontSize: 10.5, color: dark ? C.DIM : C.GRAY } },
    ], { x: 8.2, y: ly, w: 3.95, h: 1.2, fontFace: F, margin: 0, valign: "middle", lineSpacing: 15 });
    ly += 1.4;
  }
  s.addText("Three layers, three different questions.", {
    x: 7.9, y: 6.1, w: 4.53, h: 0.35, fontFace: F, fontSize: 11.5, color: C.GRAY, margin: 0,
  });
}

// ------------------------------------------------------------ 25 ACTIVATE ---
{
  const s = d.content("App Check", "Turning it on: activate() and providers");
  T.codeBlock(s, [
    "import 'package:firebase_app_check/firebase_app_check.dart';",
    "",
    "Future<void> main() async {",
    "  WidgetsFlutterBinding.ensureInitialized();",
    "  await Firebase.initializeApp(",
    "      options: DefaultFirebaseOptions.currentPlatform);",
    "  // Activate BEFORE the first call to any Firebase service.",
    "  await FirebaseAppCheck.instance.activate(",
    "    androidProvider: kDebugMode",
    "        ? AndroidProvider.debug : AndroidProvider.playIntegrity,",
    "    appleProvider: kDebugMode",
    "        ? AppleProvider.debug : AppleProvider.appAttest,",
    "  );",
    "  runApp(const App());",
    "}",
  ], { x: 0.9, y: 1.95, w: 7.4, h: 4.5, fontSize: 10.5 });
  s.addText("Pick the right attestor", { x: 8.6, y: 1.98, w: 3.85, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  const provs = [
    ["Android", "Play Integrity: the app was installed by Play, unmodified"],
    ["iOS 14+", "App Attest: a hardware-backed key per install"],
    ["older iOS", "DeviceCheck: device-level, weaker but broad"],
    ["Web", "reCAPTCHA Enterprise"],
    ["Dev & CI", "Debug provider: emulators and simulators cannot attest"],
  ];
  let py = 2.45;
  provs.forEach(([k, v], i) => {
    s.addText(k, { x: 8.6, y: py, w: 3.85, h: 0.28, fontFace: MONO, fontSize: 10.5, color: C.INK, margin: 0 });
    s.addText(v, { x: 8.6, y: py + 0.28, w: 3.85, h: 0.52, fontFace: F, fontSize: 10.5, color: C.GRAY, margin: 0, valign: "top" });
    py += 0.86;
    if (i < provs.length - 1) T.hline(s, 8.6, py - 0.12, 3.85);
  });
}

// --------------------------------------------------------- 26 ENFORCEMENT ---
{
  const s = d.content("App Check", "Enforcement: the step that changes behavior");
  T.flowDown(s, [
    ["1. Ship a build that calls activate()", "clients start attaching App Check tokens", "black"],
    ["2. Watch the metrics", "Console → App Check: verified vs unverified", "hair"],
    ["3. Wait for old versions to drain", "unverified traffic must fall to near zero", "panel"],
    ["4. Press Enforce, per product", "Firestore · Storage · Functions · Auth · RTDB", "hair"],
  ], { x: 0.9, y: 1.95, w: 6.4, h: 0.85, gap: 0.28 });
  s.addText("Debug tokens, safely", { x: 7.8, y: 1.98, w: 4.63, h: 0.35, fontFace: F, fontSize: 14, bold: true, color: C.INK, margin: 0 });
  T.lines(s, [
    "Run with the debug provider; the console prints a token on first launch.",
    "Register it in Console → App Check → Manage debug tokens, give it a name, set an expiry.",
    "A debug token is a permanent bypass of every enforcement you just enabled. Never commit one, never paste one in chat, rotate them when someone leaves the team.",
    "On CI, inject it as a secret, never as a checked-in file.",
  ], { x: 7.8, y: 2.45, w: 4.63, h: 2.6, fontSize: 11.5, color: C.GRAY, paraSpaceAfter: 12 });
  T.hline(s, 7.8, 5.3, 4.63);
  s.addText([
    { text: "Until you press Enforce, App Check only measures.", options: { bold: true, color: C.INK, breakLine: true } },
    { text: "The SDK call on its own changes nothing; that is where the old version of this lecture stopped.", options: { color: C.GRAY } },
  ], { x: 7.8, y: 5.55, w: 4.63, h: 1.2, fontFace: F, fontSize: 12, margin: 0, valign: "top" });
  s.addNotes("Enforcing before old app versions have drained is the classic outage: every user on a build without activate() is locked out at once. The metrics page exists precisely so you can time this.");
}

// -------------------------------------------------------------- 27 CLOSING --
d.closing([
  ["checklist", "Recap", [
    "AuthN is who, AuthZ is what: Firebase Auth and Security Rules are different layers",
    "One generic message for every failed sign-in; never confirm an account exists",
    "authStateChanges() is the source of truth; never cache currentUser",
    "Verify the ID token on the backend; a uid from the client proves nothing",
  ]],
  ["calendar", "This week", [
    "Add email/password and Google sign-in to your project app",
    "Write the users/{userId} rules and break them in the Rules Playground",
    "Wire up reset, verification and sign-out",
    "Turn on App Check with the debug provider and read the metrics page",
  ]],
  ["bookopen", "Read more", [
    "firebase.google.com/docs/auth/flutter/start",
    "firebase.google.com/docs/rules/rules-and-auth",
    "firebase.google.com/docs/app-check",
    "OWASP MASVS · Authentication and Session Management",
  ]],
]);

d.write(path.join(__dirname, "Mobile-and-Embedded-Lecture7-v2.pptx"))
  .then((f) => console.log("written:", f));
