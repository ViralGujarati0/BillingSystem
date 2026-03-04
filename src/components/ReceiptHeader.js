import React from "react";
import { View, Text, StyleSheet } from "react-native";

const ReceiptHeader = ({ shopName, shopAddress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.shopName}>{shopName}</Text>
      <Text style={styles.shopAddress}>{shopAddress}</Text>
    </View>
  );
};

export default ReceiptHeader;

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },

  shopName: {
    fontSize: 20,
    fontWeight: "700",
  },

  shopAddress: {
    fontSize: 12,
    color: "#666",
  },
});