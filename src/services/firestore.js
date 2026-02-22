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

/**
 * Get product by barcode from billing_products/{barcode}. Returns null if not found.
 */
export async function getProductByBarcode(barcode) {
  const ref = firestore().collection(PRODUCTS).doc(String(barcode));
  const snap = await ref.get();
  const exists = typeof snap.exists === 'function' ? snap.exists() : snap.exists;
  if (__DEV__) console.log('[Firestore] getProductByBarcode', { barcode, path: ref.path, exists });
  if (!exists) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Get inventory item for a shop: billing_shops/{shopId}/inventory/{barcode}. Returns null if not found.
 */
export async function getInventoryItem(shopId, barcode) {
  const ref = firestore()
    .collection(SHOPS)
    .doc(shopId)
    .collection('inventory')
    .doc(String(barcode));
  const snap = await ref.get();
  const exists = typeof snap.exists === 'function' ? snap.exists() : snap.exists;
  if (__DEV__) console.log('[Firestore] getInventoryItem', { shopId, barcode, path: ref.path, exists });
  if (!exists) return null;
  return { id: snap.id, ...snap.data() };
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