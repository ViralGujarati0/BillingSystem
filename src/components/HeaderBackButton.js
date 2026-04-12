import React from "react";
import { TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { colors } from "../theme/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const BTN = rs(36);

/**
 * Icon-only back control for AppHeaderLayout leftComponent and custom headers.
 * Matches Bill Detail compact back style (no "Back" label).
 */
export default function HeaderBackButton({
  onPress,
  iconColor = "#FFFFFF",
  iconSize = 19,
  /** Solid primary circle — for light backgrounds (e.g. error cards). */
  filled = false,
}) {
  return (
    <TouchableOpacity
      style={[styles.btn, filled && styles.btnFilled]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Icon name="chevron-back" size={rfs(iconSize)} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: BTN,
    height: BTN,
    borderRadius: BTN / 2,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnFilled: {
    backgroundColor: colors.primary,
    borderWidth: 0,
  },
});
