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
import ReceiptActions   from '../components/ReceiptActions';
import HeaderBackButton   from '../components/HeaderBackButton';

import { currentOwnerAtom } from '../atoms/owner';
import { generateBillPdf }  from '../services/pdfService';
import { numberToWords }    from '../utils/numberToWords';
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
          <HeaderBackButton filled onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  // ── Build data shape matching receipt components ──
  const items = (bill.items || []).map((it) => ({
    name:   it.name   || '',
    qty:    it.qty    || 0,
    mrp:    it.mrp    ?? it.rate ?? 0,
    rate:   it.rate   ?? it.mrp  ?? 0,
    amount: it.amount ?? 0,
  }));
  const grandTotal = Number(bill.grandTotal ?? 0);
  const totalQty = items.reduce((sum, it) => sum + Number(it.qty || 0), 0);
  const totalInWords =
    (typeof bill.totalInWords === 'string' && bill.totalInWords.trim()) ||
    `Rs. ${numberToWords(Math.floor(grandTotal)).replace(/^./, (c) => c.toUpperCase())} only`;

  const receiptData = {
    billNo:          bill.billNo,
    shopName:        owner?.businessName || owner?.name || 'Shop',
    shopAddress:     owner?.address      || '',
    customerName:    bill.customerName   || 'Walk-in',
    paymentType:     bill.paymentType    || 'CASH',
    date:            formatDate(bill.createdAt),
    time:            formatTime(bill.createdAt),
    items,
    grandTotal,
    totalQty,
    totalInWords,
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

        {/* ── Compact header ── */}
        <LinearGradient
          colors={['#2D4A52', '#1E3A42']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <View style={styles.orbTopRight} />

          <View style={styles.headerBar}>
            <TouchableOpacity
              style={styles.backIconBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Icon name="chevron-back" size={rfs(19)} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerMain}>
              <Text style={styles.bannerTitle} numberOfLines={1}>
                Bill detail
              </Text>
              <Text style={styles.bannerSub} numberOfLines={1}>
                {formatDate(bill.createdAt)}
                {formatTime(bill.createdAt) ? ` · ${formatTime(bill.createdAt)}` : ''}
              </Text>
            </View>

            {!!bill.billNo ? (
              <View style={styles.billNoPill}>
                <Text
                  style={styles.billNoText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  #{bill.billNo}
                </Text>
              </View>
            ) : (
              <View style={styles.headerSideSpacer} />
            )}
          </View>
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

  // ── Banner (compact) ──────────────────────────────────
  banner: {
    paddingTop: STATUS_H + rvs(6),
    paddingBottom: rvs(12),
    paddingHorizontal: rs(12),
    position: 'relative',
    overflow: 'hidden',
  },

  orbTopRight: {
    position: 'absolute',
    top: -rs(50),
    right: -rs(30),
    width: rs(120),
    height: rs(120),
    borderRadius: rs(60),
    backgroundColor: 'rgba(245,166,35,0.07)',
  },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    gap: rs(8),
  },

  backIconBtn: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(18),
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerMain: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },

  headerSideSpacer: {
    width: rs(36),
    height: rs(36),
  },

  bannerTitle: {
    fontSize: rfs(19),
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.15,
  },

  bannerSub: {
    fontSize: rfs(12),
    color: 'rgba(255,255,255,0.62)',
    fontWeight: '500',
    marginTop: rvs(2),
  },

  billNoPill: {
    maxWidth: '38%',
    backgroundColor: 'rgba(245,166,35,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.32)',
    borderRadius: rs(10),
    paddingVertical: rvs(6),
    paddingHorizontal: rs(10),
  },

  billNoText: {
    fontSize: rfs(11),
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0.3,
  },

  // ── Receipt card ──────────────────────────────────────
  receiptCard: {
    marginHorizontal: rs(16),
    marginTop: rvs(10),
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

});