import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const scale = SCREEN_W / 390;
const vs = SCREEN_H / 844;
const rs = (n) => Math.round(n * scale);
const rvs = (n) => Math.round(n * vs);
const rfs = (n) => Math.round(n * Math.min(scale, vs));

const SummaryCard = ({ label, value, count, topColor }) => {
  return (
    <View style={styles.card}>
      {/* ── Top header ── */}
      <View style={[styles.header, { backgroundColor: topColor }]}>
        <View style={styles.decoBig} />
        <View style={styles.decoSmall} />
        <Text style={styles.headerLabel}>{label}</Text>
      </View>

      {/* ── Middle: sales value ── */}
      <View style={styles.mid}>
        <Text style={styles.midLabel}>Total Sales</Text>
        <Text
          style={[styles.midValue, { color: topColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {value}
        </Text>
      </View>

      {/* ── Bottom header ── */}
      <View style={[styles.footer, { backgroundColor: topColor }]}>
        <View style={styles.footerDecoBig} />
        <View style={styles.footerDecoSmall} />
        <Text style={styles.footerValue}>{count} Bills</Text>
      </View>
    </View>
  );
};

export default SummaryCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  // ── Top header ─────────────────────────────────────────
  header: {
    paddingHorizontal: rs(11),
    paddingTop: rvs(8),
    paddingBottom: rvs(8),
    overflow: "hidden",
    borderTopLeftRadius: rs(15),
    borderTopRightRadius: rs(15),
  },

  headerLabel: {
    fontSize: rfs(13),
    fontWeight: "900",
    color: "rgba(255,255,255,0.97)",
    letterSpacing: 0.2,
  },

  decoBig: {
    position: "absolute",
    width: rs(50),
    height: rs(50),
    borderRadius: rs(25),
    backgroundColor: "rgba(255,255,255,0.07)",
    top: rvs(-14),
    right: rs(-12),
  },

  decoSmall: {
    position: "absolute",
    width: rs(24),
    height: rs(24),
    borderRadius: rs(12),
    backgroundColor: "rgba(255,255,255,0.07)",
    top: rvs(8),
    right: rs(8),
  },

  // ── Middle ─────────────────────────────────────────────
  mid: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: rs(11),
    paddingTop: rvs(6),
    paddingBottom: rvs(6),
  },

  midLabel: {
    fontSize: rfs(9),
    fontWeight: "700",
    color: "#999999",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: rvs(5),
  },

  midValue: {
    fontSize: rfs(18),
    fontWeight: "900",
    letterSpacing: -1,
  },

  // ── Bottom header ──────────────────────────────────────
  footer: {
    paddingHorizontal: rs(11),
    paddingTop: rvs(6),
    paddingBottom: rvs(6),
    overflow: "hidden",
    borderBottomLeftRadius: rs(15),
    borderBottomRightRadius: rs(15),
  },

  footerValue: {
    fontSize: rfs(13),
    fontWeight: "900",
    color: "rgba(255,255,255,0.97)",
    letterSpacing: -0.2,
  },

  footerDecoBig: {
    position: "absolute",
    width: rs(44),
    height: rs(44),
    borderRadius: rs(22),
    backgroundColor: "rgba(255,255,255,0.07)",
    bottom: rvs(-12),
    right: rs(-10),
  },

  footerDecoSmall: {
    position: "absolute",
    width: rs(22),
    height: rs(22),
    borderRadius: rs(11),
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: rvs(8),
    right: rs(8),
  },
});