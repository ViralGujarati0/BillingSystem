import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { colors } from '../theme/colors';

export default function SupplierManagementCard({ navigation }) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('SupplierManagement')}
      activeOpacity={0.85}
    >
      <View style={styles.iconWrap}>
        <Icon name="business-outline" size={22} color="#16a34a" />
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.title}>{t('supplier.management')}</Text>
        <Text style={styles.subtitle}>{t('supplier.managementSub')}</Text>
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
    backgroundColor: '#f0fdf4',
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