import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";

const ReceiptActions = ({ loading, onPdf, onBack }) => {
  return (
    <>
      <TouchableOpacity
        style={[styles.primaryBtn, loading && styles.disabled]}
        onPress={onPdf}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Convert to PDF</Text>}
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={onBack}>
        <Text style={styles.secondaryText}>Back to home</Text>
      </TouchableOpacity>
    </>
  );
};

export default ReceiptActions;

const styles = StyleSheet.create({

  primaryBtn: {
    backgroundColor: "#1a73e8",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 12,
  },

  btnText: {
    color: "#fff",
    fontWeight: "600",
  },

  secondaryBtn: {
    padding: 14,
    alignItems: "center",
  },

  secondaryText: {
    color: "#1a73e8",
    fontWeight: "600",
  },

  disabled: {
    opacity: 0.6,
  },
});