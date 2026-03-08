import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAtom } from 'jotai';
import { useFocusEffect } from '@react-navigation/native';

import AppHeaderLayout from '../components/AppHeaderLayout';
import { currentOwnerAtom } from '../atoms/owner';
import { getShop, getShopSettings } from '../services/shopService';

export default function ShopInfoScreen({ navigation }) {

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

    <AppHeaderLayout title="Shop Information">

      <View style={styles.container}>

        <View style={styles.card}>

          <InfoRow label="Business Name" value={shop.businessName} />
          <InfoRow label="Phone" value={shop.phone} />
          <InfoRow label="Address" value={shop.address} />
          <InfoRow label="GST Number" value={shop.gstNumber} />

          <InfoRow label="Bill Message" value={settings?.billMessage} />
          <InfoRow label="Bill Terms" value={settings?.billTerms} />

        </View>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate("EditShopInfo")}
        >
          <Text style={styles.editText}>Edit</Text>
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