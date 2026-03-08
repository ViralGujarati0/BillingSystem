import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

export default function StaffManagementCard({ navigation }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('StaffManagement')}
      activeOpacity={0.85}
    >
      <View style={styles.iconWrap}>
        <Icon name="people" size={22} color={colors.primary} />
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.title}>Staff Management</Text>
        <Text style={styles.subtitle}>Add, edit or remove staff members</Text>
      </View>

      <Icon name="chevron-forward" size={18} color="#bbb" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
});