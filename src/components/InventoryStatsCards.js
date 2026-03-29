import React from "react";
import {
  View,
  Text,
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

// ─── Card config ─────────────────────────────────────────────────────────────
const CARD_CONFIG = [
  {
    key:        "products",
    subLabel:   "Total",
    labelKey:   "inventory.statsProducts",
    icon:       "cube-outline",
    headerBg:   "#2D4A52",
    getValue:   (inv) => inv.length,
    format:     (v)   => String(v),
    unit:       "items",
    valueColor: () => colors.textPrimary,
  },
  {
    key:        "lowstock",
    subLabel:   "Alert",
    labelKey:   "inventory.statsLowStock",
    icon:       "warning-outline",
    headerBg:   "#C8860A",
    getValue:   (inv) => inv.filter((i) => (i.stock || 0) <= 10).length,
    format:     (v)   => String(v),
    unit:       "items",
    valueColor: (v)   => v > 0 ? "#C8860A" : colors.textPrimary,
  },
  {
    key:        "value",
    subLabel:   "Total",
    labelKey:   "inventory.statsValue",
    icon:       "cash-outline",
    headerBg:   "#3E8A57",
    getValue:   (inv) => inv.reduce((sum, item) => sum + (item.stock || 0) * (item.purchasePrice || 0), 0),
    format:     (v)   => `₹${v.toFixed(0)}`,
    unit:       "stock value",
    valueColor: () => "#3E8A57",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const InventoryStatsCards = ({ inventory }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {CARD_CONFIG.map((cfg) => {
        const val = cfg.getValue(inventory);
        return (
          <View key={cfg.key} style={styles.card}>

            {/* ── Colored header ── */}
            <View style={[styles.header, { backgroundColor: cfg.headerBg }]}>
              <Text style={styles.subLabel}>{cfg.subLabel}</Text>
              <Text style={styles.headerLabel}>{t(cfg.labelKey)}</Text>

              {/* Decorative circles */}
              <View style={styles.decoBigCircle} />
              <View style={styles.decoSmallCircle} />
            </View>

            {/* ── Floating icon (overlaps header bottom edge) ── */}
            <View style={[styles.floatingIcon, { backgroundColor: cfg.headerBg }]}>
              <Ionicons name={cfg.icon} size={rfs(13)} color="rgba(255,255,255,0.95)" />
            </View>

            {/* ── Count + unit ── */}
            <View style={styles.body}>
              <Text
                style={[styles.value, { color: cfg.valueColor(val) }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {cfg.format(val)}
              </Text>
              <Text style={styles.unit}>{cfg.unit}</Text>
            </View>

          </View>
        );
      })}
    </View>
  );
};

export default InventoryStatsCards;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: {
    flexDirection: "row",
    paddingHorizontal: rs(16),
    gap: rs(10),
    marginTop: rvs(10),
    marginBottom: rvs(4),
  },

  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 2,
    overflow: "hidden",
  },

  // ── Colored header ─────────────────────────────────────
  header: {
    paddingHorizontal: rs(12),
    paddingTop: rvs(11),
    paddingBottom: rvs(18),
    overflow: "hidden",
  },

  subLabel: {
    fontSize: rfs(9),
    fontWeight: "800",
    color: "rgba(255,255,255,0.60)",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: rvs(2),
  },

  headerLabel: {
    fontSize: rfs(10),
    fontWeight: "800",
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  // Decorative circles (top-right corner)
  decoBigCircle: {
    position: "absolute",
    top: rvs(-10),
    right: rs(-10),
    width: rs(44),
    height: rs(44),
    borderRadius: rs(22),
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  decoSmallCircle: {
    position: "absolute",
    top: rvs(4),
    right: rs(4),
    width: rs(22),
    height: rs(22),
    borderRadius: rs(11),
    backgroundColor: "rgba(255,255,255,0.07)",
  },

  // ── Floating icon ──────────────────────────────────────
  floatingIcon: {
    marginTop: rvs(-14),
    marginLeft: rs(12),
    width: rs(28),
    height: rs(28),
    borderRadius: rs(8),
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },

  // ── Body ───────────────────────────────────────────────
  body: {
    paddingHorizontal: rs(12),
    paddingTop: rvs(6),
    paddingBottom: rvs(14),
  },

  value: {
    fontSize: rfs(24),
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: rfs(28),
  },

  unit: {
    fontSize: rfs(10),
    fontWeight: "500",
    color: colors.textSecondary,
    marginTop: rvs(3),
  },

});