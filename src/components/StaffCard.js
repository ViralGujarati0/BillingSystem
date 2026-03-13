import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Switch,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { resetStaffPassword, updateStaffPermissions } from '../services/staffService';

// ─── Permission sections config (same as AddStaffScreen) ─────────────────────
const PERMISSION_SECTIONS = [
  {
    key: 'billing', label: 'Billing', icon: 'receipt-outline', color: '#f59e0b',
    flat: true, description: 'Allow staff to create new bills',
  },
  {
    key: 'sales', label: 'Sales', icon: 'bar-chart-outline', color: '#3b82f6', flat: false,
    items: [
      { key: 'summaryStrip', label: 'Summary Cards',  description: 'Total sales, profit and bills count' },
      { key: 'calendar',     label: 'Sales Calendar', description: 'Day-wise sales calendar view' },
      { key: 'recentBills',  label: 'Bills List',     description: 'View list of bills for selected date' },
    ],
  },
  {
    key: 'stock', label: 'Stock / Inventory', icon: 'cube-outline', color: '#8b5cf6', flat: false,
    items: [
      { key: 'searchBar',      label: 'Search Bar',       description: 'Search products by name or barcode' },
      { key: 'statsCards',     label: 'Stats Cards',      description: 'Total products, low stock count' },
      { key: 'stockHealth',    label: 'Stock Health Bar', description: 'Visual stock health indicator' },
      { key: 'categoryFilter', label: 'Category Filter',  description: 'Filter inventory by category' },
      { key: 'quickActions',   label: 'Quick Actions',    description: 'Scan, add and create product buttons' },
      { key: 'inventoryList',  label: 'Inventory List',   description: 'View all inventory items' },
    ],
  },
];

// ─── Toggle row ───────────────────────────────────────────────────────────────
const ToggleRow = ({ label, description, value, onToggle, accent }) => (
  <View style={styles.toggleRow}>
    <View style={styles.toggleInfo}>
      <Text style={styles.toggleLabel}>{label}</Text>
      {!!description && <Text style={styles.toggleDesc}>{description}</Text>}
    </View>
    <Switch
      value={!!value}
      onValueChange={onToggle}
      trackColor={{ false: '#e5e7eb', true: accent + '66' }}
      thumbColor={value ? accent : '#d1d5db'}
      ios_backgroundColor="#e5e7eb"
    />
  </View>
);

// ─── Permission section ───────────────────────────────────────────────────────
const PermSection = ({ section, permissions, onToggle }) => {
  if (section.flat) {
    return (
      <View style={styles.permSection}>
        <View style={styles.permSectionHeader}>
          <View style={[styles.permIconBox, { backgroundColor: section.color + '18' }]}>
            <Icon name={section.icon} size={14} color={section.color} />
          </View>
          <Text style={styles.permSectionTitle}>{section.label}</Text>
        </View>
        <ToggleRow
          label={`Enable ${section.label}`}
          description={section.description}
          value={!!permissions[section.key]}
          onToggle={(v) => onToggle(section.key, null, v)}
          accent={section.color}
        />
      </View>
    );
  }

  const allEnabled = section.items.every((it) => !!permissions[section.key]?.[it.key]);

  return (
    <View style={styles.permSection}>
      <View style={styles.permSectionHeader}>
        <View style={[styles.permIconBox, { backgroundColor: section.color + '18' }]}>
          <Icon name={section.icon} size={14} color={section.color} />
        </View>
        <Text style={styles.permSectionTitle}>{section.label}</Text>
        <TouchableOpacity
          style={[styles.selectAllPill, allEnabled && { backgroundColor: section.color + '18', borderColor: section.color + '40' }]}
          onPress={() => section.items.forEach((it) => onToggle(section.key, it.key, !allEnabled))}
          activeOpacity={0.75}
        >
          <Text style={[styles.selectAllText, allEnabled && { color: section.color }]}>
            {allEnabled ? 'Deselect All' : 'Select All'}
          </Text>
        </TouchableOpacity>
      </View>
      {section.items.map((item, idx) => (
        <View key={item.key}>
          <ToggleRow
            label={item.label}
            description={item.description}
            value={!!permissions[section.key]?.[item.key]}
            onToggle={(v) => onToggle(section.key, item.key, v)}
            accent={section.color}
          />
          {idx < section.items.length - 1 && <View style={styles.rowDivider} />}
        </View>
      ))}
    </View>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StaffCard({ staff, onEdit, onDelete }) {

  const [pwdVisible,    setPwdVisible]    = useState(false);
  const [pwdModal,      setPwdModal]      = useState(false);
  const [permModal,     setPermModal]     = useState(false);
  const [newPassword,   setNewPassword]   = useState('');
  const [showNewPwd,    setShowNewPwd]    = useState(false);
  const [resetting,     setResetting]     = useState(false);
  const [savingPerms,   setSavingPerms]   = useState(false);

  // Local permissions state — initialised from staff doc
  const [permissions, setPermissions] = useState(
    staff.permissions ?? {
      billing: false,
      sales:   { summaryStrip: false, calendar: false, recentBills: false },
      stock:   { searchBar: false, statsCards: false, stockHealth: false, categoryFilter: false, quickActions: false, inventoryList: false },
    }
  );

  // ── Toggle permission ──
  const handleToggle = (sectionKey, itemKey, value) => {
    setPermissions((prev) => {
      const perms = { ...prev };
      if (itemKey === null) {
        perms[sectionKey] = value;
      } else {
        perms[sectionKey] = { ...perms[sectionKey], [itemKey]: value };
      }
      return perms;
    });
  };

  // ── Save permissions ──
  const handleSavePermissions = async () => {
    setSavingPerms(true);
    try {
      await updateStaffPermissions(staff.id, permissions);
      setPermModal(false);
    } catch (err) {
      console.error('Failed to update permissions:', err);
    } finally {
      setSavingPerms(false);
    }
  };

  // ── Reset password ──
  const handleResetPassword = async () => {
    if (newPassword.trim().length < 6) return;
    setResetting(true);
    try {
      await resetStaffPassword(staff.id, newPassword.trim());
      setPwdModal(false);
      setNewPassword('');
    } catch (err) {
      console.error('Failed to reset password:', err);
    } finally {
      setResetting(false);
    }
  };

  const handleClosePwdModal = () => {
    setPwdModal(false);
    setNewPassword('');
    setShowNewPwd(false);
  };

  return (
    <>
      {/* ── Card ── */}
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
          <View style={styles.pwdRow}>
            <Icon name="lock-closed-outline" size={12} color="#aaa" />
            <Text style={styles.pwdText}>
              {pwdVisible ? (staff.password ?? '-') : 'xxxxxxxxxx'}
            </Text>
            <TouchableOpacity
              onPress={() => setPwdVisible((v) => !v)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Icon name={pwdVisible ? 'eye-off-outline' : 'eye-outline'} size={14} color="#aaa" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>

          {/* Edit */}
          <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(staff)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
            <Icon name="pencil-outline" size={15} color="#1a73e8" />
          </TouchableOpacity>

          {/* Delete */}
          <TouchableOpacity style={[styles.iconBtn, styles.iconBtnRed]} onPress={() => onDelete(staff)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
            <Icon name="trash-outline" size={15} color="#dc3545" />
          </TouchableOpacity>

          {/* Reset password */}
          <TouchableOpacity style={[styles.iconBtn, styles.iconBtnAmber]} onPress={() => setPwdModal(true)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
            <Icon name="key-outline" size={15} color="#e37400" />
          </TouchableOpacity>

          {/* Permissions */}
          <TouchableOpacity style={[styles.iconBtn, styles.iconBtnGreen]} onPress={() => setPermModal(true)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
            <Icon name="shield-checkmark-outline" size={15} color="#16a34a" />
          </TouchableOpacity>

        </View>
      </View>

      {/* ── Reset Password Modal ── */}
      <Modal visible={pwdModal} transparent animationType="fade" onRequestClose={handleClosePwdModal}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, { backgroundColor: '#FFF4E5' }]}>
                <Icon name="key-outline" size={20} color="#e37400" />
              </View>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalTitle}>Reset Password</Text>
                <Text style={styles.modalSubtitle}>{staff.name}</Text>
              </View>
              <TouchableOpacity onPress={handleClosePwdModal}>
                <Icon name="close" size={20} color="#aaa" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Min. 6 characters"
                placeholderTextColor="#bbb"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPwd}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowNewPwd((v) => !v)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Icon name={showNewPwd ? 'eye-off-outline' : 'eye-outline'} size={18} color="#aaa" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClosePwdModal} disabled={resetting}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#e37400' }, resetting && styles.btnDisabled]}
                onPress={handleResetPassword}
                disabled={resetting}
              >
                {resetting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.actionBtnText}>Reset</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Permissions Modal ── */}
      <Modal visible={permModal} transparent animationType="slide" onRequestClose={() => setPermModal(false)}>
        <View style={styles.overlay}>
          <View style={styles.permModalCard}>

            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, { backgroundColor: '#f0fdf4' }]}>
                <Icon name="shield-checkmark-outline" size={20} color="#16a34a" />
              </View>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalTitle}>Edit Permissions</Text>
                <Text style={styles.modalSubtitle}>{staff.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setPermModal(false)}>
                <Icon name="close" size={20} color="#aaa" />
              </TouchableOpacity>
            </View>

            {/* Scrollable permission sections */}
            <ScrollView
              style={styles.permScroll}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {PERMISSION_SECTIONS.map((section) => (
                <PermSection
                  key={section.key}
                  section={section}
                  permissions={permissions}
                  onToggle={handleToggle}
                />
              ))}
              <View style={{ height: 12 }} />
            </ScrollView>

            {/* Save button */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPermModal(false)} disabled={savingPerms}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#16a34a' }, savingPerms && styles.btnDisabled]}
                onPress={handleSavePermissions}
                disabled={savingPerms}
              >
                {savingPerms
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.actionBtnText}>Save</Text>
                }
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </>
  );
}

const styles = StyleSheet.create({

  // ── Card ──────────────────────────────────────────────
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
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#EEF4FF',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 17, fontWeight: '700', color: '#1a73e8' },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 15, fontWeight: '600', color: '#111' },
  email: { fontSize: 12, color: '#888' },
  pwdRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  pwdText: { fontSize: 12, color: '#aaa', letterSpacing: 1, flex: 1 },
  actions: { flexDirection: 'row', gap: 7, marginLeft: 8, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 80 },
  iconBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#EEF4FF',
    alignItems: 'center', justifyContent: 'center',
  },
  iconBtnRed:   { backgroundColor: '#FEE8EB' },
  iconBtnAmber: { backgroundColor: '#FFF4E5' },
  iconBtnGreen: { backgroundColor: '#f0fdf4' },

  // ── Overlay ───────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // ── Reset pwd modal ───────────────────────────────────
  modal: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },

  // ── Permissions modal ─────────────────────────────────
  permModalCard: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  permScroll: { flexGrow: 0 },

  // ── Permission sections ───────────────────────────────
  permSection: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 10,
    overflow: 'hidden',
  },
  permSectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  permIconBox: {
    width: 28, height: 28, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  permSectionTitle: { flex: 1, fontSize: 13, fontWeight: '700', color: '#111' },
  selectAllPill: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  selectAllText: { fontSize: 10, fontWeight: '600', color: '#9ca3af' },

  // ── Toggle row ────────────────────────────────────────
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  toggleInfo: { flex: 1, paddingRight: 10 },
  toggleLabel: { fontSize: 13, fontWeight: '600', color: '#111' },
  toggleDesc: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  rowDivider: { height: StyleSheet.hairlineWidth, backgroundColor: '#f0f0f0', marginLeft: 14 },

  // ── Shared modal pieces ───────────────────────────────
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 18, gap: 10,
  },
  modalIconWrap: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  modalTitleWrap: { flex: 1 },
  modalTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
  modalSubtitle: { fontSize: 12, color: '#888', marginTop: 1 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#e0e0e0',
    borderRadius: 8, paddingHorizontal: 12,
    marginBottom: 20, backgroundColor: '#fafafa',
  },
  input: { flex: 1, paddingVertical: 11, fontSize: 14, color: '#111' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '600', color: '#666' },
  actionBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center',
  },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  btnDisabled: { opacity: 0.6 },
});