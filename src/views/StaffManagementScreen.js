import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAtomValue, useSetAtom } from 'jotai';
import Icon from 'react-native-vector-icons/Ionicons';

import AppHeaderLayout from '../components/AppHeaderLayout';
import StaffCard from '../components/StaffCard';
import { currentOwnerAtom, staffListAtom, loadingStaffAtom } from '../atoms/owner';
import { subscribeStaffByShopId, deleteStaff } from '../services/staffService';
import { colors } from '../theme/colors';

export default function StaffManagementScreen({ navigation }) {
  const owner        = useAtomValue(currentOwnerAtom);
  const staffList    = useAtomValue(staffListAtom);
  const loading      = useAtomValue(loadingStaffAtom);
  const setStaffList = useSetAtom(staffListAtom);
  const setLoading   = useSetAtom(loadingStaffAtom);

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
    Alert.alert(
      'Delete Staff',
      `Delete "${staff.name}" permanently?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStaff(staff.id);
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  }, []);

  const handleEdit = useCallback(
    (staff) => navigation.navigate('EditStaff', { staff }),
    [navigation]
  );

  const handleAddStaff = () => navigation.navigate('AddStaff');

  // ─── Empty state ────────────────────────────────────────────────────────────
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyWrap}>
        <Icon name="people-outline" size={52} color="#d0d8e8" />
        <Text style={styles.emptyTitle}>No staff yet</Text>
        <Text style={styles.emptySubtitle}>
          Tap the button below to add your first staff member.
        </Text>
      </View>
    );
  };

  return (
    <AppHeaderLayout title="Staff Management">

      <View style={styles.container}>

        {/* Staff count badge */}
        {staffList.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {staffList.length} {staffList.length === 1 ? 'member' : 'members'}
            </Text>
          </View>
        )}

        {/* Loading spinner (first load only) */}
        {loading && staffList.length === 0 ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
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

      {/* Floating Add Staff button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddStaff} activeOpacity={0.85}>
        <Icon name="add" size={24} color="#fff" />
        <Text style={styles.fabText}>Add Staff</Text>
      </TouchableOpacity>

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
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a73e8',
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 100, // clearance for FAB
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    left: 20,
    backgroundColor: '#1a73e8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 4,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  fabText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});