const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

setGlobalOptions({ region: "us-central1" });

admin.initializeApp();

const USERS = "billing_users";

exports.createStaff = onCall(async (request) => {
  const context = request.auth;
  const data = request.data;

  if (!context) throw new HttpsError("unauthenticated", "Login required");

  const callerUid = context.uid;
  const { email, password, name, permissions = {} } = data;

  if (!email || !password || !name) {
    throw new HttpsError("invalid-argument", "Missing fields");
  }

  const db = admin.firestore();

  // 🔐 Get OWNER from Firestore
  const callerSnap = await db.collection(USERS).doc(callerUid).get();

  if (!callerSnap.exists)
    throw new HttpsError("not-found", "Owner not found");

  const caller = callerSnap.data();

  if (caller.role !== "OWNER")
    throw new HttpsError("permission-denied", "Only owners can create staff");

  // 🔐 TRUST ONLY SERVER SHOP ID
  const shopId = caller.shopId;

  if (!shopId)
    throw new HttpsError("failed-precondition", "Owner has no shop");

  // 🔐 Create Auth user safely
  let newUser;

  try {
    newUser = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });
  } catch (e) {
    throw new HttpsError("already-exists", "Email already registered");
  }

  // 🔐 Create Firestore STAFF
  await db.collection(USERS).doc(newUser.uid).set({
    shopId,
    name,
    email,
    role: "STAFF",
    isActive: true,
    permissions,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // OPTIONAL: also attach to shop
  await db
    .collection("billing_shops")
    .doc(shopId)
    .collection("staff")
    .doc(newUser.uid)
    .set({
      name,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

  return { uid: newUser.uid };
});