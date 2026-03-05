import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

import HomeScreen   from '../views/HomeScreen';
import FourthScreen from '../views/FourthScreen';
import SalesScreen  from '../views/SalesScreen';
import StockScreen from '../views/StockScreen';

const Tab = createBottomTabNavigator();
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Responsive scale helpers (base: 390×844) ────────────────────────────────
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

// ─── Layout — all derived, zero hardcoded ────────────────────────────────────
const NAV_H        = rvs(64);              // bar height
const PLUS_D       = rs(54);              // amber circle diameter
const PLUS_RING_D  = PLUS_D + rs(8);      // ring around plus
const CENTER_GAP   = PLUS_RING_D + rs(28);// gap in tab row for plus
const ICON_SIZE    = rs(22);              // tab icon size
const PLUS_ICON_SZ = rs(30);             // plus icon size
const TAB_PY       = rvs(10);            // tab vertical padding
const TAB_GAP      = rvs(4);             // gap between icon and label
const NAV_RADIUS   = rs(24);             // top corner radius of bar
const NAV_ELEV     = 16;                 // elevation (unitless)
const PLUS_ELEV    = 14;                 // plus button elevation
const SHADOW_R     = rs(20);             // nav bar shadow radius
const PLUS_SHADOW_R= rs(14);            // plus shadow radius
const PLUS_SHADOW_Y= rvs(6);            // plus shadow offset y
// Plus vertically centered within bar (button straddles bar top edge)
const PLUS_BOTTOM  = NAV_H / 2 - PLUS_RING_D / 2;
// Total outer height = bar height only; overflow:visible handles the rest
const OUTER_H      = NAV_H;

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { name: 'HomeTab',   label: 'Home',    icon: 'home-outline'   },
  { name: 'SalesTab',  label: 'Sales',   icon: 'list-outline'   },
  { name: 'StockTab',  label: 'Stock',   icon: 'grid-outline'   },
  { name: 'FourthTab', label: 'Profile', icon: 'person-outline' },
];

// ─── Amber Plus Button ────────────────────────────────────────────────────────
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

  const spin = rotateAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <View style={styles.plusWrap}>
      <View style={styles.plusRing}>
        <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
          <Animated.View
            style={[styles.plusBtn, { transform: [{ scale: scaleAnim }, { rotate: spin }] }]}
          >
            <Icon name="add" size={PLUS_ICON_SZ} color="#ffffff" />
          </Animated.View>
        </TouchableOpacity>
      </View>
      <Text style={styles.plusLbl}>New Bill</Text>
    </View>
  );
}

// ─── Tab Item ─────────────────────────────────────────────────────────────────
function TabItem({ tab, focused, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 80,  useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1,    friction: 5, tension: 200, useNativeDriver: true }),
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
      <Text style={[styles.tabLbl, focused && styles.tabLblActive]}>
        {tab.label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, navigation, userDoc }) {
  const activeIdx = state.index;

  // Set Android bottom nav bar color to match tab bar
  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        const NavBar = require('react-native-navigation-bar-color').default;
        NavBar.setNavigationBarColor(colors.primary, true);
        NavBar.setNavigationBarDividerColor('transparent');
      } catch (_) { /* package not installed — skip */ }
    }
  }, []);

  return (
    <View style={styles.navOuter}>
      <View style={styles.navBar}>

        {/* Left: Home + Sales */}
        <View style={styles.tabGroup}>
          {[0, 1].map(idx => (
            <TabItem
              key={TABS[idx].name}
              tab={TABS[idx]}
              focused={activeIdx === idx}
              onPress={() => navigation.navigate(TABS[idx].name)}
            />
          ))}
        </View>

        {/* Center gap for plus button */}
        <View style={styles.centerGap} />

        {/* Right: Stock + Profile */}
        <View style={styles.tabGroup}>
          {[2, 3].map(idx => (
            <TabItem
              key={TABS[idx].name}
              tab={TABS[idx]}
              focused={activeIdx === idx}
              onPress={() => navigation.navigate(TABS[idx].name)}
            />
          ))}
        </View>

      </View>

      {/* Floating amber plus */}
      <PlusButton
        onPress={() =>
          navigation.navigate('BillingScanner', { userDoc: userDoc ?? null })
        }
      />
    </View>
  );
}

// ─── Navigator ────────────────────────────────────────────────────────────────
const OwnerTabNavigator = ({ route }) => {
  const userDoc = route.params?.userDoc;

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <CustomTabBar {...props} userDoc={userDoc} />}
    >
      <Tab.Screen name="HomeTab"   component={HomeScreen}   initialParams={{ userDoc }} />
      <Tab.Screen name="SalesTab"  component={SalesScreen}  />
      <Tab.Screen name="StockTab"  component={StockScreen}  />
      <Tab.Screen name="FourthTab" component={FourthScreen} />
    </Tab.Navigator>
  );
};

export default OwnerTabNavigator;

// ─── Styles — all values from layout constants above ─────────────────────────
const styles = StyleSheet.create({

  navOuter: {
    width: SCREEN_W,
    height: OUTER_H,
    backgroundColor: 'transparent',
    overflow: 'visible',
  },

  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: NAV_H,
    backgroundColor: colors.primary,
    borderTopLeftRadius: NAV_RADIUS,
    borderTopRightRadius: NAV_RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadowPrimary,
    shadowOffset: { width: 0, height: -rvs(4) },
    shadowOpacity: 0.15,
    shadowRadius: SHADOW_R,
    elevation: NAV_ELEV,
  },

  tabGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  centerGap: {
    width: CENTER_GAP,
    flexShrink: 0,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: TAB_PY,
    gap: TAB_GAP,
  },

  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabLbl: {
    fontSize: rfs(10),
    fontWeight: '600',
    letterSpacing: 0.3,
    color: 'rgba(255,255,255,0.45)',
  },

  tabLblActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  plusWrap: {
    position: 'absolute',
    left: SCREEN_W / 2 - PLUS_RING_D / 2,
    bottom: PLUS_BOTTOM,
    alignItems: 'center',
    zIndex: 10,
  },

  plusRing: {
    width: PLUS_RING_D,
    height: PLUS_RING_D,
    borderRadius: PLUS_RING_D / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  plusBtn: {
    width: PLUS_D,
    height: PLUS_D,
    borderRadius: PLUS_D / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: PLUS_SHADOW_Y },
    shadowOpacity: 0.50,
    shadowRadius: PLUS_SHADOW_R,
    elevation: PLUS_ELEV,
  },

  plusLbl: {
    marginTop: rvs(4),
    fontSize: rfs(10),
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0.4,
  },
});