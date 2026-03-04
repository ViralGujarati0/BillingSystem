import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ReceiptTotals = ({ data }) => {
  return (
    <View style={styles.container}>

      <Text style={styles.total}>
        Grand Total: ₹{data.grandTotal}
      </Text>

      <Text style={styles.words}>
        {data.totalInWords}
      </Text>

      <Text style={styles.qty}>
        Total Items: {data.totalQty}
      </Text>

    </View>
  );
};

export default ReceiptTotals;

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },

  total: {
    fontSize: 16,
    fontWeight: "700",
  },

  words: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: "italic",
    color: "#555",
  },

  qty: {
    fontSize: 12,
    marginTop: 4,
    color: "#777",
  },
});