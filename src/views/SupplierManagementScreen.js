import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAtom } from 'jotai';
import { atom } from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';

import AppHeaderLayout from '../components/AppHeaderLayout';
import SupplierCard from '../components/SupplierCard';
import useSupplierViewModel from '../viewmodels/SupplierViewModel';

// local atoms scoped to this screen
const suppliersAtom = atom([]);
const loadingAtom   = atom(true);

export default function SupplierManagementScreen({ navigation }) {
  const vm = useSupplierViewModel();

  const [suppliers, setSuppliers] = useAtom(suppliersAtom);
  const [loading, setLoading]     = useAtom(loadingAtom);

  useEffect(() => {
    if (!vm.shopId) return;

    setLoading(true);

    const unsubscribe = vm.subscribeSuppliers((list) => {
      setSuppliers(list);
      setLoading(false);
    });

    return unsubscribe;
  }, [vm.shopId]);

  const handleDelete = useCallback((supplier) => {
    Alert.alert(
      'Delete Supplier',
      `Delete "${supplier.name}" permanently?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await vm.deleteSupplier(supplier.id);
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  }, [vm]);

  const handleEdit = useCallback(
    (supplier) => navigation.navigate('SupplierForm', { supplier }),
    [navigation]
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyWrap}>
        <Icon name="business-outline" size={52} color="#d0d8e8" />
        <Text style={styles.emptyTitle}>No suppliers yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the button below to add your first supplier.
        </Text>
      </View>
    );
  };

  return (
    <AppHeaderLayout title="Supplier Management">

      <View style={styles.container}>

        {suppliers.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {suppliers.length} {suppliers.length === 1 ? 'supplier' : 'suppliers'}
            </Text>
          </View>
        )}

        {loading && suppliers.length === 0 ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#16a34a" />
          </View>
        ) : (
          <FlatList
            data={suppliers}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <SupplierCard
                supplier={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

      </View>

      {/* Floating Add Supplier button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('SupplierForm')}
        activeOpacity={0.85}
      >
        <Icon name="add" size={24} color="#fff" />
        <Text style={styles.fabText}>Add Supplier</Text>
      </TouchableOpacity>

    </AppHeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  countBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    left: 20,
    backgroundColor: '#16a34a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 4,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  fabText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});