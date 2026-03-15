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
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { resetStaffPassword, updateStaffPermissions } from '../services/staffService';
import { colors } from '../theme/colors';
import { getAvatarColor } from '../utils/avatarColor';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Permission sections config ───────────────────────────────────────────────
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
            <Icon name={section.icon} size={rfs(14)} color={section.color} />
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
          <Icon name={section.icon} size={rfs(14)} color={section.color} />
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

  const [pwdVisible,  setPwdVisible]  = useState(false);
  const [pwdModal,    setPwdModal]    = useState(false);
  const [permModal,   setPermModal]   = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPwd,  setShowNewPwd]  = useState(false);
  const [resetting,   setResetting]   = useState(false);
  const [savingPerms, setSavingPerms] = useState(false);

  const [permissions, setPermissions] = useState(
    staff.permissions ?? {
      billing: false,
      sales:   { summaryStrip: false, calendar: false, recentBills: false },
      stock:   { searchBar: false, statsCards: false, stockHealth: false, categoryFilter: false, quickActions: false, inventoryList: false },
    }
  );

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

  const avatarColor = getAvatarColor(staff.name);

  return (
    <>
      {/* ── Card ── */}
      <View style={styles.card}>

        <View style={[styles.avatarWrap, { backgroundColor: avatarColor.bg }]}>
          <Text style={[styles.avatarText, { color: avatarColor.text }]}>
            {staff.name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{staff.name}</Text>
          <Text style={styles.email}>{staff.email}</Text>
          <View style={styles.pwdRow}>
            <Icon name="lock-closed-outline" size={rfs(12)} color="#aaa" />
            <Text style={styles.pwdText}>
              {pwdVisible ? (staff.password ?? '-') : 'xxxxxxxxxx'}
            </Text>
            <TouchableOpacity
              onPress={() => setPwdVisible((v) => !v)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Icon name={pwdVisible ? 'eye-off-outline' : 'eye-outline'} size={rfs(14)} color="#aaa" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => onEdit(staff)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
            <Icon name="pencil-outline" size={rfs(15)} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.iconBtnRed]} onPress={() => onDelete(staff)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
            <Icon name="trash-outline" size={rfs(15)} color="#E05252" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.iconBtnAmber]} onPress={() => setPwdModal(true)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
            <Icon name="key-outline" size={rfs(15)} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.iconBtnGreen]} onPress={() => setPermModal(true)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
            <Icon name="shield-checkmark-outline" size={rfs(15)} color="#5B9E6D" />
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
                <Icon name="key-outline" size={rfs(20)} color="#e37400" />
              </View>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalTitle}>Reset Password</Text>
                <Text style={styles.modalSubtitle}>{staff.name}</Text>
              </View>
              <TouchableOpacity onPress={handleClosePwdModal}>
                <Icon name="close" size={rfs(20)} color="#aaa" />
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
                <Icon name={showNewPwd ? 'eye-off-outline' : 'eye-outline'} size={rfs(18)} color="#aaa" />
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

            <View style={styles.modalHeader}>
              <View style={[styles.modalIconWrap, { backgroundColor: '#f0fdf4' }]}>
                <Icon name="shield-checkmark-outline" size={rfs(20)} color="#16a34a" />
              </View>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalTitle}>Edit Permissions</Text>
                <Text style={styles.modalSubtitle}>{staff.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setPermModal(false)}>
                <Icon name="close" size={rfs(20)} color="#aaa" />
              </TouchableOpacity>
            </View>

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
              <View style={{ height: rvs(12) }} />
            </ScrollView>

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
    backgroundColor: '#FFFFFF',
    borderRadius: rs(14),
    padding: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(8),
    elevation: 2,
  },

  avatarWrap: {
    width: rs(44),
    height: rs(44),
    borderRadius: rs(13),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: rs(12),
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 0.28,
    shadowRadius: rs(6),
    elevation: 3,
    flexShrink: 0,
  },

  avatarText: {
    fontSize: rfs(18),
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  info: {
    flex: 1,
    gap: rvs(2),
  },

  name: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: colors.textPrimary,
  },

  email: {
    fontSize: rfs(11),
    color: colors.textSecondary,
  },

  pwdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
    marginTop: rvs(3),
  },

  pwdText: {
    fontSize: rfs(11),
    color: colors.textSecondary,
    letterSpacing: 1,
    flex: 1,
  },

  actions: {
    flexDirection: 'row',
    gap: rs(7),
    marginLeft: rs(8),
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    maxWidth: rs(84),
  },

  iconBtn: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(9),
    backgroundColor: 'rgba(45,74,82,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(45,74,82,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconBtnRed:   {
    backgroundColor: 'rgba(224,82,82,0.08)',
    borderColor: 'rgba(224,82,82,0.20)',
  },
  iconBtnAmber: {
    backgroundColor: 'rgba(245,166,35,0.10)',
    borderColor: 'rgba(245,166,35,0.20)',
  },
  iconBtnGreen: {
    backgroundColor: 'rgba(91,158,109,0.10)',
    borderColor: 'rgba(91,158,109,0.20)',
  },

  // ── Overlay ───────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26,46,51,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: rs(24),
  },

  // ── Reset pwd modal ───────────────────────────────────
  modal: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(20),
    padding: rs(20),
    shadowColor: 'rgba(26,46,51,0.25)',
    shadowOffset: { width: 0, height: rvs(8) },
    shadowOpacity: 1,
    shadowRadius: rs(24),
    elevation: 12,
  },

  // ── Permissions modal ─────────────────────────────────
  permModalCard: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(20),
    padding: rs(20),
    shadowColor: 'rgba(26,46,51,0.25)',
    shadowOffset: { width: 0, height: rvs(8) },
    shadowOpacity: 1,
    shadowRadius: rs(24),
    elevation: 12,
  },

  permScroll: { flexGrow: 0 },

  // ── Permission sections ───────────────────────────────
  permSection: {
    backgroundColor: colors.background,
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: colors.borderCard,
    marginBottom: rvs(10),
    overflow: 'hidden',
  },

  permSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(8),
    paddingHorizontal: rs(14),
    paddingVertical: rvs(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.borderCard,
    backgroundColor: '#FFFFFF',
  },

  permIconBox: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(8),
    alignItems: 'center',
    justifyContent: 'center',
  },

  permSectionTitle: {
    flex: 1,
    fontSize: rfs(13),
    fontWeight: '700',
    color: colors.textPrimary,
  },

  selectAllPill: {
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: rs(20),
    paddingHorizontal: rs(8),
    paddingVertical: rvs(3),
  },

  selectAllText: {
    fontSize: rfs(10),
    fontWeight: '600',
    color: colors.textSecondary,
  },

  // ── Toggle row ────────────────────────────────────────
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(14),
    paddingVertical: rvs(10),
  },

  toggleInfo: {
    flex: 1,
    paddingRight: rs(10),
  },

  toggleLabel: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: colors.textPrimary,
  },

  toggleDesc: {
    fontSize: rfs(11),
    color: colors.textSecondary,
    marginTop: rvs(2),
  },

  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginLeft: rs(14),
  },

  // ── Shared modal pieces ───────────────────────────────
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: rvs(18),
    gap: rs(12),
  },

  modalIconWrap: {
    width: rs(42),
    height: rs(42),
    borderRadius: rs(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalTitleWrap: { flex: 1 },

  modalTitle: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: colors.textPrimary,
  },

  modalSubtitle: {
    fontSize: rfs(12),
    color: colors.textSecondary,
    marginTop: rvs(2),
  },

  inputLabel: {
    fontSize: rfs(10),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: rvs(6),
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: rs(12),
    paddingHorizontal: rs(12),
    marginBottom: rvs(18),
    backgroundColor: colors.background,
    height: rvs(48),
  },

  input: {
    flex: 1,
    fontSize: rfs(14),
    fontWeight: '500',
    color: colors.textPrimary,
  },

  modalActions: {
    flexDirection: 'row',
    gap: rs(10),
    marginTop: rvs(4),
  },

  cancelBtn: {
    flex: 1,
    paddingVertical: rvs(13),
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45,74,82,0.04)',
  },

  cancelText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: colors.textSecondary,
  },

  actionBtn: {
    flex: 1,
    paddingVertical: rvs(13),
    borderRadius: rs(12),
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: rvs(3) },
    shadowOpacity: 0.28,
    shadowRadius: rs(8),
    elevation: 4,
  },

  actionBtnText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  btnDisabled: { opacity: 0.6 },

});