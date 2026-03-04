const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

setGlobalOptions({ region: "us-central1" });
admin.initializeApp();

const USERS = "billing_users";
const SHOPS = "billing_shops";
const PRODUCTS = "billing_products";

/* ───────────────── HELPER: IST DATE INFO ───────────────── */

function getISTDateInfo() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60000;
  const istDate = new Date(now.getTime() + istOffset);

  const dd   = String(istDate.getUTCDate()).padStart(2, "0");
  const mm   = String(istDate.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = istDate.getUTCFullYear();

  // Used as display label in bill number e.g. "04-03-2026"
  const dateLabel = `${dd}-${mm}-${yyyy}`;

  // Start of IST day in UTC (for stats doc)
  const startOfISTDay = new Date(istDate);
  startOfISTDay.setUTCHours(0, 0, 0, 0);
  const startOfDayUTC = new Date(startOfISTDay.getTime() - istOffset);

  // Stats doc key e.g. "daily_2026_03_04"
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

/* ───────────────── CREATE BILL ───────────────── */

exports.createBill = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated");

  const { items = [], paymentType = "CASH", customerName = "Walk-in" } = request.data;
  if (!items.length) throw new HttpsError("invalid-argument");

  const uid = request.auth.uid;
  const db  = admin.firestore();

  const userSnap = await db.collection(USERS).doc(uid).get();
  if (!userSnap.exists) throw new HttpsError("not-found");

  const shopId = userSnap.data().shopId;
  if (!shopId) throw new HttpsError("failed-precondition");

  // ─── IST date info ───
  const { dateLabel, startOfDayUTC, statsKey } = getISTDateInfo();

  const statsRef  = db.collection(SHOPS).doc(shopId).collection("stats").doc(statsKey);
  const counterRef = db.collection(SHOPS).doc(shopId).collection("meta").doc("counters");

  // ─── Prepare inventory + product refs ───
  const barcodeItems = items.filter((it) => it.type === "BARCODE");
  const invRefs  = barcodeItems.map((it) =>
    db.collection(SHOPS).doc(shopId).collection("inventory").doc(String(it.barcode))
  );
  const prodRefs = barcodeItems.map((it) =>
    db.collection(PRODUCTS).doc(String(it.barcode))
  );

  const billResult = await db.runTransaction(async (tx) => {

    // ✅ ALL READS FIRST — explicitly indexed, no ambiguous destructuring
    const allReads = await Promise.all([
      tx.get(counterRef),                        // index 0
      ...invRefs.map((r)  => tx.get(r)),         // index 1 … invRefs.length
      ...prodRefs.map((r) => tx.get(r)),         // next prodRefs.length
    ]);

    const counterSnap = allReads[0];
    const invSnaps    = allReads.slice(1, 1 + invRefs.length);
    const prodSnaps   = allReads.slice(1 + invRefs.length, 1 + invRefs.length + prodRefs.length);

    // ─── Day-change-aware counter ───
    const counterData  = counterSnap.exists ? counterSnap.data() : {};
    const lastBillDate = counterData.lastBillDate || "";
    const nextNo       = lastBillDate === dateLabel
      ? (counterData.billCount || 0) + 1
      : 1; // new day → reset to 1

    const formatted = `${dateLabel}-${nextNo}`; // e.g. "04-03-2026-1"

    // ─── Build final items + totals ───
    let subtotal      = 0;
    let totalProfit   = 0;
    const finalItems  = [];

    for (let i = 0; i < items.length; i++) {
      const it = items[i];

      if (it.type === "BARCODE") {
        const bIdx    = barcodeItems.indexOf(it);
        const invSnap = invSnaps[bIdx];
        const prodSnap = prodSnaps[bIdx];

        if (!invSnap.exists)
          throw new HttpsError("failed-precondition", "Product not in inventory");
        if (!prodSnap.exists)
          throw new HttpsError("not-found", "Product not in catalog");

        const inv  = invSnap.data();
        const prod = prodSnap.data();
        const qty  = Number(it.qty);

        if ((inv.stock || 0) < qty)
          throw new HttpsError("failed-precondition", "Insufficient stock");

        const rate          = Number(inv.sellingPrice);
        const purchasePrice = Number(inv.lastPurchasePrice || inv.purchasePrice || 0);
        const amount        = qty * rate;
        const profit        = qty * (rate - purchasePrice);

        subtotal    += amount;
        totalProfit += profit;

        finalItems.push({
          barcode: String(it.barcode),
          name: prod.name,
          qty,
          rate,
          amount,
          profit,
        });

        tx.update(invRefs[bIdx], {
          stock: admin.firestore.FieldValue.increment(-qty),
        });

      } else {
        const amount = Number(it.qty) * Number(it.rate);
        subtotal += amount;
        finalItems.push(it);
      }
    }

    const totalItemsSold = items.reduce((sum, i) => sum + Number(i.qty || 0), 0);

    // ✅ ALL WRITES AFTER ALL READS

    // Update counter — flat fields, no nested object accumulation
    tx.set(counterRef, {
      lastBillDate: dateLabel,  // "04-03-2026"
      billCount:    nextNo,     // 1, 2, 3 ...
    }, { merge: true });

    // Save bill
    tx.set(
      db.collection(SHOPS).doc(shopId).collection("bills").doc(),
      {
        billNo:           nextNo,
        billNoFormatted:  formatted,   // "04-03-2026-1"
        customerName,
        paymentType,
        items:            finalItems,
        grandTotal:       subtotal,
        profit:           totalProfit,
        createdBy:        uid,
        createdAt:        admin.firestore.FieldValue.serverTimestamp(),
      }
    );

    return { formatted, subtotalFinal: subtotal, totalProfitFinal: totalProfit, totalItemsSoldFinal: totalItemsSold };
  });

  const billNoFormatted = billResult.formatted;
  const billStats = billResult;

  // ─── Update daily stats OUTSIDE transaction ───
  // FieldValue.increment is atomic on its own — no need to be inside a transaction
  const { subtotalFinal, totalProfitFinal, totalItemsSoldFinal } = billStats;
  await statsRef.set({
    date:           admin.firestore.Timestamp.fromDate(startOfDayUTC),
    totalSales:     admin.firestore.FieldValue.increment(subtotalFinal),
    totalProfit:    admin.firestore.FieldValue.increment(totalProfitFinal),
    totalBills:     admin.firestore.FieldValue.increment(1),
    totalItemsSold: admin.firestore.FieldValue.increment(totalItemsSoldFinal),
    lastUpdated:    admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return { success: true, billNo: billNoFormatted };
});

/* ───────────────── CREATE PURCHASE (SUPPLIER) ───────────────── */

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

  const { dateLabel } = getISTDateInfo();
  const istYear = dateLabel.split("-")[2]; // "2026"

  const counterRef = db.collection(SHOPS).doc(shopId).collection("meta").doc("counters");
  const invRefs    = items.map((it) =>
    db.collection(SHOPS).doc(shopId).collection("inventory").doc(String(it.barcode))
  );

  const result = await db.runTransaction(async (tx) => {
    const counterSnap = await tx.get(counterRef);

    const data            = counterSnap.exists ? counterSnap.data() : {};
    const lastPurchaseYear = data.lastPurchaseYear || "";
    const nextNo          = lastPurchaseYear === istYear
      ? (data.purchaseCount || 0) + 1
      : 1; // new year → reset to 1

    const purchaseNoFormatted = `PUR-${istYear}-${String(nextNo).padStart(5, "0")}`;

    let subtotal = 0;

    tx.set(counterRef, {
      lastPurchaseYear: istYear,  // "2026"
      purchaseCount:    nextNo,   // 1, 2, 3...
    }, { merge: true });

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      subtotal += it.qty * it.purchasePrice;

      tx.set(invRefs[i], {
        barcode:           it.barcode,
        stock:             admin.firestore.FieldValue.increment(it.qty),
        lastPurchasePrice: it.purchasePrice,
        supplierId,
        lastPurchaseDate:  admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated:       admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }

    const dueAmount = Math.max(0, subtotal - Number(paidAmount || 0));

    tx.set(db.collection(SHOPS).doc(shopId).collection("purchases").doc(), {
      supplierId,
      purchaseNo:           nextNo,
      purchaseNoFormatted,
      items,
      subtotal,
      paidAmount,
      dueAmount,
      createdBy:  uid,
      createdAt:  admin.firestore.FieldValue.serverTimestamp(),
    });

    return purchaseNoFormatted;
  });

  return { success: true, purchaseNo: result };
});