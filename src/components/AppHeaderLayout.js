import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, StatusBar, Platform, useWindowDimensions } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { colors } from "../theme/colors";

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

      {/* ── Status Bar — matches header gradient start color ── */}
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* ── Gradient Header ───────────────────────────── */}
      <LinearGradient
        colors={["#1E3A42", "#2D4A52", "#354E58"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Subtle teal orb — bottom left only */}
        <View style={styles.orbBottomLeft} />

        {/* Mesh lines */}
        <View style={styles.meshOverlay} pointerEvents="none">
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.meshLine, { top: 8 + i * 18 }]} />
          ))}
        </View>

        {/* ── Single row: left · title · right ── */}
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

      {/* ── Body — sits flush under header ────────────── */}
      <View style={styles.body}>{children}</View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Header: paddingTop accounts for translucent status bar ──
  header: {
    paddingTop: Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? 24) + 12
      : 20,
    paddingHorizontal: 20,
    paddingBottom: 35,
    overflow: "hidden",
    position: "relative",
  },

  // Teal orb
  orbBottomLeft: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 999,
    bottom: -28,
    left: 8,
    backgroundColor: "#5BBCD4",
    opacity: 0.10,
  },

  // Mesh overlay
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

  // ── Single header row ──
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  leftSlot: {
    alignItems: "center",
    justifyContent: "center",
  },

  titleBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  accentBar: {
    width: 3,
    height: 36,
    borderRadius: 2,
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },

  titleInner: {
    flex: 1,
    gap: 4,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textLight,
    letterSpacing: 0.3,
  },

  rightSlot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  // Subtitle pill
  pill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(245,166,35,0.14)",
    borderWidth: 1,
    borderColor: "rgba(245,166,35,0.30)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pillDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(245,166,35,0.90)",
    letterSpacing: 0.4,
  },

  // Bottom glow border
  glowBorder: {
    position: "absolute",
    bottom: 0,
    left: 20,
    right: 20,
    height: 1.5,
    borderRadius: 2,
    backgroundColor: "rgba(245,166,35,0.22)",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
  },

  // ── Body: NO marginTop, rounded top corners only ──
  body: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -18,
    paddingTop: 18,
    overflow: "hidden",
  },
});