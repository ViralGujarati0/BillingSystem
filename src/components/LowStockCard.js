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
 * LowStockCard
 * Props: items, loading, onViewAll
 * items: [{ id, barcode, stock, sellingPrice, lastPurchasePrice }]
 *   — name comes from product cache or barcode
 */
const LowStockCard = ({ items = [], loading, onViewAll }) => {

  const hasAlert = items.length > 0;

  return (
    <View style={[styles.card, hasAlert && styles.cardAlert]}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconWrap, hasAlert ? styles.iconWrapAlert : styles.iconWrapOk]}>
            <Icon
              name={hasAlert ? 'warning-outline' : 'checkmark-circle-outline'}
              size={rfs(16)}
              color={hasAlert ? colors.danger : colors.success}
            />
          </View>
          <Text style={styles.title}>Low Stock Alerts</Text>
          {hasAlert && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{items.length}</Text>
            </View>
          )}
        </View>
        {onViewAll && hasAlert && (
          <TouchableOpacity onPress={onViewAll} activeOpacity={0.75} style={styles.viewAllBtn}>
            <Text style={styles.viewAll}>Restock</Text>
            <Icon name="chevron-forward" size={rfs(12)} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.skeletonWrap}>
          {[1, 2].map((i) => <View key={i} style={styles.skeleton} />)}
        </View>
      ) : items.length === 0 ? (
        <View style={styles.okWrap}>
          <Text style={styles.okText}>All items are well stocked 🎉</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item, i) => {
            const stock = item.stock || 0;
            const stockColor =
              stock === 0 ? colors.danger
              : stock <= 2 ? '#E07B2A'
              : colors.warning;
            return (
              <View key={item.id}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.row}>
                  <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name || item.barcode || item.id}
                    </Text>
                    <Text style={styles.barcode}>{item.barcode || item.id}</Text>
                  </View>
                  <View style={[styles.stockPill, { backgroundColor: `${stockColor}14`, borderColor: `${stockColor}30` }]}>
                    <Text style={[styles.stockText, { color: stockColor }]}>
                      {stock === 0 ? 'Out of stock' : `${stock} left`}
                    </Text>
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

export default LowStockCard;

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
  cardAlert: {
    borderColor: `${colors.danger}30`,
    backgroundColor: `${colors.danger}04`,
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
  iconWrapAlert: {
    backgroundColor: `${colors.danger}12`,
  },
  iconWrapOk: {
    backgroundColor: `${colors.success}12`,
  },
  title: {
    fontSize: rfs(14),
    fontWeight: '800',
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.danger,
    borderRadius: rs(10),
    paddingHorizontal: rs(6),
    paddingVertical: rvs(2),
    minWidth: rs(18),
    alignItems: 'center',
  },
  badgeText: {
    fontSize: rfs(9),
    fontWeight: '800',
    color: '#FFFFFF',
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
    justifyContent: 'space-between',
    gap: rs(10),
  },
  info: { flex: 1, gap: rvs(2) },
  name: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: colors.textPrimary,
  },
  barcode: {
    fontSize: rfs(10),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  stockPill: {
    borderRadius: rs(8),
    borderWidth: 1,
    paddingHorizontal: rs(8),
    paddingVertical: rvs(4),
    flexShrink: 0,
  },
  stockText: {
    fontSize: rfs(10),
    fontWeight: '800',
  },
  skeletonWrap: { gap: rvs(10) },
  skeleton: {
    height: rvs(32),
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