import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../constants/collections';
import { barcodeVariants } from '../utils/barcode';

/**
 * Get product by barcode
 */
export async function getProductByBarcode(barcode) {

  const variants = barcodeVariants(barcode);

  for (const key of variants) {

    const ref = firestore()
      .collection(COLLECTIONS.PRODUCTS)
      .doc(key);

    const snap = await ref.get();

    const exists =
      typeof snap.exists === 'function'
        ? snap.exists()
        : snap.exists;

    if (__DEV__) {
      console.log('[Firestore] getProductByBarcode', {
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
 * Create product
 */
export async function createProduct({
  barcode,
  name,
  category,
  brand = '',
  unit = 'pcs',
  mrp,
  gstPercent,
  createdBy,
}) {

  const ref = firestore()
    .collection(COLLECTIONS.PRODUCTS)
    .doc(String(barcode));

  const data = {
    barcode: String(barcode),
    name: name || '',
    category: category || '',
    brand: brand || '',
    unit: unit || 'pcs',
    mrp: Number(mrp) || 0,
    gstPercent: Number(gstPercent) || 0,
    createdBy: createdBy || '',
    createdAt: firestore.FieldValue.serverTimestamp(),
  };

  await ref.set(data, { merge: true });

  const snap = await ref.get();

  return {
    id: snap.id,
    ...snap.data(),
  };
}