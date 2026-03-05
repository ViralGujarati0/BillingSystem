import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../constants/collections';

const ownerPermissions = {
  sales: true,
  invoiceHistory: true,
  accounts: true,
  profit: true,
};

/**
 * Create or update owner user after Google login
 */
export async function createOrUpdateOwnerUser(firebaseUser) {
  const ref = firestore()
    .collection(COLLECTIONS.USERS)
    .doc(firebaseUser.uid);

  const data = {
    name: firebaseUser.displayName || '',
    email: firebaseUser.email || '',
    role: 'OWNER',
    isActive: true,
    permissions: ownerPermissions,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  await ref.set(data, { merge: true });

  const snap = await ref.get();

  return {
    id: snap.id,
    ...snap.data(),
  };
}

/**
 * Get user document
 */
export async function getUser(userId) {
  const snap = await firestore()
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .get();

  if (!snap.exists) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}

/**
 * Assign shopId to user
 */
export async function updateUserShopId(userId, shopId) {
  await firestore()
    .collection(COLLECTIONS.USERS)
    .doc(userId)
    .set({ shopId }, { merge: true });
}