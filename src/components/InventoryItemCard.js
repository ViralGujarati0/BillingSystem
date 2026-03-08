import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';
import useInventoryViewModel from '../viewmodels/InventoryViewModel';

const InventoryItemCard = ({ item, onPress }) => {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const vm = useInventoryViewModel();

  const handleDelete = () => {
    const currentStock = Number(item.stock) || 0;

    const message =
      currentStock > 0
        ? `You still have ${currentStock} items in stock.\nAre you sure you want to delete this product from inventory?`
        : 'Are you sure you want to delete this product from inventory?';

    Alert.alert('Delete from inventory', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await vm.deleteInventory({ barcode: item.barcode });
          } catch (e) {
            Alert.alert('Error', e?.message || 'Failed to delete inventory item.');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => setExpanded(v => !v)} activeOpacity={0.85}>

      {/* ── Collapsed row ── */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.barcode}>{item.barcode}</Text>
        </View>
        <Text style={styles.stock}>Stock: {item.stock ?? 0}</Text>
      </View>

      {/* ── Expanded details ── */}
      {expanded && (
        <View style={styles.details}>

          <Text style={styles.detailText}>MRP: ₹{item.mrp ?? 0}</Text>
          <Text style={styles.detailText}>Selling Price: ₹{item.sellingPrice ?? 0}</Text>

          <View style={styles.btnRow}>

            <TouchableOpacity
              style={styles.updateBtn}
              onPress={() => onPress?.(item)}
            >
              <Text style={styles.updateText}>Update Inventory</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteBtn, deleting && styles.btnDisabled]}
              onPress={handleDelete}
              disabled={deleting}
            >
              <Icon name="trash-outline" size={16} color="#fff" />
            </TouchableOpacity>

          </View>

        </View>
      )}

    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderCard,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  barcode: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stock: {
    fontSize: 14,
    color: colors.primary,
  },
  details: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 10,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 6,
    color: colors.textPrimary,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  updateBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  updateText: {
    color: colors.textLight,
    fontWeight: '600',
  },
  deleteBtn: {
    width: 40,
    backgroundColor: '#dc3545',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
});

export default InventoryItemCard;