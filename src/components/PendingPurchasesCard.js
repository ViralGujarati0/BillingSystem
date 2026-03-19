import React from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

/**
 * PendingPurchasesCard
 * Props: purchases, loading, onViewAll
 * purchases: [{ id, supplierName, subtotal, paidAmount, dueAmount, purchaseNoFormatted }]
 */
const PendingPurchasesCard = ({ purchases = [], loading, onViewAll }) => {

  const totalDue = purchases.reduce((s, p) => s + (p.dueAmount || 0), 0);
  const hasDues  = purchases.length > 0;

  const fmt = (v) =>
    v >= 100000 ? `₹${(v / 100000).toFixed(1)}L`
    : v >= 1000  ? `₹${(v / 1000).toFixed(1)}K`
    : `₹${Number(v).toFixed(0)}`;

  return (
    <View style={[styles.card, hasDues && styles.cardWarning]}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrap, hasDues ? styles.iconWrapWarning : styles.iconWrapOk]}>
            <Icon
              name={hasDues ? 'time-outline' : 'checkmark-circle-outline'}
              size={rfs(16)}
              color={hasDues ? colors.warning : colors.success}
            />
          </View>
          <Text style={styles.title}>Pending Payments</Text>
        </View>
        {onViewAll && hasDues && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.75} style={styles.viewAllBtn}>
            <Text style={styles.viewAll}>View All</Text>
            <Icon name="chevron-forward" size={rfs(12)} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Total due strip */}
      {hasDues && !loading && (
        <View style={styles.totalStrip}>
          <Text style={styles.totalLabel}>Total Due</Text>
          <Text style={styles.totalValue}>{fmt(totalDue)}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.skeletonWrap}>
          {[1, 2].map((i) => <View key={i} style={styles.skeleton} />)}
        </View>
      ) : purchases.length === 0 ? (
        <View style={styles.okWrap}>
          <Text style={styles.okText}>No pending payments 🎉</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {purchases.map((p, i) => (
            <View key={p.id}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.row}>
                <View style={styles.supplierIconWrap}>
                  <Icon name="business-outline" size={rfs(14)} color={colors.accent} />
                </View>
                <View style={styles.info}>
                  <Text style={styles.supplier} numberOfLines={1}>
                    {p.supplierName || 'Supplier'}
                  </Text>
                  <Text style={styles.meta}>
                    {p.purchaseNoFormatted} · ₹{fmt(p.subtotal)} total
                  </Text>
                </View>
                <View style={styles.dueWrap}>
                  <Text style={styles.dueLabel}>Due</Text>
                  <Text style={styles.dueValue}>{fmt(p.dueAmount)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

    </View>
  );
};

export default PendingPurchasesCard;

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
    gap: rvs(12),
  },
  cardWarning: {
    borderColor: `${colors.warning}40`,
    backgroundColor: `${colors.warning}04`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
  },
  iconWrap: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapWarning: { backgroundColor: `${colors.warning}14` },
  iconWrapOk:      { backgroundColor: `${colors.success}12` },
  title: {
    fontSize: rfs(14),
    fontWeight: '800',
    color: colors.textPrimary,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(2),
  },
  viewAll: {
    fontSize: rfs(11),
    fontWeight: '700',
    color: colors.primary,
  },
  totalStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: `${colors.warning}10`,
    borderRadius: rs(10),
    paddingHorizontal: rs(12),
    paddingVertical: rvs(8),
    borderWidth: 1,
    borderColor: `${colors.warning}25`,
  },
  totalLabel: {
    fontSize: rfs(11),
    fontWeight: '700',
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: rfs(16),
    fontWeight: '800',
    color: '#E07B2A',
  },
  list: { gap: 0 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginVertical: rvs(8),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
  },
  supplierIconWrap: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(8),
    backgroundColor: `${colors.accent}14`,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: { flex: 1, gap: rvs(2) },
  supplier: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: rfs(10),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dueWrap: { alignItems: 'flex-end', gap: rvs(1) },
  dueLabel: {
    fontSize: rfs(9),
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dueValue: {
    fontSize: rfs(13),
    fontWeight: '800',
    color: '#E07B2A',
  },
  skeletonWrap: { gap: rvs(10) },
  skeleton: {
    height: rvs(36),
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderRadius: rs(8),
  },
  okWrap: {
    paddingVertical: rvs(12),
    alignItems: 'center',
  },
  okText: {
    fontSize: rfs(13),
    color: colors.success,
    fontWeight: '600',
  },
});