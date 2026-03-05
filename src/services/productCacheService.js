import firestore from "@react-native-firebase/firestore";

const PRODUCTS = "billing_products";

export async function loadProductCache() {
  const snap = await firestore()
    .collection(PRODUCTS)
    .get();

  const map = {};

  snap.forEach((doc) => {
    map[doc.id] = doc.data();
  });

  return map;
}