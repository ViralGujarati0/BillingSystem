const { onCall } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

// Always deploy to us-central1
setGlobalOptions({ region: "us-central1" });

// ---------------------------------------------------------------------------
// TWO-PROJECT SETUP: Cloud Functions in one project, Firestore/Auth in another
// ---------------------------------------------------------------------------

const USERS = "users";

let appAuth = null;
let appFirestore = null;

try {
  const serviceAccount = require("./serviceAccountKey-app.json");
  const appProjectId = serviceAccount.project_id;

  const appApp = admin.initializeApp(
    {
      credential: admin.credential.cert(serviceAccount),
      projectId: appProjectId,
    },
    "app"
  );

  appAuth = appApp.auth();
  appFirestore = appApp.firestore();
} catch (e) {
  console.log("No secondary service account, using default project");
}

// Default initialize (earnpaisa)
if (!appAuth) {
  admin.initializeApp();
}

function getAuth() {
  return appAuth || admin.auth();
}

function getFirestore() {
  return appFirestore || admin.firestore();
}

/**
 * Callable: createStaff
 * Only callable by authenticated OWNER with shopId
 */
exports.createStaff = onCall(async (request) => {
  const data = request.data;
  const context = request.auth;

  if (!context) {
    throw new Error("unauthenticated");
  }

  const callerUid = context.uid;

  const { email, password, name, shopId, permissions = {} } = data || {};

  if (!email || !password || !name || !shopId) {
    throw new Error("Missing required fields");
  }

  const db = getFirestore();

  const callerDoc = await db.collection(USERS).doc(callerUid).get();

  if (!callerDoc.exists) {
    throw new Error("User not found");
  }

  const caller = callerDoc.data();

  if (caller.role !== "OWNER" || !caller.shopId) {
    throw new Error("Only owners with a shop can create staff");
  }

  if (caller.shopId !== shopId) {
    throw new Error("Shop mismatch");
  }

  const auth = getAuth();

  let newUser;

  try {
    newUser = await auth.createUser({
      email,
      password,
      displayName: name,
    });
  } catch (err) {
    if (err.code === "auth/email-already-exists") {
      throw new Error("Email already exists");
    }
    throw err;
  }

  const uid = newUser.uid;

  const userData = {
    shopId,
    name: name || "",
    email: email || "",
    role: "STAFF",
    isActive: true,
    permissions: {
      sales: permissions.sales ?? false,
      invoiceHistory: permissions.invoiceHistory ?? false,
      accounts: permissions.accounts ?? false,
      profit: permissions.profit ?? false,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection(USERS).doc(uid).set(userData);

  return {
    uid,
    email,
    message: "Staff created. They can sign in with email and password.",
  };
});