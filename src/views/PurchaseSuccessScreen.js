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
import { useAtomValue } from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

import PurchaseInvoiceCard        from '../components/PurchaseInvoiceCard';
import { purchaseSuccessDataAtom } from '../atoms/purchase';
import { generatePurchasePdf }    from '../services/purchasePdfService';
import { colors }                 from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const STATUS_H = Platform.OS === 'android'
  ? (StatusBar.currentHeight ?? rvs(24))
  : rvs(44);

const PurchaseSuccessScreen = ({ navigation }) => {
  const data = useAtomValue(purchaseSuccessDataAtom);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleSharePdf = async () => {
    if (!data?.items?.length) {
      Alert.alert('Error', 'No purchase data.');
      return;
    }
    try {
      setPdfLoading(true);
      await generatePurchasePdf(data);
    } catch (e) {
      const msg = String(e?.message || '');
      if (!msg.toLowerCase().includes('cancel')) {
        Alert.alert('Error', msg || 'Could not share PDF');
      }
    } finally {
      setPdfLoading(false);
    }
  };

  // ── No data ──
  if (!data) {
    return (
      <View style={styles.errorCenter}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <View style={styles.errorCard}>
          <Icon name="receipt-outline" size={rfs(36)} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>No purchase found</Text>
          <Text style={styles.errorSub}>Something went wrong loading the invoice.</Text>
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

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Success banner ── */}
        <LinearGradient
          colors={['#2D4A52', '#1E3A42']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.orbTopRight} />
          <View style={styles.orbBottomLeft} />

          <View style={styles.successRing}>
            <Icon name="checkmark" size={rfs(32)} color="#5B9E6D" />
          </View>

          <Text style={styles.bannerTitle}>Purchase Saved!</Text>
          <Text style={styles.bannerSub}>Invoice has been generated successfully</Text>

          {!!data.invoiceNo && (
            <View style={styles.invoicePill}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText}>INV #{data.invoiceNo}</Text>
            </View>
          )}
        </LinearGradient>

        {/* ── Invoice card ── */}
        <View style={styles.cardWrap}>
          <PurchaseInvoiceCard data={data} />
        </View>

        {/* ── Actions ── */}
        <View style={styles.actionsWrap}>

          {/* Share PDF */}
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
                <View style={styles.pdfIconBox}>
                  <Icon name="share-outline" size={rfs(15)} color={colors.primary} />
                </View>
                <Text style={styles.pdfBtnText}>Share Purchase PDF</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Back to Home */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.replace('OwnerTabs')}
            activeOpacity={0.8}
          >
            <View style={styles.backIconBox}>
              <Icon name="home-outline" size={rfs(14)} color={colors.primary} />
            </View>
            <Text style={styles.backBtnText}>Back to Home</Text>
          </TouchableOpacity>

        </View>

      </ScrollView>
    </View>
  );
};

export default PurchaseSuccessScreen;

const styles = StyleSheet.create({

  root: { flex: 1, backgroundColor: colors.background ?? '#F2F4F5' },
  scroll: { flex: 1 },
  content: { paddingBottom: rvs(40) },

  // ── Banner ────────────────────────────────────────────
  banner: {
    paddingTop: STATUS_H + rvs(20),
    paddingBottom: rvs(28),
    paddingHorizontal: rs(20),
    alignItems: 'center',
    overflow: 'hidden',
  },

  orbTopRight: {
    position: 'absolute', top: -rs(40), right: -rs(40),
    width: rs(160), height: rs(160), borderRadius: rs(80),
    backgroundColor: 'rgba(245,166,35,0.08)',
  },

  orbBottomLeft: {
    position: 'absolute', bottom: -rvs(20), left: -rs(20),
    width: rs(100), height: rs(100), borderRadius: rs(50),
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  successRing: {
    width: rs(72), height: rs(72), borderRadius: rs(36),
    backgroundColor: 'rgba(91,158,109,0.15)',
    borderWidth: 1, borderColor: 'rgba(91,158,109,0.40)',
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
    marginTop: rvs(14),
    backgroundColor: 'rgba(245,166,35,0.15)',
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

  // ── Card + actions ────────────────────────────────────
  cardWrap:    { marginHorizontal: rs(16), marginTop: rvs(14) },
  actionsWrap: { marginHorizontal: rs(16), marginTop: rvs(16), gap: rvs(10) },

  // ── PDF button ────────────────────────────────────────
  pdfBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: rs(10), backgroundColor: colors.primary,   // was #7c3aed purple
    paddingVertical: rvs(15), borderRadius: rs(14),
    shadowColor: colors.primary,                     // was #7c3aed purple
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.28, shadowRadius: rs(12), elevation: 5,
  },

  pdfIconBox: {
    width: rs(26), height: rs(26), borderRadius: rs(8),
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },

  pdfBtnText: {
    fontSize: rfs(15), fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3,
  },

  // ── Back to Home button ───────────────────────────────
  backBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: rs(8), paddingVertical: rvs(14), borderRadius: rs(14),
    borderWidth: 1, borderColor: colors.borderCard,
    backgroundColor: '#FFFFFF',
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1, shadowRadius: rs(8), elevation: 2,
  },

  backIconBox: {
    width: rs(24), height: rs(24), borderRadius: rs(7),
    backgroundColor: 'rgba(45,74,82,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  backBtnText: {
    fontSize: rfs(14), fontWeight: '700', color: colors.primary,
  },

  btnDisabled: { opacity: 0.6 },

  // ── Error state ───────────────────────────────────────
  errorCenter: {
    flex: 1, backgroundColor: colors.background ?? '#F2F4F5',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: rs(32),
  },

  errorCard: {
    width: '100%', backgroundColor: '#FFFFFF',
    borderRadius: rs(20), borderWidth: 1, borderColor: colors.borderCard,
    alignItems: 'center', paddingVertical: rvs(36), paddingHorizontal: rs(24),
    gap: rvs(8),
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 1, shadowRadius: rs(16), elevation: 4,
  },

  errorTitle: {
    fontSize: rfs(17), fontWeight: '800',
    color: colors.textPrimary, marginTop: rvs(8),
  },

  errorSub: {
    fontSize: rfs(13), color: colors.textSecondary,
    textAlign: 'center', lineHeight: rfs(20),
  },

  errorBackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: rs(5),
    backgroundColor: colors.primary, borderRadius: rs(14),
    paddingVertical: rvs(10), paddingHorizontal: rs(20), marginTop: rvs(12),
  },

  errorBackText: { fontSize: rfs(13), fontWeight: '700', color: '#FFFFFF' },

});