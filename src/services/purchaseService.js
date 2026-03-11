import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../constants/collections';

// ── Create purchase via cloud function ─────────────────────────────────────
export async function createPurchaseInvoice({ supplierId, items, paidAmount = 0 }) {
  const res = await functions().httpsCallable('createPurchase')({
    supplierId,
    items,
    paidAmount,
  });
  return res.data;
}

// ── Realtime purchases listener ────────────────────────────────────────────
export function subscribePurchases(shopId, callback) {
  return firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .collection(COLLECTIONS.PURCHASES)
    .orderBy('createdAt', 'desc')
    .onSnapshot((snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        date: d.data().createdAt
          ? new Date(d.data().createdAt.toDate()).toLocaleDateString('en-IN')
          : '—',
        itemsCount: Array.isArray(d.data().items) ? d.data().items.length : 0,
      }));
      callback(list);
    });
}