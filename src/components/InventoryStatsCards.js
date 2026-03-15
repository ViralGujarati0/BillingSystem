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
    key:       "products",
    labelKey:  "inventory.statsProducts",
    icon:      "cube-outline",
    iconBg:    "rgba(45,74,82,0.08)",
    iconColor: colors.primary,
    topBar:    colors.primary,
    getValue:  (inv) => inv.length,
    format:    (v)   => String(v),
    valueColor: (v)  => colors.textPrimary,
  },
  {
    key:       "lowstock",
    labelKey:  "inventory.statsLowStock",
    icon:      "warning-outline",
    iconBg:    "rgba(245,166,35,0.10)",
    iconColor: colors.accent,
    topBar:    colors.accent,
    getValue:  (inv) => inv.filter((i) => (i.stock || 0) <= 10).length,
    format:    (v)   => String(v),
    valueColor: (v)  => v > 0 ? colors.accent : colors.textPrimary,
  },
  {
    key:       "value",
    labelKey:  "inventory.statsValue",
    icon:      "cash-outline",
    iconBg:    "rgba(91,158,109,0.10)",
    iconColor: "#5B9E6D",
    topBar:    "#5B9E6D",
    getValue:  (inv) => inv.reduce((sum, item) => sum + (item.stock || 0) * (item.purchasePrice || 0), 0),
    format:    (v)   => `₹${v.toFixed(0)}`,
    valueColor: (v)  => "#5B9E6D",
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

            {/* Colored top border bar */}
            <View style={[styles.topBar, { backgroundColor: cfg.topBar }]} />

            {/* Icon box */}
            <View style={[styles.iconWrap, { backgroundColor: cfg.iconBg }]}>
              <Ionicons name={cfg.icon} size={rfs(15)} color={cfg.iconColor} />
            </View>

            {/* Label */}
            <Text style={styles.label}>{t(cfg.labelKey)}</Text>

            {/* Value */}
            <Text
              style={[styles.value, { color: cfg.valueColor(val) }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {cfg.format(val)}
            </Text>

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
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 2,
    overflow: "hidden",
    paddingHorizontal: rs(12),
    paddingBottom: rvs(12),
  },

  // Colored top accent bar
  topBar: {
    height: rvs(3),
    borderRadius: rs(14),
    marginBottom: rvs(10),
  },

  iconWrap: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(8),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: rvs(6),
  },

  label: {
    fontSize: rfs(10),
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: rvs(3),
  },

  value: {
    fontSize: rfs(18),
    fontWeight: "900",
    letterSpacing: -0.5,
  },

});