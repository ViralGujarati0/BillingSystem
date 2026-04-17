import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAtomValue } from 'jotai';

import AppHeaderLayout from '../components/AppHeaderLayout';
import HeaderBackButton from '../components/HeaderBackButton';
import ConfirmActionModal from '../components/ConfirmActionModal';
import FormInputField from '../components/FormInputField';
import { currentOwnerAtom } from '../atoms/owner';
import { colors } from '../theme/colors';
import { recordPurchasePayment } from '../services/purchaseService';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const PAYMENT_TYPES = ['CASH', 'UPI', 'BANK'];

const fmt = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

const SectionLabel = ({ icon, label }) => (
  <View style={styles.sectionLabel}>
    <View style={styles.sectionBar} />
    <Icon name={icon} size={rfs(12)} color={colors.accent} />
    <Text style={styles.sectionText}>{label}</Text>
    <View style={styles.sectionLine} />
  </View>
);

const SummaryStat = ({ label, value, tone = 'default' }) => (
  <View style={styles.summaryStat}>
    <Text style={styles.summaryStatLabel}>{label}</Text>
    <Text
      style={[
        styles.summaryStatValue,
        tone === 'success' && styles.summaryStatValueSuccess,
        tone === 'warning' && styles.summaryStatValueWarning,
      ]}
    >
      {value}
    </Text>
  </View>
);

export default function RecordPurchasePaymentScreen({ navigation, route }) {
  const purchase = route.params?.purchase;
  const owner = useAtomValue(currentOwnerAtom);

  const [paymentType, setPaymentType] = useState(
    String(purchase?.paymentType || 'CASH').toUpperCase()
  );
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [resultModal, setResultModal] = useState({
    visible: false,
    variant: 'success',
    icon: 'checkmark-circle-outline',
    title: '',
    message: '',
    confirmLabel: 'OK',
    confirmIcon: 'checkmark-outline',
    onConfirm: null,
  });

  const dueAmount = Number(purchase?.dueAmount || 0);
  const paidAmount = Number(purchase?.paidAmount || 0);
  const subtotal = Number(purchase?.subtotal || 0);
  const enteredAmount = Number(amount || 0);
  const nextDueAmount = useMemo(
    () => Math.max(0, dueAmount - Math.max(0, enteredAmount)),
    [dueAmount, enteredAmount]
  );

  const openResultModal = ({
    variant,
    icon,
    title,
    message,
    confirmLabel = 'OK',
    confirmIcon = 'checkmark-outline',
    onConfirm = null,
  }) => {
    setResultModal({
      visible: true,
      variant,
      icon,
      title,
      message,
      confirmLabel,
      confirmIcon,
      onConfirm,
    });
  };

  const closeResultModal = () => {
    setResultModal((prev) => ({ ...prev, visible: false }));
  };

  const validate = () => {
    if (!purchase?.id || !owner?.shopId) {
      return 'Purchase data is missing.';
    }

    if (!amount.trim()) {
      return 'Enter the payment amount.';
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return 'Payment amount must be greater than 0.';
    }

    if (numericAmount > dueAmount) {
      return 'Payment amount cannot be greater than the due amount.';
    }

    return '';
  };

  const handleSubmit = async () => {
    const error = validate();
    setFieldError(error);

    if (error) {
      openResultModal({
        variant: 'warning',
        icon: 'alert-circle-outline',
        title: 'Invalid Payment',
        message: error,
      });
      return;
    }

    try {
      setSaving(true);
      const updatedPurchase = await recordPurchasePayment({
        shopId: owner.shopId,
        purchaseId: purchase.id,
        amount: Number(amount),
        paymentType,
        createdBy: owner?.id || null,
      });

      openResultModal({
        variant: 'success',
        icon: 'checkmark-circle-outline',
        title: 'Payment Recorded',
        message: `${fmt(amount)} has been recorded for ${purchase.supplierName || 'this supplier'}.`,
        confirmLabel: 'View Purchase',
        confirmIcon: 'arrow-forward-outline',
        onConfirm: () => {
          navigation.replace('PurchaseDetail', { purchase: updatedPurchase });
        },
      });
    } catch (error) {
      openResultModal({
        variant: 'danger',
        icon: 'close-circle-outline',
        title: 'Payment Failed',
        message: error?.message || 'Could not record the payment right now.',
      });
    } finally {
      setSaving(false);
    }
  };

  const headerLeft = <HeaderBackButton onPress={() => navigation.goBack()} />;

  if (!purchase) {
    return (
      <AppHeaderLayout title="Record Payment" leftComponent={headerLeft}>
        <View style={styles.stateWrap}>
          <View style={styles.stateIconWrap}>
            <Icon name="wallet-outline" size={rfs(28)} color={colors.textSecondary} />
          </View>
          <Text style={styles.stateTitle}>Purchase not found</Text>
          <Text style={styles.stateSub}>We could not load the purchase payment details.</Text>
        </View>
      </AppHeaderLayout>
    );
  }

  return (
    <AppHeaderLayout
      title="Record Payment"
      subtitle={purchase.supplierName || purchase.purchaseNoFormatted || 'Purchase'}
      leftComponent={headerLeft}
    >
      <ConfirmActionModal
        visible={resultModal.visible}
        variant={resultModal.variant}
        icon={resultModal.icon}
        title={resultModal.title}
        message={resultModal.message}
        confirmLabel={resultModal.confirmLabel}
        confirmIcon={resultModal.confirmIcon}
        cancelLabel="Close"
        itemPill={{
          icon: 'receipt-outline',
          label: purchase.purchaseNoFormatted || purchase.purchaseNo || 'Purchase',
        }}
        onCancel={closeResultModal}
        onConfirm={() => {
          const action = resultModal.onConfirm;
          closeResultModal();
          action?.();
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.identityBadge}>
          <View style={styles.identityIconBox}>
            <Icon name="wallet-outline" size={rfs(22)} color="#FFFFFF" />
          </View>
          <View style={styles.identityTextBlock}>
            <Text style={styles.identityLabel}>SUPPLIER PAYMENT</Text>
            <Text style={styles.identityName} numberOfLines={1}>
              {purchase.supplierName || 'Supplier'}
            </Text>
          </View>
          <View style={styles.identityPill}>
            <Icon name="document-text-outline" size={rfs(11)} color={colors.accent} />
            <Text style={styles.identityPillText}>
              {purchase.purchaseNoFormatted || purchase.purchaseNo || 'Purchase'}
            </Text>
          </View>
        </View>

        <SectionLabel icon="receipt-outline" label="PURCHASE SUMMARY" />

        <View style={styles.card}>
          <SummaryStat label="Total Amount" value={fmt(subtotal)} />
          <View style={styles.fieldDivider} />
          <SummaryStat label="Already Paid" value={fmt(paidAmount)} tone="success" />
          <View style={styles.fieldDivider} />
          <SummaryStat label="Current Due" value={fmt(dueAmount)} tone="warning" />
        </View>

        <SectionLabel icon="cash-outline" label="PAYMENT DETAILS" />

        <View style={styles.card}>
          <FormInputField
            label="Amount Paying Now"
            required
            icon="wallet-outline"
            value={amount}
            onChangeText={(value) => {
              setAmount(value);
              if (fieldError) setFieldError('');
            }}
            placeholder="e.g. 500"
            keyboardType="decimal-pad"
            error={fieldError || undefined}
          />

          <View style={styles.fieldDivider} />

          <View style={styles.fieldBlock}>
            <Text style={styles.blockLabel}>PAYMENT TYPE</Text>
            <View style={styles.chipsWrap}>
              {PAYMENT_TYPES.map((type) => {
                const active = paymentType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setPaymentType(type)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldDivider} />

          <View style={styles.nextDueBox}>
            <Text style={styles.nextDueLabel}>Remaining Due After Payment</Text>
            <Text style={[styles.nextDueValue, nextDueAmount === 0 && styles.nextDueValuePaid]}>
              {fmt(nextDueAmount)}
            </Text>
            <Text style={styles.nextDueHint}>
              {nextDueAmount === 0
                ? 'This purchase will be marked fully paid.'
                : 'The due amount will update everywhere in realtime.'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSubmit}
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
              <Text style={styles.saveBtnText}>Submit Payment</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </AppHeaderLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },

  content: {
    paddingHorizontal: rs(16),
    paddingTop: rvs(14),
    paddingBottom: rvs(48),
    gap: rvs(10),
  },

  identityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    backgroundColor: colors.primary,
    borderRadius: rs(16),
    paddingHorizontal: rs(16),
    paddingVertical: rvs(14),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.28,
    shadowRadius: rs(12),
    elevation: 5,
  },

  identityIconBox: {
    width: rs(46),
    height: rs(46),
    borderRadius: rs(13),
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  identityTextBlock: {
    flex: 1,
    gap: rvs(2),
  },

  identityLabel: {
    fontSize: rfs(8),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.9,
  },

  identityName: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },

  identityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.25)',
    borderRadius: rs(20),
    paddingHorizontal: rs(9),
    paddingVertical: rvs(4),
    flexShrink: 0,
  },

  identityPillText: {
    fontSize: rfs(10),
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0.3,
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

  summaryStat: {
    gap: rvs(4),
  },

  summaryStatLabel: {
    fontSize: rfs(11),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  summaryStatValue: {
    fontSize: rfs(18),
    fontWeight: '800',
    color: colors.textPrimary,
  },

  summaryStatValueSuccess: {
    color: colors.success,
  },

  summaryStatValueWarning: {
    color: colors.accent,
  },

  fieldDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginVertical: rvs(12),
  },

  fieldBlock: {
    gap: rvs(10),
  },

  blockLabel: {
    fontSize: rfs(10),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  chipsWrap: {
    flexDirection: 'row',
    gap: rs(8),
  },

  chip: {
    flex: 1,
    paddingVertical: rvs(11),
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: colors.borderCard,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  chipText: {
    fontSize: rfs(12),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },

  chipTextActive: {
    color: '#FFFFFF',
  },

  nextDueBox: {
    backgroundColor: 'rgba(245,166,35,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.20)',
    borderRadius: rs(12),
    paddingHorizontal: rs(14),
    paddingVertical: rvs(14),
    gap: rvs(4),
  },

  nextDueLabel: {
    fontSize: rfs(11),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  nextDueValue: {
    fontSize: rfs(20),
    fontWeight: '800',
    color: colors.accent,
  },

  nextDueValuePaid: {
    color: colors.success,
  },

  nextDueHint: {
    fontSize: rfs(12),
    color: colors.textSecondary,
    lineHeight: rfs(18),
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

  saveBtnDisabled: {
    opacity: 0.6,
  },

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
  },
});
