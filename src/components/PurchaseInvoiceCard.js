import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Meta row ─────────────────────────────────────────────────────────────────
const MetaRow = ({ icon, label, value }) => (
  <View style={styles.metaRow}>
    <View style={styles.metaLeft}>
      <Icon name={icon} size={rfs(12)} color={colors.textSecondary} />
      <Text style={styles.metaLabel}>{label}</Text>
    </View>
    <Text style={styles.metaValue} numberOfLines={1}>{value || '—'}</Text>
  </View>
);

// ─── Table header ─────────────────────────────────────────────────────────────
const TableHeader = () => (
  <View style={styles.tableHeader}>
    <Text style={[styles.th, { flex: 1 }]}>PRODUCT</Text>
    <Text style={[styles.th, styles.thCenter, { width: rs(36) }]}>QTY</Text>
    <Text style={[styles.th, styles.thRight, { width: rs(64) }]}>RATE</Text>
    <Text style={[styles.th, styles.thRight, { width: rs(72) }]}>AMT</Text>
  </View>
);

// ─── Table row ────────────────────────────────────────────────────────────────
const TableRow = ({ item, isLast }) => (
  <View style={[styles.tableRow, isLast && styles.tableRowLast]}>
    <Text style={[styles.td, { flex: 1 }]} numberOfLines={2}>{item.name || '—'}</Text>
    <Text style={[styles.td, styles.tdCenter, { width: rs(36) }]}>{item.qty}</Text>
    <Text style={[styles.td, styles.tdRight, { width: rs(64) }]}>
      ₹{Number(item.purchasePrice || 0).toFixed(2)}
    </Text>
    <Text style={[styles.td, styles.tdRight, styles.tdBold, { width: rs(72) }]}>
      ₹{Number(item.amount || 0).toFixed(2)}
    </Text>
  </View>
);

// ─── Total row ────────────────────────────────────────────────────────────────
const TotalRow = ({ label, value, color }) => (
  <View style={styles.totalRow}>
    <Text style={styles.totalLabel}>{label}</Text>
    <Text style={[styles.totalValue, color && { color }]}>{value}</Text>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const PurchaseInvoiceCard = ({ data }) => {
  const hasDue = Number(data?.dueAmount || 0) > 0;

  return (
    <View style={styles.card}>

      {/* ── Shop header ── */}
      <View style={styles.cardHeader}>
        <Text style={styles.shopName}>{data?.shopName || 'Shop'}</Text>
        <Text style={styles.invoiceLabel}>Purchase Invoice</Text>
      </View>

      {/* ── Meta info ── */}
      <View style={styles.metaSection}>
        <MetaRow icon="business-outline"      label="Supplier"   value={data?.supplierName} />
        <MetaRow icon="document-text-outline" label="Invoice No" value={data?.invoiceNo} />
        <MetaRow icon="calendar-outline"      label="Date"       value={data?.date} />
      </View>

      {/* ── Items table ── */}
      <View style={styles.tableSection}>
        <TableHeader />
        {(data?.items || []).map((item, idx) => (
          <TableRow
            key={idx}
            item={item}
            isLast={idx === (data?.items?.length || 0) - 1}
          />
        ))}
      </View>

      {/* ── Totals ── */}
      <View style={styles.totalsSection}>
        <TotalRow
          label="Subtotal"
          value={`₹${Number(data?.subtotal || 0).toFixed(2)}`}
        />
        <TotalRow
          label="Paid"
          value={`₹${Number(data?.paidAmount || 0).toFixed(2)}`}
          color="#5B9E6D"
        />
        <View style={styles.totalsDivider} />

        {/* Due amount row */}
        <View style={[
          styles.dueRow,
          hasDue ? styles.dueRowWarning : styles.dueRowPaid,
        ]}>
          <Text style={[styles.dueLabel, { color: hasDue ? colors.accent : '#5B9E6D' }]}>
            Due Amount
          </Text>
          <Text style={[styles.dueValue, { color: hasDue ? colors.accent : '#5B9E6D' }]}>
            ₹{Number(data?.dueAmount || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* ── Footer ── */}
      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>
          Computer generated purchase invoice
        </Text>
      </View>

    </View>
  );
};

export default PurchaseInvoiceCard;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
    overflow: 'hidden',
  },

  // ── Card header ───────────────────────────────────────
  cardHeader: {
    backgroundColor: colors.primary,
    paddingVertical: rvs(18),
    paddingHorizontal: rs(20),
    alignItems: 'center',
    gap: rvs(4),
  },

  shopName: {
    fontSize: rfs(17),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  invoiceLabel: {
    fontSize: rfs(11),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // ── Meta ──────────────────────────────────────────────
  metaSection: {
    paddingHorizontal: rs(18),
    paddingVertical: rvs(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderCard,
    gap: rvs(8),
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
  },

  metaLabel: {
    fontSize: rfs(11),
    fontWeight: '600',
    color: colors.textSecondary,
  },

  metaValue: {
    fontSize: rfs(12),
    fontWeight: '700',
    color: colors.textPrimary,
    maxWidth: '55%',
    textAlign: 'right',
  },

  // ── Table ─────────────────────────────────────────────
  tableSection: {
    paddingHorizontal: rs(18),
    paddingTop: rvs(10),
    paddingBottom: rvs(4),
  },

  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: rvs(6),
    marginBottom: rvs(4),
  },

  th: {
    fontSize: rfs(9),
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  thCenter: { textAlign: 'center' },
  thRight:  { textAlign: 'right' },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: rvs(7),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderCard,
  },

  tableRowLast: {
    borderBottomWidth: 0,
  },

  td: {
    fontSize: rfs(12),
    color: colors.textPrimary,
    fontWeight: '500',
  },

  tdCenter: { textAlign: 'center' },
  tdRight:  { textAlign: 'right' },
  tdBold:   { fontWeight: '700' },

  // ── Totals ────────────────────────────────────────────
  totalsSection: {
    paddingHorizontal: rs(18),
    paddingVertical: rvs(12),
    borderTopWidth: 1,
    borderTopColor: colors.borderCard,
    gap: rvs(7),
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: colors.textSecondary,
  },

  totalValue: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },

  totalsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginVertical: rvs(2),
  },

  dueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: rs(10),
    paddingHorizontal: rs(12),
    paddingVertical: rvs(10),
  },

  dueRowWarning: {
    backgroundColor: 'rgba(245,166,35,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.20)',
  },

  dueRowPaid: {
    backgroundColor: 'rgba(91,158,109,0.08)',  // theme green — not #16a34a
    borderWidth: 1,
    borderColor: 'rgba(91,158,109,0.20)',
  },

  dueLabel: {
    fontSize: rfs(13),
    fontWeight: '700',
  },

  dueValue: {
    fontSize: rfs(16),
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },

  // ── Footer ────────────────────────────────────────────
  // borderTopStyle: 'dashed' is NOT supported in React Native — removed
  cardFooter: {
    paddingVertical: rvs(12),
    paddingHorizontal: rs(18),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderCard,
    alignItems: 'center',
  },

  footerText: {
    fontSize: rfs(10),
    color: colors.textSecondary,
    fontStyle: 'italic',
  },

});