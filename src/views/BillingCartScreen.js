import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useAtomValue, useSetAtom } from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import {
  billingCartItemsAtom,
  billingCustomerNameAtom,
  billingPaymentTypeAtom,
  billingGenerateLoadingAtom,
} from '../atoms/billing';

import useBillingViewModel from '../viewmodels/BillingViewModel';
import useEffectiveBillingUserDoc from '../hooks/useEffectiveBillingUserDoc';

import BillingHeader          from '../components/BillingHeader';
import CustomerPaymentSection from '../components/CustomerPaymentSection';
import BillingItemsTable      from '../components/BillingItemsTable';
import BillingTotalCard       from '../components/BillingTotalCard';
import BillingActions         from '../components/BillingActions';

import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive helpers (base 390×844) ───────────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Component ────────────────────────────────────────────────────────────────
const BillingCartScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const userDoc = useEffectiveBillingUserDoc(route);
  const shopId = userDoc?.shopId;

  const cartItems    = useAtomValue(billingCartItemsAtom);
  const customerName = useAtomValue(billingCustomerNameAtom);
  const paymentType  = useAtomValue(billingPaymentTypeAtom);
  const loading      = useAtomValue(billingGenerateLoadingAtom);

  const setCustomerName = useSetAtom(billingCustomerNameAtom);
  const setPaymentType  = useSetAtom(billingPaymentTypeAtom);
  const setLoading      = useSetAtom(billingGenerateLoadingAtom);

  const vm = useBillingViewModel();

  const [shop,     setShop]     = useState(null);
  const [settings, setSettings] = useState(null);

  /* ───────── LOAD SHOP + SETTINGS ───────── */
  useEffect(() => {
    if (!shopId) return;
    let cancelled = false;
    (async () => {
      try {
        const { shop: s, settings: st } = await vm.loadShopAndSettings(shopId);
        if (!cancelled) { setShop(s); setSettings(st); }
      } catch (e) {
        if (!cancelled) setShop(null);
      }
    })();
    return () => { cancelled = true; };
  }, [shopId]);

  /* ───────── GRAND TOTAL ───────── */
  const grandTotal = cartItems.reduce((sum, item) => sum + (item.amount || 0), 0);

  /* ───────── UPDATE QTY ───────── */
  const updateItemQty = (index, qty) => vm.updateItemQty(index, qty);

  /* ───────── GENERATE BILL ───────── */
  const handleGenerateBill = async () => {
    setLoading(true);
    try {
      await vm.generateBill({ userDoc, shop, settings });
      const backScreen = userDoc?.role === 'OWNER' ? 'OwnerTabs' : 'StaffHome';
      const backParams = userDoc ? { userDoc } : {};
      navigation.replace('BillSuccess', { backScreen, backParams });
    } catch (err) {
      const msg     = err?.message || 'Failed to generate bill';
      const details = err?.details ? ` (${String(err.details)})` : '';
      Alert.alert('Error', msg + details);
    } finally {
      setLoading(false);
    }
  };

  /* ───────── NO SHOP CASE ───────── */
  if (!shopId) {
    return (
      <View style={styles.errorCenter}>
        <View style={styles.errorCard}>
          <Icon name="storefront-outline" size={rfs(36)} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>{t('billing.noShopFound')}</Text>
          <Text style={styles.errorSub}>{t('billing.noShopSub')}</Text>
          <TouchableOpacity
            style={styles.errorBackBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon name="chevron-back" size={rfs(14)} color="#FFFFFF" />
            <Text style={styles.errorBackText}>{t('common.goBack')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /* ───────── MAIN UI ───────── */
  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header — sits flush at top, no extra padding needed */}
        <BillingHeader navigation={navigation} shop={shop} />

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
          onAddMore={() => navigation.navigate('BillingScanner', { userDoc })}
          onGenerate={handleGenerateBill}
        />
      </ScrollView>
    </View>
  );
};

export default BillingCartScreen;

/* ───────── STYLES ───────── */
const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: colors.background ?? '#F2F4F5',
  },

  scroll: {
    flex: 1,
  },

  // No top padding — BillingHeader handles its own STATUS_H + paddingTop
  content: {
    paddingBottom: rvs(40),
  },

  // ── Error / no-shop state ─────────────────────────────
  errorCenter: {
    flex: 1,
    backgroundColor: colors.background ?? '#F2F4F5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(32),
  },

  errorCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(20),
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    paddingVertical: rvs(36),
    paddingHorizontal: rs(24),
    gap: rvs(8),
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 1,
    shadowRadius: rs(16),
    elevation: 4,
  },

  errorTitle: {
    fontSize: rfs(17),
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: rvs(8),
  },

  errorSub: {
    fontSize: rfs(13),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: rfs(20),
  },

  errorBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
    backgroundColor: colors.primary,
    borderRadius: rs(12),
    paddingVertical: rvs(10),
    paddingHorizontal: rs(20),
    marginTop: rvs(12),
  },

  errorBackText: {
    fontSize: rfs(13),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});