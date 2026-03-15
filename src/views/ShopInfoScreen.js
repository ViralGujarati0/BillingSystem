import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAtom } from 'jotai';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import AppHeaderLayout from '../components/AppHeaderLayout';
import { currentOwnerAtom } from '../atoms/owner';
import { getShop, getShopSettings } from '../services/shopService';

export default function ShopInfoScreen({ navigation }) {
  const { t } = useTranslation();
  const [owner] = useAtom(currentOwnerAtom);

  const [shop, setShop] = useState(null);
  const [settings, setSettings] = useState(null);

  const load = async () => {

    if (!owner?.shopId) return;

    const shopData = await getShop(owner.shopId);
    const settingsData = await getShopSettings(owner.shopId);

    setShop(shopData);
    setSettings(settingsData);
  };

  // reload when screen is focused
  useFocusEffect(
    useCallback(() => {
      load();
    }, [owner])
  );

  if (!shop) return null;

  return (
    <AppHeaderLayout title={t('shop.title')}>
      <View style={styles.container}>
        <View style={styles.card}>
          <InfoRow label={t('shop.businessName')} value={shop.businessName} />
          <InfoRow label={t('shop.phone')} value={shop.phone} />
          <InfoRow label={t('shop.address')} value={shop.address} />
          <InfoRow label={t('shop.gstNumber')} value={shop.gstNumber} />
          <InfoRow label={t('shop.billMessage')} value={settings?.billMessage} />
          <InfoRow label={t('shop.billTerms')} value={settings?.billTerms} />
        </View>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('EditShopInfo')}
        >
          <Text style={styles.editText}>{t('common.edit')}</Text>
        </TouchableOpacity>
      </View>
    </AppHeaderLayout>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "-"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    padding:16
  },

  card:{
    backgroundColor:"#fff",
    borderRadius:12,
    padding:16,
    elevation:2
  },

  row:{
    marginBottom:14
  },

  label:{
    fontSize:13,
    color:"#888"
  },

  value:{
    fontSize:16,
    fontWeight:"600"
  },

  editBtn:{
    marginTop:20,
    backgroundColor:"#1a73e8",
    padding:14,
    borderRadius:8,
    alignItems:"center"
  },

  editText:{
    color:"#fff",
    fontWeight:"600"
  }

});