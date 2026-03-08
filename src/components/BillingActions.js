import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Animated,
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

// ─── Component ────────────────────────────────────────────────────────────────
const BillingActions = ({ loading, onAddMore, onGenerate }) => {
  const scaleAdd = useRef(new Animated.Value(1)).current;
  const scaleGen = useRef(new Animated.Value(1)).current;

  const press   = (anim) => Animated.spring(anim, { toValue: 0.97, useNativeDriver: true, friction: 8, tension: 200 }).start();
  const release = (anim) => Animated.spring(anim, { toValue: 1,    useNativeDriver: true, friction: 8, tension: 200 }).start();

  return (
    <View style={styles.container}>

      {/* ── Add more items ── */}
      <Animated.View style={{ transform: [{ scale: scaleAdd }] }}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={onAddMore}
          onPressIn={() => press(scaleAdd)}
          onPressOut={() => release(scaleAdd)}
          activeOpacity={1}
        >
          <View style={styles.addIconWrap}>
            <Icon name="add" size={rfs(16)} color={colors.primary} />
          </View>
          <Text style={styles.addText}>Add more items</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Generate bill ── */}
      <Animated.View style={{ transform: [{ scale: scaleGen }] }}>
        <TouchableOpacity
          style={[styles.generateBtn, loading && styles.generateBtnDisabled]}
          onPress={onGenerate}
          onPressIn={() => !loading && press(scaleGen)}
          onPressOut={() => !loading && release(scaleGen)}
          disabled={loading}
          activeOpacity={1}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <View style={styles.genIconWrap}>
                <Icon name="receipt-outline" size={rfs(15)} color={colors.accent} />
              </View>
              <Text style={styles.generateText}>Generate Bill</Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
};

export default BillingActions;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(14),
    paddingBottom: rvs(32),
    gap: rvs(10),
  },

  // ── Add more items ────────────────────────────────────
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(8),
    backgroundColor: "#FFFFFF",
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    paddingVertical: rvs(15),
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(8),
    elevation: 2,
  },

  addIconWrap: {
    width: rs(24),
    height: rs(24),
    borderRadius: rs(8),
    backgroundColor: "rgba(45,74,82,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  addText: {
    fontSize: rfs(14),
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.2,
  },

  // ── Generate bill ─────────────────────────────────────
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(10),
    backgroundColor: colors.primary,
    borderRadius: rs(14),
    paddingVertical: rvs(16),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(5) },
    shadowOpacity: 0.35,
    shadowRadius: rs(12),
    elevation: 6,
  },

  generateBtnDisabled: {
    opacity: 0.6,
  },

  genIconWrap: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(8),
    backgroundColor: "rgba(245,166,35,0.20)",
    borderWidth: 1,
    borderColor: "rgba(245,166,35,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  generateText: {
    fontSize: rfs(15),
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});