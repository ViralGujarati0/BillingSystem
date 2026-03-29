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

// ─── Bar colors — teal, amber, green, purple, red ─────────────────────────────
const BAR_COLORS = [
  colors.primary,
  colors.accent,
  colors.success,
  '#7C6AF5',
  '#E05252',
];

const formatRevenue = (v) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L`
  : v >= 1000  ? `₹${(v / 1000).toFixed(1)}K`
  : `₹${Number(v || 0).toFixed(0)}`;

/**
 * TopProductsCard
 * Props: products, period, onChangePeriod, loading
 * products: [{ name, qty, revenue }]
 */
const TopProductsCard = ({ products = [], period, onChangePeriod, loading }) => {

  const maxQty = Math.max(...products.map((p) => p.qty || 0), 1);

  return (
    <View style={styles.card}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Top Products</Text>
          <Text style={styles.subtitle}>by quantity sold</Text>
        </View>
        <PeriodToggle period={period} onChangePeriod={onChangePeriod} />
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.skeletonWrap}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonRow}>
              <View style={styles.skeletonRank} />
              <View style={[styles.skeleton, { flex: 1 }]} />
            </View>
          ))}
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIconWrap}>
            <Icon name="cube-outline" size={rfs(22)} color={colors.textSecondary} />
          </View>
          <Text style={styles.emptyText}>No sales data</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {products.map((p, i) => {
            const color = BAR_COLORS[i] || colors.primary;
            const pct   = Math.max((p.qty / maxQty) * 100, 2);

            return (
              <View key={i} style={styles.row}>

                {/* Rank badge */}
                <View style={[styles.rankBox, { borderColor: `${color}30`, backgroundColor: `${color}10` }]}>
                  <Text style={[styles.rankText, { color }]}>#{i + 1}</Text>
                </View>

                {/* Name + bar + qty */}
                <View style={styles.barCol}>

                  {/* Name row */}
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
                    <Text style={[styles.revenue, { color }]}>{formatRevenue(p.revenue)}</Text>
                  </View>

                  {/* Bar track */}
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        { width: `${pct}%`, backgroundColor: color },
                      ]}
                    />
                  </View>

                  {/* Qty below bar */}
                  <Text style={styles.qty}>{p.qty} sold</Text>

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
    overflow: 'hidden',
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
    paddingHorizontal: rs(14),
    paddingTop: rvs(0),
    paddingBottom: rvs(14),
    gap: rvs(12),
  },

  // ── Header ────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    marginHorizontal: rs(-14),
    paddingHorizontal: rs(16),
    paddingVertical: rvs(6),
    marginBottom: rvs(2),
  },

  title: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: colors.textLight,
    letterSpacing: 0.3,
  },

  subtitle: {
    fontSize: rfs(10),
    color: 'rgba(255,255,255,0.70)',
    fontWeight: '500',
    marginTop: rvs(2),
  },

  // ── List ──────────────────────────────────────────────
  list: {
    gap: rvs(12),
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
  },

  // ── Rank badge ────────────────────────────────────────
  rankBox: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(8),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  rankText: {
    fontSize: rfs(10),
    fontWeight: '800',
  },

  // ── Bar column ────────────────────────────────────────
  barCol: {
    flex: 1,
    gap: rvs(3),
  },

  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: rs(6),
  },

  name: {
    fontSize: rfs(12),
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },

  revenue: {
    fontSize: rfs(12),
    fontWeight: '800',
    flexShrink: 0,
    fontVariant: ['tabular-nums'],
  },

  // ── Bar ───────────────────────────────────────────────
  barTrack: {
    height: rvs(5),
    backgroundColor: 'rgba(45,74,82,0.08)',
    borderRadius: rs(3),
    overflow: 'hidden',
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
    letterSpacing: 0.2,
  },

  // ── Skeleton ──────────────────────────────────────────
  skeletonWrap: {
    gap: rvs(12),
  },

  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
  },

  skeletonRank: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(8),
    backgroundColor: 'rgba(45,74,82,0.07)',
    flexShrink: 0,
  },

  skeleton: {
    height: rvs(28),
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderRadius: rs(8),
  },

  // ── Empty ─────────────────────────────────────────────
  emptyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(8),
    paddingVertical: rvs(20),
  },

  emptyIconWrap: {},

  emptyText: {
    fontSize: rfs(13),
    color: colors.textSecondary,
    fontWeight: '500',
  },

});