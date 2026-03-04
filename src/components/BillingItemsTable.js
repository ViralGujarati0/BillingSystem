import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

const BillingItemsTable = ({ cartItems, updateItemQty }) => {
  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.colNo}>#</Text>
        <Text style={styles.colName}>Product</Text>
        <Text style={styles.colQty}>Qty</Text>
        <Text style={styles.colMrp}>MRP</Text>
        <Text style={styles.colRate}>Rate</Text>
        <Text style={styles.colAmt}>Amt</Text>
      </View>

      {/* ROWS */}
      {cartItems.map((item, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.colNo}>{index + 1}</Text>

          <Text style={styles.colName} numberOfLines={1}>
            {item.name}
          </Text>

          <TextInput
            style={styles.qtyInput}
            value={String(item.qty)}
            keyboardType="number-pad"
            onChangeText={(v) => updateItemQty(index, v)}
          />

          <Text style={styles.colMrp}>
            ₹{item.mrp ?? item.rate}
          </Text>

          <Text style={styles.colRate}>
            ₹{item.rate}
          </Text>

          <Text style={styles.colAmt}>
            ₹{item.amount}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default BillingItemsTable;

/* ───────── STYLES ───────── */

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },

  header: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingBottom: 6,
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  colNo: {
    width: 25,
    fontSize: 12,
  },

  colName: {
    flex: 1,
    fontSize: 14,
  },

  colQty: {
    width: 45,
    textAlign: "center",
  },

  qtyInput: {
    width: 45,
    borderWidth: 1,
    borderColor: "#ddd",
    textAlign: "center",
    borderRadius: 6,
    paddingVertical: 4,
  },

  colMrp: {
    width: 60,
    textAlign: "right",
    fontSize: 12,
  },

  colRate: {
    width: 60,
    textAlign: "right",
    fontSize: 12,
  },

  colAmt: {
    width: 70,
    textAlign: "right",
    fontWeight: "600",
  },
});