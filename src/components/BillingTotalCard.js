import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import { numberToWords } from "../utils/numberToWords";
import { colors } from "../theme/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Component ────────────────────────────────────────────────────────────────
const BillingTotalCard = ({ total, cartItems }) => {

  const totalQty   = cartItems.reduce((sum, i) => sum + Number(i.qty  || 0), 0);
  const totalItems = cartItems.length;

  const words =
    "Rs. " +
    numberToWords(Math.floor(total)).replace(/^./, (c) => c.toUpperCase()) +
    " only";

  return (
    <View style={styles.container}>
      <View style={styles.card}>

        {/* ── Top row: label + amount ── */}
        <View style={styles.topRow}>
          <View style={styles.labelBlock}>
            <Text style={styles.grandLabel}>Grand Total</Text>
            <View style={styles.metaRow}>
              <View style={styles.metaDot} />
              <Text style={styles.metaText}>{totalItems} item{totalItems !== 1 ? "s" : ""} · {totalQty} qty</Text>
            </View>
          </View>

          <View style={styles.amountBlock}>
            <Text style={styles.currency}>₹</Text>
            <Text style={styles.amount}>{Number(total).toFixed(2)}</Text>
          </View>
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Words ── */}
        <View style={styles.wordsRow}>
          <View style={styles.wordsAccent} />
          <Text style={styles.words} numberOfLines={2}>{words}</Text>
        </View>

      </View>
    </View>
  );
};

export default BillingTotalCard;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(14),
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
    overflow: "hidden",
  },

  // ── Top row ───────────────────────────────────────────
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rs(18),
    paddingTop: rvs(16),
    paddingBottom: rvs(14),
  },

  labelBlock: {
    gap: rvs(5),
  },

  grandLabel: {
    fontSize: rfs(15),
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
    fontSize: rfs(16),
    fontWeight: "700",
    color: colors.primary,
    marginTop: rvs(4),
    letterSpacing: 0.2,
  },

  amount: {
    fontSize: rfs(28),
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: -0.5,
    lineHeight: rfs(32),
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