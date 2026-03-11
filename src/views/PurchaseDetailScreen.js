import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useAtomValue } from 'jotai';

import PurchaseInvoiceCard    from '../components/PurchaseInvoiceCard';
import { generatePurchasePdf } from '../services/purchasePdfService';
import { currentOwnerAtom }    from '../atoms/owner';
import { colors }              from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const STATUS_H = Platform.OS === 'android'
  ? (StatusBar.currentHeight ?? rvs(24))
  : rvs(44);

function formatDate(timestamp) {
  console.log('=== formatDate called with:', timestamp);
  if (!timestamp) return '—';
  try {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch (e) {
    console.error('formatDate error:', e);
    return '—';
  }
}

const PurchaseDetailScreen = ({ navigation, route }) => {
  console.log('=== PurchaseDetailScreen MOUNTED ===');
  console.log('route:', JSON.stringify(route, null, 2));
  console.log('route.params:', JSON.stringify(route?.params, null, 2));

  const { purchase } = route.params || {};

  console.log('purchase extracted:', JSON.stringify(purchase, null, 2));

  const owner        = useAtomValue(currentOwnerAtom);
  const [pdfLoading, setPdfLoading] = useState(false);

  if (!purchase) {
    console.log('=== purchase is null/undefined, showing error state ===');
    return (
      <View style={styles.errorCenter}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <View style={styles.errorCard}>
          <Icon name="cart-outline" size={rfs(36)} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>Purchase not found</Text>
          <Text style={styles.errorSub}>Could not load purchase details.</Text>
          <TouchableOpacity
            style={styles.errorBackBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon name="arrow-back-outline" size={rfs(14)} color="#FFFFFF" />
            <Text style={styles.errorBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  console.log('=== purchase found, building invoiceData ===');

  const invoiceData = {
    shopName:     owner?.businessName || owner?.name || 'Shop',
    supplierName: purchase.supplierName || '—',
    invoiceNo:    purchase.purchaseNoFormatted || purchase.purchaseNo || '—',
    date:         purchase.date || formatDate(purchase.createdAt),
    items:        (purchase.items || []).map((it) => ({
      name:          it.name          || '—',
      qty:           it.qty           || 0,
      purchasePrice: it.purchasePrice || 0,
      amount:        it.amount        || 0,
    })),
    subtotal:   purchase.subtotal   ?? 0,
    paidAmount: purchase.paidAmount ?? 0,
    dueAmount:  purchase.dueAmount  ?? 0,
  };

  console.log('invoiceData built:', JSON.stringify(invoiceData, null, 2));

  const handleSharePdf = async () => {
    console.log('=== handleSharePdf called ===');
    try {
      setPdfLoading(true);
      await generatePurchasePdf(invoiceData);
      console.log('PDF generated successfully');
    } catch (e) {
      console.error('PDF error:', e);
      const msg = String(e?.message || '');
      if (!msg.toLowerCase().includes('cancel')) {
        Alert.alert('Error', msg || 'Could not share PDF');
      }
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <LinearGradient
          colors={['#2D4A52', '#1E3A42']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.orbTopRight} />
          <View style={styles.orbBottomLeft} />

          <TouchableOpacity
            style={styles.backPill}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Icon name="chevron-back" size={rfs(16)} color="#FFFFFF" />
            <Text style={styles.backPillText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.iconRing}>
            <Icon name="cart-outline" size={rfs(30)} color="#7c3aed" />
          </View>

          <Text style={styles.bannerTitle}>Purchase Detail</Text>
          <Text style={styles.bannerSub}>{invoiceData.date}</Text>

          {!!invoiceData.invoiceNo && (
            <View style={styles.invoicePill}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText}>INV #{invoiceData.invoiceNo}</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.cardWrap}>
          <PurchaseInvoiceCard data={invoiceData} />
        </View>

        <View style={styles.actionsWrap}>

          <TouchableOpacity
            style={[styles.pdfBtn, pdfLoading && styles.btnDisabled]}
            onPress={handleSharePdf}
            disabled={pdfLoading}
            activeOpacity={0.85}
          >
            {pdfLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="share-outline" size={rfs(18)} color="#FFFFFF" />
                <Text style={styles.pdfBtnText}>Share Purchase PDF</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon name="arrow-back-outline" size={rfs(16)} color={colors.primary} />
            <Text style={styles.closeBtnText}>Go Back</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </View>
  );
};

export default PurchaseDetailScreen;

const styles = StyleSheet.create({

  root: { flex: 1, backgroundColor: colors.background ?? '#F2F4F5' },
  scroll: { flex: 1 },
  content: { paddingBottom: rvs(40) },

  banner: {
    paddingTop: STATUS_H + rvs(16),
    paddingBottom: rvs(28),
    paddingHorizontal: rs(20),
    alignItems: 'center',
    overflow: 'hidden',
  },
  orbTopRight: {
    position: 'absolute', top: -rs(40), right: -rs(40),
    width: rs(160), height: rs(160), borderRadius: rs(80),
    backgroundColor: 'rgba(124,58,237,0.08)',
  },
  orbBottomLeft: {
    position: 'absolute', bottom: -rvs(20), left: -rs(20),
    width: rs(100), height: rs(100), borderRadius: rs(50),
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  backPill: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    gap: rs(4), backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: rs(20), paddingHorizontal: rs(12),
    paddingVertical: rvs(7), marginBottom: rvs(20),
  },
  backPillText: { fontSize: rfs(13), fontWeight: '600', color: '#FFFFFF' },
  iconRing: {
    width: rs(68), height: rs(68), borderRadius: rs(34),
    backgroundColor: 'rgba(124,58,237,0.12)',
    borderWidth: 1, borderColor: 'rgba(124,58,237,0.30)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: rvs(14),
  },
  bannerTitle: {
    fontSize: rfs(20), fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.2,
  },
  bannerSub: {
    fontSize: rfs(12), color: 'rgba(255,255,255,0.55)',
    fontWeight: '500', marginTop: rvs(4),
  },
  invoicePill: {
    flexDirection: 'row', alignItems: 'center', gap: rs(5),
    marginTop: rvs(14), backgroundColor: 'rgba(245,166,35,0.15)',
    borderWidth: 1, borderColor: 'rgba(245,166,35,0.30)',
    borderRadius: rs(20), paddingVertical: rvs(5), paddingHorizontal: rs(14),
  },
  pillDot: {
    width: rs(6), height: rs(6), borderRadius: rs(3),
    backgroundColor: colors.accent,
  },
  pillText: {
    fontSize: rfs(11), fontWeight: '700',
    color: colors.accent, letterSpacing: 0.5,
  },

  cardWrap: { marginHorizontal: rs(16), marginTop: rvs(14) },
  actionsWrap: { marginHorizontal: rs(16), marginTop: rvs(16), gap: rvs(10) },

  pdfBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: rs(8), backgroundColor: '#7c3aed',
    paddingVertical: rvs(14), borderRadius: rs(12),
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.30, shadowRadius: rs(10), elevation: 4,
  },
  pdfBtnText: { fontSize: rfs(15), fontWeight: '700', color: '#FFFFFF' },

  closeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: rs(6), paddingVertical: rvs(13), borderRadius: rs(12),
    borderWidth: 1, borderColor: colors.borderCard, backgroundColor: '#FFFFFF',
  },
  closeBtnText: { fontSize: rfs(14), fontWeight: '600', color: colors.primary },
  btnDisabled: { opacity: 0.6 },

  errorCenter: {
    flex: 1, backgroundColor: colors.background ?? '#F2F4F5',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: rs(32),
  },
  errorCard: {
    width: '100%', backgroundColor: '#FFFFFF',
    borderRadius: rs(20), borderWidth: 1, borderColor: colors.borderCard,
    alignItems: 'center', paddingVertical: rvs(36), paddingHorizontal: rs(24),
    gap: rvs(8),
  },
  errorTitle: { fontSize: rfs(17), fontWeight: '700', color: colors.textPrimary },
  errorSub: { fontSize: rfs(13), color: colors.textSecondary, textAlign: 'center' },
  errorBackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: rs(5),
    backgroundColor: colors.primary, borderRadius: rs(12),
    paddingVertical: rvs(10), paddingHorizontal: rs(20), marginTop: rvs(12),
  },
  errorBackText: { fontSize: rfs(13), fontWeight: '700', color: '#FFFFFF' },
});