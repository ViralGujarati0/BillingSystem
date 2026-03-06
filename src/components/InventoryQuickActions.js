import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../theme/colors";

const InventoryQuickActions = ({ navigation }) => {
  return (
    <View style={styles.container}>

      <TouchableOpacity
        style={styles.action}
        onPress={() => navigation.navigate("BarcodeScanner")}
      >
        <Ionicons name="scan-outline" size={22} color={colors.primary} />
        <Text style={styles.label}>Scan</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.action}
        onPress={() =>
          navigation.navigate("BarcodeScanner", { mode: "updateInventory" })
        }
      >
        <Ionicons name="refresh-outline" size={22} color={colors.primary} />
        <Text style={styles.label}>Update</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.action}
        onPress={() => navigation.navigate("BarcodeScanner", { mode: "createProduct" })}
      >
        <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
        <Text style={styles.label}>Add</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 12,
  },

  action: {
    alignItems: "center",
  },

  label: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textPrimary,
  },
});

export default InventoryQuickActions;