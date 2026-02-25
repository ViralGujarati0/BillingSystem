import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import useSupplierViewModel from '../viewmodels/SupplierViewModel';

const SupplierListScreen = ({ navigation }) => {
  const vm = useSupplierViewModel();
  const owner = vm.owner;
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const ownerRole = owner?.role;
    const shopId = vm.shopId;
    const subscribe = vm.subscribeSuppliers;
    if (!ownerRole || ownerRole !== 'OWNER' || !shopId) return;
    setLoading(true);
    const unsubscribe = subscribe((list) => {
      setSuppliers(list);
      setLoading(false);
    });
    return unsubscribe;
  }, [owner?.role, vm.shopId, vm.subscribeSuppliers]);

  if (!owner || owner.role !== 'OWNER') {
    return (
      <View style={styles.center}>
        <Text>Only owners can access suppliers.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SupplierCreate')}>
          <Text style={styles.linkText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Suppliers</Text>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.muted}>Loading...</Text>
        </View>
      ) : suppliers.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.muted}>No suppliers yet.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('SupplierCreate')}>
            <Text style={styles.primaryText}>Create Supplier</Text>
          </TouchableOpacity>
        </View>
      ) : (
        suppliers.map((s) => (
          <View key={s.id} style={styles.card}>
            <Text style={styles.cardTitle}>{s.name}</Text>
            {!!s.phone && <Text style={styles.cardMeta}>Phone: {s.phone}</Text>}
            {!!s.address && <Text style={styles.cardMeta}>Address: {s.address}</Text>}
            <Text style={styles.cardMeta}>Opening balance: ₹{Number(s.openingBalance) || 0}</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={() => navigation.navigate('SupplierEdit', { supplier: s })}>
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert(
                    'Delete supplier',
                    `Are you sure you want to delete ${s.name}?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Yes, Delete',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await vm.deleteSupplier(s.id);
                          } catch (e) {
                            Alert.alert('Error', e?.message || 'Failed to delete supplier.');
                          }
                        },
                      },
                    ]
                  )
                }
              >
                <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 56, paddingBottom: 40 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  backText: { color: '#1a73e8', fontSize: 16 },
  linkText: { color: '#1a73e8', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  muted: { color: '#666', marginTop: 12 },
  card: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  cardMeta: { color: '#444', marginBottom: 2 },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 10 },
  actionText: { color: '#1a73e8', fontWeight: '600' },
  deleteText: { color: '#c00' },
  button: { backgroundColor: '#1a73e8', padding: 14, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  primaryButton: { backgroundColor: '#1a73e8', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 12 },
  primaryText: { color: '#fff', fontWeight: '600' },
});

export default SupplierListScreen;

