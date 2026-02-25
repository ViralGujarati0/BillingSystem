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
  const uid = request.auth.uid;

  if (!email || !password || !name)
    throw new HttpsError("invalid-argument");

  const db = admin.firestore();

  const ownerSnap = await db.collection(USERS).doc(uid).get();
  if (!ownerSnap.exists || ownerSnap.data().role !== "OWNER")
    throw new HttpsError("permission-denied");

  const shopId = ownerSnap.data().shopId;
  if (!shopId) throw new HttpsError("failed-precondition");

  const user = await admin.auth().createUser({
    email,
    password,
    displayName: name,
  });

  await db.collection(USERS).doc(user.uid).set({
    shopId,
    name,
    email,
    role: "STAFF",
    isActive: true,
    permissions,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection(SHOPS).doc(shopId).collection("staff").doc(user.uid).set({
    name,
    email,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { uid: user.uid };
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

exports.createBill = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated");

  const { items = [], paymentType = "CASH", customerName = "Walk-in" } = request.data;
  if (!items.length) throw new HttpsError("invalid-argument");

  const uid = request.auth.uid;
  const db = admin.firestore();

  const userSnap = await db.collection(USERS).doc(uid).get();
  if (!userSnap.exists) throw new HttpsError("not-found");

  const shopId = userSnap.data().shopId;
  if (!shopId) throw new HttpsError("failed-precondition");

  const year = new Date().getFullYear().toString();

  // ✅ Prepare all refs BEFORE entering the transaction
  const barcodeItems = items.filter((it) => it.type === "BARCODE");
  const invRefs = barcodeItems.map((it) =>
    db.collection(SHOPS).doc(shopId).collection("inventory").doc(String(it.barcode))
  );
  const prodRefs = barcodeItems.map((it) =>
    db.collection(PRODUCTS).doc(String(it.barcode))
  );
  const counterRef = db.collection(SHOPS).doc(shopId).collection("meta").doc("counters");

  const billNoFormatted = await db.runTransaction(async (tx) => {
    // ✅ All reads first, in parallel
    const [counterSnap, ...snaps] = await Promise.all([
      tx.get(counterRef),
      ...invRefs.map((r) => tx.get(r)),
      ...prodRefs.map((r) => tx.get(r)),
    ]);

    const invSnaps = snaps.slice(0, invRefs.length);
    const prodSnaps = snaps.slice(invRefs.length);

    // Counter logic
    const counterData = counterSnap.exists ? counterSnap.data() : {};
    const billSeries = counterData.billSeries || {};
    const nextNo = (billSeries[year] || 0) + 1;
    const formatted = `${year}-${String(nextNo).padStart(5, "0")}`;

    // ✅ All validation + writes after all reads
    let subtotal = 0;
    const finalItems = [];

    for (let i = 0; i < items.length; i++) {
      const it = items[i];

      if (it.type === "BARCODE") {
        const bIdx = barcodeItems.indexOf(it);
        const invSnap = invSnaps[bIdx];
        const prodSnap = prodSnaps[bIdx];

        if (!invSnap.exists) throw new HttpsError("failed-precondition", "Product not in inventory");
        if (!prodSnap.exists) throw new HttpsError("not-found", "Product not in catalog");

        const inv = invSnap.data();
        const prod = prodSnap.data();
        const qty = Number(it.qty);

        if ((inv.stock || 0) < qty)
          throw new HttpsError("failed-precondition", "Insufficient stock");

        const rate = Number(inv.sellingPrice);
        const amount = qty * rate;
        subtotal += amount;

        finalItems.push({ barcode: String(it.barcode), name: prod.name, qty, rate, amount });

        tx.update(invRefs[bIdx], {
          stock: admin.firestore.FieldValue.increment(-qty),
        });
      } else {
        const amount = Number(it.qty) * Number(it.rate);
        subtotal += amount;
        finalItems.push(it);
      }
    }

    // Writes
    tx.set(counterRef, { [`billSeries.${year}`]: nextNo }, { merge: true });
    tx.set(db.collection(SHOPS).doc(shopId).collection("bills").doc(), {
      billNo: nextNo,
      billNoFormatted: formatted,
      customerName,
      paymentType,
      items: finalItems,
      grandTotal: subtotal,
      createdBy: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return formatted;
  });

  return { success: true, billNo: billNoFormatted };
});
/* ───────────────── CREATE PURCHASE (SUPPLIER) ───────────────── */

exports.createPurchase = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated");

  const { supplierId, items = [], paidAmount = 0 } = request.data;
  if (!supplierId || !items.length) throw new HttpsError("invalid-argument");

  const uid = request.auth.uid;
  const db = admin.firestore();

  const userSnap = await db.collection(USERS).doc(uid).get();
  if (!userSnap.exists) throw new HttpsError("not-found");

  const shopId = userSnap.data().shopId;
  if (!shopId) throw new HttpsError("failed-precondition");

  const year = new Date().getFullYear().toString();

  // ✅ Prepare all refs BEFORE transaction
  const counterRef = db.collection(SHOPS).doc(shopId).collection("meta").doc("counters");
  const invRefs = items.map((it) =>
    db.collection(SHOPS).doc(shopId).collection("inventory").doc(String(it.barcode))
  );

  const result = await db.runTransaction(async (tx) => {
    // ✅ All reads first, in parallel
    const [counterSnap] = await Promise.all([
      tx.get(counterRef),
      // inventory refs don't need to be read here since we're only writing (incrementing)
      // but if you want to validate stock/product existence, add reads here
    ]);

    const data = counterSnap.exists ? counterSnap.data() : {};
    const purchaseSeries = data.purchaseSeries || {};
    const nextNo = (purchaseSeries[year] || 0) + 1;
    const purchaseNoFormatted = `PUR-${year}-${String(nextNo).padStart(5, "0")}`;

    let subtotal = 0;

    // ✅ All writes after all reads
    tx.set(counterRef, { [`purchaseSeries.${year}`]: nextNo }, { merge: true });

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      subtotal += it.qty * it.purchasePrice;

      tx.set(invRefs[i], {
        barcode: it.barcode,
        stock: admin.firestore.FieldValue.increment(it.qty),
        lastPurchasePrice: it.purchasePrice,
        supplierId,
        lastPurchaseDate: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    const dueAmount = Math.max(0, subtotal - Number(paidAmount || 0));

    tx.set(db.collection(SHOPS).doc(shopId).collection("purchases").doc(), {
      supplierId,
      purchaseNo: nextNo,
      purchaseNoFormatted,
      items,
      subtotal,
      paidAmount,
      dueAmount,
      createdBy: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return purchaseNoFormatted;
  });

  return { success: true, purchaseNo: result };
});