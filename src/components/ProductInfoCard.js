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

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Field icon map ───────────────────────────────────────────────────────────
const FIELD_ICON = {
  Barcode:        'barcode-outline',
  Name:           'cube-outline',
  Category:       'grid-outline',
  Brand:          'ribbon-outline',
  Unit:           'scale-outline',
  MRP:            'pricetag-outline',
  GST:            'receipt-outline',
  'Selling Price':'cash-outline',
  Stock:          'layers-outline',
  Expiry:         'calendar-outline',
};

// ─── Single info row ──────────────────────────────────────────────────────────
function InfoRow({ label, value, highlight, isLast }) {
  if (!value && value !== 0) return null;

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowLeft}>
        <View style={[styles.rowIconWrap, highlight && styles.rowIconWrapHighlight]}>
          <Icon
            name={FIELD_ICON[label] || 'ellipse-outline'}
            size={rfs(12)}
            color={highlight ? colors.primary : colors.textSecondary}
          />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={[styles.rowValue, highlight && styles.rowValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, label }) {
  return (
    <View style={styles.sectionHdr}>
      <Icon name={icon} size={rfs(11)} color={colors.textSecondary} />
      <Text style={styles.sectionHdrText}>{label}</Text>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductInfoCard({ product, barcode, inventory }) {

  const productRows = [
    { label: 'Barcode',  value: product?.barcode || barcode },
    { label: 'Name',     value: product?.name },
    { label: 'Category', value: product?.category },
    { label: 'Brand',    value: product?.brand },
    { label: 'Unit',     value: product?.unit },
    { label: 'MRP',      value: product?.mrp != null ? `₹${product.mrp}` : null },
    { label: 'GST',      value: product?.gstPercent != null ? `${product.gstPercent}%` : null },
  ].filter(r => r.value || r.value === 0);

  const inventoryRows = inventory ? [
    { label: 'Selling Price', value: `₹${inventory.sellingPrice}`, highlight: true },
    { label: 'Stock',         value: String(inventory.stock ?? 0),  highlight: true },
    ...(inventory.expiry ? [{ label: 'Expiry', value: inventory.expiry }] : []),
  ] : [];

  return (
    <View style={styles.card}>

      {/* Teal left stripe */}
      <View style={styles.stripe} />

      <View style={styles.cardInner}>

        {/* ── Product section ── */}
        <SectionHeader icon="cube-outline" label="PRODUCT DETAILS" />

        <View style={styles.rowsGroup}>
          {productRows.map((row, i) => (
            <InfoRow
              key={row.label}
              label={row.label}
              value={row.value}
              isLast={i === productRows.length - 1}
            />
          ))}
        </View>

        {/* ── Inventory section ── */}
        {inventoryRows.length > 0 && (
          <>
            <View style={styles.sectionDivider} />
            <SectionHeader icon="layers-outline" label="INVENTORY" />

            <View style={styles.rowsGroup}>
              {inventoryRows.map((row, i) => (
                <InfoRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  highlight={row.highlight}
                  isLast={i === inventoryRows.length - 1}
                />
              ))}
            </View>
          </>
        )}

      </View>

    </View>
  );
}

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
    flexDirection: 'row',
    overflow: 'hidden',
  },

  // ── Left stripe ───────────────────────────────────────
  stripe: {
    width: rs(3),
    backgroundColor: colors.primary,
    flexShrink: 0,
  },

  cardInner: {
    flex: 1,
    paddingHorizontal: rs(14),
    paddingTop: rvs(14),
    paddingBottom: rvs(10),
    gap: rvs(8),
  },

  // ── Section header ────────────────────────────────────
  sectionHdr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
    marginBottom: rvs(2),
  },

  sectionHdrText: {
    fontSize: rfs(10),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.7,
  },

  // ── Section divider ───────────────────────────────────
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginVertical: rvs(4),
  },

  // ── Rows group ────────────────────────────────────────
  rowsGroup: {
    gap: 0,
  },

  // ── Single row ────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: rvs(7),
  },

  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderCard,
  },

  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
    flex: 1,
  },

  rowIconWrap: {
    width: rs(22),
    height: rs(22),
    borderRadius: rs(6),
    backgroundColor: 'rgba(45,74,82,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  rowIconWrapHighlight: {
    backgroundColor: 'rgba(45,74,82,0.08)',
  },

  rowLabel: {
    fontSize: rfs(12),
    fontWeight: '500',
    color: colors.textSecondary,
    flexShrink: 1,
  },

  rowValue: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
    flexShrink: 1,
    maxWidth: '50%',
  },

  rowValueHighlight: {
    fontSize: rfs(14),
    fontWeight: '800',
    color: colors.primary,
  },

});