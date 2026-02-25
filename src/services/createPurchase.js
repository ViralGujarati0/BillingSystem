import functions from '@react-native-firebase/functions';

/**
 * Call createPurchase cloud function.
 * items: [{ barcode, name, qty, purchasePrice }]
 * supplierId: string
 * paidAmount: number
 */
export async function createPurchaseCF({ supplierId, items = [], paidAmount = 0 }) {
  const callable = functions().httpsCallable('createPurchase');
  const result = await callable({
    supplierId,
    items,
    paidAmount,
  });
  return result.data; // { success: true, purchaseNo: 'PUR-YYYY-00001' }
}

