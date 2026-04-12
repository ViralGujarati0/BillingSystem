import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAtomValue, useSetAtom } from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import AppHeaderLayout    from '../components/AppHeaderLayout';
import HeaderBackButton   from '../components/HeaderBackButton';
import StaffCard          from '../components/StaffCard';
import ConfirmActionModal from '../components/ConfirmActionModal';
import { currentOwnerAtom, staffListAtom, loadingStaffAtom } from '../atoms/owner';
import { subscribeStaffByShopId, deleteStaff } from '../services/staffService';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Loading state ────────────────────────────────────────────────────────────
const LoadingState = () => (
  <View style={styles.stateWrap}>
    <View style={styles.stateIconWrap}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
    <Text style={styles.stateTitle}>Loading staff…</Text>
    <Text style={styles.stateSub}>Fetching your team members</Text>
  </View>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ onAdd }) => (
  <View style={styles.stateWrap}>
    <View style={styles.stateIconWrap}>
      <Icon name="people-outline" size={rfs(34)} color={colors.textSecondary} />
    </View>
    <Text style={styles.stateTitle}>No staff yet</Text>
    <Text style={styles.stateSub}>
      Add your first staff member to get started.
    </Text>
    <TouchableOpacity style={styles.stateBtn} onPress={onAdd} activeOpacity={0.85}>
      <Icon name="person-add-outline" size={rfs(15)} color="#FFFFFF" />
      <Text style={styles.stateBtnText}>Add Staff</Text>
    </TouchableOpacity>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function StaffManagementScreen({ navigation }) {
  const { t }        = useTranslation();
  const owner        = useAtomValue(currentOwnerAtom);
  const staffList    = useAtomValue(staffListAtom);
  const loading      = useAtomValue(loadingStaffAtom);
  const setStaffList = useSetAtom(staffListAtom);
  const setLoading   = useSetAtom(loadingStaffAtom);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,     setDeleting]     = useState(false);

  // ── Realtime listener ──
  useEffect(() => {
    if (!owner?.shopId) return;
    setLoading(true);
    const unsubscribe = subscribeStaffByShopId(owner.shopId, (list) => {
      setStaffList(list);
      setLoading(false);
    });
    return unsubscribe;
  }, [owner?.shopId, setStaffList, setLoading]);

  const handleDelete = useCallback((staff) => setDeleteTarget(staff), []);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteStaff(deleteTarget.id);
    } catch (err) {
      console.error('Delete staff error:', err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleEdit = useCallback(
    (staff) => navigation.navigate('EditStaff', { staff }),
    [navigation]
  );

  const handleAdd = () => navigation.navigate('AddStaff');

  const headerLeft = <HeaderBackButton onPress={() => navigation.goBack()} />;

  return (
    <AppHeaderLayout
      title="Staff Management"
      subtitle={staffList.length > 0 ? `${staffList.length} member${staffList.length === 1 ? '' : 's'}` : undefined}
      leftComponent={headerLeft}
    >

      {/* ── Delete confirm modal ── */}
      <ConfirmActionModal
        visible={!!deleteTarget}
        variant="danger"
        icon="trash-outline"
        title="Delete Staff?"
        message="This will permanently remove this staff member from your shop."
        confirmLabel="Yes, Delete"
        confirmIcon="trash-outline"
        itemPill={{ icon: 'person-outline', label: deleteTarget?.name || '' }}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <View style={styles.container}>

        {/* ── Loading ── */}
        {loading && staffList.length === 0 ? (
          <LoadingState />
        ) : (
          <FlatList
            data={staffList}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <StaffCard
                staff={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
            ListEmptyComponent={<EmptyState onAdd={handleAdd} />}
            contentContainerStyle={[
              styles.listContent,
              staffList.length === 0 && styles.listContentEmpty,
            ]}
            showsVerticalScrollIndicator={false}
          />
        )}

      </View>

      {/* ── FAB — Add Staff ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAdd}
        activeOpacity={0.85}
      >
        <View style={styles.fabIconBox}>
          <Icon name="person-add-outline" size={rfs(16)} color={colors.primary} />
        </View>
        <Text style={styles.fabText}>Add Staff</Text>
      </TouchableOpacity>

    </AppHeaderLayout>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── Container ────────────────────────────────────────
  container: {
    flex: 1,
    paddingHorizontal: rs(16),
    paddingTop: rvs(12),
  },

  // ── List ─────────────────────────────────────────────
  listContent: {
    paddingBottom: rvs(110),
    gap: rvs(10),
  },

  listContentEmpty: {
    flex: 1,
  },

  // ── FAB ──────────────────────────────────────────────
  fab: {
    position: 'absolute',
    bottom: rvs(24),
    right: rs(16),
    left: rs(16),
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(10),
    paddingVertical: rvs(15),
    borderRadius: rs(14),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.30,
    shadowRadius: rs(12),
    elevation: 5,
  },

  fabIconBox: {
    width: rs(26),
    height: rs(26),
    borderRadius: rs(8),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fabText: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // ── Loading / empty states ───────────────────────────
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
    lineHeight: rfs(19),
  },

  stateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(6),
    backgroundColor: colors.primary,
    borderRadius: rs(12),
    paddingHorizontal: rs(20),
    paddingVertical: rvs(12),
    marginTop: rvs(8),
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: rvs(3) },
    shadowOpacity: 0.25,
    shadowRadius: rs(8),
    elevation: 4,
  },

  stateBtnText: {
    fontSize: rfs(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },

});