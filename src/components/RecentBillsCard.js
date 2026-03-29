import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { getAvatarColor } from '../utils/avatarColor';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

function formatTime(date) {
  if (!date) return '—';
  try {
    const d = date?.toDate ? date.toDate() : new Date(date);
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch { return '—'; }
}

// ─── Bill row ─────────────────────────────────────────────────────────────────
const BillRow = ({ bill, isLast }) => {
  const name   = bill.customerName || 'Walk-in';
  const avatar = getAvatarColor(name);
  const initial = name[0].toUpperCase();

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>

      {/* Initial avatar */}
      <View style={[styles.avatar, { backgroundColor: avatar.bg }]}>
        <Text style={[styles.avatarLetter, { color: avatar.text }]}>
          {initial}
        </Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.customer} numberOfLines={1}>{name}</Text>
        <Text style={styles.meta}>
          {bill.billNoFormatted || `#${bill.billNo}`}
          {' · '}
          {formatTime(bill.createdAt)}
          {' · '}
          {(bill.items || []).length} item{(bill.items || []).length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Amount */}
      <Text style={styles.amount}>
        ₹{Number(bill.grandTotal || 0).toFixed(0)}
      </Text>

    </View>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const RecentBillsCard = ({ bills = [], loading, onViewAll }) => (
  <View style={styles.card}>

    {/* ── Header ── */}
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Icon
          name="receipt-outline"
          size={rfs(16)}
          color={colors.textLight}
        />
        <Text style={styles.title}>Recent Bills</Text>
      </View>

      {onViewAll && (
        <TouchableOpacity
          onPress={onViewAll}
          activeOpacity={0.75}
          style={styles.viewAllBtn}
        >
          <Text style={styles.viewAll}>View All</Text>
          <Icon name="chevron-forward" size={rfs(12)} color={colors.textLight} />
        </TouchableOpacity>
      )}
    </View>

    {/* ── Content ── */}
    {loading ? (
      <View style={styles.skeletonWrap}>
        {[1, 2, 3].map((i) => <View key={i} style={styles.skeleton} />)}
      </View>
    ) : bills.length === 0 ? (
      <View style={styles.emptyWrap}>
        <View style={styles.emptyIconWrap}>
          <Icon name="receipt-outline" size={rfs(22)} color={colors.textSecondary} />
        </View>
        <Text style={styles.emptyText}>No bills today</Text>
      </View>
    ) : (
      <View style={styles.list}>
        {bills.map((bill, i) => (
          <BillRow
            key={bill.id}
            bill={bill}
            isLast={i === bills.length - 1}
          />
        ))}
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
    overflow: 'hidden',
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
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

  // ── List ──────────────────────────────────────────────
  list: {
    paddingBottom: rvs(4),
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
    paddingHorizontal: rs(14),
    paddingVertical: rvs(10),
  },

  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderCard,
  },

  // ── Avatar ────────────────────────────────────────────
  avatar: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(10),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  avatarLetter: {
    fontSize: rfs(15),
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  // ── Info ──────────────────────────────────────────────
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
    fontWeight: '500',
    color: colors.textSecondary,
  },

  amount: {
    fontSize: rfs(14),
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },

  // ── Skeleton ──────────────────────────────────────────
  skeletonWrap: {
    gap: rvs(12),
    paddingHorizontal: rs(14),
    paddingBottom: rvs(14),
  },

  skeleton: {
    height: rvs(36),
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderRadius: rs(8),
  },

  // ── Empty state ───────────────────────────────────────
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