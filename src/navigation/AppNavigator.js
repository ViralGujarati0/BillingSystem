import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAtomValue, useSetAtom } from 'jotai';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { appInitializingAtom, appInitialRouteAtom, appInitialParamsAtom } from '../atoms/auth';
import { currentStaffAtom } from '../atoms/staff';
import { getUser } from '../services/userService';
import { productCacheAtom, productCacheLoadedAtom } from '../atoms/productCache';
import { loadProductCache } from '../services/productCacheService';

import LoginScreen              from '../views/LoginScreen';
import StaffLoginScreen         from '../views/StaffLoginScreen';
import AddStaffScreen           from '../views/AddStaffScreen';
import EditStaffScreen          from '../views/EditStaffScreen';
import CreateShopScreen         from '../views/CreateShopScreen';
import OwnerTabNavigator        from './OwnerTabNavigator';
import StaffTabNavigator        from './StaffTabNavigator';
import BarcodeScannerScreen     from '../views/BarcodeScannerScreen';
import ProductScanResultScreen  from '../views/ProductScanResultScreen';
import InventoryFormScreen      from '../views/InventoryFormScreen';
import UpdateInventoryScreen    from '../views/UpdateInventoryScreen';
import CreateProductScreen      from '../views/CreateProductScreen';
import BillingScannerScreen     from '../views/BillingScannerScreen';
import ManualItemScreen         from '../views/ManualItemScreen';
import BillingCartScreen        from '../views/BillingCartScreen';
import BillSuccessScreen        from '../views/BillSuccessScreen';
import BillDetailScreen         from '../views/BillDetailScreen';
import ShopInfoScreen           from '../views/ShopInfoScreen';
import EditShopInfoScreen       from '../views/EditShopInfoScreen';
import StaffManagementScreen    from '../views/StaffManagementScreen';
import SupplierManagementScreen from '../views/SupplierManagementScreen';
import SupplierFormScreen       from '../views/SupplierFormScreen';
import PurchaseManagementScreen from '../views/PurchaseManagementScreen';
import PurchaseCreateScreen     from '../views/PurchaseCreateScreen';
import PurchaseSuccessScreen    from '../views/PurchaseSuccessScreen';
import PurchaseDetailScreen     from '../views/PurchaseDetailScreen';
import GlobalSearchScreen       from '../views/GlobalSearchScreen';

export const navigationRef = createNavigationContainerRef();

const Stack = createStackNavigator();

const resetTo = (name, params) => {
  navigationRef.reset({
    index: 0,
    routes: [{ name, params }],
  });
};

const AppNavigator = () => {

  const initializing  = useAtomValue(appInitializingAtom);
  const initialRoute  = useAtomValue(appInitialRouteAtom);
  const initialParams = useAtomValue(appInitialParamsAtom);

  const setInitializing  = useSetAtom(appInitializingAtom);
  const setInitialRoute  = useSetAtom(appInitialRouteAtom);
  const setInitialParams = useSetAtom(appInitialParamsAtom);
  const setProductCache  = useSetAtom(productCacheAtom);
  const setCacheLoaded   = useSetAtom(productCacheLoadedAtom);
  const setCurrentStaff  = useSetAtom(currentStaffAtom);

  // Holds the Firestore staff doc listener — cleaned up on sign out
  const staffListenerRef = useRef(null);

  const stopStaffListener = () => {
    if (staffListenerRef.current) {
      staffListenerRef.current();
      staffListenerRef.current = null;
    }
  };

  const startStaffListener = (uid) => {
    // Clean up any previous listener first
    stopStaffListener();

    staffListenerRef.current = firestore()
      .collection('billing_users')
      .doc(uid)
      .onSnapshot(
        (snap) => {
          if (!snap.exists) return;
          const updatedDoc = { id: snap.id, ...snap.data() };

          // If owner deactivated this staff — sign them out immediately
          if (!updatedDoc.isActive) {
            stopStaffListener();
            auth().signOut();
            return;
          }

          // Update atom — all staff screens react instantly
          setCurrentStaff(updatedDoc);
        },
        (err) => {
          console.error('Staff doc listener error:', err);
        }
      );
  };

  useEffect(() => {

    const unsubscribeAuth = auth().onAuthStateChanged(async (firebaseUser) => {

      try {

        if (firebaseUser) {

          const userDoc  = await getUser(firebaseUser.uid);
          const products = await loadProductCache();
          setProductCache(products);
          setCacheLoaded(true);

          if (userDoc?.role === 'OWNER') {

            // Stop any lingering staff listener from previous session
            stopStaffListener();

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
              return;
            }

            // Set atom immediately for first render
            setCurrentStaff(userDoc);

            // Start realtime listener — updates atom whenever owner changes permissions
            startStaffListener(firebaseUser.uid);

            if (navigationRef.isReady()) {
              resetTo('StaffTabs', { userDoc });
            } else {
              setInitialRoute('StaffTabs');
              setInitialParams({ userDoc });
            }

          } else {

            if (navigationRef.isReady()) {
              resetTo('Login');
            } else {
              setInitialRoute('Login');
            }

          }

        } else {

          // Stop staff listener + clear atom on sign out
          stopStaffListener();
          setCurrentStaff(null);

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

    return () => {
      unsubscribeAuth();
      stopStaffListener();
    };

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

        {/* ── Auth ── */}
        <Stack.Screen name="Login"      component={LoginScreen} />
        <Stack.Screen name="StaffLogin" component={StaffLoginScreen} />

        {/* ── Owner ── */}
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

        {/* ── Staff ── */}
        <Stack.Screen
          name="StaffTabs"
          component={StaffTabNavigator}
          initialParams={initialRoute === 'StaffTabs' ? initialParams : undefined}
        />

        {/* ── Shop ── */}
        <Stack.Screen name="ShopInfo"     component={ShopInfoScreen} />
        <Stack.Screen name="EditShopInfo" component={EditShopInfoScreen} />

        {/* ── Staff management ── */}
        <Stack.Screen name="AddStaff"        component={AddStaffScreen} />
        <Stack.Screen name="EditStaff"       component={EditStaffScreen} />
        <Stack.Screen name="StaffManagement" component={StaffManagementScreen} />

        {/* ── Supplier ── */}
        <Stack.Screen name="SupplierManagement" component={SupplierManagementScreen} />
        <Stack.Screen name="SupplierForm"       component={SupplierFormScreen} />

        {/* ── Purchase ── */}
        <Stack.Screen name="PurchaseManagement" component={PurchaseManagementScreen} />
        <Stack.Screen name="PurchaseCreate"     component={PurchaseCreateScreen} />
        <Stack.Screen name="PurchaseSuccess"    component={PurchaseSuccessScreen} />
        <Stack.Screen name="PurchaseDetail"     component={PurchaseDetailScreen} />

        {/* ── Inventory ── */}
        <Stack.Screen name="BarcodeScanner"    component={BarcodeScannerScreen} />
        <Stack.Screen name="ProductScanResult" component={ProductScanResultScreen} />
        <Stack.Screen name="InventoryForm"     component={InventoryFormScreen} />
        <Stack.Screen name="UpdateInventory"   component={UpdateInventoryScreen} />
        <Stack.Screen name="CreateProduct"     component={CreateProductScreen} />

        {/* ── Billing ── */}
        <Stack.Screen name="BillingScanner" component={BillingScannerScreen} />
        <Stack.Screen name="ManualItem"     component={ManualItemScreen} />
        <Stack.Screen name="BillingCart"    component={BillingCartScreen} />
        <Stack.Screen name="BillSuccess"    component={BillSuccessScreen} />
        <Stack.Screen name="BillDetail"     component={BillDetailScreen} />

        {/* ── Search ── */}
        <Stack.Screen name="GlobalSearch" component={GlobalSearchScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );

};

export default AppNavigator;