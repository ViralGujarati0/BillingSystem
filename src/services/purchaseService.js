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

export async function recordPurchasePayment({
  shopId,
  purchaseId,
  amount,
  paymentType = 'CASH',
  createdBy,
}) {
  const db = firestore();
  const purchaseRef = db
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .collection(COLLECTIONS.PURCHASES)
    .doc(purchaseId);

  const paymentRef = purchaseRef.collection('payments').doc();
  const normalizedAmount = Number(amount) || 0;
  const normalizedType = String(paymentType || 'CASH').toUpperCase();

  if (normalizedAmount <= 0) {
    throw new Error('Payment amount must be greater than 0.');
  }

  return db.runTransaction(async (transaction) => {
    const snap = await transaction.get(purchaseRef);

    if (!snap.exists) {
      throw new Error('Purchase not found.');
    }

    const purchase = { id: snap.id, ...snap.data() };
    const supplierId = purchase?.supplierId ? String(purchase.supplierId) : '';
    const supplierRef = supplierId
      ? db
        .collection(COLLECTIONS.SHOPS)
        .doc(shopId)
        .collection(COLLECTIONS.SUPPLIERS)
        .doc(supplierId)
      : null;
    const subtotal = Number(purchase.subtotal || 0);
    const previousPaidAmount = Number(purchase.paidAmount || 0);
    const previousDueAmount = Number(purchase.dueAmount ?? Math.max(0, subtotal - previousPaidAmount));

    if (previousDueAmount <= 0) {
      throw new Error('This purchase is already fully paid.');
    }

    if (normalizedAmount > previousDueAmount) {
      throw new Error('Payment amount cannot be greater than the due amount.');
    }

    const nextPaidAmount = previousPaidAmount + normalizedAmount;
    const nextDueAmount = Math.max(0, subtotal - nextPaidAmount);

    transaction.update(purchaseRef, {
      paidAmount: nextPaidAmount,
      dueAmount: nextDueAmount,
      paymentType: normalizedType,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    transaction.set(paymentRef, {
      amount: normalizedAmount,
      paymentType: normalizedType,
      createdAt: firestore.FieldValue.serverTimestamp(),
      createdBy: createdBy || null,
      previousPaidAmount,
      nextPaidAmount,
      previousDueAmount,
      nextDueAmount,
    });

    if (supplierRef) {
      transaction.set(
        supplierRef,
        {
          totalPaidAmount: firestore.FieldValue.increment(normalizedAmount),
          totalDueAmount: firestore.FieldValue.increment(-normalizedAmount),
        },
        { merge: true }
      );
    }

    return {
      ...purchase,
      paidAmount: nextPaidAmount,
      dueAmount: nextDueAmount,
      paymentType: normalizedType,
    };
  });
}