import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

export default function PurchaseCard({ purchase }) {
  const hasDue = Number(purchase.dueAmount) > 0;

  return (
    <View style={styles.card}>

      {/* Left stripe — amber if due, green if fully paid */}
      <View style={[styles.stripe, { backgroundColor: hasDue ? colors.accent : '#5B9E6D' }]} />

      <View style={styles.inner}>

        {/* Top row */}
        <View style={styles.topRow}>
          <View style={styles.invoiceWrap}>
            <Icon name="document-text-outline" size={rfs(13)} color={colors.primary} />
            <Text style={styles.invoiceNo}>{purchase.purchaseNoFormatted || '—'}</Text>
          </View>
          <Text style={styles.date}>{purchase.date || '—'}</Text>
        </View>

        {/* Supplier row */}
        <View style={styles.supplierRow}>
          <Icon name="business-outline" size={rfs(12)} color={colors.textSecondary} />
          <Text style={styles.supplierName}>{purchase.supplierName || '—'}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Amount grid */}
        <View style={styles.amountGrid}>

          <View style={styles.amountCell}>
            <Text style={styles.amountLabel}>Items</Text>
            <Text style={styles.amountValue}>{purchase.itemsCount ?? 0}</Text>
          </View>

          <View style={styles.amountDivider} />

          <View style={styles.amountCell}>
            <Text style={styles.amountLabel}>Total</Text>
            <Text style={styles.amountValue}>₹{purchase.subtotal ?? 0}</Text>
          </View>

          <View style={styles.amountDivider} />

          <View style={styles.amountCell}>
            <Text style={styles.amountLabel}>Paid</Text>
            <Text style={[styles.amountValue, { color: '#5B9E6D' }]}>
              ₹{purchase.paidAmount ?? 0}
            </Text>
          </View>

          <View style={styles.amountDivider} />

          <View style={styles.amountCell}>
            <Text style={styles.amountLabel}>Due</Text>
            <Text style={[styles.amountValue, { color: hasDue ? colors.accent : '#5B9E6D' }]}>
              ₹{purchase.dueAmount ?? 0}
            </Text>
          </View>

        </View>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(8),
  },
  stripe: {
    width: rs(3),
    flexShrink: 0,
  },
  inner: {
    flex: 1,
    padding: rs(12),
    gap: rvs(8),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
  },
  invoiceNo: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: colors.primary,
  },
  date: {
    fontSize: rfs(11),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
  },
  supplierName: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
  },
  amountGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountCell: {
    flex: 1,
    alignItems: 'center',
    gap: rvs(2),
  },
  amountDivider: {
    width: StyleSheet.hairlineWidth,
    height: rvs(28),
    backgroundColor: colors.borderCard,
  },
  amountLabel: {
    fontSize: rfs(9),
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  amountValue: {
    fontSize: rfs(13),
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
});