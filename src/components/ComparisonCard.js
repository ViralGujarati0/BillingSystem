import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Single metric row ────────────────────────────────────────────────────────
const ComparisonItem = ({ label, current, prev, isCount, accentColor, maxValue }) => {
  const change  = calcChange(current, prev);
  const isUp    = change !== null && change >= 0;
  const accent  = accentColor || colors.primary;
  const barPct  = maxValue > 0 ? Math.min(((current || 0) / maxValue) * 100, 100) : 0;

  return (
    <View style={itemStyles.wrap}>

      {/* Left accent bar */}
      <View style={[itemStyles.accentBar, { backgroundColor: accent }]} />

      {/* Label + value + bar */}
      <View style={itemStyles.body}>
        <View style={itemStyles.topRow}>
          <Text style={itemStyles.label}>{label.toUpperCase()}</Text>
          {change !== null ? (
            <View style={[
              itemStyles.changePill,
              { backgroundColor: isUp ? 'rgba(91,158,109,0.10)' : 'rgba(224,82,82,0.10)' },
            ]}>
              <Icon
                name={isUp ? 'trending-up-outline' : 'trending-down-outline'}
                size={rfs(10)}
                color={isUp ? colors.success : '#E05252'}
              />
              <Text style={[
                itemStyles.changePct,
                { color: isUp ? colors.success : '#E05252' },
              ]}>
                {Math.abs(change).toFixed(1)}%
              </Text>
            </View>
          ) : (
            <Text style={itemStyles.noData}>—</Text>
          )}
        </View>

        {/* Progress bar */}
        <View style={itemStyles.barTrack}>
          <View
            style={[
              itemStyles.bar,
              {
                width: `${Math.max(barPct, current > 0 ? 2 : 0)}%`,
                backgroundColor: accent,
              },
            ]}
          />
        </View>

        <View style={itemStyles.bottomRow}>
          <Text style={[itemStyles.currentValue, { color: accent }]}>
            {fmt(current, isCount)}
          </Text>
          <Text style={itemStyles.prevValue}>
            prev {fmt(prev, isCount)}
          </Text>
        </View>
      </View>

    </View>
  );
};

const itemStyles = StyleSheet.create({

  wrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: rs(10),
  },

  accentBar: {
    width: rs(3),
    borderRadius: rs(2),
    flexShrink: 0,
    minHeight: rvs(54),
  },

  body: {
    flex: 1,
    gap: rvs(5),
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  label: {
    fontSize: rfs(9),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.6,
  },

  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(3),
    borderRadius: rs(6),
    paddingHorizontal: rs(7),
    paddingVertical: rvs(2),
  },

  changePct: {
    fontSize: rfs(10),
    fontWeight: '800',
  },

  noData: {
    fontSize: rfs(12),
    color: colors.textSecondary,
    fontWeight: '600',
  },

  barTrack: {
    height: rvs(5),
    backgroundColor: 'rgba(45,74,82,0.08)',
    borderRadius: rs(3),
    overflow: 'hidden',
  },

  bar: {
    height: '100%',
    borderRadius: rs(3),
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },

  currentValue: {
    fontSize: rfs(17),
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  prevValue: {
    fontSize: rfs(10),
    color: colors.textSecondary,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },

});

// ─── Main component ───────────────────────────────────────────────────────────
const ComparisonCard = ({ activeStats, prevStats, period, onChangePeriod, loading }) => {

  const maxValue = Math.max(
    activeStats?.totalSales  || 0,
    activeStats?.totalProfit || 0,
    (activeStats?.totalBills || 0) * 1000,
    1,
  );

  return (
    <View style={styles.card}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>vs Last Period</Text>
        <PeriodToggle period={period} onChangePeriod={onChangePeriod} />
      </View>

      {/* ── Content ── */}
      {period === 'today' ? (
        <View style={styles.naWrap}>
          <Icon name="information-circle-outline" size={rfs(20)} color={colors.textSecondary} />
          <Text style={styles.naText}>Switch to 7D or 30D to compare periods</Text>
        </View>
      ) : loading ? (
        <View style={styles.skeletonWrap}>
          {[1, 2, 3].map((i) => <View key={i} style={styles.skeleton} />)}
        </View>
      ) : (
        <View style={styles.list}>

          <ComparisonItem
            label="Revenue"
            current={activeStats?.totalSales}
            prev={prevStats?.totalSales}
            accentColor={colors.primary}
            maxValue={maxValue}
          />

          <View style={styles.divider} />

          <ComparisonItem
            label="Profit"
            current={activeStats?.totalProfit}
            prev={prevStats?.totalProfit}
            accentColor={colors.success}
            maxValue={maxValue}
          />

          <View style={styles.divider} />

          <ComparisonItem
            label="Bills"
            current={activeStats?.totalBills}
            prev={prevStats?.totalBills}
            isCount
            accentColor={colors.accent}
            maxValue={activeStats?.totalBills || 1}
          />

        </View>
      )}

    </View>
  );
};

export default ComparisonCard;

const styles = StyleSheet.create({

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    overflow: 'hidden',
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
    paddingHorizontal: rs(14),
    paddingTop: rvs(0),
    paddingBottom: rvs(14),
    gap: rvs(14),
  },

  // ── Header ────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    marginHorizontal: rs(-14),
    paddingHorizontal: rs(16),
    paddingVertical: rvs(4),
  },

  title: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: colors.textLight,
    letterSpacing: 0.3,
  },

  // ── List ──────────────────────────────────────────────
  list: {
    gap: rvs(0),
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginVertical: rvs(12),
  },

  // ── N/A state ─────────────────────────────────────────
  naWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(7),
    paddingVertical: rvs(16),
  },

  naText: {
    fontSize: rfs(12),
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },

  // ── Skeleton ──────────────────────────────────────────
  skeletonWrap: {
    gap: rvs(14),
  },

  skeleton: {
    height: rvs(54),
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderRadius: rs(8),
  },

});