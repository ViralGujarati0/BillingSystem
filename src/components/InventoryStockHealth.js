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
const rfs   = (n) => Math.round(n * scale);

// ─── Component ────────────────────────────────────────────────────────────────
const InventoryStockHealth = ({ inventory }) => {
  const total   = inventory.length;
  const outOf   = inventory.filter((i) => (i.stock || 0) === 0).length;
  const low     = inventory.filter((i) => (i.stock || 0) > 0 && (i.stock || 0) <= 10).length;
  const healthy = total - outOf - low;

  const healthPct   = total > 0 ? Math.round((healthy / total) * 100) : 100;
  const isAllHealthy = outOf === 0 && low === 0;

  return (
    <View style={styles.card}>

      {/* Top row */}
      <View style={styles.topRow}>
        <Text style={styles.title}>STOCK HEALTH</Text>
        <View style={[styles.badge, !isAllHealthy && styles.badgeWarn]}>
          <View style={[styles.badgeDot, !isAllHealthy && styles.badgeDotWarn]} />
          <Text style={[styles.badgeText, !isAllHealthy && styles.badgeTextWarn]}>
            {healthPct}% Healthy
          </Text>
        </View>
      </View>

      {/* Segmented bar */}
      <View style={styles.segBar}>
        {healthy > 0 && (
          <View style={[styles.seg, styles.segHealthy, { flex: healthy }]} />
        )}
        {low > 0 && (
          <View style={[styles.seg, styles.segLow, { flex: low }]} />
        )}
        {outOf > 0 && (
          <View style={[styles.seg, styles.segOut, { flex: outOf }]} />
        )}
        {total === 0 && (
          <View style={[styles.seg, styles.segEmpty, { flex: 1 }]} />
        )}
      </View>

      {/* Labels */}
      <View style={styles.labelsRow}>
        <Text style={styles.segLabel}>
          <Text style={styles.segNum}>{healthy}</Text> Healthy
        </Text>
        <Text style={styles.segLabel}>
          <Text style={[styles.segNum, { color: colors.accent }]}>{low}</Text> Low
        </Text>
        <Text style={styles.segLabel}>
          <Text style={[styles.segNum, { color: "#E05252" }]}>{outOf}</Text> Out
        </Text>
      </View>

    </View>
  );
};

export default InventoryStockHealth;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 2,
    padding: rs(14),
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: rvs(10),
  },

  title: {
    fontSize: rfs(10),
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.6,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(4),
    backgroundColor: "rgba(91,158,109,0.10)",
    borderWidth: 1,
    borderColor: "rgba(91,158,109,0.25)",
    borderRadius: rs(8),
    paddingHorizontal: rs(9),
    paddingVertical: rvs(3),
  },

  badgeWarn: {
    backgroundColor: "rgba(245,166,35,0.10)",
    borderColor: "rgba(245,166,35,0.25)",
  },

  badgeDot: {
    width: rs(5),
    height: rs(5),
    borderRadius: rs(3),
    backgroundColor: "#5B9E6D",
  },

  badgeDotWarn: {
    backgroundColor: colors.accent,
  },

  badgeText: {
    fontSize: rfs(10),
    fontWeight: "700",
    color: "#5B9E6D",
  },

  badgeTextWarn: {
    color: colors.accent,
  },

  // ── Segmented bar ─────────────────────────────────────
  segBar: {
    flexDirection: "row",
    height: rvs(7),
    borderRadius: rs(99),
    overflow: "hidden",
    gap: rs(3),
    marginBottom: rvs(8),
  },

  seg: {
    height: "100%",
    borderRadius: rs(99),
  },

  segHealthy: { backgroundColor: "#5B9E6D" },
  segLow:     { backgroundColor: colors.accent },
  segOut:     { backgroundColor: "#E05252" },
  segEmpty:   { backgroundColor: colors.borderCard },

  // ── Labels ────────────────────────────────────────────
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  segLabel: {
    fontSize: rfs(10),
    fontWeight: "600",
    color: colors.textSecondary,
  },

  segNum: {
    fontWeight: "800",
    color: colors.textPrimary,
  },

});