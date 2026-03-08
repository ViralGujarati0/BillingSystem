import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { colors } from "../theme/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Component ────────────────────────────────────────────────────────────────
const ReceiptHeader = ({ shopName, shopAddress }) => {
  return (
    <View style={styles.container}>

      <View style={styles.row}>
        {/* Amber accent bar */}
        <View style={styles.accentBar} />

        <View style={styles.textBlock}>
          <Text style={styles.shopName} numberOfLines={1}>
            {shopName}
          </Text>
          {!!shopAddress && (
            <Text style={styles.shopAddress} numberOfLines={1}>
              {shopAddress}
            </Text>
          )}
        </View>
      </View>

    </View>
  );
};

export default ReceiptHeader;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: {
    paddingHorizontal: rs(18),
    paddingTop: rvs(18),
    paddingBottom: rvs(14),
    borderBottomWidth: 1,
    borderColor: colors.borderCard,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10),
  },

  accentBar: {
    width: rs(3),
    height: rvs(36),
    borderRadius: rs(2),
    backgroundColor: colors.accent,
    flexShrink: 0,
  },

  textBlock: {
    flex: 1,
    gap: rvs(3),
  },

  shopName: {
    fontSize: rfs(18),
    fontWeight: "800",
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },

  shopAddress: {
    fontSize: rfs(12),
    fontWeight: "500",
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
});