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

// ─── Payment badge colors ─────────────────────────────────────────────────────
const PAY_CONFIG = {
  CASH: { bg: "rgba(91,158,109,0.10)", border: "#5B9E6D", text: "#5B9E6D" },
  UPI:  { bg: "rgba(45,74,82,0.10)",   border: colors.primary, text: colors.primary },
  CARD: { bg: "rgba(245,166,35,0.10)", border: colors.accent,  text: "#c47c0a" },
};

const DEFAULT_PAY = {
  bg: "rgba(138,155,163,0.08)", border: colors.borderCard, text: colors.textSecondary,
};

// ─── Component ────────────────────────────────────────────────────────────────
const ReceiptInfo = ({ data }) => {
  const payKey = (data.paymentType || "").toUpperCase();
  const pay    = PAY_CONFIG[payKey] ?? DEFAULT_PAY;

  return (
    <View style={styles.container}>

      {/* 2×2 info grid */}
      <View style={styles.grid}>

        {/* Customer */}
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>CUSTOMER</Text>
          <Text style={styles.cellValue} numberOfLines={1}>
            {data.customerName || "Walk-in"}
          </Text>
        </View>

        {/* Payment */}
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>PAYMENT</Text>
          <View style={[styles.payBadge, { backgroundColor: pay.bg, borderColor: pay.border }]}>
            <Text style={[styles.payBadgeText, { color: pay.text }]}>
              ✓ {data.paymentType || "—"}
            </Text>
          </View>
        </View>

        {/* Bill No */}
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>BILL NO</Text>
          <Text style={styles.cellValue} numberOfLines={1}>
            {data.billNo || "—"}
          </Text>
        </View>

        {/* Date */}
        <View style={styles.cell}>
          <Text style={styles.cellLabel}>DATE & TIME</Text>
          <Text style={styles.cellValue} numberOfLines={1}>
            {data.date || "—"}
          </Text>
        </View>

      </View>

    </View>
  );
};

export default ReceiptInfo;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: {
    borderBottomWidth: 1,
    borderColor: colors.borderCard,
  },

  // ── 2×2 grid ──────────────────────────────────────────
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: rs(18),
    paddingVertical: rvs(14),
    gap: rvs(12),
  },

  cell: {
    width: "47%",
    gap: rvs(4),
  },

  cellLabel: {
    fontSize: rfs(9),
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.7,
  },

  cellValue: {
    fontSize: rfs(12),
    fontWeight: "600",
    color: colors.textPrimary,
  },

  // ── Payment badge ──────────────────────────────────────
  payBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: rs(8),
    paddingHorizontal: rs(8),
    paddingVertical: rvs(2),
  },

  payBadgeText: {
    fontSize: rfs(11),
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});