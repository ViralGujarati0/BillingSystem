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
 * Uses Firebase Auth uid as document id. Owner has no shopId until they create a shop.
 * @param {Object} firebaseUser - from auth().currentUser or userCredential.user
 * @returns {Promise<Object>} the written user doc data (with id)
 */
export async function createOrUpdateOwnerUser(firebaseUser) {
  const ref = firestore().collection(USERS).doc(firebaseUser.uid);
  
  // Check if doc already exists
  const snap = await ref.get();
  
  if (snap.exists) {
    // Already exists — only update name/email, never touch shopId
    await ref.update({
      name: firebaseUser.displayName || '',
      email: firebaseUser.email || '',
    });
    return { id: firebaseUser.uid, ...snap.data() };
  } else {
    // First time — create with shopId: null
    const data = {
      shopId: null,
      name: firebaseUser.displayName || '',
      email: firebaseUser.email || '',
      role: 'OWNER',
      isActive: true,
      permissions: ownerPermissions,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };
    await ref.set(data);
    return { id: firebaseUser.uid, ...data };
  }
}
/**
 * Get user doc from Firestore.
 * @param {string} userId - users/{userId}
 */
export async function getUser(userId) {
  const snap = await firestore().collection(USERS).doc(userId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Create a shop. Call this when owner sets up their business.
 * After creating the shop, update the owner's user doc with shopId (use updateUserShopId).
 * @param {Object} params
 * @param {string} params.ownerId - users/{ownerId}
 * @param {string} params.businessName
 * @param {string} [params.phone]
 * @param {string} [params.address]
 * @param {string} [params.gstNumber]
 * @returns {Promise<string>} the new shop id
 */
export async function createShop({ ownerId, businessName, phone = '', address = '', gstNumber = '' }) {
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
 * Update owner's user doc with their shopId after they create a shop.
 */
export async function updateUserShopId(userId, shopId) {
  await firestore().collection(USERS).doc(userId).update({
    shopId,
  });
}

/**
 * Create shop and set it on the owner in one go (convenience for first-time setup).
 */
export async function createShopAndAssignToOwner(ownerId, shopData) {
  const shopId = await createShop({ ownerId, ...shopData });
  await updateUserShopId(ownerId, shopId);
  return shopId;
}
