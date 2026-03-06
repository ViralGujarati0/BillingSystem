import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../theme/colors";

const InventoryFAB = ({ navigation }) => {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => navigation.navigate("BarcodeScanner", { mode: "createProduct" })}
    >
      <Ionicons name="add" size={26} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});

export default InventoryFAB;