import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../constants/collections';
import { barcodeVariants } from '../utils/barcode';

/**
 * Get inventory item
 */
export async function getInventoryItem(shopId, barcode) {

  const variants = barcodeVariants(barcode);

  for (const key of variants) {

    const ref = firestore()
      .collection(COLLECTIONS.SHOPS)
      .doc(shopId)
      .collection(COLLECTIONS.INVENTORY)
      .doc(key);

    const snap = await ref.get();

    const exists =
      typeof snap.exists === 'function'
        ? snap.exists()
        : snap.exists;

    if (__DEV__) {
      console.log('[Firestore] getInventoryItem', {
        shopId,
        barcode: key,
        path: ref.path,
        exists,
      });
    }

    if (exists) {
      return {
        id: snap.id,
        ...snap.data(),
      };
    }
  }

  return null;
}

/**
 * Create or update inventory item
 */
export async function setInventoryItem(
  shopId,
  {
    barcode,
    sellingPrice,
    purchasePrice,
    stock,
    expiry = '',
    supplierId,
    lastPurchasePrice,
    lastPurchaseDate,
  }
) {

  const ref = firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .collection(COLLECTIONS.INVENTORY)
    .doc(String(barcode));

  const data = {
    barcode: String(barcode),
    sellingPrice: Number(sellingPrice) ?? 0,
    purchasePrice: Number(purchasePrice) ?? 0,
    stock: Number(stock) ?? 0,
    expiry: expiry || '',
    ...(typeof supplierId !== 'undefined' && {
      supplierId: String(supplierId),
    }),
    ...(typeof lastPurchasePrice !== 'undefined' && {
      lastPurchasePrice: Number(lastPurchasePrice) ?? 0,
    }),
    ...(typeof lastPurchaseDate !== 'undefined' && {
      lastPurchaseDate,
    }),
    lastUpdated: firestore.FieldValue.serverTimestamp(),
  };

  await ref.set(data, { merge: true });

  const snap = await ref.get();

  return {
    id: snap.id,
    ...snap.data(),
  };
}

/**
 * Delete inventory item
 */
export async function deleteInventoryItem(shopId, barcode) {

  const ref = firestore()
    .collection(COLLECTIONS.SHOPS)
    .doc(shopId)
    .collection(COLLECTIONS.INVENTORY)
    .doc(String(barcode));

  await ref.delete();
}


export async function listInventory(shopId) {
    const snap = await firestore()
      .collection(COLLECTIONS.SHOPS)
      .doc(shopId)
      .collection(COLLECTIONS.INVENTORY)
      .get();
  
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  }