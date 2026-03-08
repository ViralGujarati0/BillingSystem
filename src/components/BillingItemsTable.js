import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/Ionicons";
import { colors } from "../theme/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Column widths — derived from rs() ───────────────────────────────────────
const COL_NO   = rs(24);
const COL_QTY  = rs(46);
const COL_MRP  = rs(58);
const COL_RATE = rs(58);
const COL_AMT  = rs(58);

// ─── Swipe delete action ──────────────────────────────────────────────────────
function DeleteAction({ onPress }) {
  return (
    <TouchableOpacity style={styles.deleteBtn} onPress={onPress} activeOpacity={0.8}>
      <Icon name="trash-outline" size={rfs(16)} color="#FFFFFF" />
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
const BillingItemsTable = ({
  cartItems,
  updateItemQty,
  updateManualItemField,
  removeItem,
}) => {
  return (
    <View style={styles.container}>

      {/* ── Card wrapper ── */}
      <View style={styles.card}>

        {/* ── Table header ── */}
        <View style={styles.tableHead}>
          <Text style={[styles.th, { width: COL_NO }]}>No</Text>
          <Text style={[styles.th, styles.thFlex]}>Product</Text>
          <Text style={[styles.th, { width: COL_QTY, textAlign: "center" }]}>Qty</Text>
          <Text style={[styles.th, { width: COL_MRP, textAlign: "center" }]}>MRP</Text>
          <Text style={[styles.th, { width: COL_RATE, textAlign: "center" }]}>Rate</Text>
          <Text style={[styles.th, { width: COL_AMT, textAlign: "right" }]}>Amt</Text>
        </View>

        {/* ── Rows ── */}
        {cartItems.map((item, index) => (
          <Swipeable
            key={index}
            renderRightActions={() => (
              <DeleteAction onPress={() => removeItem(index)} />
            )}
            overshootRight={false}
          >
            <View style={[
              styles.row,
              index < cartItems.length - 1 && styles.rowBorder,
            ]}>

              {/* Left stripe — green accent */}
              <View style={styles.stripe} />

              {/* # */}
              <Text style={[styles.td, styles.tdNo, { width: COL_NO }]}>
                {index + 1}
              </Text>

              {/* Product name */}
              <Text style={[styles.td, styles.tdName]} numberOfLines={1}>
                {item.name}
              </Text>

              {/* Qty input */}
              <TextInput
                style={[styles.cellInput, styles.qtyInput, { width: COL_QTY }]}
                value={String(item.qty)}
                keyboardType="number-pad"
                onChangeText={(v) => updateItemQty(index, v)}
                selectTextOnFocus
              />

              {/* MRP — editable box if MANUAL, plain text if not */}
              {item.type === "MANUAL" ? (
                <TextInput
                  style={[styles.cellInput, styles.mrpInput, { width: COL_MRP }]}
                  value={String(item.mrp)}
                  keyboardType="decimal-pad"
                  onChangeText={(v) => updateManualItemField(index, "mrp", v)}
                  selectTextOnFocus
                />
              ) : (
                <Text style={[styles.td, styles.tdMrp, { width: COL_MRP }]}>
                  {item.mrp ?? item.rate}
                </Text>
              )}

              {/* Rate — always shown as box */}
              {item.type === "MANUAL" ? (
                <TextInput
                  style={[styles.cellInput, styles.rateInput, { width: COL_RATE }]}
                  value={String(item.rate)}
                  keyboardType="decimal-pad"
                  onChangeText={(v) => updateManualItemField(index, "rate", v)}
                  selectTextOnFocus
                />
              ) : (
                <View style={[styles.rateBox, { width: COL_RATE }]}>
                  <Text style={styles.rateBoxText}>{item.rate}</Text>
                </View>
              )}

              {/* Amount */}
              <Text style={[styles.td, styles.tdAmt, { width: COL_AMT }]}>
                ₹{item.amount}
              </Text>

            </View>
          </Swipeable>
        ))}

      </View>
    </View>
  );
};

export default BillingItemsTable;

/* ───────── STYLES ───────── */

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

  // ── Table header ─────────────────────────────────────
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: rs(16),
    paddingVertical: rvs(10),
    backgroundColor: "rgba(45,74,82,0.04)",
    borderBottomWidth: 1,
    borderColor: colors.borderCard,
    gap: rs(4),
  },

  th: {
    fontSize: rfs(10),
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },

  thFlex: {
    flex: 1,
  },

  // ── Row ───────────────────────────────────────────────
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: rvs(11),
    paddingRight: rs(16),
    gap: rs(4),
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderColor: colors.borderCard,
  },

  // Left accent stripe per row — full height
  stripe: {
    width: rs(3),
    alignSelf: 'stretch',
    borderTopRightRadius: rs(2),
    borderBottomRightRadius: rs(2),
    backgroundColor: "#5B9E6D",
    marginRight: rs(10),
    flexShrink: 0,
  },

  // ── Cell text ─────────────────────────────────────────
  td: {
    fontSize: rfs(13),
    color: colors.textPrimary,
  },

  tdNo: {
    fontSize: rfs(11),
    color: colors.textSecondary,
    fontWeight: "600",
  },

  tdName: {
    flex: 1,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  tdMrp: {
    fontSize: rfs(12),
    color: colors.textSecondary,
    textAlign: "center",
    fontWeight: "500",
  },

  tdRate: {
    fontSize: rfs(12),
    color: colors.primary,
    textAlign: "center",
    fontWeight: "700",
  },

  tdAmt: {
    fontSize: rfs(13),
    fontWeight: "800",
    color: colors.primary,
    textAlign: "right",
  },

  // ── Cell inputs ───────────────────────────────────────
  cellInput: {
    borderRadius: rs(8),
    paddingVertical: rvs(5),
    textAlign: "center",
    fontSize: rfs(12),
    fontWeight: "700",
  },

  qtyInput: {
    backgroundColor: "rgba(45,74,82,0.06)",
    borderWidth: 1,
    borderColor: "rgba(45,74,82,0.14)",
    color: colors.textPrimary,
  },

  mrpInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderCard,
    color: colors.textSecondary,
  },

  rateBox: {
    borderRadius: rs(8),
    paddingVertical: rvs(5),
    backgroundColor: "rgba(45,74,82,0.06)",
    borderWidth: 1,
    borderColor: "rgba(45,74,82,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  rateBoxText: {
    fontSize: rfs(12),
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
  },

  rateInput: {
    backgroundColor: "rgba(45,74,82,0.06)",
    borderWidth: 1,
    borderColor: "rgba(45,74,82,0.14)",
    color: colors.primary,
  },

  // ── Swipe delete ──────────────────────────────────────
  deleteBtn: {
    width: rs(72),
    backgroundColor: "#DC3C3C",
    alignItems: "center",
    justifyContent: "center",
    gap: rvs(4),
    borderTopRightRadius: rs(16),
    borderBottomRightRadius: rs(16),
  },

  deleteText: {
    fontSize: rfs(10),
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});