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

import AppHeaderLayout    from '../components/AppHeaderLayout';
import ProductInfoCard    from '../components/ProductInfoCard';
import ScanStatusBanner  from '../components/ScanStatusBanner';

import {
  currentOwnerAtom,
  scanResultBarcodeAtom,
  scanResultProductAtom,
  scanResultInventoryAtom,
  scanResultLoadingAtom,
  scanResultErrorAtom,
} from '../atoms/owner';

import { getProductByBarcode } from '../services/productService';
import { getInventoryItem }    from '../services/inventoryService';

const ProductScanResultScreen = ({ navigation, route }) => {
  const { barcode, mode = 'default' } = route.params || {};
  const isCheckMode = mode === 'check';

  const owner = useAtomValue(currentOwnerAtom);

  const scanResultBarcode  = useAtomValue(scanResultBarcodeAtom);
  const product            = useAtomValue(scanResultProductAtom);
  const inventory          = useAtomValue(scanResultInventoryAtom);
  const loading            = useAtomValue(scanResultLoadingAtom);
  const error              = useAtomValue(scanResultErrorAtom);

  const setScanResultBarcode   = useSetAtom(scanResultBarcodeAtom);
  const setScanResultProduct   = useSetAtom(scanResultProductAtom);
  const setScanResultInventory = useSetAtom(scanResultInventoryAtom);
  const setScanResultLoading   = useSetAtom(scanResultLoadingAtom);
  const setScanResultError     = useSetAtom(scanResultErrorAtom);

  useEffect(() => {
    if (!barcode || !owner?.shopId) {
      setScanResultLoading(false);
      setScanResultProduct(null);
      setScanResultInventory(null);
      setScanResultError(barcode ? 'Missing shop.' : 'Missing barcode or shop.');
      setScanResultBarcode(null);
      return;
    }

    let cancelled = false;
    const shopId  = owner.shopId;

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
        if (cancelled) return;
        setScanResultProduct(productDoc);
        setScanResultInventory(inventoryDoc);
      } catch (e) {
        if (!cancelled) setScanResultError(e.message);
      } finally {
        if (!cancelled) setScanResultLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [barcode, owner?.shopId]);

  // ── Guard ────────────────────────────────────────────────────────────────
  if (!barcode || !owner?.shopId) {
    return (
      <AppHeaderLayout title="Scan Result">
        <View style={styles.center}>
          <Text style={styles.errorText}>Missing barcode or shop.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>Back</Text>
          </TouchableOpacity>
        </View>
      </AppHeaderLayout>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <AppHeaderLayout title="Scan Result">
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1a73e8" />
          <Text style={styles.loadingText}>Checking product...</Text>
        </View>
      </AppHeaderLayout>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <AppHeaderLayout title="Scan Result">
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
            <Text style={styles.btnText}>Back</Text>
          </TouchableOpacity>
        </View>
      </AppHeaderLayout>
    );
  }

  const isMatchingResult  = scanResultBarcode === barcode;
  const resolvedProduct   = isMatchingResult ? product   : null;
  const resolvedInventory = isMatchingResult ? inventory : null;
  const hasInventory      = resolvedInventory != null;

  // ── FLOW 3: Product not in global ───────────────────────────────────────
  // Same for both Check and Add — show "Product not found" + Create button
  if (!resolvedProduct) {
    return (
      <AppHeaderLayout title="Scan Result">
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          <ScanStatusBanner type="warning" message="Product not found in database" />

          <View style={styles.barcodeBox}>
            <Text style={styles.barcodeLabel}>Scanned barcode</Text>
            <Text style={styles.barcodeValue}>{barcode}</Text>
          </View>

          <Text style={styles.hint}>
            This barcode doesn't exist yet. Create it as a new product and it
            will be added to your inventory.
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('CreateProduct', { barcode })}
          >
            <Text style={styles.primaryBtnText}>Create Product</Text>
          </TouchableOpacity>

        </ScrollView>
      </AppHeaderLayout>
    );
  }

  // ── FLOW 1 (Check): In global + in inventory → info only, no action ─────
  if (isCheckMode && hasInventory) {
    return (
      <AppHeaderLayout title="Scan Result">
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          <ScanStatusBanner type="success" message="Product is in your inventory" />

          <ProductInfoCard
            product={resolvedProduct}
            barcode={barcode}
            inventory={resolvedInventory}
          />

        </ScrollView>
      </AppHeaderLayout>
    );
  }

  // ── FLOW 1 (Add): In global + in inventory → show Update Inventory button
  if (!isCheckMode && hasInventory) {
    return (
      <AppHeaderLayout title="Scan Result">
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          <ScanStatusBanner type="success" message="Product is already in your inventory" />

          <ProductInfoCard
            product={resolvedProduct}
            barcode={barcode}
            inventory={resolvedInventory}
          />

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.navigate('UpdateInventory', { barcode })}
          >
            <Text style={styles.secondaryBtnText}>Update Inventory</Text>
          </TouchableOpacity>

        </ScrollView>
      </AppHeaderLayout>
    );
  }

  // ── FLOW 2: In global but NOT in inventory (same for both modes) ─────────
  return (
    <AppHeaderLayout title="Scan Result">
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <ScanStatusBanner type="info" message="Product found — not yet in your inventory" />

        <ProductInfoCard
          product={resolvedProduct}
          barcode={barcode}
          inventory={null}
        />

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() =>
            navigation.navigate('InventoryForm', {
              barcode,
              product: resolvedProduct,
            })
          }
        >
          <Text style={styles.primaryBtnText}>Add to Inventory</Text>
        </TouchableOpacity>

      </ScrollView>
    </AppHeaderLayout>
  );
};

export default ProductScanResultScreen;

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#666',
  },
  errorText: {
    fontSize: 15,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  barcodeBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  barcodeLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  barcodeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    letterSpacing: 1,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryBtn: {
    borderWidth: 1.5,
    borderColor: '#1a73e8',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#1a73e8',
    fontWeight: '700',
    fontSize: 15,
  },
  btn: {
    backgroundColor: '#1a73e8',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});