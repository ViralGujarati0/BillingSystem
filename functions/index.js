const { onCall } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

setGlobalOptions({ region: "us-central1" });

admin.initializeApp();

const USERS = "billing_users";

exports.createStaff = onCall(async (request) => {
  const data = request.data;
  const context = request.auth;

  console.log("Received data:", JSON.stringify(data));
  console.log("Auth context:", context ? context.uid : "NO AUTH");

  if (!context) throw new Error("unauthenticated");

  const callerUid = context.uid;
  const { email, password, name, shopId, permissions = {} } = data;

  if (!email || !password || !name || !shopId) {
    throw new Error("Missing fields");
  }

  const db = admin.firestore();

  const callerDoc = await db.collection(USERS).doc(callerUid).get();

  if (!callerDoc.exists) throw new Error("Owner not found");

  const caller = callerDoc.data();

  if (caller.role !== "OWNER") throw new Error("Not owner");

  const newUser = await admin.auth().createUser({
    email,
    password,
    displayName: name,
  });

  await db.collection(USERS).doc(newUser.uid).set({
    shopId,
    name,
    email,
    role: "STAFF",
    isActive: true,
    permissions,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { uid: newUser.uid };
});