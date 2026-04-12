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

/**
 * LowStockCard
 * Props: items, loading, onViewAll
 * items: [{ id, barcode, name, stock }]
 */
const LowStockCard = ({ items = [], loading, onViewAll }) => {
  const { t } = useTranslation();

  const hasAlert = items.length > 0;

  return (
    <View style={[styles.card, hasAlert && styles.cardAlert]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Icon
            name={hasAlert ? 'warning-outline' : 'checkmark-circle-outline'}
            size={rfs(16)}
            color={colors.textLight}
          />
          <Text style={styles.title}>{t('home.lowStockAlerts')}</Text>
          {hasAlert && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{items.length}</Text>
            </View>
          )}
        </View>

        {onViewAll && hasAlert && (
          <TouchableOpacity
            onPress={onViewAll}
            activeOpacity={0.75}
            style={styles.viewAllBtn}
          >
            <Text style={styles.viewAll}>{t('home.restock')}</Text>
            <Icon name="chevron-forward" size={rfs(12)} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.skeletonWrap}>
          {[1, 2].map((i) => <View key={i} style={styles.skeleton} />)}
        </View>
      ) : items.length === 0 ? (
        <View style={styles.okWrap}>
          <Icon
            name="checkmark-circle-outline"
            size={rfs(18)}
            color={colors.success}
          />
          <Text style={styles.okText}>{t('home.allStocked')}</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((item, i) => {
            const stock = item.stock || 0;
            const stockColor =
              stock === 0  ? colors.danger
              : stock <= 2 ? '#E07B2A'
              : colors.warning;

            return (
              <View
                key={item.id}
                style={[styles.row, i < items.length - 1 && styles.rowBorder]}
              >
                {/* Stock icon box */}
                <View style={[
                  styles.stockIconBox,
                  { backgroundColor: `${stockColor}10`, borderColor: `${stockColor}25` },
                ]}>
                  <Icon
                    name={stock === 0 ? 'close-circle-outline' : 'alert-circle-outline'}
                    size={rfs(15)}
                    color={stockColor}
                  />
                </View>

                {/* Info */}
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.name || item.barcode || item.id}
                  </Text>
                  <Text style={styles.barcode}>
                    {item.barcode || item.id}
                  </Text>
                </View>

                {/* Stock pill */}
                <View style={[
                  styles.stockPill,
                  { backgroundColor: `${stockColor}10`, borderColor: `${stockColor}28` },
                ]}>
                  <Text style={[styles.stockText, { color: stockColor }]}>
                    {stock === 0
                      ? t('home.outOfStock')
                      : t('home.stockLeft', { count: stock })}
                  </Text>
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
    overflow: 'hidden',
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
  },

  cardAlert: {
    borderColor: `${colors.danger}30`,
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
    color: colors.textLight,
  },

  // ── List ──────────────────────────────────────────────
  list: {},

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
    paddingHorizontal: rs(14),
    paddingVertical: rvs(11),
  },

  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderCard,
  },

  stockIconBox: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(9),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  info: {
    flex: 1,
    gap: rvs(2),
  },

  name: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: colors.textPrimary,
  },

  barcode: {
    fontSize: rfs(10),
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.3,
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

  // ── OK state ──────────────────────────────────────────
  okWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(7),
    paddingVertical: rvs(14),
  },

  okText: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: colors.success,
  },

});