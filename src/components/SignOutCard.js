import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import useAuthViewModel from '../viewmodels/AuthViewModel';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

export default function SignOutCard() {
  const { signOut } = useAuthViewModel();

  const [loggingOut,  setLoggingOut]  = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const performSignOut = async () => {
    setShowConfirm(false);
    setLoggingOut(true);
    try {
      await signOut();
    } catch (e) {
      console.error('[SignOutCard] signOut error:', e);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.row, loggingOut && styles.rowDisabled]}
        onPress={() => setShowConfirm(true)}
        disabled={loggingOut}
        activeOpacity={0.8}
      >
        <View style={styles.iconBox}>
          {loggingOut ? (
            <ActivityIndicator size="small" color="#E05252" />
          ) : (
            <Icon name="log-out-outline" size={rfs(16)} color={colors.textLight} />
          )}
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title}>Sign Out</Text>
          <Text style={styles.subtitle}>Log out of your account</Text>
        </View>

        <Icon name="chevron-forward" size={rfs(14)} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* ── Confirm modal ── */}
      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <View style={styles.modalIconRing}>
              <Icon name="log-out-outline" size={rfs(28)} color={colors.textLight} />
            </View>

            <Text style={styles.modalTitle}>Sign Out?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to sign out of your account?
            </Text>

            <View style={styles.modalDivider} />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowConfirm(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={performSignOut}
                activeOpacity={0.85}
              >
                <Icon name="log-out-outline" size={rfs(14)} color="#FFFFFF" />
                <Text style={styles.modalConfirmText}>Sign Out</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({

  // ── Row (matches PurchaseManagementCard) ──────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    paddingHorizontal: rs(14),
    paddingVertical: rvs(13),
    backgroundColor: '#FFFFFF',
  },

  rowDisabled: { opacity: 0.6 },

  iconBox: {
    width: rs(38),
    height: rs(38),
    borderRadius: rs(10),
    // backgroundColor: 'rgba(224,82,82,0.08)',
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(224,82,82,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  textWrap: { flex: 1 },

  title: {
    fontSize: rfs(16),
    fontWeight: '700',
    color: colors.textPrimary,
  },

  subtitle: {
    fontSize: rfs(12),
    color: colors.textSecondary,
    marginTop: rvs(1),
  },

  // ── Modal ──────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26,46,51,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: rs(24),
  },

  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(20),
    paddingHorizontal: rs(20),
    paddingTop: rvs(28),
    paddingBottom: rvs(20),
    alignItems: 'center',
    shadowColor: 'rgba(26,46,51,0.25)',
    shadowOffset: { width: 0, height: rvs(8) },
    shadowOpacity: 1,
    shadowRadius: rs(24),
    elevation: 12,
  },

  modalIconRing: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(32),
    backgroundColor: 'rgba(224,82,82,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(224,82,82,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: rvs(14),
  },

  modalTitle: {
    fontSize: rfs(18),
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: rvs(8),
    textAlign: 'center',
  },

  modalMessage: {
    fontSize: rfs(13),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: rfs(20),
    marginBottom: rvs(18),
  },

  modalDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginBottom: rvs(16),
  },

  modalActions: {
    flexDirection: 'row',
    gap: rs(10),
    width: '100%',
  },

  modalCancelBtn: {
    flex: 1,
    paddingVertical: rvs(13),
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45,74,82,0.04)',
  },

  modalCancelText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: colors.textSecondary,
  },

  modalConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(6),
    paddingVertical: rvs(13),
    borderRadius: rs(12),
    backgroundColor: '#E05252',
    shadowColor: '#E05252',
    shadowOffset: { width: 0, height: rvs(3) },
    shadowOpacity: 0.30,
    shadowRadius: rs(8),
    elevation: 4,
  },

  modalConfirmText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },

});