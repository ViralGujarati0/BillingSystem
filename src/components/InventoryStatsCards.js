import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

const InventoryStatsCards = ({ inventory }) => {

  const totalProducts = inventory.length;

  const lowStock = inventory.filter((i) => (i.stock || 0) <= 10).length;

  const value = inventory.reduce(
    (sum, item) => sum + (item.stock || 0) * (item.purchasePrice || 0),
    0
  );

  return (
    <View style={styles.container}>

      <View style={styles.card}>
        <Text style={styles.label}>Products</Text>
        <Text style={styles.value}>{totalProducts}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Low Stock</Text>
        <Text style={[styles.value, { color: colors.warning }]}>
          {lowStock}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Value</Text>
        <Text style={styles.value}>₹{value.toFixed(0)}</Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  card: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: "center",
  },

  label: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  value: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
});

export default InventoryStatsCards;