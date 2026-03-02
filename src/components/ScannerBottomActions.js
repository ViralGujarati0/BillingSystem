import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAtomValue } from 'jotai';
import { billingCartItemsAtom } from '../atoms/billing';
import { colors } from '../theme/colors';

const ScannerBottomActions = ({ navigation, userDoc }) => {
  const cartItems = useAtomValue(billingCartItemsAtom);

  const itemCount = cartItems.reduce((s, i) => s + i.qty, 0);

  return (
    <View style={styles.container}>

      {/* Manual Add Button */}
      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => navigation.navigate('ManualItem')}
      >
        <Text style={styles.secondaryText}>Add Manual Item</Text>
      </TouchableOpacity>

      {/* Go To Bill */}
      <TouchableOpacity
        style={[
          styles.primaryBtn,
          itemCount === 0 && { opacity: 0.5 },
        ]}
        disabled={itemCount === 0}
        onPress={() =>
          navigation.navigate('BillingCart', { userDoc })
        }
      >
        <Text style={styles.primaryText}>
          Go To Bill ({itemCount})
        </Text>
      </TouchableOpacity>

      {/* Cancel */}
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>

    </View>
  );
};

export default ScannerBottomActions;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },

  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },

  secondaryText: {
    color: colors.primary,
    fontWeight: '600',
  },

  primaryBtn: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },

  primaryText: {
    color: colors.textLight,
    fontWeight: '600',
  },

  cancelBtn: {
    alignItems: 'center',
    padding: 10,
  },

  cancelText: {
    color: colors.textSecondary,
  },
});