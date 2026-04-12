import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * scale);

/**
 * Rendered inside AppHeaderLayout's rightComponent prop.
 *
 * Check → 'check' mode → ProductScanResultScreen
 * Update → 'updateInventory' mode → UpdateInventoryScreen
 * Add → default mode → ProductScanResultScreen
 */
const InventoryQuickActions = ({ navigation }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.row}>

      <ActionPill
        icon="search-outline"
        label={t('inventory.quickCheck')}
        onPress={() => navigation.navigate('BarcodeScanner', { mode: 'check' })}
      />

      <ActionPill
        icon="refresh-outline"
        label={t('inventory.quickUpdate')}
        onPress={() => navigation.navigate('BarcodeScanner', { mode: 'updateInventory' })}
      />

      <ActionPill
        icon="add-outline"
        label={t('inventory.quickAdd')}
        accent
        onPress={() => navigation.navigate('BarcodeScanner')}
      />

    </View>
  );
};

// ─── Single pill (also used by Home header — same look as Stock) ─────────────
export function ActionPill({ icon, label, onPress, accent, accessibilityLabel }) {
  return (
    <TouchableOpacity
      style={[styles.pill, accent && styles.pillAccent]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Ionicons
        name={icon}
        size={rfs(14)}
        color={accent ? colors.accent : 'rgba(255,255,255,0.80)'}
      />
      <Text
        style={[styles.pillLabel, accent && styles.pillLabelAccent]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default InventoryQuickActions;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
  },

  pill: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: rvs(3),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.13)',
    borderRadius: rs(12),
    paddingVertical: rvs(7),
    paddingHorizontal: rs(10),
    minWidth: rs(46),
  },

  pillAccent: {
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderColor: 'rgba(245,166,35,0.28)',
  },

  pillLabel: {
    fontSize: rfs(9),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.3,
  },

  pillLabelAccent: {
    color: colors.accent,
  },

});