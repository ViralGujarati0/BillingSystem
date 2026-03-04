import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);

// ─── Layout ───────────────────────────────────────────────────────────────────
const FRAME_W      = SCREEN_W - rs(36);   // 18px padding each side
const FRAME_H      = rvs(260);            // responsive height
const CORNER_SIZE  = rs(22);              // corner bracket arm length
const CORNER_W     = rs(3);              // corner bracket thickness
const BORDER_R     = rs(20);             // frame border radius

// ─── Corner Bracket ───────────────────────────────────────────────────────────
function Corner({ position }) {
  const isTop    = position.includes('top');
  const isLeft   = position.includes('left');

  return (
    <View style={[styles.corner, styles[position]]}>
      {/* Vertical arm */}
      <View style={[
        styles.cornerArm,
        styles.cornerV,
        isTop  ? { top: 0 }    : { bottom: 0 },
        isLeft ? { left: 0 }   : { right: 0 },
      ]} />
      {/* Horizontal arm */}
      <View style={[
        styles.cornerArm,
        styles.cornerH,
        isTop  ? { top: 0 }    : { bottom: 0 },
        isLeft ? { left: 0 }   : { right: 0 },
      ]} />
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
const ScannerFrame = ({ device, codeScanner, isActive }) => {
  const scanAnim   = useRef(new Animated.Value(0)).current;
  const frameHeight = useRef(FRAME_H);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const scanLineY = scanAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, frameHeight.current - rs(4)],
  });

  return (
    <View style={styles.wrapper}>
      <View
        style={styles.frame}
        onLayout={(e) => { frameHeight.current = e.nativeEvent.layout.height; }}
      >

        {/* ── Camera — logic unchanged ── */}
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive ?? true}
          codeScanner={codeScanner}
        />

        {/* ── Outer amber border ── */}
        <View style={styles.overlayBorder} />

        {/* ── Outer glow ring ── */}
        <View style={styles.glowRing} />

        {/* ── Corner brackets ── */}
        <Corner position="topLeft"     />
        <Corner position="topRight"    />
        <Corner position="bottomLeft"  />
        <Corner position="bottomRight" />

        {/* ── Animated scan line ── */}
        <Animated.View
          style={[
            styles.scanLine,
            { transform: [{ translateY: scanLineY }] },
          ]}
        />

      </View>
    </View>
  );
};

export default ScannerFrame;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  wrapper: {
    flex: 1,
    alignItems: 'center',
    marginBottom: rvs(12),
  },

  frame: {
    width: FRAME_W,
    flex: 1,
    borderRadius: BORDER_R,
    overflow: 'hidden',
    backgroundColor: '#000',
  },

  // Amber border
  overlayBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: rs(2),
    borderColor: colors.accent,
    borderRadius: BORDER_R,
  },

  // Soft glow outside the border
  glowRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BORDER_R,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: rs(12),
    elevation: 0,
  },

  // ── Corner brackets ───────────────────────────────────
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
  },
  topLeft:     { top: rs(10),    left: rs(10)    },
  topRight:    { top: rs(10),    right: rs(10)   },
  bottomLeft:  { bottom: rs(10), left: rs(10)    },
  bottomRight: { bottom: rs(10), right: rs(10)   },

  cornerArm: {
    position: 'absolute',
    backgroundColor: colors.accent,
    borderRadius: rs(2),
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: rs(4),
    elevation: 0,
  },
  cornerV: {
    width: CORNER_W,
    height: CORNER_SIZE,
  },
  cornerH: {
    width: CORNER_SIZE,
    height: CORNER_W,
  },

  // ── Scan line ─────────────────────────────────────────
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: rs(2),
    borderRadius: rs(1),
    backgroundColor: 'rgba(245,166,35,0.85)',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: rs(8),
    elevation: 0,
  },
});