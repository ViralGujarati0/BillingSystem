import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { currentOwnerAtom, editingStaffNameAtom, savingStaffAtom } from '../atoms/owner';
import { updateStaffDoc, updateStaffInShop } from '../services/firestore';

const EditStaffScreen = ({ navigation, route }) => {
  const { staff } = route.params;
  const owner = useAtomValue(currentOwnerAtom);
  const [name, setName] = useAtom(editingStaffNameAtom);
  const saving = useAtomValue(savingStaffAtom);
  const setSaving = useSetAtom(savingStaffAtom);

  useEffect(() => {
    setName(staff?.name ?? '');
    return () => setName('');
  }, [staff?.name, setName]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setSaving(true);
    try {
      await updateStaffDoc(staff.id, { name: name.trim() });
      if (owner?.shopId) {
        await updateStaffInShop(owner.shopId, staff.id, { name: name.trim() });
      }
      Alert.alert('Success', 'Staff updated');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Edit Staff</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Email (cannot be changed)</Text>
      <TextInput
        style={[styles.input, styles.inputDisabled]}
        value={staff?.email ?? ''}
        editable={false}
      />

      <TouchableOpacity
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save'}</Text>
      </TouchableOpacity>
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
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  button: {
    backgroundColor: '#1a73e8',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default EditStaffScreen;
