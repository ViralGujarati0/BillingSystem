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

  await firestore()
    .collection(COLLECTIONS.USERS)
    .doc(ownerId)
    .set({ shopId }, { merge: true });

  return shopId;
}

/**
 * Get shop document
 */
export async function getShop(shopId) {

  const snap = await firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .get();

  if (!snap.exists) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}

/**
 * Get shop settings
 */
export async function getShopSettings(shopId) {

  const snap = await firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .collection(COLLECTIONS.SETTINGS)
    .doc('main')
    .get();

  if (!snap.exists) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}