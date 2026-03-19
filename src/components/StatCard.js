import React from 'react';
import {
  View, Text, ActivityIndicator, StyleSheet, Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';
import PeriodToggle from './PeriodToggle';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

/**
 * StatCard
 * Props:
 *   icon (string — Ionicons name, rendered by parent if needed)
 *   label, value, valueColor
 *   subLabel, subValue
 *   period, onChangePeriod, loading
 *   accentColor
 *   leftIcon (ReactNode) — optional icon to show in iconWrap
 */
const StatCard = ({
  leftIcon,
  label,
  value,
  valueColor,
  subLabel,
  subValue,
  period,
  onChangePeriod,
  loading,
  accentColor,
}) => {
  const accent = accentColor || colors.primary;

  return (
    <View style={[styles.card, { borderLeftColor: accent }]}>

      {/* Top row: icon + toggle */}
      <View style={styles.topRow}>
        {leftIcon ? (
          <View style={[styles.iconWrap, { backgroundColor: `${accent}14`, borderColor: `${accent}22` }]}>
            {leftIcon}
          </View>
        ) : null}
        {onChangePeriod ? (
          <PeriodToggle
            period={period}
            onChangePeriod={onChangePeriod}
            loading={loading}
          />
        ) : null}
      </View>

      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Value or loader */}
      {loading ? (
        <View style={styles.loaderRow}>
          <ActivityIndicator size="small" color={accent} />
          <View style={styles.skeleton} />
        </View>
      ) : (
        <Text style={[styles.value, valueColor && { color: valueColor }]}>
          {value ?? '—'}
        </Text>
      )}

      {/* Sub row */}
      {subLabel && subValue && !loading ? (
        <View style={styles.subRow}>
          <Text style={styles.subLabel}>{subLabel}</Text>
          <Text style={styles.subValue}>{subValue}</Text>
        </View>
      ) : null}

    </View>
  );
};

export default StatCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderLeftWidth: rs(3),
    padding: rs(14),
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
    gap: rvs(5),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: rvs(2),
  },
  iconWrap: {
    width: rs(34),
    height: rs(34),
    borderRadius: rs(9),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: rfs(10),
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  value: {
    fontSize: rfs(22),
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
    height: rvs(30),
  },
  skeleton: {
    height: rvs(20),
    width: rs(70),
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderRadius: rs(6),
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
    marginTop: rvs(1),
  },
  subLabel: {
    fontSize: rfs(9),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  subValue: {
    fontSize: rfs(9),
    fontWeight: '700',
    color: colors.textSecondary,
  },
});