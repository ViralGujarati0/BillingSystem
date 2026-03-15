import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function ShopInfoCard({ navigation }) {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ShopInfo')}
    >
      <Text style={styles.title}>{t('shop.info')}</Text>
      <Text>{t('shop.tapToViewEdit')}</Text>
    </TouchableOpacity>
  );
}

const styles=StyleSheet.create({
card:{margin:16,padding:20,backgroundColor:"#fff",borderRadius:10,elevation:2},
title:{fontSize:16,fontWeight:"600"}
});