import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useAtomValue } from 'jotai';
import { billingCartItemsAtom } from '../atoms/billing';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Component ────────────────────────────────────────────────────────────────
const ScannerBottomActions = ({ navigation, userDoc }) => {
  const cartItems = useAtomValue(billingCartItemsAtom);

  // Logic unchanged
  const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);

  return (
    <View style={styles.container}>

      {/* ── Add Manual Item ── */}
      <TouchableOpacity
        style={styles.secondaryBtn}
        activeOpacity={0.75}
        onPress={() => navigation.navigate('ManualItem')}
      >
        <View style={styles.btnInner}>
          <Text style={styles.plusIcon}>＋</Text>
          <Text style={styles.secondaryText}>Add Manual Item</Text>
        </View>
      </TouchableOpacity>

      {/* ── Go To Bill ── */}
      <TouchableOpacity
        style={[styles.primaryBtn, itemCount === 0 && styles.primaryBtnDisabled]}
        activeOpacity={0.82}
        disabled={itemCount === 0}
        onPress={() => navigation.navigate('BillingCart', { userDoc })}
      >
        <View style={styles.btnInner}>
          <Text style={styles.primaryText}>Go To Bill</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{itemCount}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* ── Cancel ── */}
      <TouchableOpacity
        style={styles.cancelBtn}
        activeOpacity={0.6}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>

    </View>
  );
};

export default ScannerBottomActions;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: {
    paddingBottom: rvs(8),
    gap: rvs(10),
  },

  // Shared inner row
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(8),
  },

  // ── Secondary (Manual Item) ───────────────────────────
  secondaryBtn: {
    height: rvs(50),
    borderRadius: rs(14),
    borderWidth: 1.5,
    borderColor: colors.borderCard,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(8),
    elevation: 2,
  },

  plusIcon: {
    fontSize: rfs(16),
    color: colors.primary,
    fontWeight: '700',
    lineHeight: rfs(18),
  },

  secondaryText: {
    fontSize: rfs(14),
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 0.2,
  },

  // ── Primary (Go To Bill) ──────────────────────────────
  primaryBtn: {
    height: rvs(52),
    borderRadius: rs(14),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowPrimary,
    shadowOffset: { width: 0, height: rvs(6) },
    shadowOpacity: 0.35,
    shadowRadius: rs(14),
    elevation: 8,
  },

  primaryBtnDisabled: {
    opacity: 0.45,
  },

  primaryText: {
    fontSize: rfs(15),
    fontWeight: '700',
    color: colors.textLight,
    letterSpacing: 0.3,
  },

  // Item count amber badge
  countBadge: {
    minWidth: rs(22),
    height: rs(22),
    borderRadius: rs(11),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(5),
  },

  countText: {
    fontSize: rfs(11),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ── Cancel ────────────────────────────────────────────
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: rvs(6),
  },

  cancelText: {
    fontSize: rfs(13),
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
});