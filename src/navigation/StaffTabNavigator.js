import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, Platform, StatusBar,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

import StaffHomeScreen    from '../views/StaffHomeScreen';
import StaffSalesScreen   from '../views/StaffSalesScreen';
import StaffStockScreen   from '../views/StaffStockScreen';
import StaffProfileScreen from '../views/StaffProfileScreen';

const Tab = createBottomTabNavigator();
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ── Identical layout constants to OwnerTabNavigator ──────────────────────────
const NAV_H       = rvs(64);
const PLUS_D      = rs(54);
const PLUS_RING_D = PLUS_D + rs(8);
const CENTER_GAP  = PLUS_RING_D + rs(28);
const ICON_SIZE   = rs(22);
const PLUS_ICON_SZ = rs(30);
const TAB_PY      = rvs(10);
const TAB_GAP     = rvs(4);
const NAV_RADIUS  = rs(24);
const NAV_ELEV    = 16;
const PLUS_ELEV   = 14;
const SHADOW_R    = rs(20);
const PLUS_SHADOW_R = rs(14);
const PLUS_SHADOW_Y = rvs(6);
const PLUS_BOTTOM = NAV_H / 2 - PLUS_RING_D / 2;
const OUTER_H     = NAV_H;

const TABS = [
  { name: 'StaffHomeTab',    label: 'Home',    icon: 'home-outline'    },
  { name: 'StaffSalesTab',   label: 'Sales',   icon: 'list-outline'    },
  { name: 'StaffStockTab',   label: 'Stock',   icon: 'grid-outline'    },
  { name: 'StaffProfileTab', label: 'Profile', icon: 'person-outline'  },
];

// ── Plus button — only shown if billing permission is enabled ─────────────────
function PlusButton({ onPress }) {
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim,  { toValue: 0.88, duration: 90,  useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 1,    duration: 200, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(scaleAnim,  { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start();
    onPress?.();
  };

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  return (
    <View style={styles.plusWrap}>
      <View style={styles.plusRing}>
        <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
          <Animated.View style={[styles.plusBtn, { transform: [{ scale: scaleAnim }, { rotate: spin }] }]}>
            <Icon name="add" size={PLUS_ICON_SZ} color="#ffffff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
      <Text style={styles.plusLbl}>New Bill</Text>
    </View>
  );
}

// ── Tab item ──────────────────────────────────────────────────────────────────
function TabItem({ tab, focused, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(colorAnim, { toValue: focused ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [focused]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity style={styles.tab} activeOpacity={1} onPress={handlePress}>
      <Animated.View style={[styles.tabIconWrap, { transform: [{ scale: scaleAnim }] }]}>
        <Icon
          name={focused ? tab.icon.replace('-outline', '') : tab.icon}
          size={ICON_SIZE}
          color={focused ? '#FFFFFF' : 'rgba(255,255,255,0.45)'}
        />
      </Animated.View>
      <Text style={[styles.tabLbl, focused && styles.tabLblActive]}>{tab.label}</Text>
    </TouchableOpacity>
  );
}

// ── Custom tab bar ─────────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation, permissions }) {
  const activeIdx    = state.index;
  const canBill      = !!permissions?.billing;

  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        const NavBar = require('react-native-navigation-bar-color').default;
        NavBar.setNavigationBarColor(colors.primary, true);
        NavBar.setNavigationBarDividerColor('transparent');
      } catch (_) {}
    }
  }, []);

  return (
    <View style={styles.navOuter}>
      <View style={styles.navBar}>
        <View style={styles.tabGroup}>
          {[0, 1].map((idx) => (
            <TabItem key={TABS[idx].name} tab={TABS[idx]} focused={activeIdx === idx}
              onPress={() => navigation.navigate(TABS[idx].name)} />
          ))}
        </View>
        <View style={styles.centerGap} />
        <View style={styles.tabGroup}>
          {[2, 3].map((idx) => (
            <TabItem key={TABS[idx].name} tab={TABS[idx]} focused={activeIdx === idx}
              onPress={() => navigation.navigate(TABS[idx].name)} />
          ))}
        </View>
      </View>

      {/* Show plus only if billing is allowed */}
      {canBill && (
        <PlusButton
          onPress={() => navigation.getParent()?.navigate('BillingScanner')}
        />
      )}

      {/* If billing not allowed — show disabled placeholder so layout stays consistent */}
      {!canBill && (
        <View style={styles.plusWrap}>
          <View style={[styles.plusRing]}>
            <View style={[styles.plusBtn, styles.plusBtnDisabled]}>
              <Icon name="lock-closed" size={rs(20)} color="rgba(255,255,255,0.4)" />
            </View>
          </View>
          <Text style={[styles.plusLbl, { color: 'rgba(255,255,255,0.30)' }]}>Billing</Text>
        </View>
      )}
    </View>
  );
}

// ── Navigator ─────────────────────────────────────────────────────────────────
const StaffTabNavigator = ({ route }) => {
  const { userDoc } = route.params || {};
  const permissions = userDoc?.permissions || {};

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} permissions={permissions} />}
    >
      <Tab.Screen name="StaffHomeTab"    component={StaffHomeScreen}    initialParams={{ userDoc }} />
      <Tab.Screen name="StaffSalesTab"   component={StaffSalesScreen}   initialParams={{ userDoc }} />
      <Tab.Screen name="StaffStockTab"   component={StaffStockScreen}   initialParams={{ userDoc }} />
      <Tab.Screen name="StaffProfileTab" component={StaffProfileScreen} initialParams={{ userDoc }} />
    </Tab.Navigator>
  );
};

export default StaffTabNavigator;

const styles = StyleSheet.create({
  navOuter: { width: SCREEN_W, height: OUTER_H, backgroundColor: 'transparent', overflow: 'visible' },
  navBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: NAV_H, backgroundColor: colors.primary, borderTopLeftRadius: NAV_RADIUS, borderTopRightRadius: NAV_RADIUS, flexDirection: 'row', alignItems: 'center', shadowColor: colors.shadowPrimary, shadowOffset: { width: 0, height: -rvs(4) }, shadowOpacity: 0.15, shadowRadius: SHADOW_R, elevation: NAV_ELEV },
  tabGroup: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  centerGap: { width: CENTER_GAP, flexShrink: 0 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: TAB_PY, gap: TAB_GAP },
  tabIconWrap: { alignItems: 'center', justifyContent: 'center' },
  tabLbl: { fontSize: rfs(10), fontWeight: '600', letterSpacing: 0.3, color: 'rgba(255,255,255,0.45)' },
  tabLblActive: { color: '#FFFFFF', fontWeight: '700' },
  plusWrap: { position: 'absolute', left: SCREEN_W / 2 - PLUS_RING_D / 2, bottom: PLUS_BOTTOM, alignItems: 'center', zIndex: 10 },
  plusRing: { width: PLUS_RING_D, height: PLUS_RING_D, borderRadius: PLUS_RING_D / 2, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  plusBtn: { width: PLUS_D, height: PLUS_D, borderRadius: PLUS_D / 2, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', shadowColor: colors.accent, shadowOffset: { width: 0, height: PLUS_SHADOW_Y }, shadowOpacity: 0.50, shadowRadius: PLUS_SHADOW_R, elevation: PLUS_ELEV },
  plusBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.12)', shadowOpacity: 0 },
  plusLbl: { marginTop: rvs(4), fontSize: rfs(10), fontWeight: '700', color: colors.accent, letterSpacing: 0.4 },
});