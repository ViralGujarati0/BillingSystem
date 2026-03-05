import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
const USERS = "billing_users";
const SHOPS = "billing_shops";
const PRODUCTS = "billing_products";
const SUPPLIERS = "suppliers";
const PURCHASES = "purchases";

const ownerPermissions = {
  sales: true,
  invoiceHistory: true,
  accounts: true,
  profit: true,
};

export async function createBill(items, customerName = 'Walk-in', paymentType = 'CASH') {
  const res = await functions().httpsCallable('createBill')({
    items,
    customerName,
    paymentType,
  });

  return res.data; // { success, billNo }
}

export async function createPurchaseInvoice({ supplierId, items, paidAmount = 0 }) {
  const res = await functions().httpsCallable('createPurchase')({
    supplierId,
    items,
    paidAmount,
  });

  return res.data; // { success, purchaseNo }
}

/**
 * Create or update owner user in Firestore when they sign in with Google.
 * Atomic UPSERT (mobile safe). Does NOT overwrite shopId so owner keeps their shop on re-login.
 */
export async function createOrUpdateOwnerUser(firebaseUser) {
  const ref = firestore().collection(USERS).doc(firebaseUser.uid);

  const data = {
    name: firebaseUser.displayName || '',
    email: firebaseUser.email || '',
    role: 'OWNER',
    isActive: true,
    permissions: ownerPermissions,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };
  // Do not set shopId here: new owners have none until they create a shop;
  // existing owners must keep their shopId on re-login.

  // ✅ Safe create/update
  await ref.set(data, { merge: true });

  const snap = await ref.get();
  return { id: snap.id, ...snap.data() };
}

/**
 * Get user doc from Firestore.
 */
export async function getUser(userId) {
  const snap = await firestore().collection(USERS).doc(userId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Create a shop.
 */
export async function createShop({
  ownerId,
  businessName,
  phone = '',
  address = '',
  gstNumber = '',
}) {
  const ref = firestore().collection(SHOPS).doc();

  const data = {
    ownerId,
    businessName: businessName || '',
    phone,
    address,
    gstNumber,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  await ref.set(data);
  return ref.id;
}

/**
 * Update owner's shopId (mobile safe).
 */
export async function updateUserShopId(userId, shopId) {
  await firestore()
    .collection(USERS)
    .doc(userId)
    .set({ shopId }, { merge: true }); // ✅ no update()
}

/**
 * Create shop and assign to owner.
 */
export async function createShopAndAssignToOwner(ownerId, shopData) {
  const shopId = await createShop({ ownerId, ...shopData });
  await updateUserShopId(ownerId, shopId);
  return shopId;
}

/**
 * Get shop doc: billing_shops/{shopId}.
 */
export async function getShop(shopId) {
  const snap = await firestore().collection(SHOPS).doc(shopId).get();
  const exists = typeof snap.exists === 'function' ? snap.exists() : snap.exists;
  if (!exists) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Get shop settings: billing_shops/{shopId}/settings/main.
 */
export async function getShopSettings(shopId) {
  const snap = await firestore()
    .collection(SHOPS)
    .doc(shopId)
    .collection('settings')
    .doc('main')
    .get();
  const exists = typeof snap.exists === 'function' ? snap.exists() : snap.exists;
  if (!exists) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * List staff for a shop from the staff subcollection: billing_shops/{shopId}/staff.
 */
export function subscribeStaffByShopId(shopId, callback) {
  return firestore()
    .collection(SHOPS)
    .doc(shopId)
    .collection('staff')
    .onSnapshot((snap) => {
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));
      callback(list);
    });
}

/**
 * Update staff in billing_users (e.g. name). Does not change Auth email/password.
 */
export async function updateStaffDoc(staffId, data) {
  const ref = firestore().collection(USERS).doc(staffId);
  await ref.set(data, { merge: true });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() };
}

/**
 * Update staff doc in shop subcollection: billing_shops/{shopId}/staff/{staffId}.
 */
export async function updateStaffInShop(shopId, staffId, data) {
  await firestore()
    .collection(SHOPS)
    .doc(shopId)
    .collection('staff')
    .doc(staffId)
    .set(data, { merge: true });
}

/**
 * Deactivate staff in billing_users so they cannot log in (owner "delete").
 */
export async function setStaffInactive(staffId) {
  await firestore()
    .collection(USERS)
    .doc(staffId)
    .set({ isActive: false }, { merge: true });
}

/**
 * Remove staff from shop subcollection so they no longer appear in the list.
 */
export async function removeStaffFromShop(shopId, staffId) {
  await firestore()
    .collection(SHOPS)
    .doc(shopId)
    .collection('staff')
    .doc(staffId)
    .delete();
}

// ─── Global Products & Shop Inventory ─────────────────────────────────────

/** Barcode variants to try (scanner may return with/without leading zeros). */
function barcodeVariants(barcode) {
  const s = String(barcode || '').trim();
  if (!s) return [];
  const set = new Set([s]);
  const noLeading = s.replace(/^0+/, '') || s;
  set.add(noLeading);
  if (s.length <= 13) set.add(s.padStart(13, '0'));
  return [...set];
}

/**
 * Get product by barcode from billing_products. Tries barcode as-is, without leading zeros, and padded to 13 digits. Returns null if not found.
 */
export async function getProductByBarcode(barcode) {
  const variants = barcodeVariants(barcode);
  for (const key of variants) {
    const ref = firestore().collection(PRODUCTS).doc(key);
    const snap = await ref.get();
    const exists = typeof snap.exists === 'function' ? snap.exists() : snap.exists;
    if (__DEV__) console.log('[Firestore] getProductByBarcode', { barcode: key, path: ref.path, exists });
    if (exists) return { id: snap.id, ...snap.data() };
  }
  return null;
}

/**
 * Get inventory item for a shop: billing_shops/{shopId}/inventory/{barcode}. Tries same barcode variants as getProductByBarcode. Returns null if not found.
 */
export async function getInventoryItem(shopId, barcode) {
  const variants = barcodeVariants(barcode);
  for (const key of variants) {
    const ref = firestore()
      .collection(SHOPS)
      .doc(shopId)
      .collection('inventory')
      .doc(key);
    const snap = await ref.get();
    const exists = typeof snap.exists === 'function' ? snap.exists() : snap.exists;
    if (__DEV__) console.log('[Firestore] getInventoryItem', { shopId, barcode: key, path: ref.path, exists });
    if (exists) return { id: snap.id, ...snap.data() };
  }
  return null;
}

/**
 * Create or update a product in global collection billing_products/{barcode}.
 * Document ID = barcode. Fields: barcode, name, category, brand, unit, mrp, gstPercent, createdBy, createdAt.
 */
export async function createProduct({
  barcode,
  name,
  category,
  brand = '',
  unit = 'pcs',
  mrp,
  gstPercent,
  createdBy,
}) {
  const ref = firestore().collection(PRODUCTS).doc(String(barcode));
  const data = {
    barcode: String(barcode),
    name: name || '',
    category: category || '',
    brand: brand || '',
    unit: unit || 'pcs',
    mrp: Number(mrp) || 0,
    gstPercent: Number(gstPercent) || 0,
    createdBy: createdBy || '',
    createdAt: firestore.FieldValue.serverTimestamp(),
  };
  await ref.set(data, { merge: true });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() };
}

/**
 * Set (create or update) an inventory item: billing_shops/{shopId}/inventory/{barcode}.
 * Document ID = barcode. Fields: barcode, sellingPrice, purchasePrice, stock, expiry, lastUpdated.
 */
export async function setInventoryItem(shopId, {
  barcode,
  sellingPrice,
  purchasePrice,
  stock,
  expiry = '',
  supplierId,
  lastPurchasePrice,
  lastPurchaseDate,
}) {
  const ref = firestore()
    .collection(SHOPS)
    .doc(shopId)
    .collection('inventory')
    .doc(String(barcode));
  const data = {
    barcode: String(barcode),
    sellingPrice: Number(sellingPrice) ?? 0,
    purchasePrice: Number(purchasePrice) ?? 0,
    stock: Number(stock) ?? 0,
    expiry: expiry || '',
    ...(typeof supplierId !== 'undefined' && { supplierId: String(supplierId) }),
    ...(typeof lastPurchasePrice !== 'undefined' && { lastPurchasePrice: Number(lastPurchasePrice) ?? 0 }),
    ...(typeof lastPurchaseDate !== 'undefined' && { lastPurchaseDate }),
    lastUpdated: firestore.FieldValue.serverTimestamp(),
  };
  await ref.set(data, { merge: true });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() };
}

/**
 * Delete an inventory item from a shop: billing_shops/{shopId}/inventory/{barcode}.
 * Does NOT touch global products.
 */
export async function deleteInventoryItem(shopId, barcode) {
  const ref = firestore()
    .collection(SHOPS)
    .doc(shopId)
    .collection('inventory')
    .doc(String(barcode));
  await ref.delete();
}

// ─── Suppliers ───────────────────────────────────────────────────────────

/**
 * Create a supplier: billing_shops/{shopId}/suppliers/{supplierId}
 * openingBalance is set once and should not be updated later.
 */
export async function createSupplier(shopId, {
  name,
  phone = '',
  address = '',
  gstNumber = '',
  openingBalance = 0,
} = {}) {
  const ref = firestore()
    .collection(SHOPS)
    .doc(shopId)
    .collection(SUPPLIERS)
    .doc();

  const data = {
    name: String(name || '').trim(),
    phone: String(phone || '').trim(),
    address: String(address || '').trim(),
    gstNumber: String(gstNumber || '').trim(),
    openingBalance: Number(openingBalance) || 0,
    isActive: true,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };
  if (!data.name) throw new Error('Supplier name is required');

  await ref.set(data);
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() };
}

export async function listSuppliers(shopId) {
  try {
    const snap = await firestore()
      .collection(SHOPS)
      .doc(shopId)
      .collection(SUPPLIERS)
      .where('isActive', '==', true)
      .orderBy('name')
      .get();

    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.log('🔥 FIRESTORE ERROR:', e);
    console.log('🔥 FIRESTORE MESSAGE:', e?.message);
    console.log('🔥 FIRESTORE CODE:', e?.code);
    throw e;
  }
}

/**
 * Realtime subscription for suppliers list of a shop.
 * Calls callback(list) on every change.
 */
export function subscribeSuppliers(shopId, callback) {
  return firestore()
    .collection(SHOPS)
    .doc(shopId)
    .collection(SUPPLIERS)
    .where('isActive', '==', true)
    .orderBy('name')
    .onSnapshot((snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(list);
    });
}

export async function getSupplier(shopId, supplierId) {
  const snap = await firestore()
    .collection(SHOPS)
    .doc(shopId)
    .collection(SUPPLIERS)
    .doc(String(supplierId))
    .get();
  const exists = typeof snap.exists === 'function' ? snap.exists() : snap.exists;
  if (!exists) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * TEMP helper: create a few suppliers for a shop.
 */
export async function createSampleSuppliers(shopId) {
  const samples = [
    { name: 'Patel Distributors', phone: '9999999999', address: 'Main Market', gstNumber: '—', openingBalance: 0 },
    { name: 'Shree Traders', phone: '8888888888', address: 'Industrial Area', gstNumber: '—', openingBalance: 1500 },
    { name: 'Om Wholesale', phone: '7777777777', address: 'Ring Road', gstNumber: '—', openingBalance: 0 },
  ];
  await Promise.all(samples.map((s) => createSupplier(shopId, s)));
  return true;
}

// ─── Purchases ───────────────────────────────────────────────────────────

/**
 * Create a purchase invoice and increment inventory stock.
 * Writes:
 *  - billing_shops/{shopId}/purchases/{purchaseId}
 *  - updates billing_shops/{shopId}/inventory/{barcode} stock += qty and sets supplierId + lastPurchase fields
 */
export async function createPurchase(shopId, {
  supplierId,
  invoiceNo = '',
  items = [],
  paidAmount = 0,
  paymentType = 'CASH', // CASH | UPI | BANK
} = {}) {
  if (!shopId) throw new Error('Missing shopId');
  if (!supplierId) throw new Error('Missing supplierId');
  if (!Array.isArray(items) || items.length === 0) throw new Error('No items');

  const normalizedItems = items.map((it) => {
    const barcode = String(it.barcode || '').trim();
    const qty = Number(it.qty) || 0;
    const purchasePrice = Number(it.purchasePrice) || 0;
    if (!barcode || qty <= 0) throw new Error('Invalid item');
    return {
      barcode,
      name: String(it.name || '').trim(),
      qty,
      purchasePrice,
      amount: qty * purchasePrice,
    };
  });
  const subtotal = normalizedItems.reduce((s, it) => s + it.amount, 0);
  const paid = Math.max(0, Number(paidAmount) || 0);
  const due = Math.max(0, subtotal - paid);

  const db = firestore();
  const shopRef = db.collection(SHOPS).doc(shopId);
  const purchaseRef = shopRef.collection(PURCHASES).doc();
  const createdAt = firestore.FieldValue.serverTimestamp();

  await db.runTransaction(async (tx) => {
    // Reads first
    const invRefs = normalizedItems.map((it) => shopRef.collection('inventory').doc(it.barcode));
    const invSnaps = await Promise.all(invRefs.map((ref) => tx.get(ref)));
    const prodRefs = normalizedItems.map((it) => db.collection(PRODUCTS).doc(it.barcode));
    const prodSnaps = await Promise.all(prodRefs.map((ref) => tx.get(ref)));

    // Writes
    tx.set(purchaseRef, {
      supplierId: String(supplierId),
      invoiceNo: String(invoiceNo || '').trim(),
      items: normalizedItems.map((it, idx) => ({
        ...it,
        name: it.name || (prodSnaps[idx].exists ? (prodSnaps[idx].data()?.name || '') : ''),
      })),
      subtotal,
      paidAmount: paid,
      dueAmount: due,
      paymentType,
      createdAt,
    });

    normalizedItems.forEach((it, idx) => {
      const invSnap = invSnaps[idx];
      const existing = invSnap.exists ? invSnap.data() : {};
      const prevStock = Number(existing.stock) || 0;
      const newStock = prevStock + it.qty;
      const sellingPrice = existing.sellingPrice != null ? Number(existing.sellingPrice) || 0 : 0;
      const expiry = existing.expiry || '';

      tx.set(
        invRefs[idx],
        {
          barcode: it.barcode,
          sellingPrice,
          purchasePrice: it.purchasePrice,
          stock: newStock,
          expiry,
          supplierId: String(supplierId),
          lastPurchasePrice: it.purchasePrice,
          lastPurchaseDate: createdAt,
          lastUpdated: createdAt,
        },
        { merge: true }
      );
    });
  });

  const snap = await purchaseRef.get();
  const exists = typeof snap.exists === 'function' ? snap.exists() : snap.exists;
  if (!exists) return null;
  return { id: snap.id, ...snap.data() };
}

// ─── Bills & Settings ─────────────────────────────────────────────────────

/**
 * Set shop settings: billing_shops/{shopId}/settings/main
 * Fields: billTerms, billMessage
 */
export async function setShopSettings(shopId, { billTerms = '', billMessage = '' } = {}) {
  const ref = firestore()
    .collection(SHOPS)
    .doc(shopId)
    .collection('settings')
    .doc('main');
  const data = {
    billTerms: billTerms || 'Goods once sold cannot be returned',
    billMessage: billMessage || 'Thank you for shopping!',
  };
  await ref.set(data, { merge: true });
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() };
}

/**
 * Create a bill: billing_shops/{shopId}/bills/{billId}
 * Fields: billNo, createdAt, paymentType (CASH|UPI|CARD), customerName, items[], grandTotal, createdBy, createdByRole
 */
export async function createBillDoc(shopId, {
  billNo,
  paymentType = 'CASH',
  customerName = 'Walk-in',
  items = [],
  grandTotal,
  createdBy,
  createdByRole = 'OWNER',
}) {
  const ref = firestore()
    .collection(SHOPS)
    .doc(shopId)
    .collection('bills')
    .doc();
  const data = {
    billNo: Number(billNo) || 1,
    createdAt: firestore.FieldValue.serverTimestamp(),
    paymentType: paymentType || 'CASH',
    customerName: customerName || 'Walk-in',
    items: items.map((it) => ({
      barcode: it.barcode || '',
      name: it.name || '',
      qty: Number(it.qty) || 0,
      mrp: Number(it.mrp) ?? 0,
      rate: Number(it.rate) ?? 0,
      amount: Number(it.amount) ?? 0,
    })),
    grandTotal: Number(grandTotal) ?? 0,
    createdBy: createdBy || '',
    createdByRole: createdByRole || 'OWNER',
  };
  await ref.set(data);
  const snap = await ref.get();
  return { id: snap.id, ...snap.data() };
}

export async function updateSupplier(shopId, supplierId, data) {
  return firestore()
    .collection('billing_shops')
    .doc(shopId)
    .collection('suppliers')
    .doc(String(supplierId))
    .set(
      {
        ...(data?.name != null && { name: String(data.name).trim() }),
        ...(data?.phone != null && { phone: String(data.phone).trim() }),
        ...(data?.address != null && { address: String(data.address).trim() }),
        ...(data?.gstNumber != null && { gstNumber: String(data.gstNumber).trim() }),
      },
      { merge: true }
    );
}

export async function deleteSupplier(shopId, supplierId) {
  return firestore()
    .collection('billing_shops')
    .doc(shopId)
    .collection('suppliers')
    .doc(String(supplierId))
    .set({ isActive: false }, { merge: true });
}