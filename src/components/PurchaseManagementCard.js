import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function PurchaseManagementCard({ navigation }) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PurchaseManagement')}
      activeOpacity={0.85}
    >
      <View style={styles.iconWrap}>
        <Icon name="cart-outline" size={22} color="#7c3aed" />
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.title}>Purchase Management</Text>
        <Text style={styles.subtitle}>Create and manage supplier purchases</Text>
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
    backgroundColor: '#f5f3ff',
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