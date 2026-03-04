import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

const ManualItemForm = ({
  name,
  qty,
  mrp,
  rate,
  amount,
  onChangeName,
  onChangeQty,
  onChangeMrp,
  onChangeRate,
}) => {
  return (
    <View>

      <Text style={styles.label}>Item name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={onChangeName}
        placeholder="e.g. Service charge"
      />

      <Text style={styles.label}>Quantity *</Text>
      <TextInput
        style={styles.input}
        value={qty}
        onChangeText={onChangeQty}
        keyboardType="number-pad"
        placeholder="1"
      />

      <Text style={styles.label}>MRP (₹)</Text>
      <TextInput
        style={styles.input}
        value={mrp}
        onChangeText={onChangeMrp}
        keyboardType="decimal-pad"
        placeholder="0"
      />

      <Text style={styles.label}>Rate (₹) *</Text>
      <TextInput
        style={styles.input}
        value={rate}
        onChangeText={onChangeRate}
        keyboardType="decimal-pad"
        placeholder="0"
      />

      {/* 🔹 Live Amount Preview */}

      <View style={styles.amountBox}>
        <Text style={styles.amountLabel}>Amount Preview</Text>
        <Text style={styles.amountValue}>₹{amount}</Text>
      </View>

    </View>
  );
};

export default ManualItemForm;

const styles = StyleSheet.create({

  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },

  amountBox: {
    backgroundColor: "#f5f7ff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 20,
  },

  amountLabel: {
    fontSize: 12,
    color: "#666",
  },

  amountValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a73e8",
  },

});