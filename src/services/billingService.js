import functions from '@react-native-firebase/functions';

export async function createBill({ items, customerName = 'Walk-in', paymentType = 'CASH' }) {
  const res = await functions().httpsCallable('createBill')({
    items,
    customerName,
    paymentType,
  });

  return res.data;
}