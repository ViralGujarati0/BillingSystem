import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { getApps } from '@react-native-firebase/app';

export default function App() {

  useEffect(() => {
    console.log("Firebase initialized:", getApps().length);
  }, []);

  return (
    <View>
      <Text>Firebase Connected Successfully</Text>
    </View>
  );
}
