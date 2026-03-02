import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useAtomValue } from 'jotai';
import { colors } from '../theme/colors';
import { billingCartItemsAtom } from '../atoms/billing';

const ScannerHeaderCart = () => {
  const cartItems = useAtomValue(billingCartItemsAtom);

  // Latest scanned first
  const latestItems = useMemo(() => {
    return [...cartItems].reverse().slice(0, 5);
  }, [cartItems]);

  if (!latestItems.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Scan items to start billing</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={latestItems}
        keyExtractor={(item, index) => `${item.barcode || item.name}_${index}`}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.qty}>x{item.qty}</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    maxHeight: 180,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  name: {
    flex: 1,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  qty: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default ScannerHeaderCart;