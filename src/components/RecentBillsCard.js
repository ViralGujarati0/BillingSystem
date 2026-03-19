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

const PAYMENT_ICON = {
  CASH: 'cash-outline',
  UPI:  'phone-portrait-outline',
  CARD: 'card-outline',
};

const PAYMENT_COLOR = {
  CASH: colors.primary,
  UPI:  colors.accent,
  CARD: colors.success,
};

function formatTime(date) {
  if (!date) return '—';
  return date.toLocaleTimeString('en-IN', {
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * RecentBillsCard
 * Props: bills, loading, onViewAll
 */
const RecentBillsCard = ({ bills = [], loading, onViewAll }) => (
  <View style={styles.card}>

    {/* Header */}
    <View style={styles.header}>
      <Text style={styles.title}>Recent Bills</Text>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.75} style={styles.viewAllBtn}>
          <Text style={styles.viewAll}>View All</Text>
          <Icon name="chevron-forward" size={rfs(12)} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>

    {loading ? (
      <View style={styles.skeletonWrap}>
        {[1, 2, 3].map((i) => <View key={i} style={styles.skeleton} />)}
      </View>
    ) : bills.length === 0 ? (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No bills today</Text>
      </View>
    ) : (
      <View style={styles.list}>
        {bills.map((bill, i) => {
          const pt = bill.paymentType || 'CASH';
          return (
            <View key={bill.id}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.row}>

                {/* Payment icon */}
                <View style={[styles.iconWrap, { backgroundColor: `${PAYMENT_COLOR[pt]}14` }]}>
                  <Icon
                    name={PAYMENT_ICON[pt] || 'receipt-outline'}
                    size={rfs(16)}
                    color={PAYMENT_COLOR[pt] || colors.primary}
                  />
                </View>

                {/* Info */}
                <View style={styles.info}>
                  <Text style={styles.customer} numberOfLines={1}>
                    {bill.customerName || 'Walk-in'}
                  </Text>
                  <Text style={styles.meta}>
                    {bill.billNoFormatted || `#${bill.billNo}`}
                    {' · '}
                    {formatTime(bill.createdAt)}
                    {' · '}
                    {(bill.items || []).length} items
                  </Text>
                </View>

                {/* Amount */}
                <Text style={styles.amount}>
                  ₹{Number(bill.grandTotal || 0).toFixed(0)}
                </Text>

              </View>
            </View>
          );
        })}
      </View>
    )}

  </View>
);

export default RecentBillsCard;

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
  iconWrap: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(10),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: rvs(2),
  },
  customer: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: colors.textPrimary,
  },
  meta: {
    fontSize: rfs(10),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  amount: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: colors.textPrimary,
  },
  skeletonWrap: { gap: rvs(12) },
  skeleton: {
    height: rvs(36),
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderRadius: rs(8),
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