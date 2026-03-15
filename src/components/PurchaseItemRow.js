import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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

export default function PurchaseItemRow({ item, index, onQtyChange, onRateChange, onRemove }) {
  return (
    <View style={styles.row}>

      {/* Teal left stripe */}
      <View style={styles.stripe} />

      {/* Product info */}
      <View style={styles.infoWrap}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name || item.barcode}
        </Text>
        <Text style={styles.barcode}>{item.barcode}</Text>
      </View>

      {/* Qty input */}
      <View style={styles.inputWrap}>
        <Text style={styles.inputLabel}>QTY</Text>
        <TextInput
          style={styles.input}
          value={String(item.qty)}
          onChangeText={(v) => onQtyChange(index, v)}
          keyboardType="number-pad"
          textAlign="center"
        />
      </View>

      {/* Rate input */}
      <View style={styles.inputWrap}>
        <Text style={styles.inputLabel}>RATE ₹</Text>
        <TextInput
          style={styles.input}
          value={String(item.purchasePrice)}
          onChangeText={(v) => onRateChange(index, v)}
          keyboardType="decimal-pad"
          textAlign="center"
        />
      </View>

      {/* Amount */}
      <View style={styles.amountWrap}>
        <Text style={styles.inputLabel}>AMT</Text>
        <Text style={styles.amount}>₹{item.amount}</Text>
      </View>

      {/* Remove */}
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => onRemove(index)}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        activeOpacity={0.7}
      >
        <Icon name="close-circle" size={rfs(18)} color="#E05252" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(8),
    elevation: 2,
    overflow: 'hidden',
    gap: rs(8),
    paddingRight: rs(10),
    paddingVertical: rvs(10),
  },

  // ── Teal left stripe ─────────────────────────────────
  stripe: {
    width: rs(3),
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    flexShrink: 0,
    marginRight: rs(2),
  },

  // ── Product info ──────────────────────────────────────
  infoWrap: {
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
    letterSpacing: 0.4,
    fontVariant: ['tabular-nums'],
  },

  // ── Qty / Rate inputs ─────────────────────────────────
  inputWrap: {
    alignItems: 'center',
    gap: rvs(3),
  },

  inputLabel: {
    fontSize: rfs(8),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.6,
  },

  input: {
    width: rs(52),
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: rs(8),
    paddingVertical: rvs(5),
    paddingHorizontal: rs(4),
    fontSize: rfs(13),
    fontWeight: '600',
    color: colors.textPrimary,
    backgroundColor: colors.background,
    textAlign: 'center',
  },

  // ── Amount ────────────────────────────────────────────
  amountWrap: {
    alignItems: 'center',
    gap: rvs(3),
  },

  amount: {
    fontSize: rfs(13),
    fontWeight: '800',
    color: colors.primary,
    width: rs(54),
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },

  // ── Remove button ─────────────────────────────────────
  removeBtn: {
    padding: rs(2),
    flexShrink: 0,
  },

});