import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SecondScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Second Screen</Text>
  </View>
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

export default SecondScreen;
