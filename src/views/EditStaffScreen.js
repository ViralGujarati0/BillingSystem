import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  currentOwnerAtom,
  editingStaffNameAtom,
  savingStaffAtom,
} from '../atoms/owner';
import { updateStaff } from '../services/staffService';
import { colors } from '../theme/colors';
import AppHeaderLayout from '../components/AppHeaderLayout';
import ConfirmActionModal from '../components/ConfirmActionModal';
import FormInputField from '../components/FormInputField';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Back pill ────────────────────────────────────────────────────────────────
const BackPill = ({ onPress }) => (
  <TouchableOpacity style={styles.backPill} onPress={onPress} activeOpacity={0.75}>
    <Icon name="chevron-back" size={rfs(16)} color="#FFFFFF" />
    <Text style={styles.backPillText}>Back</Text>
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const EditStaffScreen = ({ navigation, route }) => {
  const { staff } = route.params;

  const owner      = useAtomValue(currentOwnerAtom);
  const [name, setName] = useAtom(editingStaffNameAtom);
  const saving     = useAtomValue(savingStaffAtom);
  const setSaving  = useSetAtom(savingStaffAtom);

  const [nameError,    setNameError]    = useState('');
  const [confirmModal, setConfirmModal] = useState(false);

  useEffect(() => {
    setName(staff?.name ?? '');
    return () => setName('');
  }, [staff?.name, setName]);

  // ── Validate → open modal ──
  const handleSavePress = useCallback(() => {
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }
    setNameError('');
    setConfirmModal(true);
  }, [name]);

  // ── Confirmed → actual save ──
  const handleSaveConfirm = useCallback(async () => {
    setConfirmModal(false);
    setSaving(true);
    try {
      await updateStaff(owner?.shopId, staff.id, { name: name.trim() });
      navigation.goBack();
    } catch (err) {
      console.error('[EditStaffScreen] save error:', err);
    } finally {
      setSaving(false);
    }
  }, [name, owner?.shopId, staff?.id, navigation, setSaving]);

  const headerLeft = <BackPill onPress={() => navigation.goBack()} />;

  // ── Derive avatar initial ──
  const initial = (staff?.name || staff?.email || '?')[0].toUpperCase();

  return (
    <AppHeaderLayout
      title="Edit Staff"
      subtitle={staff?.name || 'Staff member'}
      leftComponent={headerLeft}
    >

      {/* ── Save confirm modal ── */}
      <ConfirmActionModal
        visible={confirmModal}
        variant="success"
        icon="checkmark-circle-outline"
        title="Save Changes?"
        message="This will update the staff member's name."
        confirmLabel="Yes, Save"
        confirmIcon="checkmark-outline"
        itemPill={{ icon: 'person-outline', label: name.trim() || staff?.name }}
        loading={saving}
        onCancel={() => setConfirmModal(false)}
        onConfirm={handleSaveConfirm}
      />

      <View style={styles.content}>

        {/* ── Staff identity card ── */}
        <View style={styles.identityCard}>
          <View style={styles.identityStripe} />
          <View style={styles.identityInner}>
            <View style={styles.identityRow}>
              {/* Avatar */}
              <View style={styles.avatar}>
                <Text style={styles.avatarLetter}>{initial}</Text>
              </View>
              {/* Info */}
              <View style={styles.identityInfo}>
                <Text style={styles.identityName} numberOfLines={1}>
                  {staff?.name || '—'}
                </Text>
                <Text style={styles.identityEmail} numberOfLines={1}>
                  {staff?.email || '—'}
                </Text>
                <View style={styles.rolePill}>
                  <View style={styles.roleDot} />
                  <Text style={styles.roleText}>STAFF</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── Section label ── */}
        <View style={styles.sectionLabel}>
          <View style={styles.sectionBar} />
          <Icon name="create-outline" size={rfs(12)} color={colors.accent} />
          <Text style={styles.sectionText}>EDIT DETAILS</Text>
          <View style={styles.sectionLine} />
        </View>

        {/* ── Fields card ── */}
        <View style={styles.card}>

          {/* Name — editable */}
          <FormInputField
            label="Name"
            required
            icon="person-outline"
            value={name}
            onChangeText={(v) => {
              setName(v);
              if (nameError) setNameError('');
            }}
            placeholder="Enter staff name"
            error={nameError}
          />

          <View style={styles.fieldDivider} />

          {/* Email — read-only */}
          <FormInputField
            label="Email (cannot be changed)"
            icon="mail-outline"
            value={staff?.email ?? ''}
            onChangeText={() => {}}
            placeholder="—"
            editable={false}
          />

        </View>

        {/* ── Save button ── */}
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSavePress}
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
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>

      </View>

    </AppHeaderLayout>
  );
};

export default EditStaffScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── Back pill ────────────────────────────────────────
  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: rs(20),
    paddingHorizontal: rs(12),
    paddingVertical: rvs(7),
  },

  backPillText: {
    fontSize: rfs(13),
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ── Content ───────────────────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: rs(16),
    paddingTop: rvs(14),
    paddingBottom: rvs(48),
    gap: rvs(10),
  },

  // ── Identity card ─────────────────────────────────────
  identityCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: rs(18),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(3) },
    shadowOpacity: 1,
    shadowRadius: rs(14),
    elevation: 4,
    overflow: 'hidden',
  },

  identityStripe: {
    width: rs(4),
    backgroundColor: colors.primary,
    flexShrink: 0,
  },

  identityInner: {
    flex: 1,
    padding: rs(16),
  },

  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(14),
  },

  avatar: {
    width: rs(52),
    height: rs(52),
    borderRadius: rs(15),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: rvs(3) },
    shadowOpacity: 0.35,
    shadowRadius: rs(8),
    elevation: 3,
    flexShrink: 0,
  },

  avatarLetter: {
    fontSize: rfs(22),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },

  identityInfo: {
    flex: 1,
    gap: rvs(2),
  },

  identityName: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },

  identityEmail: {
    fontSize: rfs(11),
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: rvs(1),
  },

  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(45,74,82,0.12)',
    borderRadius: rs(20),
    paddingHorizontal: rs(9),
    paddingVertical: rvs(3),
    marginTop: rvs(5),
  },

  roleDot: {
    width: rs(5),
    height: rs(5),
    borderRadius: rs(3),
    backgroundColor: colors.accent,
  },

  roleText: {
    fontSize: rfs(9),
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.7,
  },

  // ── Section label ─────────────────────────────────────
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

  // ── Fields card ───────────────────────────────────────
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

  fieldDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginVertical: rvs(12),
  },

  // ── Save button ───────────────────────────────────────
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