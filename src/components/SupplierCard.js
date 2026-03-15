import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
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

export default function SupplierCard({ supplier, onEdit, onDelete }) {

  const initial      = supplier.name?.charAt(0)?.toUpperCase() ?? '?';
  const avatarColor  = getAvatarColor(supplier.name);

  return (
    <View style={styles.card}>

      {/* Teal left stripe */}
      <View style={styles.stripe} />

      {/* Avatar */}
      <View style={[styles.avatarWrap, {
        backgroundColor: avatarColor.bg,
        shadowColor:     avatarColor.bg,
      }]}>
        <Text style={[styles.avatarText, { color: avatarColor.text }]}>{initial}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>

        <Text style={styles.name} numberOfLines={1}>{supplier.name}</Text>

        {!!supplier.phone && (
          <View style={styles.metaRow}>
            <Icon name="call-outline" size={rfs(11)} color={colors.textSecondary} />
            <Text style={styles.metaText}>{supplier.phone}</Text>
          </View>
        )}

        {!!supplier.address && (
          <View style={styles.metaRow}>
            <Icon name="location-outline" size={rfs(11)} color={colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>{supplier.address}</Text>
          </View>
        )}

        <View style={styles.balancePill}>
          <Icon name="wallet-outline" size={rfs(10)} color={colors.primary} />
          <Text style={styles.balanceText}>
            ₹{Number(supplier.openingBalance) || 0}
          </Text>
          <Text style={styles.balanceLabel}>Opening Balance</Text>
        </View>

      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => onEdit(supplier)}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Icon name="pencil-outline" size={rfs(15)} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconBtn, styles.iconBtnRed]}
          onPress={() => onDelete(supplier)}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Icon name="trash-outline" size={rfs(15)} color="#E05252" />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(8),
    elevation: 2,
    overflow: 'hidden',
  },

  // ── Teal left stripe ─────────────────────────────────
  stripe: {
    width: rs(3),
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    flexShrink: 0,
  },

  // ── Avatar ────────────────────────────────────────────
  avatarWrap: {
    width: rs(42),
    height: rs(42),
    borderRadius: rs(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: rs(12),
    marginVertical: rvs(12),
    flexShrink: 0,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 0.28,
    shadowRadius: rs(6),
    elevation: 2,
  },

  avatarText: {
    fontSize: rfs(17),
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  // ── Info block ────────────────────────────────────────
  info: {
    flex: 1,
    paddingLeft: rs(12),
    paddingVertical: rvs(12),
    paddingRight: rs(6),
    gap: rvs(4),
  },

  name: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
  },

  metaText: {
    fontSize: rfs(11),
    color: colors.textSecondary,
    fontWeight: '400',
    flex: 1,
  },

  // ── Balance pill ──────────────────────────────────────
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(45,74,82,0.12)',
    borderRadius: rs(20),
    paddingHorizontal: rs(8),
    paddingVertical: rvs(3),
    marginTop: rvs(2),
  },

  balanceText: {
    fontSize: rfs(11),
    fontWeight: '800',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },

  balanceLabel: {
    fontSize: rfs(9),
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },

  // ── Actions ───────────────────────────────────────────
  actions: {
    flexDirection: 'column',
    gap: rvs(7),
    paddingRight: rs(12),
    paddingVertical: rvs(12),
    alignSelf: 'flex-start',
    marginTop: rvs(0),
  },

  iconBtn: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(9),
    backgroundColor: 'rgba(45,74,82,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(45,74,82,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconBtnRed: {
    backgroundColor: 'rgba(224,82,82,0.08)',
    borderColor: 'rgba(224,82,82,0.20)',
  },

});