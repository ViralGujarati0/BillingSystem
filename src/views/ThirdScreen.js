import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppHeaderLayout from '../components/AppHeaderLayout';

const ThirdScreen = () => (
  <AppHeaderLayout
    title="Analytics"
    subtitle="Screen"
  >
  <View style={styles.container}>
    <Text style={styles.text}>Third Screen</Text>
  </View>
  </AppHeaderLayout>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 22,
    fontWeight: '600',
  },
});

export default ThirdScreen;
