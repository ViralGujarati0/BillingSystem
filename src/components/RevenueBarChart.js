import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import PeriodToggle from './PeriodToggle';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const CHART_HEIGHT = rvs(130);
const BAR_MODES = [
  { key: 'sales',     label: 'Revenue', color: colors.primary  },
  { key: 'profit',    label: 'Profit',  color: colors.success  },
  { key: 'purchases', label: 'Purchase',color: colors.accent   },
];

/**
 * RevenueBarChart
 * Props: dailyData, period, onChangePeriod, loading
 * dailyData: [{ key, sales, profit, purchases }]
 */
const RevenueBarChart = ({ dailyData = [], period, onChangePeriod, loading }) => {

  const [activeMode, setActiveMode] = useState('sales');
  const mode = BAR_MODES.find((m) => m.key === activeMode);

  const values = dailyData.map((d) => d[activeMode] || 0);
  const maxVal = Math.max(...values, 1);

  const formatLabel = (key) => {
    if (key === 'Today') return 'Today';
    const parts = key.replace('daily_', '').split('_');
    if (parts.length === 3) {
      const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
      return `${parseInt(parts[2])}/${months[parseInt(parts[1]) - 1]}`;
    }
    return key;
  };

  const formatValue = (v) =>
    v >= 100000
      ? `₹${(v / 100000).toFixed(1)}L`
      : v >= 1000
      ? `₹${(v / 1000).toFixed(1)}K`
      : `₹${v.toFixed(0)}`;

  return (
    <View style={styles.card}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.title}>Sales Trend</Text>

        <PeriodToggle
          period={period}
          onChangePeriod={onChangePeriod}
          loading={loading}
          accentColor={colors.primary}
          label="Sales Trend"
        />
      </View>

      {/* Mode tabs */}
      <View style={styles.modeTabs}>
        {BAR_MODES.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={[styles.modeTab, activeMode === m.key && { borderBottomColor: m.color, borderBottomWidth: 2 }]}
            onPress={() => setActiveMode(m.key)}
            activeOpacity={0.75}
          >
            <Text style={[styles.modeLabel, activeMode === m.key && { color: m.color, fontWeight: '700' }]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      {loading || dailyData.length === 0 ? (
        <View style={[styles.chartWrap, styles.emptyWrap]}>
          <Text style={styles.emptyText}>No data</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.barsScroll}
        >
          {dailyData.map((d, i) => {
            const val    = d[activeMode] || 0;
            const height = Math.max(rvs(4), (val / maxVal) * CHART_HEIGHT);
            return (
              <View key={d.key || i} style={styles.barCol}>
                <Text style={styles.barTopVal}>{val > 0 ? formatValue(val) : ''}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.bar, { height, backgroundColor: mode.color }]} />
                </View>
                <Text style={styles.barLabel}>{formatLabel(d.key)}</Text>
              </View>
            );
          })}
        </ScrollView>
      )}

    </View>
  );
};

export default RevenueBarChart;

const BAR_WIDTH = rs(32);

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
  },

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: rs(16),
    paddingVertical: rvs(4),
  },
  title: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: colors.textLight,
    letterSpacing: 0.3,
  },

  /* Mode tabs */
  modeTabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderCard,
    marginHorizontal: rs(16),
    marginTop: rvs(10),
  },
  modeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: rvs(8),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  modeLabel: {
    fontSize: rfs(11),
    fontWeight: '600',
    color: colors.textSecondary,
  },

  /* Chart */
  chartWrap: {
    height: CHART_HEIGHT + rvs(40),
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: rfs(13),
    color: colors.textSecondary,
  },
  barsScroll: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: rvs(4),
    paddingHorizontal: rs(16),
    paddingTop: rvs(8),
    gap: rs(10),
    minWidth: '100%',
    justifyContent: 'space-around',
  },
  barCol: {
    alignItems: 'center',
    gap: rvs(4),
    width: BAR_WIDTH,
  },
  barTopVal: {
    fontSize: rfs(8),
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  barTrack: {
    width: BAR_WIDTH,
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(45,74,82,0.05)',
    borderRadius: rs(6),
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: rs(6),
  },
  barLabel: {
    fontSize: rfs(8),
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});