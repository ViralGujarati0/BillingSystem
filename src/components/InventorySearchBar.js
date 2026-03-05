import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../theme/colors";

const InventorySearchBar = ({ onSearch, navigation }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search-outline" size={20} color={colors.textSecondary} />

      <TextInput
        placeholder="Search product or barcode"
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        onChangeText={onSearch}
      />

      <TouchableOpacity
        onPress={() =>
          navigation.navigate("BarcodeScanner", {
            mode: "searchInventory",
          })
        }
      >
        <Ionicons name="camera-outline" size={22} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: colors.textPrimary,
  },
});

export default InventorySearchBar;