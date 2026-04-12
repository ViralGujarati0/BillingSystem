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
const ReceiptActions = ({ loading, onPdf, onBack }) => {
  const scalePdf  = useRef(new Animated.Value(1)).current;
  const scaleBack = useRef(new Animated.Value(1)).current;

  const press   = (anim) => Animated.spring(anim, { toValue: 0.97, useNativeDriver: true, friction: 8, tension: 200 }).start();
  const release = (anim) => Animated.spring(anim, { toValue: 1,    useNativeDriver: true, friction: 8, tension: 200 }).start();

  return (
    <View style={styles.container}>

      {/* ── Convert to PDF ── */}
      <Animated.View style={{ transform: [{ scale: scalePdf }] }}>
        <TouchableOpacity
          style={[styles.pdfBtn, loading && styles.pdfBtnDisabled]}
          onPress={onPdf}
          onPressIn={() => !loading && press(scalePdf)}
          onPressOut={() => !loading && release(scalePdf)}
          disabled={loading}
          activeOpacity={1}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <View style={styles.pdfIconWrap}>
                <Icon name="document-text-outline" size={rfs(15)} color={colors.accent} />
              </View>
              <Text style={styles.pdfText}>Convert to PDF</Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>

      {typeof onBack === "function" && (
        <Animated.View style={{ transform: [{ scale: scaleBack }] }}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={onBack}
            onPressIn={() => press(scaleBack)}
            onPressOut={() => release(scaleBack)}
            activeOpacity={1}
          >
            <View style={styles.backIconWrap}>
              <Icon name="home-outline" size={rfs(14)} color={colors.primary} />
            </View>
            <Text style={styles.backText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

    </View>
  );
};

export default ReceiptActions;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(14),
    paddingBottom: rvs(32),
    gap: rvs(10),
  },

  // ── PDF button ────────────────────────────────────────
  pdfBtn: {
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

  pdfBtnDisabled: {
    opacity: 0.6,
  },

  pdfIconWrap: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(8),
    backgroundColor: "rgba(245,166,35,0.20)",
    borderWidth: 1,
    borderColor: "rgba(245,166,35,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },

  pdfText: {
    fontSize: rfs(15),
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },

  // ── Back button ───────────────────────────────────────
  backBtn: {
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

  backIconWrap: {
    width: rs(24),
    height: rs(24),
    borderRadius: rs(8),
    backgroundColor: "rgba(45,74,82,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    fontSize: rfs(14),
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 0.2,
  },
});