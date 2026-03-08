import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { colors } from "../theme/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const STATUS_H = Platform.OS === "android"
  ? (StatusBar.currentHeight ?? rvs(24))
  : rvs(44);

const HEADER_PT = STATUS_H + rvs(12);

// ─── Component ────────────────────────────────────────────────────────────────
const BillingHeader = ({ navigation, shop }) => {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(rvs(8))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0, duration: 400, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <LinearGradient
        colors={["#2D4A52", "#1E3A42"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Decorative orbs */}
        <View style={styles.orbTopRight} />
        <View style={styles.orbBottomLeft} />

        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Icon name="chevron-back" size={rfs(15)} color="rgba(255,255,255,0.80)" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Shop info + DRAFT badge */}
        <Animated.View
          style={[
            styles.infoRow,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Accent bar */}
          <View style={styles.accentBar} />

          <View style={styles.infoText}>
            <Text style={styles.shopName} numberOfLines={1}>
              {shop?.businessName || "—"}
            </Text>
            {!!(shop?.address || shop?.phone) && (
              <Text style={styles.shopSub} numberOfLines={1}>
                {shop?.address || shop?.phone}
              </Text>
            )}
          </View>

          {/* Draft badge */}
          <View style={styles.draftBadge}>
            <View style={styles.draftDot} />
            <Text style={styles.draftText}>DRAFT</Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </>
  );
};

export default BillingHeader;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  header: {
    paddingTop: HEADER_PT,
    paddingHorizontal: rs(20),
    paddingBottom: rvs(22),
    position: "relative",
    overflow: "hidden",
  },

  // ── Decorative orbs ──────────────────────────────────
  orbTopRight: {
    position: "absolute",
    top: -rs(40),
    right: -rs(40),
    width: rs(160),
    height: rs(160),
    borderRadius: rs(80),
    backgroundColor: "rgba(245,166,35,0.08)",
  },

  orbBottomLeft: {
    position: "absolute",
    bottom: -rvs(20),
    left: -rs(20),
    width: rs(100),
    height: rs(100),
    borderRadius: rs(50),
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  // ── Back button ───────────────────────────────────────
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(4),
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: rs(20),
    paddingVertical: rvs(5),
    paddingHorizontal: rs(12),
    marginBottom: rvs(16),
  },

  backText: {
    fontSize: rfs(13),
    fontWeight: "600",
    color: "rgba(255,255,255,0.80)",
    letterSpacing: 0.2,
  },

  // ── Info row ──────────────────────────────────────────
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10),
  },

  accentBar: {
    width: rs(3),
    height: rvs(36),
    borderRadius: rs(2),
    backgroundColor: colors.accent,
    flexShrink: 0,
  },

  infoText: {
    flex: 1,
    gap: rvs(3),
  },

  shopName: {
    fontSize: rfs(20),
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  shopSub: {
    fontSize: rfs(12),
    fontWeight: "500",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.1,
  },

  // ── Draft badge ───────────────────────────────────────
  draftBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
    backgroundColor: "rgba(245,166,35,0.15)",
    borderWidth: 1,
    borderColor: "rgba(245,166,35,0.30)",
    borderRadius: rs(20),
    paddingVertical: rvs(5),
    paddingHorizontal: rs(10),
    flexShrink: 0,
  },

  draftDot: {
    width: rs(6),
    height: rs(6),
    borderRadius: rs(3),
    backgroundColor: colors.accent,
  },

  draftText: {
    fontSize: rfs(10),
    fontWeight: "700",
    color: colors.accent,
    letterSpacing: 0.5,
  },
});