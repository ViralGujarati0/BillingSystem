import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
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
import UpdateInventoryScreen from '../views/UpdateInventoryScreen';
import CreateProductScreen from '../views/CreateProductScreen';
import BillingScannerScreen from '../views/BillingScannerScreen';
import ManualItemScreen from '../views/ManualItemScreen';
import BillingCartScreen from '../views/BillingCartScreen';
import BillSuccessScreen from '../views/BillSuccessScreen';
import SupplierListScreen from '../views/SupplierListScreen';
import SupplierCreateScreen from '../views/SupplierCreateScreen';
import SupplierEditScreen from '../views/SupplierEditScreen';
import PurchaseCreateScreen from '../views/PurchaseCreateScreen';
import PurchaseSuccessScreen from '../views/PurchaseSuccessScreen';

// ── Global navigation ref — use this to navigate from outside React tree ──────
export const navigationRef = createNavigationContainerRef();

const Stack = createStackNavigator();

// ── Helper: reset stack to a single route ─────────────────────────────────────
const resetTo = (name, params) => {
  navigationRef.reset({
    index: 0,
    routes: [{ name, params }],
  });
};

const AppNavigator = () => {
  const initializing    = useAtomValue(appInitializingAtom);
  const initialRoute    = useAtomValue(appInitialRouteAtom);
  const initialParams   = useAtomValue(appInitialParamsAtom);
  const setInitializing = useSetAtom(appInitializingAtom);
  const setInitialRoute = useSetAtom(appInitialRouteAtom);
  const setInitialParams = useSetAtom(appInitialParamsAtom);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getUser(firebaseUser.uid);

          if (userDoc?.role === 'OWNER') {
            const route = userDoc.shopId ? 'OwnerTabs' : 'CreateShop';

            if (navigationRef.isReady()) {
              resetTo(route, { userDoc });
            } else {
              setInitialRoute(route);
              setInitialParams({ userDoc });
            }

          } else if (userDoc?.role === 'STAFF') {
            if (!userDoc.isActive) {
              await auth().signOut();
              // onAuthStateChanged will fire again with null → handled below
              return;
            }

            if (navigationRef.isReady()) {
              resetTo('StaffHome', { userDoc });
            } else {
              setInitialRoute('StaffHome');
              setInitialParams({ userDoc });
            }

          } else {
            // Logged in but no valid user doc
            if (navigationRef.isReady()) {
              resetTo('Login');
            } else {
              setInitialRoute('Login');
            }
          }

        } else {
          // Signed out
          if (navigationRef.isReady()) {
            resetTo('Login');
          } else {
            setInitialRoute('Login');
          }
        }
      } catch (e) {
        console.error('AppNavigator auth error:', e);
        if (navigationRef.isReady()) {
          resetTo('Login');
        } else {
          setInitialRoute('Login');
        }
      } finally {
        setInitializing(false);
      }
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
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Login"        component={LoginScreen} />
        <Stack.Screen name="StaffLogin"   component={StaffLoginScreen} />

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

        <Stack.Screen name="AddStaff"           component={AddStaffScreen} />
        <Stack.Screen name="StaffList"           component={StaffListScreen} />
        <Stack.Screen name="EditStaff"           component={EditStaffScreen} />
        <Stack.Screen name="BarcodeScanner"      component={BarcodeScannerScreen} />
        <Stack.Screen name="ProductScanResult"   component={ProductScanResultScreen} />
        <Stack.Screen name="InventoryForm"       component={InventoryFormScreen} />
        <Stack.Screen name="UpdateInventory"     component={UpdateInventoryScreen} />
        <Stack.Screen name="CreateProduct"       component={CreateProductScreen} />
        <Stack.Screen name="BillingScanner"      component={BillingScannerScreen} />
        <Stack.Screen name="ManualItem"          component={ManualItemScreen} />
        <Stack.Screen name="BillingCart"         component={BillingCartScreen} />
        <Stack.Screen name="BillSuccess"         component={BillSuccessScreen} />
        <Stack.Screen name="SupplierList"        component={SupplierListScreen} />
        <Stack.Screen name="SupplierCreate"      component={SupplierCreateScreen} />
        <Stack.Screen name="SupplierEdit"        component={SupplierEditScreen} />
        <Stack.Screen name="PurchaseCreate"      component={PurchaseCreateScreen} />
        <Stack.Screen name="PurchaseSuccess"     component={PurchaseSuccessScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;