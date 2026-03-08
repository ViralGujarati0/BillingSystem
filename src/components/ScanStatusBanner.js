import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Variant config — mapped to app theme ────────────────────────────────────
const VARIANTS = {
  success: {
    bg:          'rgba(91,158,109,0.08)',
    borderColor: 'rgba(91,158,109,0.30)',
    stripeColor: '#5B9E6D',
    iconBg:      'rgba(91,158,109,0.12)',
    iconColor:   '#5B9E6D',
    textColor:   '#3a7a50',
    icon:        'checkmark-circle-outline',
  },
  warning: {
    bg:          'rgba(245,166,35,0.08)',
    borderColor: 'rgba(245,166,35,0.28)',
    stripeColor: colors.accent,
    iconBg:      'rgba(245,166,35,0.12)',
    iconColor:   colors.accent,
    textColor:   '#c47c0a',
    icon:        'warning-outline',
  },
  info: {
    bg:          'rgba(45,74,82,0.06)',
    borderColor: colors.borderCard,
    stripeColor: colors.primary,
    iconBg:      'rgba(45,74,82,0.08)',
    iconColor:   colors.primary,
    textColor:   colors.textPrimary,
    icon:        'information-circle-outline',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ScanStatusBanner({ type = 'info', message }) {
  const v = VARIANTS[type] ?? VARIANTS.info;

  return (
    <View style={[styles.banner, {
      backgroundColor: v.bg,
      borderColor:     v.borderColor,
    }]}>

      {/* Left accent stripe */}
      <View style={[styles.stripe, { backgroundColor: v.stripeColor }]} />

      {/* Icon box */}
      <View style={[styles.iconWrap, { backgroundColor: v.iconBg }]}>
        <Icon name={v.icon} size={rfs(16)} color={v.iconColor} />
      </View>

      {/* Message */}
      <Text style={[styles.text, { color: v.textColor }]} numberOfLines={3}>
        {message}
      </Text>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
    borderWidth: 1,
    borderRadius: rs(14),
    paddingVertical: rvs(12),
    paddingRight: rs(14),
    overflow: 'hidden',
  },

  // Left accent stripe
  stripe: {
    width: rs(3),
    alignSelf: 'stretch',
    borderRadius: rs(2),
    flexShrink: 0,
  },

  // Icon box
  iconWrap: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(9),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Message text
  text: {
    flex: 1,
    fontSize: rfs(13),
    fontWeight: '600',
    lineHeight: rfs(18),
  },

});