import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, StatusBar, Platform, Dimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { colors } from "../theme/colors";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive scale helpers ─────────────────────────────────────────────────
// Base design is 390×844 (iPhone 14)
const scale     = SCREEN_W / 390;
const vs        = SCREEN_H / 844;
const rs        = (size) => Math.round(size * scale);   // horizontal scale
const rvs       = (size) => Math.round(size * vs);      // vertical scale
const rfs       = (size) => Math.round(size * Math.min(scale, vs)); // font scale

// ─── Subtitle pill ────────────────────────────────────────────────────────────
function AccentPill({ subtitle }) {
  return (
    <View style={styles.pill}>
      <View style={styles.pillDot} />
      <Text style={styles.pillText}>{subtitle}</Text>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AppHeaderLayout({
  title,
  subtitle,
  leftComponent,
  rightComponent,
  children,
}) {
  const fadeIn  = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>

      {/* ── Status Bar ── */}
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* ── Gradient Header ── */}
      <LinearGradient
        colors={["#1E3A42", "#2D4A52", "#354E58"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Subtle teal orb */}
        <View style={styles.orbBottomLeft} />

        {/* Mesh lines */}
        <View style={styles.meshOverlay} pointerEvents="none">
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.meshLine, { top: rvs(8) + i * rvs(18) }]} />
          ))}
        </View>

        {/* ── Header row ── */}
        <Animated.View
          style={[
            styles.headerRow,
            { opacity: fadeIn, transform: [{ translateY: slideUp }] },
          ]}
        >
          {leftComponent ? (
            <View style={styles.leftSlot}>{leftComponent}</View>
          ) : null}

          <View style={styles.titleBlock}>
            <View style={styles.accentBar} />
            <View style={styles.titleInner}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? <AccentPill subtitle={subtitle} /> : null}
            </View>
          </View>

          {rightComponent ? (
            <View style={styles.rightSlot}>{rightComponent}</View>
          ) : null}
        </Animated.View>

        {/* Bottom glow line */}
        <View style={styles.glowBorder} />
      </LinearGradient>

      {/* ── Body ── */}
      <View style={styles.body}>{children}</View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const HEADER_PADDING_BOTTOM = rvs(35);
const BODY_OVERLAP          = rvs(18);   // body pulls up over header by this amount

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingTop: Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? rvs(24)) + rvs(12)
      : rvs(20),
    paddingHorizontal: rs(20),
    paddingBottom: HEADER_PADDING_BOTTOM,
    overflow: "hidden",
    position: "relative",
  },

  orbBottomLeft: {
    position: "absolute",
    width: rs(80),
    height: rs(80),
    borderRadius: 999,
    bottom: -rvs(28),
    left: rs(8),
    backgroundColor: "#5BBCD4",
    opacity: 0.10,
  },

  meshOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  meshLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12),
  },

  leftSlot: {
    alignItems: "center",
    justifyContent: "center",
  },

  titleBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10),
  },

  accentBar: {
    width: rs(3),
    height: rvs(36),
    borderRadius: 2,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: rs(8),
  },

  titleInner: {
    flex: 1,
    gap: rvs(4),
  },

  title: {
    fontSize: rfs(20),
    fontWeight: "700",
    color: colors.textLight,
    letterSpacing: 0.3,
  },

  rightSlot: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12),
  },

  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: rs(5),
    backgroundColor: "rgba(245,166,35,0.14)",
    borderWidth: 1,
    borderColor: "rgba(245,166,35,0.30)",
    borderRadius: rs(20),
    paddingHorizontal: rs(10),
    paddingVertical: rvs(3),
  },
  pillDot: {
    width: rs(5),
    height: rs(5),
    borderRadius: rs(3),
    backgroundColor: colors.accent,
  },
  pillText: {
    fontSize: rfs(11),
    fontWeight: "500",
    color: "rgba(245,166,35,0.90)",
    letterSpacing: 0.4,
  },

  glowBorder: {
    position: "absolute",
    bottom: 0,
    left: rs(20),
    right: rs(20),
    height: 1.5,
    borderRadius: 2,
    backgroundColor: "rgba(245,166,35,0.22)",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: rs(6),
  },

  body: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: rs(24),
    borderTopRightRadius: rs(24),
    marginTop: -BODY_OVERLAP,
    paddingTop: BODY_OVERLAP,
    overflow: "hidden",
  },
});