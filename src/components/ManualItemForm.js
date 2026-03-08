import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import FormInputField   from "./FormInputField";
import CategoryDropdown from "./CategoryDropdown";
import UnitDropdown     from "./UnitDropdown";
import { colors }       from "../theme/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * scale);

// ─── Small label above each field ────────────────────────────────────────────
const FieldLabel = ({ icon, text }) => (
  <View style={styles.labelRow}>
    <Icon name={icon} size={rfs(10)} color={colors.textSecondary} />
    <Text style={styles.labelText}>{text}</Text>
  </View>
);

// ─── Card wrapper ─────────────────────────────────────────────────────────────
const FieldCard = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

// ─── Component ────────────────────────────────────────────────────────────────
const ManualItemForm = ({
  name,
  category,
  unit,
  qty,
  mrp,
  rate,
  amount,
  onChangeName,
  onChangeCategory,
  onChangeUnit,
  onChangeQty,
  onChangeMrp,
  onChangeRate,
}) => {
  return (
    <View style={styles.container}>

      {/* ── Item Name ── */}
      <FieldCard>
        <View style={styles.fieldPad}>
          <FieldLabel icon="pencil-outline" text="ITEM NAME" />
          <FormInputField
            value={name}
            onChangeText={onChangeName}
            placeholder="e.g. Gold Ring"
          />
        </View>
      </FieldCard>

      {/* ── Category + Unit side by side ── */}
      <FieldCard style={styles.rowCard}>
        <View style={styles.halfLeft}>
          <FieldLabel icon="grid-outline" text="CATEGORY" />
          <CategoryDropdown value={category} onChange={onChangeCategory} />
        </View>
        <View style={styles.colDivider} />
        <View style={styles.halfRight}>
          <FieldLabel icon="cube-outline" text="UNIT" />
          <UnitDropdown value={unit} onChange={onChangeUnit} />
        </View>
      </FieldCard>

      {/* ── Qty + MRP + Rate ── */}
      <FieldCard>
        {/* Quantity full row */}
        <View style={styles.fieldPad}>
          <FieldLabel icon="layers-outline" text="QUANTITY" />
          <FormInputField
            value={qty}
            keyboardType="number-pad"
            onChangeText={onChangeQty}
          />
        </View>

        <View style={styles.rowDivider} />

        {/* MRP + Rate side by side */}
        <View style={styles.rowInner}>
          <View style={styles.halfLeft}>
            <FieldLabel icon="pricetag-outline" text="MRP" />
            <FormInputField
              value={mrp}
              keyboardType="decimal-pad"
              onChangeText={onChangeMrp}
              placeholder="0.00"
            />
          </View>
          <View style={styles.colDivider} />
          <View style={styles.halfRight}>
            <FieldLabel icon="cash-outline" text="RATE" />
            <FormInputField
              value={rate}
              keyboardType="decimal-pad"
              onChangeText={onChangeRate}
              placeholder="0.00"
            />
          </View>
        </View>
      </FieldCard>

      {/* ── Amount display ── */}
      <View style={styles.amountCard}>
        <View style={styles.amountLeft}>
          <Text style={styles.amountLabel}>AMOUNT</Text>
          <View style={styles.amountMeta}>
            <View style={styles.amountDot} />
            <Text style={styles.amountMetaText}>qty × rate</Text>
          </View>
        </View>
        <View style={styles.amountRight}>
          <Text style={styles.amountCurrency}>₹</Text>
          <Text style={styles.amountValue}>
            {Number(amount || 0).toFixed(2)}
          </Text>
        </View>
      </View>

    </View>
  );
};

export default ManualItemForm;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: {
    gap: rvs(12),
  },

  // ── Card ──────────────────────────────────────────────
  card: {
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

  // ── Padding wrapper ───────────────────────────────────
  fieldPad: {
    padding: rs(16),
    paddingBottom: rvs(14),
  },

  // ── Horizontal row card ───────────────────────────────
  rowCard: {
    flexDirection: "row",
  },

  rowInner: {
    flexDirection: "row",
  },

  halfLeft: {
    flex: 1,
    padding: rs(16),
    paddingBottom: rvs(14),
  },

  halfRight: {
    flex: 1,
    padding: rs(16),
    paddingBottom: rvs(14),
  },

  colDivider: {
    width: 1,
    backgroundColor: colors.borderCard,
  },

  rowDivider: {
    height: 1,
    backgroundColor: colors.borderCard,
  },

  // ── Field label ───────────────────────────────────────
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
    marginBottom: rvs(8),
  },

  labelText: {
    fontSize: rfs(11),
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.7,
  },

  // ── Amount card ───────────────────────────────────────
  amountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 2,
    paddingHorizontal: rs(18),
    paddingVertical: rvs(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  amountLeft: {
    gap: rvs(5),
  },

  amountLabel: {
    fontSize: rfs(11),
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.7,
  },

  amountMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
  },

  amountDot: {
    width: rs(5),
    height: rs(5),
    borderRadius: rs(3),
    backgroundColor: colors.accent,
  },

  amountMetaText: {
    fontSize: rfs(13),
    fontWeight: "600",
    color: colors.textSecondary,
  },

  amountRight: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: rs(1),
  },

  amountCurrency: {
    fontSize: rfs(15),
    fontWeight: "700",
    color: colors.primary,
    marginTop: rvs(4),
  },

  amountValue: {
    fontSize: rfs(26),
    fontWeight: "900",
    color: colors.primary,
    letterSpacing: -0.5,
    lineHeight: rfs(30),
  },
});