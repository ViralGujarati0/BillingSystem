import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';

import AppHeaderLayout        from '../components/AppHeaderLayout';
import ProfileHeader          from '../components/ProfileHeader';
import ShopInfoCard           from '../components/ShopInfoCard';
import StaffManagementCard   from '../components/StaffManagementCard';
import SupplierManagementCard from '../components/SupplierManagementCard';
import PurchaseManagementCard from '../components/PurchaseManagementCard';
import LanguageCard           from '../components/LanguageCard';
import useAuthViewModel       from '../viewmodels/AuthViewModel';
import { localeAtom }        from '../atoms/locale';
import { colors }            from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * scale);

export default function ProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const user = auth().currentUser;
  const savedLocale = useAtomValue(localeAtom);
  const { signOut } = useAuthViewModel();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const performSignOut = async () => {
    setShowConfirm(false);
    setLoggingOut(true);
    try {
      await signOut();
    } catch (e) {
      console.error('[ProfileScreen] signOut error:', e);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <AppHeaderLayout title={t('profile.title')}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        <ProfileHeader
          photoURL={user?.photoURL}
          email={user?.email}
        />

        <LanguageCard currentLocale={savedLocale || 'en'} />
        <ShopInfoCard           navigation={navigation} />
        <StaffManagementCard    navigation={navigation} />
        <SupplierManagementCard navigation={navigation} />
        <PurchaseManagementCard navigation={navigation} />

        {/* ── Sign Out ── */}
        <View style={styles.logoutWrap}>
          <TouchableOpacity
            style={[styles.logoutBtn, loggingOut && styles.logoutBtnDisabled]}
            onPress={() => setShowConfirm(true)}
            disabled={loggingOut}
            activeOpacity={0.85}
          >
            {loggingOut ? (
              <ActivityIndicator size="small" color="#E05252" />
            ) : (
              <>
                <Icon name="log-out-outline" size={rfs(18)} color="#E05252" />
                <Text style={styles.logoutText}>{t('profile.signOut')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* ── Sign out confirm modal — replaces Alert to fix Android Activity issue ── */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <View style={styles.modalIconWrap}>
              <Icon name="log-out-outline" size={rfs(28)} color="#E05252" />
            </View>

            <Text style={styles.modalTitle}>{t('profile.signOutConfirmTitle')}</Text>
            <Text style={styles.modalMessage}>{t('profile.signOutConfirmMessage')}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowConfirm(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={performSignOut}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmText}>{t('profile.signOut')}</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </AppHeaderLayout>
  );
}

const styles = StyleSheet.create({

  scroll: { flex: 1 },

  content: {
    paddingTop: rvs(16),
    paddingBottom: rvs(48),
  },

  // ── Logout button ──────────────────────────────────────
  logoutWrap: {
    paddingHorizontal: rs(16),
    marginTop: rvs(24),
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(8),
    paddingVertical: rvs(14),
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: 'rgba(224,82,82,0.30)',
    backgroundColor: 'rgba(224,82,82,0.06)',
  },

  logoutBtnDisabled: { opacity: 0.6 },

  logoutText: {
    fontSize: rfs(15),
    fontWeight: '700',
    color: '#E05252',
  },

  // ── Confirm modal ──────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(32),
  },

  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(20),
    paddingTop: rvs(28),
    paddingBottom: rvs(20),
    paddingHorizontal: rs(24),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: rvs(8) },
    shadowOpacity: 0.15,
    shadowRadius: rs(20),
    elevation: 10,
  },

  modalIconWrap: {
    width: rs(60),
    height: rs(60),
    borderRadius: rs(30),
    backgroundColor: 'rgba(224,82,82,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rvs(14),
  },

  modalTitle: {
    fontSize: rfs(18),
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: rvs(8),
  },

  modalMessage: {
    fontSize: rfs(14),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: rfs(21),
    marginBottom: rvs(24),
  },

  modalActions: {
    flexDirection: 'row',
    gap: rs(10),
    width: '100%',
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: rvs(13),
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
  },

  cancelText: {
    fontSize: rfs(14),
    fontWeight: '600',
    color: colors.textSecondary,
  },

  confirmBtn: {
    flex: 1,
    paddingVertical: rvs(13),
    borderRadius: rs(12),
    backgroundColor: '#E05252',
    alignItems: 'center',
  },

  confirmText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },

});