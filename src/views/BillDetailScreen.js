import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useAtomValue } from 'jotai';

import ReceiptHeader  from '../components/ReceiptHeader';
import ReceiptInfo    from '../components/ReceiptInfo';
import ReceiptTable   from '../components/ReceiptTable';
import ReceiptTotals  from '../components/ReceiptTotals';
import ReceiptActions from '../components/ReceiptActions';

import { currentOwnerAtom } from '../atoms/owner';
import { generateBillPdf }  from '../services/pdfService';
import { colors }           from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const STATUS_H = Platform.OS === 'android'
  ? (StatusBar.currentHeight ?? rvs(24))
  : rvs(44);

// ─── Format date from Firestore timestamp ─────────────────────────────────────
function formatDate(timestamp) {
  if (!timestamp) return '—';
  try {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day:   '2-digit',
      month: 'short',
      year:  'numeric',
    });
  } catch {
    return '—';
  }
}

function formatTime(timestamp) {
  if (!timestamp) return null;
  try {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour:   '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return null;
  }
}

// ─── Back pill ────────────────────────────────────────────────────────────────
const BackPill = ({ onPress }) => (
  <TouchableOpacity style={styles.backPill} onPress={onPress} activeOpacity={0.75}>
    <Icon name="chevron-back" size={rfs(16)} color="#FFFFFF" />
    <Text style={styles.backPillText}>Back</Text>
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const BillDetailScreen = ({ navigation, route }) => {
  const { bill } = route.params || {};
  const owner    = useAtomValue(currentOwnerAtom);

  const [pdfLoading, setPdfLoading] = useState(false);

  // ── No bill data ──
  if (!bill) {
    return (
      <View style={styles.errorCenter}>
        <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
        <View style={styles.errorCard}>
          <Icon name="receipt-outline" size={rfs(36)} color={colors.textSecondary} />
          <Text style={styles.errorTitle}>Bill not found</Text>
          <Text style={styles.errorSub}>Could not load bill details.</Text>
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

  // ── Build data shape matching receipt components ──
  const receiptData = {
    billNo:          bill.billNo,
    shopName:        owner?.businessName || owner?.name || 'Shop',
    shopAddress:     owner?.address      || '',
    customerName:    bill.customerName   || 'Walk-in',
    paymentType:     bill.paymentType    || 'CASH',
    date:            formatDate(bill.createdAt),
    time:            formatTime(bill.createdAt),
    items:           (bill.items || []).map((it) => ({
      name:   it.name   || '',
      qty:    it.qty    || 0,
      mrp:    it.mrp    ?? it.rate ?? 0,
      rate:   it.rate   ?? it.mrp  ?? 0,
      amount: it.amount ?? 0,
    })),
    grandTotal:      bill.grandTotal     ?? 0,
    thankYouMessage: 'Thank you for your purchase!',
  };

  // ── PDF ──
  const handleConvertToPdf = async () => {
    try {
      setPdfLoading(true);
      await generateBillPdf(receiptData);
    } catch (e) {
      Alert.alert('Error', e?.message || 'Could not create PDF');
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

        {/* ── Header banner ── */}
        <LinearGradient
          colors={['#2D4A52', '#1E3A42']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          {/* Decorative orbs */}
          <View style={styles.orbTopRight} />
          <View style={styles.orbBottomLeft} />

          {/* Back pill */}
          <TouchableOpacity
            style={styles.backPill}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Icon name="chevron-back" size={rfs(16)} color="#FFFFFF" />
            <Text style={styles.backPillText}>Back</Text>
          </TouchableOpacity>

          {/* Receipt icon */}
          <View style={styles.receiptRing}>
            <Icon name="receipt-outline" size={rfs(30)} color={colors.accent} />
          </View>

          <Text style={styles.bannerTitle}>Bill Detail</Text>
          <Text style={styles.bannerSub}>
            {formatDate(bill.createdAt)}
            {formatTime(bill.createdAt) ? `  ·  ${formatTime(bill.createdAt)}` : ''}
          </Text>

          {/* Bill no pill */}
          {!!bill.billNo && (
            <View style={styles.billNoPill}>
              <View style={styles.billNoDot} />
              <Text style={styles.billNoText}>BILL #{bill.billNo}</Text>
            </View>
          )}

        </LinearGradient>

        {/* ── Receipt card ── */}
        <View style={styles.receiptCard}>
          <ReceiptHeader
            shopName={receiptData.shopName}
            shopAddress={receiptData.shopAddress}
          />
          <ReceiptInfo    data={receiptData} />
          <ReceiptTable   items={receiptData.items} />
          <ReceiptTotals  data={receiptData} />

          <View style={styles.thanksRow}>
            <Text style={styles.thanks}>
              {receiptData.thankYouMessage}
            </Text>
          </View>
        </View>

        {/* ── Actions ── */}
        <ReceiptActions
          loading={pdfLoading}
          onPdf={handleConvertToPdf}
          onBack={() => navigation.goBack()}
        />

      </ScrollView>
    </View>
  );
};

export default BillDetailScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: colors.background ?? '#F2F4F5',
  },

  scroll: { flex: 1 },

  content: {
    paddingBottom: rvs(40),
  },

  // ── Banner ────────────────────────────────────────────
  banner: {
    paddingTop: STATUS_H + rvs(16),
    paddingBottom: rvs(28),
    paddingHorizontal: rs(20),
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  orbTopRight: {
    position: 'absolute',
    top: -rs(40),
    right: -rs(40),
    width: rs(160),
    height: rs(160),
    borderRadius: rs(80),
    backgroundColor: 'rgba(245,166,35,0.08)',
  },

  orbBottomLeft: {
    position: 'absolute',
    bottom: -rvs(20),
    left: -rs(20),
    width: rs(100),
    height: rs(100),
    borderRadius: rs(50),
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: rs(4),
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: rs(20),
    paddingHorizontal: rs(12),
    paddingVertical: rvs(7),
    marginBottom: rvs(20),
  },

  backPillText: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  receiptRing: {
    width: rs(68),
    height: rs(68),
    borderRadius: rs(34),
    backgroundColor: 'rgba(245,166,35,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rvs(14),
  },

  bannerTitle: {
    fontSize: rfs(20),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  bannerSub: {
    fontSize: rfs(12),
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
    marginTop: rvs(4),
  },

  billNoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
    marginTop: rvs(14),
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.30)',
    borderRadius: rs(20),
    paddingVertical: rvs(5),
    paddingHorizontal: rs(14),
  },

  billNoDot: {
    width: rs(6),
    height: rs(6),
    borderRadius: rs(3),
    backgroundColor: colors.accent,
  },

  billNoText: {
    fontSize: rfs(11),
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0.5,
  },

  // ── Receipt card ──────────────────────────────────────
  receiptCard: {
    marginHorizontal: rs(16),
    marginTop: rvs(14),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(16),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(10),
    elevation: 3,
    overflow: 'hidden',
  },

  thanksRow: {
    paddingVertical: rvs(14),
    paddingHorizontal: rs(18),
    alignItems: 'center',
  },

  thanks: {
    fontSize: rfs(12),
    fontStyle: 'italic',
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ── Error state ───────────────────────────────────────
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
  },

});