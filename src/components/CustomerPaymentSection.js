import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

const PAYMENT_OPTIONS = ["CASH", "UPI", "CARD"];

const CustomerPaymentSection = ({
  customerName,
  setCustomerName,
  paymentType,
  setPaymentType,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Customer name</Text>

      <TextInput
        style={styles.input}
        value={customerName}
        onChangeText={setCustomerName}
        placeholder="Walk-in"
      />

      <Text style={styles.label}>Payment type</Text>

      <View style={styles.paymentRow}>
        {PAYMENT_OPTIONS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.chip,
              paymentType === p && styles.chipActive,
            ]}
            onPress={() => setPaymentType(p)}
          >
            <Text
              style={[
                styles.chipText,
                paymentType === p && styles.chipTextActive,
              ]}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default CustomerPaymentSection;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },

  paymentRow: {
    flexDirection: "row",
  },

  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    marginRight: 10,
  },

  chipActive: {
    backgroundColor: "#1a73e8",
    borderColor: "#1a73e8",
  },

  chipText: {
    fontSize: 14,
  },

  chipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});