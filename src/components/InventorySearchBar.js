import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../theme/colors";
import { useTranslation } from "react-i18next";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * scale);

// ─── Component ────────────────────────────────────────────────────────────────
const InventorySearchBar = ({ onSearch, navigation }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>

      {/* Search icon */}
      <Ionicons
        name="search-outline"
        size={rfs(18)}
        color={colors.textSecondary}
      />

      {/* Input */}
      <TextInput
        placeholder={t("inventory.searchPlaceholder")}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        onChangeText={onSearch}
      />

      {/* Camera button */}
      <TouchableOpacity
        style={styles.cameraBtn}
        activeOpacity={0.75}
        onPress={() =>
          navigation.navigate("BarcodeScanner", { mode: "searchInventory" })
        }
      >
        <Ionicons
          name="camera-outline"
          size={rfs(17)}
          color={colors.primary}
        />
      </TouchableOpacity>

    </View>
  );
};

export default InventorySearchBar;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10),
    paddingHorizontal: rs(14),
    paddingVertical: rvs(11),
    borderRadius: rs(14),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 2,
  },

  input: {
    flex: 1,
    fontSize: rfs(14),
    fontWeight: "500",
    color: colors.textPrimary,
    padding: 0,
  },

  cameraBtn: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(9),
    backgroundColor: "rgba(45,74,82,0.07)",
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

});