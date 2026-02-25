import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  billingCartItemsAtom,
  billingCustomerNameAtom,
  billingPaymentTypeAtom,
  billingGenerateLoadingAtom,
} from '../atoms/billing';
import { getShop, getShopSettings } from '../services/firestore';
import useBillingViewModel from '../viewmodels/BillingViewModel';

const PAYMENT_OPTIONS = ['CASH', 'UPI', 'CARD'];

const BillingCartScreen = ({ navigation, route }) => {
  const { userDoc } = route.params || {};
  const shopId = userDoc?.shopId;
  const cartItems = useAtomValue(billingCartItemsAtom);
  const customerName = useAtomValue(billingCustomerNameAtom);
  const paymentType = useAtomValue(billingPaymentTypeAtom);
  const setCustomerName = useSetAtom(billingCustomerNameAtom);
  const setPaymentType = useSetAtom(billingPaymentTypeAtom);
  const loading = useAtomValue(billingGenerateLoadingAtom);
  const setLoading = useSetAtom(billingGenerateLoadingAtom);

  const vm = useBillingViewModel();

  const [shop, setShop] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    if (!shopId) return;
    let cancelled = false;
    (async () => {
      try {
        const { shop: s, settings: st } = await vm.loadShopAndSettings(shopId);
        if (!cancelled) {
          setShop(s);
          setSettings(st);
        }
      } catch (e) {
        if (!cancelled) setShop(null);
      }
    })();
    return () => { cancelled = true; };
  }, [shopId, vm]);

  const updateItemQty = (index, newQty) => {
    vm.updateItemQty(index, newQty);
  };

  const grandTotal = cartItems.reduce((s, i) => s + (i.amount || 0), 0);

  const handleGenerateBill = async () => {
    setLoading(true);
    try {
      await vm.generateBill({ userDoc, shop, settings });
      const backScreen = userDoc?.role === 'OWNER' ? 'OwnerTabs' : 'StaffHome';
      const backParams = userDoc ? { userDoc } : {};
      navigation.replace('BillSuccess', { backScreen, backParams });
    } catch (err) {
      const msg = err?.message || 'Failed to generate bill';
      const details = err?.details ? ` (${String(err.details)})` : '';
      Alert.alert('Error', msg + details);
    } finally {
      setLoading(false);
    }
  };

  if (!shopId) {
    return (
      <View style={styles.center}>
        <Text>No shop.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
          <Text style={styles.btnText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.shopName}>{shop?.businessName || '—'}</Text>
      <Text style={styles.shopAddress}>{shop?.address || shop?.phone || '—'}</Text>

      <Text style={styles.label}>Customer name</Text>
      <TextInput
        style={styles.input}
        value={customerName}
        onChangeText={setCustomerName}
        placeholder="Walk-in"
      />
      <Text style={styles.label}>Payment type</Text>
      <View style={styles.paymentRow}>
        {PAYMENT_OPTIONS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.paymentChip, paymentType === p && styles.paymentChipActive]}
            onPress={() => setPaymentType(p)}
          >
            <Text style={[styles.paymentChipText, paymentType === p && styles.paymentChipTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.tableHeader}>No | Product | Qty | Rate | Amount</Text>
      {cartItems.map((item, index) => (
        <View key={index} style={styles.row}>
          <Text style={styles.cellNo}>{index + 1}</Text>
          <Text style={styles.cellName} numberOfLines={1}>{item.name}</Text>
          <TextInput
            style={styles.qtyInput}
            value={String(item.qty)}
            onChangeText={(v) => updateItemQty(index, v)}
            keyboardType="number-pad"
          />
          <Text style={styles.cellRate}>₹{item.rate}</Text>
          <Text style={styles.cellAmt}>₹{item.amount}</Text>
        </View>
      ))}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Grand total</Text>
        <Text style={styles.totalValue}>₹{grandTotal}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('BillingScanner', { userDoc })}
      >
        <Text style={styles.buttonText}>Add more items</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleGenerateBill}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate bill</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingTop: 56, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 16 },
  backText: { color: '#1a73e8', fontSize: 16 },
  shopName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  shopAddress: { fontSize: 12, color: '#666', marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 6, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 6, marginBottom: 16 },
  paymentRow: { flexDirection: 'row', marginBottom: 16 },
  paymentChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginRight: 8 },
  paymentChipActive: { backgroundColor: '#1a73e8', borderColor: '#1a73e8' },
  paymentChipText: { fontSize: 14 },
  paymentChipTextActive: { color: '#fff', fontWeight: '600' },
  tableHeader: { fontSize: 12, color: '#666', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cellNo: { width: 24, fontSize: 12 },
  cellName: { flex: 1, fontSize: 14, marginRight: 8 },
  qtyInput: { width: 48, borderWidth: 1, borderColor: '#eee', padding: 4, fontSize: 14 },
  cellRate: { width: 48, fontSize: 12, marginLeft: 4 },
  cellAmt: { width: 56, fontSize: 12, fontWeight: '600', marginLeft: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, marginBottom: 24, paddingTop: 12, borderTopWidth: 1, borderColor: '#eee' },
  totalLabel: { fontSize: 18, fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: '700' },
  btn: { padding: 12 },
  btnText: { color: '#fff', fontWeight: '600' },
  button: { backgroundColor: '#eee', padding: 14, borderRadius: 6, alignItems: 'center', marginBottom: 12 },
  primaryButton: { backgroundColor: '#1a73e8', padding: 14, borderRadius: 6, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
});

export default BillingCartScreen;
