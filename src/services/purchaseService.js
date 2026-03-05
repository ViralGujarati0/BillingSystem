import functions from '@react-native-firebase/functions';

/**
 * Create purchase invoice using Cloud Function
 */
export async function createPurchaseInvoice({
  supplierId,
  items,
  paidAmount = 0,
}) {

  const res = await functions().httpsCallable('createPurchase')({
    supplierId,
    items,
    paidAmount,
  });

  return res.data;
}