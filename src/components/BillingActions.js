import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from "react-native";

const BillingActions = ({ loading, onAddMore, onGenerate }) => {
  return (
    <>
      <TouchableOpacity style={styles.secondary} onPress={onAddMore}>
        <Text style={styles.secondaryText}>Add more items</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primary, loading && { opacity: 0.6 }]}
        disabled={loading}
        onPress={onGenerate}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>Generate bill</Text>
        )}
      </TouchableOpacity>
    </>
  );
};

export default BillingActions;

const styles = StyleSheet.create({
  secondary: {
    backgroundColor: "#eee",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },

  secondaryText: {
    fontWeight: "600",
  },

  primary: {
    backgroundColor: "#1a73e8",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "600",
  },
});