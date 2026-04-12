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
const ReceiptTotals = ({ data }) => {
  const items = data.items || [];
  const totalItems = items.length;
  const totalQty =
    data.totalQty != null
      ? Number(data.totalQty)
      : items.reduce((s, i) => s + Number(i.qty || 0), 0);

  return (
    <View style={styles.container}>

      {/* ── Grand total row ── */}
      <View style={styles.totalRow}>
        <View style={styles.totalLabelBlock}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaDot} />
            <Text style={styles.metaText}>
              {totalItems} item{totalItems !== 1 ? "s" : ""} · {totalQty} qty
            </Text>
          </View>
        </View>

        <View style={styles.amountBlock}>
          <Text style={styles.currency}>₹</Text>
          <Text style={styles.amount}>
            {Number(data.grandTotal || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Words row ── */}
      <View style={styles.wordsRow}>
        <View style={styles.wordsAccent} />
        <Text style={styles.words} numberOfLines={2}>
          {data.totalInWords}
        </Text>
      </View>

    </View>
  );
};

export default ReceiptTotals;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: {
    borderBottomWidth: 1,
    borderColor: colors.borderCard,
  },

  // ── Total row ─────────────────────────────────────────
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rs(18),
    paddingTop: rvs(14),
    paddingBottom: rvs(12),
  },

  totalLabelBlock: {
    gap: rvs(5),
  },

  totalLabel: {
    fontSize: rfs(14),
    fontWeight: "700",
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
  },

  metaDot: {
    width: rs(5),
    height: rs(5),
    borderRadius: rs(3),
    backgroundColor: colors.accent,
  },

  metaText: {
    fontSize: rfs(11),
    fontWeight: "600",
    color: colors.textSecondary,
  },

  // ── Amount ────────────────────────────────────────────
  amountBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  currency: {
    fontSize: rfs(15),
    fontWeight: "700",
    color: colors.primary,
    marginTop: rvs(4),
    letterSpacing: 0.2,
  },

  amount: {
    fontSize: rfs(26),
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: -0.5,
    lineHeight: rfs(30),
  },

  // ── Divider ───────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: colors.borderCard,
    marginHorizontal: rs(18),
  },

  // ── Words row ─────────────────────────────────────────
  wordsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10),
    paddingHorizontal: rs(18),
    paddingTop: rvs(10),
    paddingBottom: rvs(14),
  },

  wordsAccent: {
    width: rs(3),
    height: rvs(28),
    borderRadius: rs(2),
    backgroundColor: colors.accent,
    flexShrink: 0,
  },

  words: {
    flex: 1,
    fontSize: rfs(12),
    fontStyle: "italic",
    color: colors.textSecondary,
    fontWeight: "500",
    lineHeight: rfs(18),
  },
});