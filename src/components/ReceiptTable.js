import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ReceiptTable = ({ items }) => {
  return (
    <View style={styles.table}>

      <View style={styles.row}>
        <Text style={[styles.th, styles.colNo]}>No</Text>
        <Text style={[styles.th, styles.colName]}>Product</Text>
        <Text style={[styles.th, styles.colQty]}>Qty</Text>
        <Text style={[styles.th, styles.colMrp]}>MRP</Text>
        <Text style={[styles.th, styles.colRate]}>Rate</Text>
        <Text style={[styles.th, styles.colAmt]}>Amt</Text>
      </View>

      {items.map((it, i) => (
        <View key={i} style={styles.row}>
          <Text style={[styles.td, styles.colNo]}>{i + 1}</Text>
          <Text style={[styles.td, styles.colName]} numberOfLines={1}>
            {it.name}
          </Text>
          <Text style={[styles.td, styles.colQty]}>{it.qty}</Text>
          <Text style={[styles.td, styles.colMrp]}>₹{it.mrp}</Text>
          <Text style={[styles.td, styles.colRate]}>₹{it.rate}</Text>
          <Text style={[styles.td, styles.colAmt]}>₹{it.amount}</Text>
        </View>
      ))}
    </View>
  );
};

export default ReceiptTable;

const styles = StyleSheet.create({
  table: {
    marginVertical: 12,
  },

  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 6,
  },

  th: {
    fontWeight: "600",
    fontSize: 11,
  },

  td: {
    fontSize: 12,
  },

  colNo: { width: 24 },
  colName: { flex: 1 },
  colQty: { width: 30 },
  colMrp: { width: 55 },
  colRate: { width: 55 },
  colAmt: { width: 60 },
});