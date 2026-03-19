const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

setGlobalOptions({ region: "us-central1" });
admin.initializeApp();

const USERS    = "billing_users";
const SHOPS    = "billing_shops";
const PRODUCTS = "billing_products";

/* ───────────────── HELPER: IST DATE INFO ───────────────── */

function getISTDateInfo() {
  const now       = new Date();
  const istOffset = 5.5 * 60 * 60000;
  const istDate   = new Date(now.getTime() + istOffset);

  const dd   = String(istDate.getUTCDate()).padStart(2, "0");
  const mm   = String(istDate.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = istDate.getUTCFullYear();

  const dateLabel = `${dd}-${mm}-${yyyy}`;

  const startOfISTDay = new Date(istDate);
  startOfISTDay.setUTCHours(0, 0, 0, 0);
  const startOfDayUTC = new Date(startOfISTDay.getTime() - istOffset);

  const statsKey = `daily_${yyyy}_${mm}_${dd}`;

  return { dateLabel, startOfDayUTC, statsKey };
}

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
    password,
    role:      "STAFF",
    isActive:  true,
    permissions,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db
    .collection(SHOPS)
    .doc(shopId)
    .collection("staff")
    .doc(user.uid)
    .set({
      name,
      email,
      password,
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
    await db
      .collection(SHOPS)
      .doc(shopId)
      .collection("staff")
      .doc(staffId)
      .delete();
  }

  return { success: true };
});

/* ───────────────── CREATE BILL ───────────────── */

exports.createBill = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated");

  const {
    items       = [],
    paymentType  = "CASH",
    customerName = "Walk-in",
  } = request.data;

  if (!Array.isArray(items) || !items.length)
    throw new HttpsError("invalid-argument", "Items required");

  const uid = request.auth.uid;
  const db  = admin.firestore();

  const userSnap = await db.collection(USERS).doc(uid).get();
  if (!userSnap.exists) throw new HttpsError("not-found");

  const shopId = userSnap.data().shopId;
  if (!shopId) throw new HttpsError("failed-precondition");

  const { dateLabel, startOfDayUTC, statsKey } = getISTDateInfo();

  const statsRef   = db.collection(SHOPS).doc(shopId).collection("stats").doc(statsKey);
  const counterRef = db.collection(SHOPS).doc(shopId).collection("meta").doc("counters");
  const newBillRef = db.collection(SHOPS).doc(shopId).collection("bills").doc();

  /* ───── BARCODE ITEM REFERENCES ───── */

  const uniqueBarcodes = [
    ...new Set(
      items
        .filter((i) => i.type === "BARCODE")
        .map((i) => String(i.barcode))
    ),
  ];

  const invRefMap = new Map(
    uniqueBarcodes.map((barcode) => [
      barcode,
      db.collection(SHOPS).doc(shopId).collection("inventory").doc(barcode),
    ])
  );

  const prodRefMap = new Map(
    uniqueBarcodes.map((barcode) => [
      barcode,
      db.collection(PRODUCTS).doc(barcode),
    ])
  );

  /* ───────────────── TRANSACTION ───────────────── */

  const { formatted } = await db.runTransaction(async (tx) => {

    /* ── READ ALL DOCS FIRST ── */
    const reads = await Promise.all([
      tx.get(counterRef),
      tx.get(statsRef),
      ...uniqueBarcodes.map((b) => tx.get(invRefMap.get(b))),
      ...uniqueBarcodes.map((b) => tx.get(prodRefMap.get(b))),
    ]);

    const counterSnap = reads[0];

    const invSnapMap = new Map(
      uniqueBarcodes.map((b, i) => [b, reads[2 + i]])
    );

    const prodSnapMap = new Map(
      uniqueBarcodes.map((b, i) => [b, reads[2 + uniqueBarcodes.length + i]])
    );

    /* ── BILL NUMBER ── */
    const counterData  = counterSnap.exists ? counterSnap.data() : {};
    const lastBillDate = counterData.lastBillDate || "";
    const nextNo       =
      lastBillDate === dateLabel ? (counterData.billCount || 0) + 1 : 1;
    const formatted    = `${dateLabel}-${nextNo}`;

    /* ── BUILD ITEMS ── */
    let subtotal    = 0;
    let totalProfit = 0;
    const finalItems = [];

    for (const item of items) {

      if (item.type === "BARCODE") {

        const key      = String(item.barcode);
        const invSnap  = invSnapMap.get(key);
        const prodSnap = prodSnapMap.get(key);

        if (!invSnap?.exists)
          throw new HttpsError("failed-precondition", "Product not in inventory");
        if (!prodSnap?.exists)
          throw new HttpsError("not-found", "Product not found");

        const inv  = invSnap.data();
        const prod = prodSnap.data();
        const qty  = Number(item.qty);

        if ((inv.stock || 0) < qty)
          throw new HttpsError("failed-precondition", "Insufficient stock");

        const rate          = Number(inv.sellingPrice);
        const purchasePrice = Number(inv.lastPurchasePrice || inv.purchasePrice || 0);
        const amount        = qty * rate;
        const profit        = qty * (rate - purchasePrice);

        subtotal    += amount;
        totalProfit += profit;

        finalItems.push({
          type:     "BARCODE",
          barcode:  key,
          name:     prod.name,
          category: prod.category || "",
          unit:     prod.unit || "pcs",
          qty,
          rate,
          amount,
          profit,
        });

        tx.update(invRefMap.get(key), {
          stock: admin.firestore.FieldValue.increment(-qty),
        });

      } else if (item.type === "MANUAL") {

        const qty    = Number(item.qty);
        const rate   = Number(item.rate);
        const amount = qty * rate;

        subtotal += amount;

        finalItems.push({
          type:     "MANUAL",
          name:     item.name || "Item",
          category: item.category || "",
          unit:     item.unit || "pcs",
          qty,
          rate,
          amount,
          profit: 0,
        });

      } else {
        throw new HttpsError("invalid-argument", "Invalid item type");
      }
    }

    const totalItemsSold = finalItems.reduce(
      (sum, i) => sum + Number(i.qty || 0),
      0
    );

    /* ── UPDATE BILL COUNTER ── */
    tx.set(counterRef, { lastBillDate: dateLabel, billCount: nextNo }, { merge: true });

    /* ── SAVE BILL ── */
    tx.set(newBillRef, {
      billNo:           nextNo,
      billNoFormatted:  formatted,
      customerName,
      paymentType,
      items:            finalItems,
      grandTotal:       subtotal,
      profit:           totalProfit,
      createdBy:        uid,
      createdAt:        admin.firestore.FieldValue.serverTimestamp(),
    });

    /* ── UPDATE STATS (with payment split) ── */
    tx.set(statsRef, {
      date:           admin.firestore.Timestamp.fromDate(startOfDayUTC),
      totalSales:     admin.firestore.FieldValue.increment(subtotal),
      totalProfit:    admin.firestore.FieldValue.increment(totalProfit),
      totalBills:     admin.firestore.FieldValue.increment(1),
      totalItemsSold: admin.firestore.FieldValue.increment(totalItemsSold),

      // ── Payment split by amount ──
      cashSales:  admin.firestore.FieldValue.increment(paymentType === "CASH" ? subtotal : 0),
      upiSales:   admin.firestore.FieldValue.increment(paymentType === "UPI"  ? subtotal : 0),
      cardSales:  admin.firestore.FieldValue.increment(paymentType === "CARD" ? subtotal : 0),

      // ── Payment split by bill count ──
      cashBills:  admin.firestore.FieldValue.increment(paymentType === "CASH" ? 1 : 0),
      upiBills:   admin.firestore.FieldValue.increment(paymentType === "UPI"  ? 1 : 0),
      cardBills:  admin.firestore.FieldValue.increment(paymentType === "CARD" ? 1 : 0),

      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return { formatted };
  });

  return { success: true, billNo: formatted };
});

/* ───────────────── CREATE PURCHASE ───────────────── */

exports.createPurchase = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated");

  const { supplierId, items = [], paidAmount = 0 } = request.data;
  if (!supplierId || !items.length) throw new HttpsError("invalid-argument");

  const uid = request.auth.uid;
  const db  = admin.firestore();

  const userSnap = await db.collection(USERS).doc(uid).get();
  if (!userSnap.exists) throw new HttpsError("not-found");

  const shopId = userSnap.data().shopId;
  if (!shopId) throw new HttpsError("failed-precondition");

  const { dateLabel, startOfDayUTC, statsKey } = getISTDateInfo();
  const istYear = dateLabel.split("-")[2];

  // ── Fetch supplier name ──
  const supplierSnap = await db
    .collection(SHOPS)
    .doc(shopId)
    .collection("suppliers")
    .doc(supplierId)
    .get();
  const supplierName = supplierSnap.exists
    ? supplierSnap.data().name || "—"
    : "—";

  const statsRef   = db.collection(SHOPS).doc(shopId).collection("stats").doc(statsKey);
  const counterRef = db.collection(SHOPS).doc(shopId).collection("meta").doc("counters");
  const invRefs    = items.map((it) =>
    db
      .collection(SHOPS)
      .doc(shopId)
      .collection("inventory")
      .doc(String(it.barcode))
  );

  const result = await db.runTransaction(async (tx) => {
    const counterSnap = await tx.get(counterRef);

    const data             = counterSnap.exists ? counterSnap.data() : {};
    const lastPurchaseYear = data.lastPurchaseYear || "";
    const nextNo           =
      lastPurchaseYear === istYear ? (data.purchaseCount || 0) + 1 : 1;

    const purchaseNoFormatted = `PUR-${istYear}-${String(nextNo).padStart(5, "0")}`;

    let subtotal = 0;

    tx.set(
      counterRef,
      { lastPurchaseYear: istYear, purchaseCount: nextNo },
      { merge: true }
    );

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      subtotal += it.qty * it.purchasePrice;

      tx.set(
        invRefs[i],
        {
          barcode:           it.barcode,
          stock:             admin.firestore.FieldValue.increment(it.qty),
          lastPurchasePrice: it.purchasePrice,
          supplierId,
          lastPurchaseDate:  admin.firestore.FieldValue.serverTimestamp(),
          lastUpdated:       admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    const dueAmount = Math.max(0, subtotal - Number(paidAmount || 0));

    // ── Save purchase doc ──
    tx.set(
      db.collection(SHOPS).doc(shopId).collection("purchases").doc(),
      {
        supplierId,
        supplierName,
        purchaseNo:          nextNo,
        purchaseNoFormatted,
        items,
        subtotal,
        paidAmount,
        dueAmount,
        createdBy:  uid,
        createdAt:  admin.firestore.FieldValue.serverTimestamp(),
      }
    );

    // ── Update stats with purchase data ──
    tx.set(statsRef, {
      date:                admin.firestore.Timestamp.fromDate(startOfDayUTC),
      totalPurchaseAmount: admin.firestore.FieldValue.increment(subtotal),
      totalDueAmount:      admin.firestore.FieldValue.increment(dueAmount),
      totalPurchases:      admin.firestore.FieldValue.increment(1),
      lastUpdated:         admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return purchaseNoFormatted;
  });

  return { success: true, purchaseNo: result };
});

/* ───────────────── RESET STAFF PASSWORD ───────────────── */

exports.resetStaffPassword = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated");

  const { staffId, newPassword } = request.data;
  if (!staffId || !newPassword) throw new HttpsError("invalid-argument");

  const db = admin.firestore();

  const ownerSnap = await db.collection(USERS).doc(request.auth.uid).get();
  if (!ownerSnap.exists || ownerSnap.data().role !== "OWNER")
    throw new HttpsError("permission-denied");

  const shopId = ownerSnap.data().shopId;
  if (!shopId) throw new HttpsError("failed-precondition");

  await admin.auth().updateUser(staffId, { password: newPassword });

  await db
    .collection(USERS)
    .doc(staffId)
    .set({ password: newPassword }, { merge: true });

  await db
    .collection(SHOPS)
    .doc(shopId)
    .collection("staff")
    .doc(staffId)
    .set({ password: newPassword }, { merge: true });

  return { success: true };
});