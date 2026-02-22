const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

setGlobalOptions({ region: "us-central1" });

admin.initializeApp();

const USERS = "billing_users";
const SHOPS = "billing_shops";
const PRODUCTS = "billing_products";

/* ───────────────── CREATE STAFF ───────────────── */

exports.createStaff = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated");

  const { email, password, name, permissions = {} } = request.data;
  const callerUid = request.auth.uid;

  if (!email || !password || !name)
    throw new HttpsError("invalid-argument", "Missing fields");

  const db = admin.firestore();

  const callerSnap = await db.collection(USERS).doc(callerUid).get();
  if (!callerSnap.exists || callerSnap.data().role !== "OWNER")
    throw new HttpsError("permission-denied");

  const shopId = callerSnap.data().shopId;
  if (!shopId) throw new HttpsError("failed-precondition", "No shop");

  let newUser;

  try {
    newUser = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });
  } catch {
    throw new HttpsError("already-exists", "Email exists");
  }

  await db.collection(USERS).doc(newUser.uid).set({
    shopId,
    name,
    email,
    role: "STAFF",
    isActive: true,
    permissions,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection(SHOPS).doc(shopId).collection("staff").doc(newUser.uid).set({
    name,
    email,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { uid: newUser.uid };
});

/* ───────────────── DELETE STAFF ───────────────── */

exports.deleteStaff = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated");

  const { staffId } = request.data;
  const db = admin.firestore();

  const ownerSnap = await db.collection(USERS).doc(request.auth.uid).get();
  if (!ownerSnap.exists || ownerSnap.data().role !== "OWNER")
    throw new HttpsError("permission-denied");

  await admin.auth().deleteUser(staffId);
  await db.collection(USERS).doc(staffId).delete();

  const shopId = ownerSnap.data().shopId;

  if (shopId) {
    await db.collection(SHOPS).doc(shopId).collection("staff").doc(staffId).delete();
  }

  return { success: true };
});

/* ───────────────── CREATE BILL ───────────────── */

exports.createBill = onCall(async (request) => {
  try {
    if (!request.auth) throw new HttpsError("unauthenticated");

    const uid = request.auth.uid;
    const { items = [], paymentType = "CASH", customerName = "Walk-in" } = request.data;

    if (!items.length) throw new HttpsError("invalid-argument", "No items");

    const db = admin.firestore();
    const userSnap = await db.collection(USERS).doc(uid).get();

    if (!userSnap.exists) throw new HttpsError("not-found", "User not found");

    const shopId = userSnap.data().shopId;
    if (!shopId) throw new HttpsError("failed-precondition", "No shop");

    let subtotal = 0;
    const finalItems = [];

    const txResult = await db.runTransaction(async (tx) => {
      const counterRef = db.collection("billing_counters").doc(shopId);

      // ——— Phase 1: All reads first ———
      const counterSnap = await tx.get(counterRef);

      const productRefs = [];
      const invRefs = [];
      for (const item of items) {
        if (item.type === "BARCODE") {
          const barcode = String(item.barcode || "");
          if (!barcode) throw new HttpsError("invalid-argument", "Invalid barcode item");
          productRefs.push(db.collection(PRODUCTS).doc(barcode));
          invRefs.push(db.collection(SHOPS).doc(shopId).collection("inventory").doc(barcode));
        }
      }
      const productSnaps = productRefs.length ? await Promise.all(productRefs.map((ref) => tx.get(ref))) : [];
      const invSnaps = invRefs.length ? await Promise.all(invRefs.map((ref) => tx.get(ref))) : [];

      // ——— Process read data and build finalItems (no writes yet) ———
      let billNo = 1;
      if (counterSnap.exists) billNo = (counterSnap.data().lastBillNo || 0) + 1;

      let barcodeIndex = 0;
      for (const item of items) {
        if (item.type === "BARCODE") {
          const qty = Number(item.qty) || 0;
          if (qty <= 0) throw new HttpsError("invalid-argument", "Invalid barcode item");

          const productSnap = productSnaps[barcodeIndex];
          const invSnap = invSnaps[barcodeIndex];
          barcodeIndex++;

          if (!productSnap.exists || !invSnap.exists)
            throw new HttpsError("not-found", "Product or inventory not found");

          const stock = Number(invSnap.data().stock) || 0;
          if (stock < qty) throw new HttpsError("failed-precondition", "Out of stock");

          const rate = Number(invSnap.data().sellingPrice) || 0;
          const amount = qty * rate;
          subtotal += amount;

          finalItems.push({
            type: "BARCODE",
            barcode: String(item.barcode || ""),
            name: productSnap.data().name || "",
            qty,
            rate,
            amount,
          });
        } else {
          const name = String(item.name || "").trim();
          const qty = Number(item.qty) || 0;
          const rate = Number(item.rate) || 0;
          if (!name || qty <= 0) throw new HttpsError("invalid-argument", "Invalid manual item");
          const amount = qty * rate;
          subtotal += amount;
          finalItems.push({ type: "MANUAL", name, qty, rate, amount });
        }
      }

      // ——— Phase 2: All writes ———
      tx.set(counterRef, { lastBillNo: billNo }, { merge: true });

      barcodeIndex = 0;
      for (const item of items) {
        if (item.type === "BARCODE") {
          const qty = Number(item.qty) || 0;
          tx.update(invRefs[barcodeIndex], {
            stock: admin.firestore.FieldValue.increment(-qty),
          });
          barcodeIndex++;
        }
      }

      tx.set(db.collection(SHOPS).doc(shopId).collection("bills").doc(), {
        billNo,
        customerName: String(customerName || "Walk-in").trim() || "Walk-in",
        paymentType: String(paymentType || "CASH"),
        items: finalItems,
        subtotal,
        grandTotal: subtotal,
        createdBy: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { billNo };
    });

    return { success: true, billNo: txResult.billNo };
  } catch (err) {
    if (err instanceof HttpsError) throw err;
    console.error("createBill error:", err);
    throw new HttpsError("internal", err.message || "Failed to create bill");
  }
});