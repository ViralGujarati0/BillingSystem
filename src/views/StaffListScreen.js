import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  currentOwnerAtom,
  staffListAtom,
  loadingStaffAtom,
} from '../atoms/owner';
import { subscribeStaffByShopId } from '../services/firestore';
import functions from '@react-native-firebase/functions';

const StaffListScreen = ({ navigation }) => {
  const owner = useAtomValue(currentOwnerAtom);
  const staffList = useAtomValue(staffListAtom);
  const loading = useAtomValue(loadingStaffAtom);
  const setStaffList = useSetAtom(staffListAtom);
  const setLoading = useSetAtom(loadingStaffAtom);

  // 🔴 Realtime staff listener
  useEffect(() => {
    if (!owner?.shopId) return;

    setLoading(true);

    const unsubscribe = subscribeStaffByShopId(owner.shopId, (list) => {
      setStaffList(list);
      setLoading(false);
    });

    return unsubscribe; // cleanup listener on unmount
  }, [owner?.shopId, setStaffList, setLoading]);

  const handleDelete = (staff) => {
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
              await functions().httpsCallable('deleteStaff')({
                staffId: staff.id,
              });
              // realtime listener auto refreshes list
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (staff) => {
    navigation.navigate('EditStaff', { staff });
  };

  if (!owner?.shopId) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>No shop found.</Text>
      </View>
    );
  }

  if (loading && staffList.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Staff List</Text>

      {staffList.length === 0 ? (
        <Text style={styles.empty}>No staff added yet.</Text>
      ) : (
        <FlatList
          data={staffList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleEdit(item)}
                >
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.delBtn, { marginLeft: 8 }]}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.delBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 24,
    paddingTop: 56,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backText: {
    color: '#1a73e8',
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#666',
  },
  empty: {
    fontSize: 16,
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
  },
  editBtn: {
    backgroundColor: '#1a73e8',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  editBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  delBtn: {
    backgroundColor: '#dc3545',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  delBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default StaffListScreen;