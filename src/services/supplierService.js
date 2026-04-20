import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../constants/collections';

/**
 * Create supplier
 */
export async function createSupplier(
  shopId,
  {
    name,
    phone = '',
    address = '',
    gstNumber = '',
    openingBalance = 0,
  } = {}
) {

  const ref = firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .collection(COLLECTIONS.SUPPLIERS)
    .doc();

  const data = {
    name: String(name || '').trim(),
    phone: String(phone || '').trim(),
    address: String(address || '').trim(),
    gstNumber: String(gstNumber || '').trim(),
    openingBalance: Number(openingBalance) || 0,
    totalPurchaseAmount: 0,
    totalPaidAmount: 0,
    totalDueAmount: 0,
    totalPurchases: 0,
    lastPurchaseAt: null,
    isActive: true,
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  if (!data.name) {
    throw new Error('Supplier name is required');
  }

  await ref.set(data);

  const snap = await ref.get();

  return {
    id: snap.id,
    ...snap.data(),
  };
}

/**
 * List suppliers
 */
export async function listSuppliers(shopId) {

  const snap = await firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .collection(COLLECTIONS.SUPPLIERS)
    .where('isActive', '==', true)
    .orderBy('name')
    .get();

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

/**
 * Subscribe suppliers
 */
export function subscribeSuppliers(shopId, callback) {

  return firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .collection(COLLECTIONS.SUPPLIERS)
    .where('isActive', '==', true)
    .orderBy('name')
    .onSnapshot((snap) => {

      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      callback(list);
    });
}

/**
 * Get supplier
 */
export async function getSupplier(shopId, supplierId) {

  const snap = await firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .collection(COLLECTIONS.SUPPLIERS)
    .doc(String(supplierId))
    .get();

  if (!snap.exists) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
}

/**
 * Update supplier
 */
export async function updateSupplier(shopId, supplierId, data) {

  return firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .collection(COLLECTIONS.SUPPLIERS)
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

/**
 * Soft delete supplier
 */
export async function deleteSupplier(shopId, supplierId) {

  return firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .collection(COLLECTIONS.SUPPLIERS)
    .doc(String(supplierId))
    .set({ isActive: false }, { merge: true });
}

/**
 * Create sample suppliers
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