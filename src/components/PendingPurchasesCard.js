import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const fmt = (v) =>
  v >= 100000 ? `₹${(v / 100000).toFixed(1)}L`
  : v >= 1000  ? `₹${(v / 1000).toFixed(1)}K`
  : `₹${Number(v).toFixed(0)}`;

/**
 * PendingPurchasesCard
 * Props: purchases, loading, onViewAll
 * purchases: [{ id, supplierName, subtotal, paidAmount, dueAmount, purchaseNoFormatted }]
 */
const PendingPurchasesCard = ({ purchases = [], loading, onViewAll }) => {
  const { t } = useTranslation();

  const totalDue = purchases.reduce((s, p) => s + (p.dueAmount || 0), 0);
  const hasDues  = purchases.length > 0;

  return (
    <View style={[styles.card, hasDues && styles.cardWarning]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon
            name={hasDues ? 'time-outline' : 'checkmark-circle-outline'}
            size={rfs(16)}
            color={colors.textLight}
          />
          <Text style={styles.title}>{t('home.pendingPayments')}</Text>
        </View>

        {onViewAll && hasDues && (
          <TouchableOpacity
            onPress={onViewAll}
            activeOpacity={0.75}
            style={styles.viewAllBtn}
          >
            <Text style={styles.viewAll}>{t('home.viewAll')}</Text>
            <Icon name="chevron-forward" size={rfs(12)} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Total due strip ── */}
      {hasDues && !loading && (
        <View style={styles.totalStrip}>
          <Text style={styles.totalLabel}>{t('home.totalDue')}</Text>
          <Text style={styles.totalValue}>{fmt(totalDue)}</Text>
        </View>
      )}

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.skeletonWrap}>
          {[1, 2].map((i) => <View key={i} style={styles.skeleton} />)}
        </View>
      ) : purchases.length === 0 ? (
        <View style={styles.okWrap}>
          <View style={styles.okIconWrap}>
            <Icon name="checkmark-circle-outline" size={rfs(22)} color={colors.success} />
          </View>
          <Text style={styles.okText}>{t('home.noPendingPayments')}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {purchases.map((p, i) => (
            <View key={p.id}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.row}>

                {/* Supplier icon box */}
                <View style={styles.supplierIconWrap}>
                  <Icon
                    name="business-outline"
                    size={rfs(15)}
                    color={colors.accent}
                  />
                </View>

                {/* Info */}
                <View style={styles.info}>
                  <Text style={styles.supplier} numberOfLines={1}>
                    {p.supplierName || t('home.supplierDefault')}
                  </Text>
                  <Text style={styles.meta}>
                    {p.purchaseNoFormatted} · {fmt(p.subtotal)} total
                  </Text>
                </View>

                {/* Due */}
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
    overflow: 'hidden',
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
  },

  cardWarning: {
    borderColor: `${colors.warning}40`,
  },

  // ── Header ────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: rs(16),
    paddingVertical: rvs(12),
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
  },

  title: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: colors.textLight,
    letterSpacing: 0.3,
  },

  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(2),
  },

  viewAll: {
    fontSize: rfs(11),
    fontWeight: '700',
    color: colors.textLight,
  },

  // ── Total due strip ───────────────────────────────────
  totalStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(224,82,82,0.05)',
    paddingHorizontal: rs(14),
    paddingVertical: rvs(8),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderCard,
  },

  totalLabel: {
    fontSize: rfs(11),
    fontWeight: '600',
    color: colors.textSecondary,
  },

  totalValue: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: '#E05252',
  },

  // ── List ──────────────────────────────────────────────
  list: {
    paddingHorizontal: rs(14),
    paddingBottom: rvs(6),
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
    paddingVertical: rvs(11),
  },

  supplierIconWrap: {
    width: rs(34),
    height: rs(34),
    borderRadius: rs(9),
    backgroundColor: 'rgba(245,166,35,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  info: {
    flex: 1,
    gap: rvs(2),
  },

  supplier: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: colors.textPrimary,
  },

  meta: {
    fontSize: rfs(10),
    fontWeight: '500',
    color: colors.textSecondary,
  },

  dueWrap: {
    alignItems: 'flex-end',
    gap: rvs(1),
  },

  dueLabel: {
    fontSize: rfs(9),
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },

  dueValue: {
    fontSize: rfs(13),
    fontWeight: '800',
    color: '#E05252',
  },

  // ── Skeleton ──────────────────────────────────────────
  skeletonWrap: {
    gap: rvs(10),
    paddingHorizontal: rs(14),
    paddingBottom: rvs(14),
  },

  skeleton: {
    height: rvs(36),
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderRadius: rs(8),
  },

  // ── Empty / OK state ──────────────────────────────────
  okWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(7),
    paddingVertical: rvs(14),
    paddingHorizontal: rs(14),
  },

  okIconWrap: {},

  okText: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: colors.success,
  },

});