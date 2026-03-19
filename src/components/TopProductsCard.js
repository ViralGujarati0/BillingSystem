import React from 'react';
import {
  View, Text, StyleSheet, Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';
import PeriodToggle from './PeriodToggle';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const BAR_COLORS = [
  colors.primary,
  colors.accent,
  colors.success,
  '#7C6AF5',
  '#E05252',
];

/**
 * TopProductsCard
 * Props: products, period, onChangePeriod, loading
 * products: [{ name, qty, revenue }]
 */
const TopProductsCard = ({ products = [], period, onChangePeriod, loading }) => {

  const maxQty = Math.max(...products.map((p) => p.qty), 1);

  const formatRevenue = (v) =>
    v >= 100000 ? `₹${(v / 100000).toFixed(1)}L`
    : v >= 1000  ? `₹${(v / 1000).toFixed(1)}K`
    : `₹${v.toFixed(0)}`;

  return (
    <View style={styles.card}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Top Products</Text>
        <PeriodToggle period={period} onChangePeriod={onChangePeriod} />
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>by quantity sold</Text>

      {/* Bars */}
      {loading ? (
        <View style={styles.skeletonWrap}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonRow}>
              <View style={[styles.skeleton, { width: `${70 - i * 15}%` }]} />
            </View>
          ))}
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No sales data</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {products.map((p, i) => {
            const pct = (p.qty / maxQty) * 100;
            return (
              <View key={i} style={styles.row}>
                {/* Rank */}
                <Text style={[styles.rank, { color: BAR_COLORS[i] }]}>
                  #{i + 1}
                </Text>
                {/* Name + bar */}
                <View style={styles.barCol}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.revenue}>{formatRevenue(p.revenue)}</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        { width: `${pct}%`, backgroundColor: BAR_COLORS[i] },
                      ]}
                    />
                    <Text style={styles.qty}>{p.qty} sold</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

    </View>
  );
};

export default TopProductsCard;

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
    gap: rvs(2),
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
  subtitle: {
    fontSize: rfs(10),
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: rvs(8),
  },
  list: {
    gap: rvs(12),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
  },
  rank: {
    fontSize: rfs(12),
    fontWeight: '800',
    width: rs(24),
    textAlign: 'center',
    flexShrink: 0,
  },
  barCol: {
    flex: 1,
    gap: rvs(4),
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: rfs(12),
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  revenue: {
    fontSize: rfs(11),
    fontWeight: '700',
    color: colors.textSecondary,
  },
  barTrack: {
    height: rvs(6),
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderRadius: rs(3),
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
  },
  bar: {
    height: '100%',
    borderRadius: rs(3),
    minWidth: rs(4),
  },
  qty: {
    fontSize: rfs(9),
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: rs(6),
  },
  skeletonWrap: { gap: rvs(10) },
  skeletonRow:  { height: rvs(30) },
  skeleton: {
    height: rvs(10),
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderRadius: rs(4),
  },
  emptyWrap: {
    paddingVertical: rvs(20),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: rfs(13),
    color: colors.textSecondary,
  },
});