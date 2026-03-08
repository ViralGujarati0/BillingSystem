import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { resetStaffPassword } from '../services/staffService';

export default function StaffCard({ staff, onEdit, onDelete }) {

  const [pwdVisible, setPwdVisible]     = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPassword, setNewPassword]   = useState('');
  const [showNewPwd, setShowNewPwd]     = useState(false);
  const [resetting, setResetting]       = useState(false);

  const handleResetPassword = async () => {

    if (newPassword.trim().length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setResetting(true);

    try {
      await resetStaffPassword(staff.id, newPassword.trim());
      Alert.alert('Success', 'Password reset successfully');
      setModalVisible(false);
      setNewPassword('');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setNewPassword('');
    setShowNewPwd(false);
  };

  return (
    <>
      <View style={styles.card}>

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>
            {staff.name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.info}>

          <Text style={styles.name}>{staff.name}</Text>
          <Text style={styles.email}>{staff.email}</Text>

          {/* Password row */}
          <View style={styles.pwdRow}>
            <Icon name="lock-closed-outline" size={12} color="#aaa" />
            <Text style={styles.pwdText}>
              {pwdVisible ? (staff.password ?? '-') : 'xxxxxxxxxx'}
            </Text>
            <TouchableOpacity
              onPress={() => setPwdVisible(v => !v)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Icon
                name={pwdVisible ? 'eye-off-outline' : 'eye-outline'}
                size={14}
                color="#aaa"
              />
            </TouchableOpacity>
          </View>

        </View>

        {/* Action buttons */}
        <View style={styles.actions}>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => onEdit(staff)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Icon name="pencil-outline" size={15} color="#1a73e8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, styles.iconBtnRed]}
            onPress={() => onDelete(staff)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Icon name="trash-outline" size={15} color="#dc3545" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, styles.iconBtnAmber]}
            onPress={() => setModalVisible(true)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Icon name="key-outline" size={15} color="#e37400" />
          </TouchableOpacity>

        </View>

      </View>

      {/* Reset Password Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modal}>

            {/* Modal header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <Icon name="key-outline" size={20} color="#e37400" />
              </View>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalTitle}>Reset Password</Text>
                <Text style={styles.modalSubtitle}>{staff.name}</Text>
              </View>
              <TouchableOpacity onPress={handleCloseModal}>
                <Icon name="close" size={20} color="#aaa" />
              </TouchableOpacity>
            </View>

            {/* New password input */}
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#bbb"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPwd}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowNewPwd(v => !v)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Icon
                  name={showNewPwd ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#aaa"
                />
              </TouchableOpacity>
            </View>

            {/* Modal actions */}
            <View style={styles.modalActions}>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCloseModal}
                disabled={resetting}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.resetBtn, resetting && styles.resetBtnDisabled]}
                onPress={handleResetPassword}
                disabled={resetting}
              >
                {resetting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.resetText}>Reset</Text>
                )}
              </TouchableOpacity>

            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </>
  );
}

const styles = StyleSheet.create({

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a73e8',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  email: {
    fontSize: 12,
    color: '#888',
  },
  pwdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  pwdText: {
    fontSize: 12,
    color: '#aaa',
    letterSpacing: 1,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 7,
    marginLeft: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnRed: {
    backgroundColor: '#FEE8EB',
  },
  iconBtnAmber: {
    backgroundColor: '#FFF4E5',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  modalIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF4E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleWrap: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  input: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: '#111',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#e37400',
    alignItems: 'center',
  },
  resetBtnDisabled: {
    opacity: 0.6,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});