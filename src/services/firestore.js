import firestore from '@react-native-firebase/firestore';

const USERS = "billing_users";
const SHOPS = "billing_shops";
const PRODUCTS = "billing_products";

const ownerPermissions = {
  sales: true,
  invoiceHistory: true,
  accounts: true,
  profit: true,
};

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