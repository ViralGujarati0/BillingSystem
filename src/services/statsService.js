import firestore from "@react-native-firebase/firestore";

/* ───────── LISTEN MONTH STATS (REALTIME) ───────── */

export function listenMonthStats(shopId, year, month, callback) {

  const prefix =
    "daily_" +
    year +
    "_" +
    String(month + 1).padStart(2, "0");

  return firestore()
    .collection("billing_shops")
    .doc(shopId)
    .collection("stats")
    .where(
      firestore.FieldPath.documentId(),
      ">=",
      prefix
    )
    .where(
      firestore.FieldPath.documentId(),
      "<",
      prefix + "_z"
    )
    .onSnapshot((snap) => {

      const stats = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      callback(stats);

    });

}