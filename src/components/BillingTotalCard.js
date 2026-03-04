import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { numberToWords } from "../utils/numberToWords";

const BillingTotalCard = ({ total, cartItems }) => {

  const totalQty = cartItems.reduce((sum, i) => sum + (i.qty || 0), 0);

  const words =
  "Rs. " +
  numberToWords(Math.floor(total)).replace(/^./, c => c.toUpperCase()) +
  " only";

  return (
    <View style={styles.container}>

      <View style={styles.totalRow}>
        <Text style={styles.label}>Grand total</Text>
        <Text style={styles.value}>₹{total}</Text>
      </View>

      <Text style={styles.words}>
        {words}
      </Text>

      <Text style={styles.qty}>
        Total items: {totalQty}
      </Text>

    </View>
  );
};

export default BillingTotalCard;

const styles = StyleSheet.create({

  container: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  label: {
    fontSize: 18,
    fontWeight: "600",
  },

  value: {
    fontSize: 20,
    fontWeight: "700",
  },

  words: {
    fontSize: 13,
    color: "#555",
    marginTop: 6,
    fontStyle: "italic",
  },

  qty: {
    fontSize: 13,
    marginTop: 4,
    color: "#777",
  },
});