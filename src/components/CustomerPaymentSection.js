import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { colors } from "../theme/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Payment config ───────────────────────────────────────────────────────────
const PAYMENT_OPTIONS = ["CASH", "UPI", "CARD"];

const PAY_CONFIG = {
  CASH: {
    icon:       "cash-outline",
    activeBg:   "rgba(91,158,109,0.10)",
    activeBorder: "#5B9E6D",
    activeText: "#5B9E6D",
  },
  UPI: {
    icon:       "phone-portrait-outline",
    activeBg:   "rgba(45,74,82,0.10)",
    activeBorder: colors.primary,
    activeText: colors.primary,
  },
  CARD: {
    icon:       "card-outline",
    activeBg:   "rgba(245,166,35,0.10)",
    activeBorder: colors.accent,
    activeText: "#c47c0a",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
const CustomerPaymentSection = ({
  customerName,
  setCustomerName,
  paymentType,
  setPaymentType,
}) => {
  return (
    <View style={styles.container}>

      {/* ── Customer card ── */}
      <View style={styles.card}>
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Icon name="person-outline" size={rfs(12)} color={colors.textSecondary} />
            <Text style={styles.label}>CUSTOMER</Text>
          </View>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Walk-in"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>
      </View>

      {/* ── Payment card ── */}
      <View style={[styles.card, styles.cardGap]}>
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Icon name="wallet-outline" size={rfs(12)} color={colors.textSecondary} />
            <Text style={styles.label}>PAYMENT TYPE</Text>
          </View>
          <View style={styles.payRow}>
            {PAYMENT_OPTIONS.map((p) => {
              const cfg      = PAY_CONFIG[p];
              const isActive = paymentType === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.chip,
                    isActive && {
                      backgroundColor: cfg.activeBg,
                      borderColor:     cfg.activeBorder,
                    },
                  ]}
                  onPress={() => setPaymentType(p)}
                  activeOpacity={0.75}
                >
                  <Icon
                    name={cfg.icon}
                    size={rfs(13)}
                    color={isActive ? cfg.activeText : colors.textSecondary}
                  />
                  <Text style={[
                    styles.chipText,
                    isActive && { color: cfg.activeText, fontWeight: "700" },
                  ]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

    </View>
  );
};

export default CustomerPaymentSection;

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

  cardGap: {
    marginTop: rvs(12),
  },

  section: {
    padding: rs(16),
  },

  // ── Label ─────────────────────────────────────────────
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
    marginBottom: rvs(8),
  },

  label: {
    fontSize: rfs(10),
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },

  // ── Input ─────────────────────────────────────────────
  inputWrap: {
    backgroundColor: colors.background,
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: colors.borderCard,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rs(14),
  },

  input: {
    flex: 1,
    paddingVertical: rvs(11),
    fontSize: rfs(14),
    fontWeight: "600",
    color: colors.textPrimary,
  },

  // ── Payment chips ─────────────────────────────────────
  payRow: {
    flexDirection: "row",
    gap: rs(8),
  },

  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(5),
    paddingVertical: rvs(9),
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: colors.borderCard,
    backgroundColor: colors.background,
  },

  chipText: {
    fontSize: rfs(12),
    fontWeight: "600",
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
});  