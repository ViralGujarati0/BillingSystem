import React from 'react';
import {
  View, Text, StyleSheet, Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import PeriodToggle from './PeriodToggle';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

function calcChange(current, prev) {
  if (!prev || prev === 0) return null;
  return ((current - prev) / prev) * 100;
}

const fmt = (v, isCount = false) => {
  if (isCount) return String(Math.round(v || 0));
  const n = v || 0;
  return n >= 100000 ? `₹${(n / 100000).toFixed(1)}L`
    : n >= 1000  ? `₹${(n / 1000).toFixed(1)}K`
    : `₹${n.toFixed(0)}`;
};

/**
 * ComparisonItem — single metric row
 */
const ComparisonItem = ({ label, current, prev, isCount, accentColor }) => {
  const change = calcChange(current, prev);
  const isUp   = change !== null && change >= 0;
  const accent = accentColor || colors.primary;

  return (
    <View style={itemStyles.wrap}>
      <View style={[itemStyles.dot, { backgroundColor: accent }]} />
      <View style={itemStyles.info}>
        <Text style={itemStyles.label}>{label}</Text>
        <Text style={itemStyles.current}>{fmt(current, isCount)}</Text>
      </View>
      <View style={itemStyles.right}>
        {change !== null ? (
          <View style={[
            itemStyles.pill,
            { backgroundColor: isUp ? `${colors.success}14` : `${colors.danger}14` },
          ]}>
            <Icon
              name={isUp ? 'trending-up' : 'trending-down'}
              size={rfs(10)}
              color={isUp ? colors.success : colors.danger}
            />
            <Text style={[itemStyles.pct, { color: isUp ? colors.success : colors.danger }]}>
              {Math.abs(change).toFixed(1)}%
            </Text>
          </View>
        ) : (
          <Text style={itemStyles.noData}>—</Text>
        )}
        <Text style={itemStyles.prev}>
          prev: {fmt(prev, isCount)}
        </Text>
      </View>
    </View>
  );
};

const itemStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
  },
  dot: {
    width: rs(3),
    height: rvs(36),
    borderRadius: rs(2),
    flexShrink: 0,
  },
  info: { flex: 1, gap: rvs(2) },
  label: {
    fontSize: rfs(10),
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  current: {
    fontSize: rfs(18),
    fontWeight: '800',
    color: colors.textPrimary,
  },
  right: { alignItems: 'flex-end', gap: rvs(3) },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(3),
    borderRadius: rs(6),
    paddingHorizontal: rs(7),
    paddingVertical: rvs(3),
  },
  pct: {
    fontSize: rfs(11),
    fontWeight: '800',
  },
  noData: {
    fontSize: rfs(13),
    color: colors.textSecondary,
    fontWeight: '600',
  },
  prev: {
    fontSize: rfs(9),
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

/**
 * ComparisonCard
 * Props: activeStats, prevStats, period, onChangePeriod
 */
const ComparisonCard = ({ activeStats, prevStats, period, onChangePeriod }) => (
  <View style={styles.card}>

    {/* Header */}
    <View style={styles.header}>
      <Text style={styles.title}>vs Last Period</Text>
      <PeriodToggle period={period} onChangePeriod={onChangePeriod} />
    </View>

    {period === 'today' ? (
      <View style={styles.naWrap}>
        <Text style={styles.naText}>Switch to 7D or 30D to compare periods</Text>
      </View>
    ) : (
      <View style={styles.list}>
        <ComparisonItem
          label="Revenue"
          current={activeStats?.totalSales}
          prev={prevStats?.totalSales}
          accentColor={colors.primary}
        />
        <View style={styles.divider} />
        <ComparisonItem
          label="Profit"
          current={activeStats?.totalProfit}
          prev={prevStats?.totalProfit}
          accentColor={colors.success}
        />
        <View style={styles.divider} />
        <ComparisonItem
          label="Bills"
          current={activeStats?.totalBills}
          prev={prevStats?.totalBills}
          isCount
          accentColor={colors.accent}
        />
      </View>
    )}

  </View>
);

export default ComparisonCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    padding: rs(16),
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
    gap: rvs(14),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: rfs(14),
    fontWeight: '800',
    color: colors.textPrimary,
  },
  list: { gap: 0 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginVertical: rvs(10),
  },
  naWrap: {
    paddingVertical: rvs(14),
    alignItems: 'center',
  },
  naText: {
    fontSize: rfs(12),
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});