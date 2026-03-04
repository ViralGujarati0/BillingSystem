import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useAtomValue } from 'jotai';
import { colors } from '../theme/colors';
import { billingCartItemsAtom } from '../atoms/billing';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Component ────────────────────────────────────────────────────────────────
const ScannerHeaderCart = () => {
  const cartItems = useAtomValue(billingCartItemsAtom);

  // Latest scanned first — logic unchanged
  const latestItems = useMemo(() => {
    return [...cartItems].reverse().slice(0, 5);
  }, [cartItems]);

  // ── Total ─────────────────────────────────────────────
  const total = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty || 1)), 0);
  }, [cartItems]);

  // ── Empty state ───────────────────────────────────────
  if (!latestItems.length) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyText}>Scan items to start billing</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* ── Header row ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{cartItems.length}</Text>
          </View>
        </View>
        {total > 0 && (
          <Text style={styles.totalText}>
            ₹{Number(total).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
        )}
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Item rows ── */}
      <FlatList
        data={latestItems}
        keyExtractor={(item, index) => `${item.barcode || item.name}_${index}`}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {/* Icon circle */}
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>📦</Text>
            </View>

            {/* Name + price */}
            <View style={styles.itemInfo}>
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              {item.price > 0 && (
                <Text style={styles.price}>
                  ₹{Number(item.price).toFixed(2)} / unit
                </Text>
              )}
            </View>

            {/* Qty badge */}
            <View style={styles.qtyBadge}>
              <Text style={styles.qty}>×{item.qty}</Text>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        scrollEnabled={latestItems.length > 3}
      />
    </View>
  );
};

export default ScannerHeaderCart;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    marginBottom: rvs(12),
    maxHeight: rvs(170),
    overflow: 'hidden',
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(8),
    elevation: 3,
  },

  // ── Empty ─────────────────────────────────────────────
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: rs(8),
    paddingVertical: rvs(14),
    paddingHorizontal: rs(16),
  },
  emptyIcon: {
    fontSize: rfs(16),
  },
  emptyText: {
    fontSize: rfs(13),
    color: colors.textSecondary,
    fontWeight: '500',
  },

  // ── Header ────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(14),
    paddingTop: rvs(10),
    paddingBottom: rvs(8),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(7),
  },
  headerTitle: {
    fontSize: rfs(11),
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  countBadge: {
    width: rs(18),
    height: rs(18),
    borderRadius: rs(9),
    backgroundColor: colors.primary,  // light teal tint
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: rfs(10),
    fontWeight: '700',
    color: '#fff',
  },
  totalText: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.2,
  },

  // ── Divider ───────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: colors.borderCard,
    marginHorizontal: rs(14),
  },

  // ── Row ───────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(14),
    paddingVertical: rvs(7),
    gap: rs(10),
  },

  iconCircle: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(10),
    backgroundColor: 'rgba(45,74,82,0.10)',  // light teal tint
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: {
    fontSize: rfs(14),
  },

  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },
  price: {
    fontSize: rfs(11),
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: rvs(1),
  },

  qtyBadge: {
    backgroundColor: 'rgba(45,74,82,0.08)',
    borderRadius: rs(8),
    paddingHorizontal: rs(8),
    paddingVertical: rvs(3),
    flexShrink: 0,
  },
  qty: {
    fontSize: rfs(12),
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
});