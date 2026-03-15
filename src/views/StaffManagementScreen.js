// import React, { useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import { useAtomValue, useSetAtom } from 'jotai';
// import Icon from 'react-native-vector-icons/Ionicons';

// import AppHeaderLayout from '../components/AppHeaderLayout';
// import StaffCard from '../components/StaffCard';
// import { currentOwnerAtom, staffListAtom, loadingStaffAtom } from '../atoms/owner';
// import { subscribeStaffByShopId, deleteStaff } from '../services/staffService';
// import { colors } from '../theme/colors';

// export default function StaffManagementScreen({ navigation }) {
//   const owner        = useAtomValue(currentOwnerAtom);
//   const staffList    = useAtomValue(staffListAtom);
//   const loading      = useAtomValue(loadingStaffAtom);
//   const setStaffList = useSetAtom(staffListAtom);
//   const setLoading   = useSetAtom(loadingStaffAtom);

//   // Realtime staff listener
//   useEffect(() => {
//     if (!owner?.shopId) return;

//     setLoading(true);

//     const unsubscribe = subscribeStaffByShopId(owner.shopId, (list) => {
//       setStaffList(list);
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, [owner?.shopId, setStaffList, setLoading]);

//   const handleDelete = useCallback((staff) => {
//     Alert.alert(
//       'Delete Staff',
//       `Delete "${staff.name}" permanently?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await deleteStaff(staff.id);
//             } catch (err) {
//               Alert.alert('Error', err.message);
//             }
//           },
//         },
//       ]
//     );
//   }, []);

//   const handleEdit = useCallback(
//     (staff) => navigation.navigate('EditStaff', { staff }),
//     [navigation]
//   );

//   const handleAddStaff = () => navigation.navigate('AddStaff');

//   // ─── Empty state ────────────────────────────────────────────────────────────
//   const renderEmpty = () => {
//     if (loading) return null;
//     return (
//       <View style={styles.emptyWrap}>
//         <Icon name="people-outline" size={52} color="#d0d8e8" />
//         <Text style={styles.emptyTitle}>No staff yet</Text>
//         <Text style={styles.emptySubtitle}>
//           Tap the button below to add your first staff member.
//         </Text>
//       </View>
//     );
//   };

//   return (
//     <AppHeaderLayout title="Staff Management">

//       <View style={styles.container}>

//         {/* Staff count badge */}
//         {staffList.length > 0 && (
//           <View style={styles.countBadge}>
//             <Text style={styles.countText}>
//               {staffList.length} {staffList.length === 1 ? 'member' : 'members'}
//             </Text>
//           </View>
//         )}

//         {/* Loading spinner (first load only) */}
//         {loading && staffList.length === 0 ? (
//           <View style={styles.loadingWrap}>
//             <ActivityIndicator size="large" color={colors.primary} />
//           </View>
//         ) : (
//           <FlatList
//             data={staffList}
//             keyExtractor={(item) => String(item.id)}
//             renderItem={({ item }) => (
//               <StaffCard
//                 staff={item}
//                 onEdit={handleEdit}
//                 onDelete={handleDelete}
//               />
//             )}
//             ListEmptyComponent={renderEmpty}
//             contentContainerStyle={styles.listContent}
//             showsVerticalScrollIndicator={false}
//           />
//         )}

//       </View>

//       {/* Floating Add Staff button */}
//       <TouchableOpacity style={styles.fab} onPress={handleAddStaff} activeOpacity={0.85}>
//         <Icon name="add" size={24} color="#fff" />
//         <Text style={styles.fabText}>Add Staff</Text>
//       </TouchableOpacity>

//     </AppHeaderLayout>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingTop: 12,
//   },
//   countBadge: {
//     alignSelf: 'flex-start',
//     backgroundColor: '#EEF4FF',
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     marginBottom: 14,
//   },
//   countText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#1a73e8',
//   },
//   loadingWrap: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   listContent: {
//     paddingBottom: 100, // clearance for FAB
//   },
//   emptyWrap: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingTop: 80,
//     gap: 10,
//   },
//   emptyTitle: {
//     fontSize: 17,
//     fontWeight: '700',
//     color: '#333',
//   },
//   emptySubtitle: {
//     fontSize: 13,
//     color: '#999',
//     textAlign: 'center',
//     paddingHorizontal: 32,
//   },
//   fab: {
//     position: 'absolute',
//     bottom: 24,
//     right: 20,
//     left: 20,
//     backgroundColor: '#1a73e8',
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     borderRadius: 12,
//     gap: 8,
//     elevation: 4,
//     shadowColor: '#1a73e8',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.35,
//     shadowRadius: 10,
//   },
//   fabText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 15,
//   },
// });


import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useAtomValue, useSetAtom } from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

import AppHeaderLayout from '../components/AppHeaderLayout';
import StaffCard from '../components/StaffCard';
import Loader   from '../components/Loader';
import { currentOwnerAtom, staffListAtom, loadingStaffAtom } from '../atoms/owner';
import { subscribeStaffByShopId, deleteStaff } from '../services/staffService';
import { colors } from '../theme/colors';

export default function StaffManagementScreen({ navigation }) {
  const { t }     = useTranslation();
  const owner        = useAtomValue(currentOwnerAtom);
  const staffList    = useAtomValue(staffListAtom);
  const loading      = useAtomValue(loadingStaffAtom);
  const setStaffList = useSetAtom(staffListAtom);
  const setLoading   = useSetAtom(loadingStaffAtom);

  // Custom confirm modal state — replaces Alert to fix Android Activity issue
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);

  // Realtime staff listener
  useEffect(() => {
    if (!owner?.shopId) return;
    setLoading(true);
    const unsubscribe = subscribeStaffByShopId(owner.shopId, (list) => {
      setStaffList(list);
      setLoading(false);
    });
    return unsubscribe;
  }, [owner?.shopId, setStaffList, setLoading]);

  const handleDelete = useCallback((staff) => {
    setDeleteTarget(staff);
  }, []);

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

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyWrap}>
        <Icon name="people-outline" size={52} color="#d0d8e8" />
        <Text style={styles.emptyTitle}>{t('staff.emptyTitle')}</Text>
        <Text style={styles.emptySubtitle}>
          {t('staff.emptySubtitle')}
        </Text>
      </View>
    );
  };

  return (
    <AppHeaderLayout title={t('staff.management')}>

      <View style={styles.container}>

        {staffList.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {t('staff.countLabel', { count: staffList.length })}
            </Text>
          </View>
        )}

        {loading && staffList.length === 0 ? (
          <Loader />
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
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

      </View>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddStaff')}
        activeOpacity={0.85}
      >
        <Icon name="add" size={24} color="#fff" />
        <Text style={styles.fabText}>{t('staff.addStaff')}</Text>
      </TouchableOpacity>

      {/* ── Delete confirm modal — no Alert ── */}
      <Modal
        visible={!!deleteTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            <View style={styles.modalIconWrap}>
              <Icon name="trash-outline" size={28} color="#dc3545" />
            </View>

            <Text style={styles.modalTitle}>{t('staff.deleteTitle')}</Text>
            <Text style={styles.modalMessage}>
              {t('staff.deleteMessage', { name: deleteTarget?.name })}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                <Text style={styles.cancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteBtn, deleting && { opacity: 0.6 }]}
                onPress={confirmDelete}
                disabled={deleting}
              >
                {deleting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.deleteBtnText}>{t('common.delete')}</Text>
                }
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </AppHeaderLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  countBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF4FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
  },
  countText: { fontSize: 12, fontWeight: '600', color: '#1a73e8' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: 100 },
  emptyWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingTop: 80, gap: 10,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  emptySubtitle: { fontSize: 13, color: '#999', textAlign: 'center', paddingHorizontal: 32 },
  fab: {
    position: 'absolute', bottom: 24, right: 20, left: 20,
    backgroundColor: '#1a73e8',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12, gap: 8,
    elevation: 4,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10,
  },
  fabText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // ── Delete modal ──────────────────────────────────────
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    width: '100%', backgroundColor: '#fff',
    borderRadius: 20, paddingTop: 28, paddingBottom: 20,
    paddingHorizontal: 24, alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  modalIconWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#FEE8EB',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 8 },
  modalMessage: {
    fontSize: 14, color: '#666',
    textAlign: 'center', lineHeight: 21, marginBottom: 24,
  },
  modalActions: { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    borderWidth: 1, borderColor: '#e0e0e0', alignItems: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '600', color: '#666' },
  deleteBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 12,
    backgroundColor: '#dc3545', alignItems: 'center',
  },
  deleteBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});