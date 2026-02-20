import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';

import { getUser } from '../services/firestore';
import LoginScreen from '../views/LoginScreen';
import HomeScreen from '../views/HomeScreen';
import StaffLoginScreen from '../views/StaffLoginScreen';
import StaffHomeScreen from '../views/StaffHomeScreen';
import AddStaffScreen from '../views/AddStaffScreen';
import CreateShopScreen from '../views/CreateShopScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');
  const [initialParams, setInitialParams] = useState(undefined);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getUser(firebaseUser.uid);
          if (userDoc && userDoc.role === 'OWNER') {
            if (!userDoc.shopId) {
              setInitialRoute('CreateShop');
              setInitialParams({ userDoc });
            } else {
              setInitialRoute('Home');
              setInitialParams({ userDoc });
            }
          } else if (userDoc && userDoc.role === 'STAFF') {
            setInitialRoute('StaffHome');
            setInitialParams({ userDoc });
          } else {
            setInitialRoute('Login');
          }
        } catch (e) {
          setInitialRoute('Login');
        }
      } else {
        setInitialRoute('Login');
      }
      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          initialParams={initialRoute === 'Home' ? initialParams : undefined}
        />
        <Stack.Screen
          name="CreateShop"
          component={CreateShopScreen}
          initialParams={initialRoute === 'CreateShop' ? initialParams : undefined}
        />
        <Stack.Screen
          name="StaffHome"
          component={StaffHomeScreen}
          initialParams={initialRoute === 'StaffHome' ? initialParams : undefined}
        />
        <Stack.Screen name="StaffLogin" component={StaffLoginScreen} />
        <Stack.Screen name="AddStaff" component={AddStaffScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
