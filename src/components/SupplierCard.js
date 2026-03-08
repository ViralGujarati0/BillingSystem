import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function SupplierCard({ supplier, onEdit, onDelete }) {
  return (
    <View style={styles.card}>

      {/* Avatar + Info */}
      <View style={styles.avatarWrap}>
        <Text style={styles.avatarText}>
          {supplier.name?.charAt(0)?.toUpperCase() ?? '?'}
        </Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{supplier.name}</Text>

        {!!supplier.phone && (
          <View style={styles.metaRow}>
            <Icon name="call-outline" size={11} color="#aaa" />
            <Text style={styles.metaText}>{supplier.phone}</Text>
          </View>
        )}

        {!!supplier.address && (
          <View style={styles.metaRow}>
            <Icon name="location-outline" size={11} color="#aaa" />
            <Text style={styles.metaText}>{supplier.address}</Text>
          </View>
        )}

        <View style={styles.metaRow}>
          <Icon name="wallet-outline" size={11} color="#aaa" />
          <Text style={styles.metaText}>
            Opening balance: ₹{Number(supplier.openingBalance) || 0}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => onEdit(supplier)}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Icon name="pencil-outline" size={15} color="#1a73e8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconBtn, styles.iconBtnRed]}
          onPress={() => onDelete(supplier)}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          <Icon name="trash-outline" size={15} color="#dc3545" />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#16a34a',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
    gap: 7,
    marginLeft: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnRed: {
    backgroundColor: '#FEE8EB',
  },
});