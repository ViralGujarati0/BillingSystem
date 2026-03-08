import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

/**
 * Check → 'check' mode → ProductScanResultScreen
 *   Flow 1: in global + in inventory     → info from both + "Already in inventory" message
 *   Flow 2: in global + NOT in inventory → global info + "Add to Inventory" button
 *   Flow 3: NOT in global                → "Product not found" + "Create Product" button
 *
 * Update → 'updateInventory' mode → UpdateInventoryScreen
 *   Edit selling price, stock, expiry of existing inventory item
 *
 * Add → default mode → ProductScanResultScreen
 *   Flow 1: in global + in inventory     → info from both + "Update Inventory" button
 *   Flow 2: in global + NOT in inventory → global info + "Add to Inventory" button
 *   Flow 3: NOT in global                → "Product not found" + "Create Product" button
 */
const InventoryQuickActions = ({ navigation }) => {
  return (
    <View style={styles.container}>

      <ActionButton
        icon="search-outline"
        label="Check"
        onPress={() =>
          navigation.navigate('BarcodeScanner', { mode: 'check' })
        }
      />

      <ActionButton
        icon="refresh-outline"
        label="Update"
        onPress={() =>
          navigation.navigate('BarcodeScanner', { mode: 'updateInventory' })
        }
      />

      <ActionButton
        icon="add-circle-outline"
        label="Add"
        onPress={() => navigation.navigate('BarcodeScanner')}
      />

    </View>
  );
};

function ActionButton({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.action} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
    paddingHorizontal: 8,
  },
  action: {
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

export default InventoryQuickActions;