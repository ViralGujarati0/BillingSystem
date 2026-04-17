import React, { useState } from 'react';
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
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

import AppHeaderLayout from '../components/AppHeaderLayout';
import ConfirmActionModal from '../components/ConfirmActionModal';
import HeaderBackButton from '../components/HeaderBackButton';
import ShopForm from '../components/ShopForm';
import { createShopFormAtom } from '../atoms/forms';
import { defaultCreateShopForm } from '../atoms/forms';
import { currentOwnerAtom } from '../atoms/owner';
import { createShopAndAssignToOwner } from '../services/shopService';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

export default function CreateShopScreen({ navigation, route }) {
  const { t } = useTranslation();
  const [form, setForm] = useAtom(createShopFormAtom);
  const [owner] = useAtom(currentOwnerAtom);
  const ownerDoc = owner || route.params?.userDoc;
  const [saving, setSaving] = useState(false);
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

  const handleCreate = async () => {
    if (!ownerDoc?.id) {
      openResultModal({
        variant: 'danger',
        icon: 'alert-circle-outline',
        title: t('common.error'),
        message: t('common.somethingWentWrong'),
      });
      return;
    }

    if (!form.businessName.trim()) {
      openResultModal({
        variant: 'warning',
        icon: 'storefront-outline',
        title: t('common.error'),
        message: t('shop.businessNameRequired'),
      });
      return;
    }

    try {
      setSaving(true);
      const shopId = await createShopAndAssignToOwner(ownerDoc.id, form);
      const nextUserDoc = {
        ...ownerDoc,
        shopId,
        shopName: form.businessName.trim() || ownerDoc?.shopName,
        shopAddress: form.address?.trim?.() || ownerDoc?.shopAddress || '',
      };

      openResultModal({
        variant: 'success',
        icon: 'checkmark-circle-outline',
        title: 'Shop Created Successfully',
        message: `${form.businessName.trim() || 'Your shop'} is now ready to use.`,
        confirmLabel: 'Continue',
        confirmIcon: 'arrow-forward-outline',
        onConfirm: () => {
          setForm({ ...defaultCreateShopForm });
          navigation.replace('OwnerTabs', {
            userDoc: nextUserDoc,
            showSetupLoader: true,
          });
        },
      });
    } catch (error) {
      console.error('[CreateShopScreen] create error:', error);
      openResultModal({
        variant: 'danger',
        icon: 'close-circle-outline',
        title: 'Shop Creation Failed',
        message: error?.message || 'We could not create your shop right now. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const headerLeft = <HeaderBackButton onPress={() => navigation.goBack()} />;
  const ownerLabel = ownerDoc?.name || 'New Shop';

  return (
    <AppHeaderLayout
      title={t('shop.createShop')}
      subtitle={form.businessName?.trim() || ownerLabel}
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
        itemPill={{ icon: 'storefront-outline', label: form.businessName?.trim() || ownerLabel }}
        onCancel={closeResultModal}
        onConfirm={() => {
          const action = resultModal.onConfirm;
          closeResultModal();
          action?.();
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.identityBadge}>
          <View style={styles.identityIconBox}>
            <Icon name="storefront-outline" size={rfs(22)} color="#FFFFFF" />
          </View>
          <View style={styles.identityTextBlock}>
            <Text style={styles.identityLabel}>NEW SHOP</Text>
            <Text style={styles.identityName} numberOfLines={1}>
              {form.businessName?.trim() || ownerLabel}
            </Text>
          </View>
          <View style={styles.ownerBadge}>
            <Icon name="person-outline" size={rfs(11)} color={colors.accent} />
            <Text style={styles.ownerBadgeText}>Owner</Text>
          </View>
        </View>

        <ShopForm form={form} setForm={setForm} />

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleCreate}
          activeOpacity={0.85}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <View style={styles.saveIconBox}>
                <Icon name="add-outline" size={rfs(15)} color={colors.primary} />
              </View>
              <Text style={styles.saveBtnText}>{t('shop.createShop')}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </AppHeaderLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },

  scrollContent: {
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

  ownerBadge: {
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

  ownerBadgeText: {
    fontSize: rfs(10),
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0.3,
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
});