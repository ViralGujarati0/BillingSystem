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
import { DEFAULT_STAFF_PERMISSIONS } from '../atoms/staff';
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
  {
    key: 'home', label: 'Home dashboard', icon: 'home-outline', color: '#0d9488', flat: false,
    items: [
      { key: 'overviewStats',    label: 'Overview stats',     description: 'Revenue, profit, bills, items, avg bill, purchases' },
      { key: 'revenueChart',     label: 'Revenue chart',      description: 'Bar chart of daily sales' },
      { key: 'paymentSplit',     label: 'Payment split',      description: 'Cash vs online vs other' },
      { key: 'topProducts',      label: 'Top products',       description: 'Best-selling products' },
      { key: 'comparison',     label: 'Period comparison',  description: 'This period vs previous' },
      { key: 'lowStock',         label: 'Low stock alert',    description: 'Products running low' },
      { key: 'pendingPurchases', label: 'Pending purchases',  description: 'Unpaid purchase invoices' },
      { key: 'recentBillsCard',  label: 'Recent bills',       description: 'Latest bills on home' },
      { key: 'dailyReportFab',   label: 'Print daily report', description: 'Floating button to build / print report' },
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

// ─── Card action (icon + label, equal columns) ────────────────────────────────
const CardAction = ({ icon, label, onPress, iconColor, labelColor }) => (
  <TouchableOpacity
    style={styles.cardAction}
    onPress={onPress}
    activeOpacity={0.72}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <View style={[styles.cardActionIconWrap, { borderColor: iconColor + '35', backgroundColor: iconColor + '12' }]}>
      <Icon name={icon} size={rfs(17)} color={iconColor} />
    </View>
    <Text style={[styles.cardActionLabel, labelColor && { color: labelColor }]} numberOfLines={1}>
      {label}
    </Text>
  </TouchableOpacity>
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

  const [permissions, setPermissions] = useState(() => ({
    ...DEFAULT_STAFF_PERMISSIONS,
    ...staff.permissions,
    sales: { ...DEFAULT_STAFF_PERMISSIONS.sales, ...staff.permissions?.sales },
    stock: { ...DEFAULT_STAFF_PERMISSIONS.stock, ...staff.permissions?.stock },
    home:  { ...DEFAULT_STAFF_PERMISSIONS.home, ...staff.permissions?.home },
  }));

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
        <View style={styles.cardTop}>
          <View style={[styles.avatarWrap, { backgroundColor: avatarColor.bg }]}>
            <Text style={[styles.avatarText, { color: avatarColor.text }]}>
              {staff.name?.charAt(0)?.toUpperCase() ?? '?'}
            </Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{staff.name}</Text>
            <View style={styles.emailRow}>
              <Text style={styles.email} numberOfLines={1}>{staff.email}</Text>
              <View style={styles.pwdPill}>
                <Icon name="lock-closed-outline" size={rfs(12)} color={colors.textSecondary} />
                <Text
                  style={[styles.pwdText, !pwdVisible && { letterSpacing: 1.2 }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {pwdVisible ? (staff.password ?? '—') : '••••••••••'}
                </Text>
                <TouchableOpacity
                  onPress={() => setPwdVisible((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel={pwdVisible ? 'Hide password' : 'Show password'}
                >
                  <Icon
                    name={pwdVisible ? 'eye-off-outline' : 'eye-outline'}
                    size={rfs(15)}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionBar}>
          <CardAction
            icon="create-outline"
            label="Edit"
            iconColor={colors.primary}
            onPress={() => onEdit(staff)}
          />
          <View style={styles.actionBarDivider} />
          <CardAction
            icon="trash-outline"
            label="Delete"
            iconColor={colors.danger}
            labelColor={colors.danger}
            onPress={() => onDelete(staff)}
          />
          <View style={styles.actionBarDivider} />
          <CardAction
            icon="key-outline"
            label="Password"
            iconColor={colors.accent}
            onPress={() => setPwdModal(true)}
          />
          <View style={styles.actionBarDivider} />
          <CardAction
            icon="shield-checkmark-outline"
            label="Access"
            iconColor={colors.success}
            onPress={() => setPermModal(true)}
          />
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
    backgroundColor: '#FFFFFF',
    borderRadius: rs(14),
    borderWidth: 1,
    borderColor: colors.borderCard,
    overflow: 'hidden',
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 1,
    shadowRadius: rs(8),
    elevation: 2,
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(14),
    paddingTop: rs(14),
    paddingBottom: rs(12),
  },

  avatarWrap: {
    width: rs(48),
    height: rs(48),
    borderRadius: rs(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: rs(12),
    shadowOffset: { width: 0, height: rvs(2) },
    shadowOpacity: 0.22,
    shadowRadius: rs(6),
    elevation: 3,
    flexShrink: 0,
  },

  avatarText: {
    fontSize: rfs(19),
    fontWeight: '800',
    letterSpacing: -0.5,
  },

  info: {
    flex: 1,
    minWidth: 0,
    gap: rvs(3),
  },

  name: {
    fontSize: rfs(15),
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },

  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
    marginTop: rvs(2),
    minWidth: 0,
  },

  email: {
    flex: 1,
    minWidth: 0,
    fontSize: rfs(12),
    color: colors.textSecondary,
    fontWeight: '500',
  },

  pwdPill: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    maxWidth: '52%',
    gap: rs(5),
    paddingVertical: rvs(4),
    paddingHorizontal: rs(8),
    borderRadius: rs(20),
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderCard,
  },

  pwdText: {
    flex: 1,
    minWidth: 0,
    fontSize: rfs(11),
    fontWeight: '600',
    color: colors.textSecondary,
  },

  actionBar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    backgroundColor: colors.background,
  },

  actionBarDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginVertical: rvs(10),
  },

  cardAction: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: rvs(12),
    paddingHorizontal: rs(2),
    gap: rvs(6),
  },

  cardActionIconWrap: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(11),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardActionLabel: {
    fontSize: rfs(10),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.2,
    textAlign: 'center',
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