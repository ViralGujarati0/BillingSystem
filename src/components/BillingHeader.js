import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const BillingHeader = ({ navigation, shop }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.shopName}>{shop?.businessName || "-"}</Text>
      <Text style={styles.address}>
        {shop?.address || shop?.phone || ""}
      </Text>
    </View>
  );
};

export default BillingHeader;

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  back: {
    color: "#1a73e8",
    fontSize: 16,
    marginBottom: 10,
  },

  shopName: {
    fontSize: 22,
    fontWeight: "700",
  },

  address: {
    fontSize: 13,
    color: "#777",
  },
});