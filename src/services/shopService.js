import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../constants/collections';

/**
 * Create a new shop
 */
export async function createShop({
  ownerId,
  businessName,
  phone = '',
  address = '',
  gstNumber = '',
}) {

  const ref = firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc();

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
 * Create shop and assign it to owner
 */
export async function createShopAndAssignToOwner(ownerId, shopData) {

  const shopId = await createShop({
    ownerId,
    ...shopData,
  });

  // assign shopId to user
  await firestore()
    .collection(COLLECTIONS.USERS)
    .doc(ownerId)
    .set({ shopId }, { merge: true });

  // create default settings
  await firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .collection(COLLECTIONS.SETTINGS)
    .doc('main')
    .set({
      billMessage: shopData.billMessage || '',
      billTerms: shopData.billTerms || '',
    });

  return shopId;
}

/**
 * Update shop info
 */
export async function updateShop(shopId, data) {

  await firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .update(data);
}

/**
 * Update shop settings
 */
export async function updateShopSettings(shopId, data) {

  await firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .collection(COLLECTIONS.SETTINGS)
    .doc('main')
    .update(data);
}

/**
 * Get shop data
 */
export async function getShop(shopId) {
  const doc = await firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .get();

  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

/**
 * Get shop settings
 */
export async function getShopSettings(shopId) {
  const doc = await firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .collection(COLLECTIONS.SETTINGS)
    .doc('main')
    .get();

  return doc.exists ? doc.data() : null;
}