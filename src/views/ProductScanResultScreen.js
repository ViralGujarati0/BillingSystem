import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useAtomValue, useSetAtom } from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';

import AppHeaderLayout   from '../components/AppHeaderLayout';
import HeaderBackButton  from '../components/HeaderBackButton';
import ProductInfoCard   from '../components/ProductInfoCard';
import ScanStatusBanner  from '../components/ScanStatusBanner';
import { colors }        from '../theme/colors';

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

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Loading state ────────────────────────────────────────────────────────────
const LoadingState = () => (
  <View style={styles.stateWrap}>
    <View style={styles.stateIconWrap}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
    <Text style={styles.stateTitle}>Checking product…</Text>
    <Text style={styles.stateSub}>Looking up barcode in database</Text>
  </View>
);

// ─── Error / guard state ──────────────────────────────────────────────────────
const ErrorState = ({ message, onBack }) => (
  <View style={styles.stateWrap}>
    <View style={[styles.stateIconWrap, styles.stateIconWrapError]}>
      <Icon name="alert-circle-outline" size={rfs(34)} color="#E05252" />
    </View>
    <Text style={styles.stateTitle}>Something went wrong</Text>
    <Text style={styles.stateSub}>{message}</Text>
    <TouchableOpacity style={styles.stateBtn} onPress={onBack} activeOpacity={0.8}>
      <Icon name="arrow-back-outline" size={rfs(15)} color="#FFFFFF" />
      <Text style={styles.stateBtnText}>Go Back</Text>
    </TouchableOpacity>
  </View>
);

// ─── Barcode box — shown when product not found ───────────────────────────────
const BarcodeBox = ({ barcode }) => (
  <View style={styles.barcodeBox}>
    <View style={styles.barcodeStripe} />
    <View style={styles.barcodeInner}>
      <View style={styles.barcodeIconWrap}>
        <Icon name="barcode-outline" size={rfs(18)} color={colors.primary} />
      </View>
      <View style={styles.barcodeTextBlock}>
        <Text style={styles.barcodeLabel}>SCANNED BARCODE</Text>
        <Text style={styles.barcodeValue}>{barcode}</Text>
      </View>
    </View>
  </View>
);

// ─── Primary action button ────────────────────────────────────────────────────
const PrimaryBtn = ({ label, icon, onPress }) => (
  <TouchableOpacity style={styles.primaryBtn} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.primaryIconBox}>
      <Icon name={icon} size={rfs(15)} color={colors.primary} />
    </View>
    <Text style={styles.primaryBtnText}>{label}</Text>
  </TouchableOpacity>
);

// ─── Secondary action button ──────────────────────────────────────────────────
const SecondaryBtn = ({ label, icon, onPress }) => (
  <TouchableOpacity style={styles.secondaryBtn} onPress={onPress} activeOpacity={0.8}>
    <Icon name={icon} size={rfs(15)} color={colors.primary} />
    <Text style={styles.secondaryBtnText}>{label}</Text>
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const ProductScanResultScreen = ({ navigation, route }) => {
  const { barcode, mode = 'default' } = route.params || {};
  const isCheckMode = mode === 'check';
  /** From billing scanner — same actions as stock add flow, copy nudges back to billing */
  const isBillingMode = mode === 'billing';

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

  // ── Logic unchanged ──────────────────────────────────────────────────────
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
  // ────────────────────────────────────────────────────────────────────────

  const headerBack = <HeaderBackButton onPress={() => navigation.goBack()} />;

  // ── Guard ────────────────────────────────────────────────────────────────
  if (!barcode || !owner?.shopId) {
    return (
      <AppHeaderLayout title="Scan Result" leftComponent={headerBack}>
        <ErrorState
          message="Missing barcode or shop information."
          onBack={() => navigation.goBack()}
        />
      </AppHeaderLayout>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <AppHeaderLayout title="Scan Result" leftComponent={headerBack}>
        <LoadingState />
      </AppHeaderLayout>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <AppHeaderLayout title="Scan Result" leftComponent={headerBack}>
        <ErrorState message={error} onBack={() => navigation.goBack()} />
      </AppHeaderLayout>
    );
  }

  const isMatchingResult  = scanResultBarcode === barcode;
  const resolvedProduct   = isMatchingResult ? product   : null;
  const resolvedInventory = isMatchingResult ? inventory : null;
  const hasInventory      = resolvedInventory != null;

  // ── FLOW 3: Product not in global ───────────────────────────────────────
  if (!resolvedProduct) {
    return (
      <AppHeaderLayout
        title="Scan Result"
        subtitle="Product not found"
        leftComponent={headerBack}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ScanStatusBanner
            type="warning"
            message={
              isBillingMode
                ? 'Not in the catalog — create the product first, then add stock to bill it.'
                : 'This barcode is not in the database yet.'
            }
          />

          <BarcodeBox barcode={barcode} />

          <Text style={styles.hintText}>
            {isBillingMode
              ? 'Create this product (global catalog), then add it to your inventory — you can scan again on the billing screen to add it to the bill.'
              : 'Create this as a new product and it will be added to your inventory automatically.'}
          </Text>

          <PrimaryBtn
            label="Create Product"
            icon="add-circle-outline"
            onPress={() =>
              navigation.navigate('CreateProduct', {
                barcode,
                ...(isBillingMode && { returnToBillingScanner: true }),
              })
            }
          />

        </ScrollView>
      </AppHeaderLayout>
    );
  }

  // ── FLOW 1 (Check): In global + in inventory → info only ────────────────
  if (isCheckMode && hasInventory) {
    return (
      <AppHeaderLayout
        title="Scan Result"
        subtitle="In your inventory"
        leftComponent={headerBack}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ScanStatusBanner
            type="success"
            message="Product is in your inventory"
          />

          <ProductInfoCard
            product={resolvedProduct}
            barcode={barcode}
            inventory={resolvedInventory}
          />

        </ScrollView>
      </AppHeaderLayout>
    );
  }

  // ── FLOW 1 (Add): In global + in inventory → Update Inventory ───────────
  if (!isCheckMode && hasInventory) {
    return (
      <AppHeaderLayout
        title="Scan Result"
        subtitle="Already in inventory"
        leftComponent={headerBack}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ScanStatusBanner
            type="success"
            message="Product is already in your inventory"
          />

          <ProductInfoCard
            product={resolvedProduct}
            barcode={barcode}
            inventory={resolvedInventory}
          />

          <SecondaryBtn
            label="Update Inventory"
            icon="create-outline"
            onPress={() => navigation.navigate('UpdateInventory', { barcode })}
          />

        </ScrollView>
      </AppHeaderLayout>
    );
  }

  // ── FLOW 2: In global but NOT in inventory (both modes) ─────────────────
  return (
    <AppHeaderLayout
      title="Scan Result"
      subtitle="Not in inventory"
      leftComponent={headerBack}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScanStatusBanner
          type="info"
          message={
            isBillingMode
              ? 'In the catalog but not in your shop — add stock to sell it on this bill.'
              : 'Product found — not yet in your inventory'
          }
        />

        <ProductInfoCard
          product={resolvedProduct}
          barcode={barcode}
          inventory={null}
        />

        <PrimaryBtn
          label="Add to Inventory"
          icon="add-circle-outline"
          onPress={() =>
            navigation.navigate('InventoryForm', {
              barcode,
              product: resolvedProduct,
              ...(isBillingMode && { returnToBillingScanner: true }),
            })
          }
        />

      </ScrollView>
    </AppHeaderLayout>
  );
};

export default ProductScanResultScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── Scroll ───────────────────────────────────────────────
  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(16),
    paddingBottom: rvs(48),
    gap: rvs(12),
  },

  // ── Hint text ────────────────────────────────────────────
  hintText: {
    fontSize: rfs(13),
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: rfs(19),
    textAlign: 'center',
    paddingHorizontal: rs(8),
  },

  // ── Barcode box ──────────────────────────────────────────
  barcodeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 2,
    flexDirection: 'row',
    overflow: 'hidden',
  },

  barcodeStripe: {
    width: rs(3),
    backgroundColor: colors.accent,
    flexShrink: 0,
  },

  barcodeInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    paddingHorizontal: rs(14),
    paddingVertical: rvs(14),
  },

  barcodeIconWrap: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(11),
    backgroundColor: 'rgba(45,74,82,0.06)',
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  barcodeTextBlock: {
    flex: 1,
    gap: rvs(3),
  },

  barcodeLabel: {
    fontSize: rfs(9),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.6,
  },

  barcodeValue: {
    fontSize: rfs(16),
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },

  // ── Primary button ───────────────────────────────────────
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(10),
    backgroundColor: colors.primary,
    borderRadius: rs(14),
    paddingVertical: rvs(15),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.30,
    shadowRadius: rs(12),
    elevation: 5,
  },

  primaryIconBox: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(8),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryBtnText: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // ── Secondary button ─────────────────────────────────────
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(8),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(14),
    paddingVertical: rvs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(8),
    elevation: 2,
  },

  secondaryBtnText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: colors.primary,
  },

  // ── Loading / error states ───────────────────────────────
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: rs(32),
    gap: rvs(10),
  },

  stateIconWrap: {
    width: rs(72),
    height: rs(72),
    borderRadius: rs(20),
    backgroundColor: 'rgba(45,74,82,0.06)',
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rvs(4),
  },

  stateIconWrapError: {
    backgroundColor: 'rgba(224,82,82,0.06)',
    borderColor: 'rgba(224,82,82,0.20)',
  },

  stateTitle: {
    fontSize: rfs(17),
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  stateSub: {
    fontSize: rfs(13),
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: rfs(19),
  },

  stateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    backgroundColor: colors.primary,
    borderRadius: rs(12),
    paddingHorizontal: rs(20),
    paddingVertical: rvs(12),
    marginTop: rvs(8),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(3) },
    shadowOpacity: 0.25,
    shadowRadius: rs(8),
    elevation: 4,
  },

  stateBtnText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },

});