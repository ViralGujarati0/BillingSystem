import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAtomValue } from 'jotai';
import { currentOwnerAtom } from '../atoms/owner';
import { getProductByBarcode, getInventoryItem, setInventoryItem, deleteInventoryItem } from '../services/firestore';

const UpdateInventoryScreen = ({ navigation, route }) => {
  const { barcode } = route.params || {};
  const owner = useAtomValue(currentOwnerAtom);
  const shopId = owner?.shopId;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [sellingPrice, setSellingPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [stock, setStock] = useState('');
  const [expiry, setExpiry] = useState('');

  useEffect(() => {
    if (!barcode || !owner || owner.role !== 'OWNER' || !shopId) {
      Alert.alert('Error', 'Only owners with a shop can update inventory.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [prod, inv] = await Promise.all([
          getProductByBarcode(barcode),
          getInventoryItem(shopId, barcode),
        ]);
        if (cancelled) return;

        if (!inv) {
          Alert.alert(
            'Not in inventory',
            'This product is not in your inventory.',
            [{ text: 'OK', onPress: () => navigation.goBack() }],
          );
          return;
        }

        setProduct(prod);
        setInventory(inv);
        setSellingPrice(inv.sellingPrice != null ? String(inv.sellingPrice) : '');
        setPurchasePrice(inv.purchasePrice != null ? String(inv.purchasePrice) : '');
        setStock(inv.stock != null ? String(inv.stock) : '');
        setExpiry(inv.expiry || '');
      } catch (e) {
        if (!cancelled) {
          Alert.alert('Error', e?.message || 'Failed to load inventory.');
          navigation.goBack();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [barcode, owner, shopId, navigation]);

  const handleSave = async () => {
    if (!shopId || !inventory?.barcode) {
      Alert.alert('Error', 'Missing shop or inventory item.');
      return;
    }

    const sell = Number.parseFloat(String(sellingPrice));
    const purchase = Number.parseFloat(String(purchasePrice));
    const stockNum = Number.parseInt(String(stock), 10);

    if (!Number.isFinite(sell) || sell < 0) {
      Alert.alert('Error', 'Enter a valid selling price (0 or more).');
      return;
    }
    if (!Number.isFinite(purchase) || purchase < 0) {
      Alert.alert('Error', 'Enter a valid purchase price (0 or more).');
      return;
    }
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      Alert.alert('Error', 'Enter a valid stock quantity (0 or more).');
      return;
    }

    try {
      await setInventoryItem(shopId, {
        barcode: inventory.barcode,
        sellingPrice: sell,
        purchasePrice: purchase,
        stock: stockNum,
        expiry: (expiry || '').trim(),
      });
      Alert.alert('Success', 'Inventory updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to update inventory.');
    }
  };

  const confirmDelete = () => {
    if (!inventory) return;
    const currentStock = Number(inventory.stock) || 0;

    const message =
      currentStock > 0
        ? `You still have ${currentStock} items in stock.\nAre you sure you want to delete this product from inventory?`
        : 'Are you sure you want to delete this product from inventory?';

    Alert.alert('Delete from inventory', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Delete',
        style: 'destructive',
        onPress: handleDelete,
      },
    ]);
  };

  const handleDelete = async () => {
    if (!shopId || !inventory?.barcode) return;
    try {
      await deleteInventoryItem(shopId, inventory.barcode);
      Alert.alert('Deleted', 'Product removed from your inventory.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Failed to delete inventory item.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading inventory...</Text>
      </View>
    );
  }

  if (!inventory) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>No inventory for this product.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const effectiveProductName = product?.name || '—';
  const effectiveBarcode = product?.barcode || inventory.barcode || barcode;
  const mrp = product?.mrp != null ? product.mrp : '—';
  const currentStock = inventory.stock != null ? inventory.stock : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={confirmDelete}>
          <Icon name="trash-outline" size={22} color="#c00" />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Update Inventory</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Product info</Text>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{effectiveProductName}</Text>
        <Text style={styles.label}>Barcode</Text>
        <Text style={styles.value}>{effectiveBarcode}</Text>
        <Text style={styles.label}>MRP</Text>
        <Text style={styles.value}>₹{mrp}</Text>
        <Text style={styles.label}>Current stock</Text>
        <Text style={styles.value}>{currentStock}</Text>
      </View>

      <Text style={styles.sectionTitle}>Edit inventory</Text>

      <Text style={styles.inputLabel}>Selling price (₹)</Text>
      <TextInput
        style={styles.input}
        value={sellingPrice}
        onChangeText={setSellingPrice}
        keyboardType="decimal-pad"
        placeholder="Selling price"
      />

      <Text style={styles.inputLabel}>Purchase price (₹)</Text>
      <TextInput
        style={styles.input}
        value={purchasePrice}
        onChangeText={setPurchasePrice}
        keyboardType="decimal-pad"
        placeholder="Purchase price"
      />

      <Text style={styles.inputLabel}>Stock</Text>
      <TextInput
        style={styles.input}
        value={stock}
        onChangeText={setStock}
        keyboardType="number-pad"
        placeholder="Stock quantity"
      />

      <Text style={styles.inputLabel}>Expiry (optional)</Text>
      <TextInput
        style={styles.input}
        value={expiry}
        onChangeText={setExpiry}
        placeholder="YYYY-MM-DD e.g. 2026-05-01"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Update Inventory</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 56, paddingBottom: 40 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  loadingText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: { color: '#1a73e8', fontSize: 16 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  label: { fontSize: 12, color: '#777', marginTop: 6 },
  value: { fontSize: 15, fontWeight: '500' },
  inputLabel: { fontSize: 14, marginBottom: 6, color: '#333' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1a73e8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  saveButton: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { color: '#fff', fontWeight: '600' },
});

export default UpdateInventoryScreen;

