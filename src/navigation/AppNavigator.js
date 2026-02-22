import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAtomValue, useSetAtom } from 'jotai';
import auth from '@react-native-firebase/auth';

import { appInitializingAtom, appInitialRouteAtom, appInitialParamsAtom } from '../atoms/auth';
import { getUser } from '../services/firestore';
import LoginScreen from '../views/LoginScreen';
import StaffLoginScreen from '../views/StaffLoginScreen';
import StaffHomeScreen from '../views/StaffHomeScreen';
import AddStaffScreen from '../views/AddStaffScreen';
import CreateShopScreen from '../views/CreateShopScreen';
import StaffListScreen from '../views/StaffListScreen';
import EditStaffScreen from '../views/EditStaffScreen';
import OwnerTabNavigator from './OwnerTabNavigator';
import BarcodeScannerScreen from '../views/BarcodeScannerScreen';
import ProductScanResultScreen from '../views/ProductScanResultScreen';
import InventoryFormScreen from '../views/InventoryFormScreen';
import CreateProductScreen from '../views/CreateProductScreen';
import BillingScannerScreen from '../views/BillingScannerScreen';
import ManualItemScreen from '../views/ManualItemScreen';
import BillingCartScreen from '../views/BillingCartScreen';
import BillSuccessScreen from '../views/BillSuccessScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const initializing = useAtomValue(appInitializingAtom);
  const initialRoute = useAtomValue(appInitialRouteAtom);
  const initialParams = useAtomValue(appInitialParamsAtom);
  const setInitializing = useSetAtom(appInitializingAtom);
  const setInitialRoute = useSetAtom(appInitialRouteAtom);
  const setInitialParams = useSetAtom(appInitialParamsAtom);

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
              setInitialRoute('OwnerTabs');
              setInitialParams({ userDoc });
            }
          } else if (userDoc && userDoc.role === 'STAFF') {
            if (!userDoc.isActive) {
              await auth().signOut();
              setInitialRoute('Login');
              return;
            }
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
  }, [setInitializing, setInitialRoute, setInitialParams]);

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
          name="OwnerTabs"
          component={OwnerTabNavigator}
          initialParams={initialRoute === 'OwnerTabs' ? initialParams : undefined}
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
        <Stack.Screen name="StaffList" component={StaffListScreen} />
        <Stack.Screen name="EditStaff" component={EditStaffScreen} />
        <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} />
        <Stack.Screen name="ProductScanResult" component={ProductScanResultScreen} />
        <Stack.Screen name="InventoryForm" component={InventoryFormScreen} />
        <Stack.Screen name="CreateProduct" component={CreateProductScreen} />
        <Stack.Screen name="BillingScanner" component={BillingScannerScreen} />
        <Stack.Screen name="ManualItem" component={ManualItemScreen} />
        <Stack.Screen name="BillingCart" component={BillingCartScreen} />
        <Stack.Screen name="BillSuccess" component={BillSuccessScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
