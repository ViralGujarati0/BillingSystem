import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../constants/collections';

/**
 * Subscribe to staff list of a shop
 */
export function subscribeStaffByShopId(shopId, callback) {
  return firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .collection(COLLECTIONS.STAFF)
    .onSnapshot((snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      callback(list);
    });
}

/**
 * Update staff document in users collection
 */
export async function updateStaffDoc(staffId, data) {
  const ref = firestore()
    .collection(COLLECTIONS.USERS)
    .doc(staffId);

  await ref.set(data, { merge: true });

  const snap = await ref.get();

  return {
    id: snap.id,
    ...snap.data(),
  };
}

/**
 * Update staff document inside shop
 */
export async function updateStaffInShop(shopId, staffId, data) {
  await firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .collection(COLLECTIONS.STAFF)
    .doc(staffId)
    .set(data, { merge: true });
}

/**
 * Deactivate staff so they cannot login
 */
export async function setStaffInactive(staffId) {
  await firestore()
    .collection(COLLECTIONS.USERS)
    .doc(staffId)
    .set({ isActive: false }, { merge: true });
}

/**
 * Remove staff from shop staff list
 */
export async function removeStaffFromShop(shopId, staffId) {
  await firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .collection(COLLECTIONS.STAFF)
    .doc(staffId)
    .delete();
}

import functions from '@react-native-firebase/functions';

/**
 * Delete staff using cloud function
 */
export async function deleteStaff(staffId) {
  const res = await functions().httpsCallable('deleteStaff')({
    staffId,
  });

  return res.data;
}

/**
 * Update staff everywhere (user doc + shop subcollection)
 */
export async function updateStaff(shopId, staffId, data) {
    await updateStaffDoc(staffId, data);
  
    if (shopId) {
      await updateStaffInShop(shopId, staffId, data);
    }
  
    return true;
  }