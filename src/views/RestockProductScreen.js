import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAtomValue } from 'jotai';

import AppHeaderLayout from '../components/AppHeaderLayout';
import HeaderBackButton from '../components/HeaderBackButton';
import FormInputField from '../components/FormInputField';
import SupplierDropdown from '../components/SupplierDropdown';
import { currentOwnerAtom } from '../atoms/owner';
import { productCacheAtom } from '../atoms/productCache';
import { listSuppliers } from '../services/supplierService';
import { createPurchaseInvoice } from '../services/purchaseService';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs = SCREEN_H / 844;
const rs = (n) => Math.round(n * scale);
const rvs = (n) => Math.round(n * vs);
const rfs = (n) => Math.round(n * Math.min(scale, vs));

const SectionLabel = ({ icon, label }) => (
  <View style={styles.sectionLabel}>
    <View style={styles.sectionBar} />
    <Icon name={icon} size={rfs(12)} color={colors.accent} />
    <Text style={styles.sectionText}>{label}</Text>
    <View style={styles.sectionLine} />
  </View>
);

export default function RestockProductScreen({ navigation, route }) {
  const owner = useAtomValue(currentOwnerAtom);
  const products = useAtomValue(productCacheAtom);
  const shopId = owner?.shopId;

  const initialItem = route.params?.item || null;
  const initialItems = Array.isArray(route.params?.items) ? route.params.items : [];

  const [items, setItems] = useState(initialItems);
  const [selectedBarcode, setSelectedBarcode] = useState(initialItem?.barcode || '');
  const [suppliers, setSuppliers] = useState([]);
  const [supplierId, setSupplierId] = useState('');
  const [qty, setQty] = useState('1');
  const [purchasePrice, setPurchasePrice] = useState(
    initialItem?.lastPurchasePrice != null ? String(initialItem.lastPurchasePrice) : ''
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!shopId) return;
    let cancelled = false;

    (async () => {
      try {
        const list = await listSuppliers(shopId);
        if (cancelled) return;
        setSuppliers(list);
        if (list.length > 0) {
          setSupplierId(initialItem?.supplierId || list[0].id);
        }
      } catch (error) {
        if (!cancelled) {
          Alert.alert('Error', error?.message || 'Failed to load suppliers.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shopId]);

  useEffect(() => {
    if (initialItems.length > 0) return;
    if (!initialItem) return;
    setItems([initialItem]);
  }, [initialItem, initialItems.length]);

  useEffect(() => {
    if (selectedBarcode) return;
    if (items.length === 0) return;
    setSelectedBarcode(String(items[0].barcode || ''));
  }, [items, selectedBarcode]);

  const enrichedItems = useMemo(
    () =>
      items.map((it) => {
        const product = products?.[String(it.barcode)] || null;
        const stock = Number(it.stock) || 0;
        return {
          ...it,
          displayName: it.name || product?.name || 'Unknown Product',
          mrp: it.mrp ?? product?.mrp ?? null,
          stock,
        };
      }),
    [items, products]
  );

  const selectedItem = useMemo(
    () => enrichedItems.find((it) => String(it.barcode) === String(selectedBarcode)) || null,
    [enrichedItems, selectedBarcode]
  );

  const numericQty = parseInt(String(qty), 10) || 0;
  const numericRate = parseFloat(String(purchasePrice)) || 0;
  const subtotal = Math.max(0, numericQty * numericRate);

  const handleSelectProduct = (barcode) => {
    setSelectedBarcode(barcode);
    const item = items.find((it) => String(it.barcode) === String(barcode));
    if (item?.lastPurchasePrice != null) {
      setPurchasePrice(String(item.lastPurchasePrice));
    } else {
      setPurchasePrice('');
    }
  };

  const handleRestock = async () => {
    if (!shopId) {
      Alert.alert('Error', 'Shop not found.');
      return;
    }
    if (!selectedItem?.barcode) {
      Alert.alert('Error', 'Select a product to restock.');
      return;
    }
    if (!supplierId) {
      Alert.alert('Error', 'Select supplier.');
      return;
    }
    if (!Number.isInteger(numericQty) || numericQty <= 0) {
      Alert.alert('Error', 'Quantity should be 1 or more.');
      return;
    }
    if (numericRate < 0) {
      Alert.alert('Error', 'Purchase price should be 0 or more.');
      return;
    }

    try {
      setSaving(true);
      await createPurchaseInvoice({
        supplierId,
        items: [
          {
            barcode: String(selectedItem.barcode),
            qty: numericQty,
            purchasePrice: numericRate,
          },
        ],
        // Restock from this flow is treated as paid purchase by default.
        paidAmount: subtotal,
      });
      Alert.alert('Success', 'Product restocked successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to restock product.');
    } finally {
      setSaving(false);
    }
  };

  const headerLeft = <HeaderBackButton onPress={() => navigation.goBack()} />;

  return (
    <AppHeaderLayout
      title="Restock Product"
      subtitle={selectedItem?.name || selectedItem?.barcode || 'Low stock item'}
      leftComponent={headerLeft}
    >
      {loading ? (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.stateText}>Loading restock form…</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <SectionLabel icon="cube-outline" label="PRODUCT" />
          <View style={styles.card}>
            {items.length <= 1 ? (
              <View style={styles.fixedProductRow}>
                <Icon name="cube-outline" size={rfs(16)} color={colors.primary} />
                <View style={styles.fixedProductTextWrap}>
                  <Text style={styles.fixedProductName}>
                    {selectedItem?.displayName || selectedItem?.barcode || 'Product'}
                  </Text>
                  {!!selectedItem?.barcode && (
                    <Text style={styles.fixedProductBarcode}>{selectedItem.barcode}</Text>
                  )}
                </View>
              </View>
            ) : (
              <View style={styles.productListWrap}>
                {enrichedItems.map((item) => {
                  const active = String(item.barcode) === String(selectedBarcode);
                  const stockStatus =
                    item.stock === 0 ? 'Out of stock' : item.stock <= 5 ? 'Low stock' : 'In stock';
                  return (
                    <TouchableOpacity
                      key={String(item.id || item.barcode)}
                      style={[styles.productOptionCard, active && styles.productOptionCardActive]}
                      onPress={() => handleSelectProduct(item.barcode)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.productOptionName, active && styles.productOptionNameActive]}>
                        {item.displayName}
                      </Text>
                      <Text style={styles.productOptionMeta}>Barcode: {item.barcode || '—'}</Text>
                      <Text style={styles.productOptionMeta}>Stock: {item.stock}</Text>
                      <Text style={styles.productOptionMeta}>Status: {stockStatus}</Text>
                      {item.mrp != null && (
                        <Text style={styles.productOptionMeta}>MRP: ₹{item.mrp}</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {selectedItem && (
            <View style={styles.productInfoCard}>
              <View style={styles.productInfoRow}>
                <Text style={styles.productInfoLabel}>Product</Text>
                <Text style={styles.productInfoValue}>{selectedItem.displayName}</Text>
              </View>
              <View style={styles.productInfoRow}>
                <Text style={styles.productInfoLabel}>Barcode</Text>
                <Text style={styles.productInfoValue}>{selectedItem.barcode || '—'}</Text>
              </View>
              <View style={styles.productInfoRow}>
                <Text style={styles.productInfoLabel}>Current Stock</Text>
                <Text style={styles.productInfoValue}>{selectedItem.stock}</Text>
              </View>
              {selectedItem.mrp != null && (
                <View style={styles.productInfoRow}>
                  <Text style={styles.productInfoLabel}>MRP</Text>
                  <Text style={styles.productInfoValue}>₹{selectedItem.mrp}</Text>
                </View>
              )}
            </View>
          )}

          <SectionLabel icon="business-outline" label="SUPPLIER" />
          <SupplierDropdown
            suppliers={suppliers}
            selectedId={supplierId}
            onSelect={setSupplierId}
          />
          {suppliers.length === 0 && (
            <TouchableOpacity
              style={styles.createSupplierBtn}
              onPress={() => navigation.navigate('SupplierForm')}
              activeOpacity={0.85}
            >
              <Icon name="add-circle-outline" size={rfs(14)} color={colors.primary} />
              <Text style={styles.createSupplierText}>Create Supplier</Text>
            </TouchableOpacity>
          )}

          <SectionLabel icon="cart-outline" label="RESTOCK DETAILS" />
          <View style={styles.card}>
            <FormInputField
              label="Quantity"
              required
              icon="layers-outline"
              value={qty}
              onChangeText={setQty}
              keyboardType="number-pad"
              placeholder="e.g. 12"
            />

            <View style={styles.divider} />

            <FormInputField
              label="Purchase Price (₹)"
              required
              icon="pricetag-outline"
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              keyboardType="decimal-pad"
              placeholder="e.g. 45"
            />

            <View style={styles.divider} />

            <View style={styles.totalWrap}>
              <Text style={styles.totalLabel}>Total Spending</Text>
              <Text style={styles.totalValue}>₹{subtotal.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleRestock}
            activeOpacity={0.85}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <View style={styles.saveIconBox}>
                  <Icon name="checkmark-outline" size={rfs(15)} color={colors.primary} />
                </View>
                <Text style={styles.saveBtnText}>Confirm Restock</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </AppHeaderLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(14),
    paddingBottom: rvs(48),
    gap: rvs(10),
  },
  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: rvs(8),
  },
  stateText: {
    fontSize: rfs(13),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(7),
    marginTop: rvs(2),
  },
  sectionBar: {
    width: rs(3),
    height: rvs(14),
    backgroundColor: colors.accent,
    borderRadius: rs(2),
    flexShrink: 0,
  },
  sectionText: {
    fontSize: rfs(10),
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.9,
  },
  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
    paddingHorizontal: rs(14),
    paddingVertical: rvs(16),
  },
  fixedProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
  },
  fixedProductTextWrap: {
    flex: 1,
    gap: rvs(2),
  },
  fixedProductName: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: colors.textPrimary,
  },
  fixedProductBarcode: {
    fontSize: rfs(11),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  productListWrap: {
    gap: rvs(8),
  },
  productOptionCard: {
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: rs(12),
    paddingHorizontal: rs(12),
    paddingVertical: rvs(10),
    backgroundColor: '#FFFFFF',
  },
  productOptionCardActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(45,74,82,0.08)',
  },
  productOptionName: {
    fontSize: rfs(13),
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: rvs(2),
  },
  productOptionNameActive: {
    color: colors.primary,
  },
  productOptionMeta: {
    fontSize: rfs(11),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  productInfoCard: {
    backgroundColor: 'rgba(45,74,82,0.05)',
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: rs(12),
    paddingHorizontal: rs(12),
    paddingVertical: rvs(10),
    gap: rvs(6),
  },
  productInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: rs(8),
  },
  productInfoLabel: {
    fontSize: rfs(11),
    color: colors.textSecondary,
    fontWeight: '600',
  },
  productInfoValue: {
    fontSize: rfs(12),
    color: colors.textPrimary,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginVertical: rvs(12),
  },
  totalWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: rfs(12),
    color: colors.textSecondary,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: rfs(18),
    color: colors.primary,
    fontWeight: '800',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(10),
    backgroundColor: colors.primary,
    borderRadius: rs(14),
    paddingVertical: rvs(15),
    marginTop: rvs(4),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.28,
    shadowRadius: rs(12),
    elevation: 5,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveIconBox: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(8),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  createSupplierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    marginTop: rvs(-6),
  },
  createSupplierText: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: colors.primary,
  },
});
