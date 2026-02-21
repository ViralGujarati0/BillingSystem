import firestore from '@react-native-firebase/firestore';

const USERS = "billing_users";
const SHOPS = "billing_shops";

const ownerPermissions = {
  sales: true,
  invoiceHistory: true,
  accounts: true,
  profit: true,
};

/**
 * Create or update owner user in Firestore when they sign in with Google.
 * Atomic UPSERT (mobile safe).
 */
export async function createOrUpdateOwnerUser(firebaseUser) {
  const ref = firestore().collection(USERS).doc(firebaseUser.uid);

  const data = {
    name: firebaseUser.displayName || '',
    email: firebaseUser.email || '',
    role: 'OWNER',
    isActive: true,
    permissions: ownerPermissions,
    shopId: null,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

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
export async function getStaffByShopId(shopId) {
  const snap = await firestore()
    .collection(SHOPS)
    .doc(shopId)
    .collection('staff')
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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