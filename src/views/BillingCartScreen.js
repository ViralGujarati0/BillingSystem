import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { useAtomValue, useSetAtom } from 'jotai';

import {
  billingCartItemsAtom,
  billingCustomerNameAtom,
  billingPaymentTypeAtom,
  billingGenerateLoadingAtom,
} from '../atoms/billing';

import useBillingViewModel from '../viewmodels/BillingViewModel';

import BillingHeader from '../components/BillingHeader';
import CustomerPaymentSection from '../components/CustomerPaymentSection';
import BillingItemsTable from '../components/BillingItemsTable';
import BillingTotalCard from '../components/BillingTotalCard';
import BillingActions from '../components/BillingActions';

const BillingCartScreen = ({ navigation, route }) => {
  const { userDoc } = route.params || {};
  const shopId = userDoc?.shopId;

  const cartItems = useAtomValue(billingCartItemsAtom);
  const customerName = useAtomValue(billingCustomerNameAtom);
  const paymentType = useAtomValue(billingPaymentTypeAtom);
  const loading = useAtomValue(billingGenerateLoadingAtom);

  const setCustomerName = useSetAtom(billingCustomerNameAtom);
  const setPaymentType = useSetAtom(billingPaymentTypeAtom);
  const setLoading = useSetAtom(billingGenerateLoadingAtom);

  const vm = useBillingViewModel();

  const [shop, setShop] = useState(null);
  const [settings, setSettings] = useState(null);

  /* ───────── LOAD SHOP + SETTINGS ───────── */

  useEffect(() => {
    if (!shopId) return;

    let cancelled = false;

    (async () => {
      try {
        const { shop: s, settings: st } =
          await vm.loadShopAndSettings(shopId);

        if (!cancelled) {
          setShop(s);
          setSettings(st);
        }
      } catch (e) {
        if (!cancelled) setShop(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shopId]);

  /* ───────── UPDATE QTY ───────── */

  const updateItemQty = (index, qty) => {
    vm.updateItemQty(index, qty);
  };

  /* ───────── GRAND TOTAL ───────── */

  const grandTotal = cartItems.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );

  /* ───────── GENERATE BILL ───────── */

  const handleGenerateBill = async () => {
    setLoading(true);

    try {
      await vm.generateBill({
        userDoc,
        shop,
        settings,
      });

      const backScreen =
        userDoc?.role === 'OWNER'
          ? 'OwnerTabs'
          : 'StaffHome';

      const backParams = userDoc
        ? { userDoc }
        : {};

      navigation.replace('BillSuccess', {
        backScreen,
        backParams,
      });

    } catch (err) {
      const msg =
        err?.message || 'Failed to generate bill';

      const details = err?.details
        ? ` (${String(err.details)})`
        : '';

      Alert.alert('Error', msg + details);

    } finally {
      setLoading(false);
    }
  };

  /* ───────── NO SHOP CASE ───────── */

  if (!shopId) {
    return (
      <View style={styles.center}>
        <Text>No shop found.</Text>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ───────── MAIN UI ───────── */

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <BillingHeader
        navigation={navigation}
        shop={shop}
      />

      <CustomerPaymentSection
        customerName={customerName}
        setCustomerName={setCustomerName}
        paymentType={paymentType}
        setPaymentType={setPaymentType}
      />

      <BillingItemsTable
        cartItems={cartItems}
        updateItemQty={updateItemQty}
        updateManualItemField={vm.updateManualItemField}
        removeItem={vm.removeItem}
      />

      <BillingTotalCard total={grandTotal} cartItems={cartItems} />

      <BillingActions
        loading={loading}
        onAddMore={() =>
          navigation.navigate(
            'BillingScanner',
            { userDoc }
          )
        }
        onGenerate={handleGenerateBill}
      />
    </ScrollView>
  );
};

export default BillingCartScreen;

/* ───────── STYLES ───────── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  content: {
    padding: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backBtn: {
    marginTop: 20,
    padding: 12,
  },

  backText: {
    color: '#1a73e8',
    fontWeight: '600',
  },
});