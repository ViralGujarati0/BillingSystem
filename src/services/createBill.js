import functions from '@react-native-firebase/functions';

/**
 * Call createBill cloud function.
 * items: array of { type: 'BARCODE', barcode, qty } or { type: 'MANUAL', name, qty, rate }
 * paymentType: 'CASH' | 'UPI' | 'CARD'
 * customerName: string
 */
export async function createBill({ items = [], paymentType = 'CASH', customerName = 'Walk-in' }) {
  const callable = functions().httpsCallable('createBill');
  const result = await callable({
    items,
    paymentType,
    customerName,
  });
  return result.data;
}
