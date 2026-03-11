import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * scale);

export default function PurchaseItemRow({ item, index, onQtyChange, onRateChange, onRemove }) {
  return (
    <View style={styles.row}>

      {/* Product info */}
      <View style={styles.infoWrap}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name || item.barcode}
        </Text>
        <Text style={styles.barcode}>{item.barcode}</Text>
      </View>

      {/* Qty input */}
      <View style={styles.inputWrap}>
        <Text style={styles.inputLabel}>Qty</Text>
        <TextInput
          style={styles.input}
          value={String(item.qty)}
          onChangeText={(v) => onQtyChange(index, v)}
          keyboardType="number-pad"
        />
      </View>

      {/* Rate input */}
      <View style={styles.inputWrap}>
        <Text style={styles.inputLabel}>Rate ₹</Text>
        <TextInput
          style={styles.input}
          value={String(item.purchasePrice)}
          onChangeText={(v) => onRateChange(index, v)}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Amount */}
      <View style={styles.amountWrap}>
        <Text style={styles.inputLabel}>Amt</Text>
        <Text style={styles.amount}>₹{item.amount}</Text>
      </View>

      {/* Remove */}
      <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(index)}>
        <Icon name="close-circle" size={rfs(18)} color="#dc3545" />
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: rs(10),
    borderWidth: 1,
    borderColor: '#f0f0f0',
    padding: rs(10),
    gap: rs(8),
    marginBottom: rvs(8),
  },
  infoWrap: {
    flex: 1,
  },
  name: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: '#111',
  },
  barcode: {
    fontSize: rfs(10),
    color: '#aaa',
    marginTop: rvs(2),
  },
  inputWrap: {
    alignItems: 'center',
    gap: rvs(2),
  },
  inputLabel: {
    fontSize: rfs(9),
    fontWeight: '700',
    color: '#aaa',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    width: rs(52),
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: rs(6),
    paddingVertical: rvs(5),
    paddingHorizontal: rs(6),
    fontSize: rfs(13),
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    backgroundColor: '#fafafa',
  },
  amountWrap: {
    alignItems: 'center',
    gap: rvs(2),
  },
  amount: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: '#7c3aed',
    width: rs(56),
    textAlign: 'right',
  },
  removeBtn: {
    padding: rs(2),
  },
});