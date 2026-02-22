import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  currentOwnerAtom,
  scanResultBarcodeAtom,
  scanResultProductAtom,
  scanResultInventoryAtom,
  scanResultLoadingAtom,
  scanResultErrorAtom,
} from '../atoms/owner';
import { getProductByBarcode, getInventoryItem } from '../services/firestore';

const LOG = true;
const log = (...args) => { if (LOG) console.log('[ProductScanResult]', ...args); };

const ProductScanResultScreen = ({ navigation, route }) => {
  const { barcode } = route.params || {};
  const owner = useAtomValue(currentOwnerAtom);
  const scanResultBarcode = useAtomValue(scanResultBarcodeAtom);
  const product = useAtomValue(scanResultProductAtom);
  const inventory = useAtomValue(scanResultInventoryAtom);
  const loading = useAtomValue(scanResultLoadingAtom);
  const error = useAtomValue(scanResultErrorAtom);
  const setScanResultBarcode = useSetAtom(scanResultBarcodeAtom);
  const setScanResultProduct = useSetAtom(scanResultProductAtom);
  const setScanResultInventory = useSetAtom(scanResultInventoryAtom);
  const setScanResultLoading = useSetAtom(scanResultLoadingAtom);
  const setScanResultError = useSetAtom(scanResultErrorAtom);

  useEffect(() => {
    if (!barcode || !owner?.shopId) {
      log('Missing input:', { barcode: barcode ?? 'null', shopId: owner?.shopId ?? 'null' });
      setScanResultLoading(false);
      setScanResultProduct(null);
      setScanResultInventory(null);
      setScanResultError(barcode ? 'Missing shop.' : 'Missing barcode or shop.');
      setScanResultBarcode(null);
      return;
    }
    let cancelled = false;
    const shopId = owner.shopId;
    log('Fetching for barcode:', barcode, 'shopId:', shopId);
    setScanResultError(null);
    setScanResultLoading(true);
    setScanResultProduct(null);
    setScanResultInventory(null);
    setScanResultBarcode(barcode);
    (async () => {
      try {
        const [productDoc, inventoryDoc] = await Promise.all([
          getProductByBarcode(barcode),
          getInventoryItem(shopId, barcode),
        ]);
        if (cancelled) {
          log('Fetch cancelled for barcode:', barcode);
          return;
        }
        log('Fetch done:', {
          barcode,
          productExists: productDoc != null,
          productId: productDoc?.id,
          inventoryExists: inventoryDoc != null,
          inventoryId: inventoryDoc?.id,
        });
        setScanResultProduct(productDoc);
        setScanResultInventory(inventoryDoc);
      } catch (e) {
        if (!cancelled) {
          log('Fetch error:', e.message);
          setScanResultError(e.message);
        }
      } finally {
        if (!cancelled) setScanResultLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [barcode, owner?.shopId, setScanResultBarcode, setScanResultProduct, setScanResultInventory, setScanResultLoading, setScanResultError]);

  const handleAddToInventory = () => {
    navigation.navigate('InventoryForm', { barcode, product });
  };

  const handleCreateProduct = () => {
    navigation.navigate('CreateProduct', { barcode });
  };

  if (!barcode) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>No barcode.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!owner?.shopId) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>No shop. Create a shop first.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a73e8" />
        <Text style={styles.loadingText}>Checking product...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Only use product/inventory if they are for THIS barcode (avoid showing stale result from another scan)
  const isResultForThisBarcode = scanResultBarcode === barcode;
  const productForThisScan = isResultForThisBarcode ? product : null;
  const inventoryForThisScan = isResultForThisBarcode ? inventory : null;

  // Case 2: Product does NOT exist globally → Create Product
  if (!productForThisScan) {
    log('Showing branch: Create Product (product not in billing_products)', { barcode, scanResultBarcode });
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Product not found</Text>
        <Text style={styles.barcode}>Barcode: {barcode}</Text>
        <Text style={styles.hint}>Create this product and add it to your inventory.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={handleCreateProduct}>
          <Text style={styles.buttonText}>Create Product</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Case 1: Product exists in global billing_products
  // "Already present in inventory" ONLY when this shop's inventory doc exists for this barcode
  const hasInventoryInThisShop = inventoryForThisScan != null && typeof inventoryForThisScan === 'object';
  log('Showing branch:', hasInventoryInThisShop ? 'Already present in inventory' : 'Add To Inventory', {
    barcode,
    scanResultBarcode,
    hasInventoryInThisShop,
    inventoryIsNull: inventoryForThisScan === null,
    inventoryType: typeof inventoryForThisScan,
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Product details</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Barcode</Text>
        <Text style={styles.value}>{product.barcode || barcode}</Text>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{product.name}</Text>
        <Text style={styles.label}>Category</Text>
        <Text style={styles.value}>{product.category}</Text>
        <Text style={styles.label}>MRP</Text>
        <Text style={styles.value}>₹{product.mrp}</Text>
        <Text style={styles.label}>GST %</Text>
        <Text style={styles.value}>{product.gstPercent}%</Text>
        {hasInventoryInThisShop && inventoryForThisScan && (
          <>
            <Text style={styles.label}>Selling price</Text>
            <Text style={styles.value}>₹{inventoryForThisScan.sellingPrice}</Text>
            <Text style={styles.label}>Stock</Text>
            <Text style={styles.value}>{inventoryForThisScan.stock}</Text>
          </>
        )}
      </View>

      {hasInventoryInThisShop ? (
        <View style={styles.messageBox}>
          <Text style={styles.messageBoxText}>Already present in inventory</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.primaryButton} onPress={handleAddToInventory}>
          <Text style={styles.buttonText}>Add To Inventory</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 56 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 24 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: '#1a73e8', fontSize: 16 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  barcode: { fontSize: 16, color: '#666', marginBottom: 16 },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  message: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
  errorText: { fontSize: 16, color: '#c00', marginBottom: 20, textAlign: 'center' },
  hint: { fontSize: 14, color: '#666', marginBottom: 24 },
  card: { backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 24 },
  label: { fontSize: 12, color: '#666', marginTop: 8 },
  value: { fontSize: 16, fontWeight: '500' },
  button: { backgroundColor: '#1a73e8', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  primaryButton: { backgroundColor: '#1a73e8', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
  messageBox: { backgroundColor: '#e8f5e9', padding: 16, borderRadius: 8, alignItems: 'center' },
  messageBoxText: { fontSize: 16, color: '#2e7d32', fontWeight: '500' },
});

export default ProductScanResultScreen;
