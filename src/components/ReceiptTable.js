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

// ─── Column widths ────────────────────────────────────────────────────────────
const COL_NO   = rs(24);
const COL_QTY  = rs(30);
const COL_MRP  = rs(62);
const COL_RATE = rs(62);
const COL_AMT  = rs(64);
const STRIPE_W = rs(3);
const STRIPE_MR = rs(8);

// ─── Component ────────────────────────────────────────────────────────────────
const ReceiptTable = ({ items }) => {
  return (
    <View style={styles.table}>

      {/* ── Header ── */}
      <View style={styles.tableHead}>
        {/* Spacer for stripe offset */}
        <View style={{ width: STRIPE_W + STRIPE_MR + COL_NO }} />
        <Text style={[styles.th, styles.thFlex]}>Product</Text>
        <Text style={[styles.th, { width: COL_QTY, textAlign: "center" }]}>Qty</Text>
        <Text style={[styles.th, { width: COL_MRP,  textAlign: "center" }]}>MRP</Text>
        <Text style={[styles.th, { width: COL_RATE, textAlign: "center" }]}>Rate</Text>
        <Text style={[styles.th, { width: COL_AMT,  textAlign: "right"  }]}>Amt</Text>
      </View>

      {/* ── Rows ── */}
      {items.map((it, i) => (
        <View
          key={i}
          style={[
            styles.row,
            i < items.length - 1 && styles.rowBorder,
          ]}
        >
          {/* Green stripe */}
          <View style={styles.stripe} />

          {/* No */}
          <Text style={[styles.tdNo, { width: COL_NO }]}>{i + 1}</Text>

          {/* Name — wraps to next line instead of ellipsis */}
          <Text style={styles.tdName}>{it.name}</Text>

          {/* Qty */}
          <Text style={[styles.td, { width: COL_QTY, textAlign: "center" }]}>
            {it.qty}
          </Text>

          {/* MRP — plain text */}
          <Text style={[styles.tdMrp, { width: COL_MRP }]}>
            ₹{it.mrp}
          </Text>

          {/* Rate — teal box */}
          <View style={[styles.rateBox, { width: COL_RATE }]}>
            <Text style={styles.rateBoxText}>₹{it.rate}</Text>
          </View>

          {/* Amount */}
          <Text style={[styles.tdAmt, { width: COL_AMT }]}>
            ₹{it.amount}
          </Text>
        </View>
      ))}

    </View>
  );
};

export default ReceiptTable;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  table: {
    borderBottomWidth: 1,
    borderColor: colors.borderCard,
  },

  // ── Header ───────────────────────────────────────────
  tableHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 0,
    paddingRight: rs(16),
    paddingVertical: rvs(8),
    backgroundColor: "rgba(45,74,82,0.04)",
    borderBottomWidth: 1,
    borderColor: colors.borderCard,
    gap: rs(4),
  },

  th: {
    fontSize: rfs(9),
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
    alignItems: "flex-start",
    paddingVertical: rvs(11),
    paddingRight: rs(16),
    gap: rs(4),
    backgroundColor: "#FFFFFF",
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderColor: colors.borderCard,
  },

  stripe: {
    width: STRIPE_W,
    alignSelf: "stretch",
    borderTopRightRadius: rs(2),
    borderBottomRightRadius: rs(2),
    backgroundColor: "#5B9E6D",
    marginRight: STRIPE_MR,
    flexShrink: 0,
  },

  // ── Cells ─────────────────────────────────────────────
  tdNo: {
    fontSize: rfs(11),
    fontWeight: "600",
    color: colors.textSecondary,
    textAlign: "center",
  },

  tdName: {
    flex: 1,
    flexShrink: 1,
    fontSize: rfs(13),
    fontWeight: "700",
    color: colors.textPrimary,
  },

  td: {
    fontSize: rfs(12),
    fontWeight: "600",
    color: colors.textPrimary,
  },

  tdMrp: {
    fontSize: rfs(11),
    fontWeight: "500",
    color: colors.textSecondary,
    textAlign: "center",
  },

  rateBox: {
    borderRadius: rs(8),
    paddingVertical: rvs(4),
    backgroundColor: "rgba(45,74,82,0.06)",
    borderWidth: 1,
    borderColor: "rgba(45,74,82,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  rateBoxText: {
    fontSize: rfs(11),
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
  },

  tdAmt: {
    fontSize: rfs(13),
    fontWeight: "800",
    color: colors.primary,
    textAlign: "right",
  },
});