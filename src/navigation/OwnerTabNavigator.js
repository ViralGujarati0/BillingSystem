import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

import HomeScreen   from '../views/HomeScreen';
import ThirdScreen  from '../views/ThirdScreen';
import FourthScreen from '../views/FourthScreen';
import SalesScreen  from '../views/SalesScreen';

const Tab = createBottomTabNavigator();
const { width: SCREEN_W } = Dimensions.get('window');

// ─── Layout ───────────────────────────────────────────────────────────────────
const NAV_H     = 64;   // white bar height
const PLUS_D    = 54;   // amber circle diameter
const PLUS_LIFT = 20;   // how much plus floats above bar top

// ─── Tab definitions ──────────────────────────────────────────────────────────
const TABS = [
  { name: 'HomeTab',   label: 'Home',    icon: 'home-outline'   },
  { name: 'SalesTab',  label: 'Sales',   icon: 'list-outline'   },
  { name: 'ThirdTab',  label: 'Stock',   icon: 'grid-outline'   },
  { name: 'FourthTab', label: 'Profile', icon: 'person-outline' },
];

// ─── Amber Plus Button ────────────────────────────────────────────────────────
function PlusButton({ onPress }) {
  const scale  = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale,  { toValue: 0.88, duration: 90,  useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 1,    duration: 200, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(scale,  { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start();
    onPress?.();
  };

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  return (
    <View style={styles.plusWrap}>
      {/* White ring acts as border + separates from bar */}
      <View style={styles.plusRing}>
        <TouchableOpacity activeOpacity={0.85} onPress={handlePress}>
          <Animated.View style={[styles.plusBtn, { transform: [{ scale }, { rotate: spin }] }]}>
            <Icon name="add" size={30} color="#ffffff" />
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
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const iconColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textSecondary, colors.primary],
  });

  return (
    <TouchableOpacity style={styles.tab} activeOpacity={1} onPress={handlePress}>
      <Animated.View style={[styles.tabIconWrap, { transform: [{ scale: scaleAnim }] }]}>
        {/* Active indicator dot above icon */}
        {focused && <View style={styles.activeDot} />}
        <Icon
          name={focused ? tab.icon.replace('-outline', '') : tab.icon}
          size={22}
          color={focused ? colors.primary : colors.textSecondary}
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

  return (
    <View style={styles.navOuter}>
      {/* White bar */}
      <View style={styles.navBar}>

        {/* Left two tabs */}
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

        {/* Center gap — space for plus button */}
        <View style={styles.centerGap} />

        {/* Right two tabs */}
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

      {/* Floating amber plus — centered above bar */}
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
      <Tab.Screen name="ThirdTab"  component={ThirdScreen}  />
      <Tab.Screen name="FourthTab" component={FourthScreen} />
    </Tab.Navigator>
  );
};

export default OwnerTabNavigator;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── Outer container ────────────────────────────────────
  navOuter: {
    width: SCREEN_W,
    height: NAV_H,              // exact same as white bar — no extra space
    backgroundColor: 'transparent',
    overflow: 'visible',        // lets plus button float above without clipping
  },

  // ── White bar ──────────────────────────────────────────
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: NAV_H,
    backgroundColor: '#FFFFFF',
    // Only round the top corners
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'rgba(26,43,48,0.10)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 16,
  },

  // ── Tab groups ─────────────────────────────────────────
  tabGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  centerGap: {
    width: PLUS_D + 32,   // matches plusRing width + breathing room
  },

  // ── Single tab ─────────────────────────────────────────
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },

  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // Small dot above active icon
  activeDot: {
    position: 'absolute',
    top: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },

  tabLbl: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: colors.textSecondary,
  },

  tabLblActive: {
    color: colors.primary,
    fontWeight: '700',
  },

  // ── Amber plus button ──────────────────────────────────
  plusWrap: {
    position: 'absolute',
    left: SCREEN_W / 2 - (PLUS_D + 10) / 2,
    bottom: NAV_H / 2 - (PLUS_D + 10) / 2,  // vertically centered on bar top edge
    alignItems: 'center',
    zIndex: 10,
  },

  plusRing: {
    width: PLUS_D + 10,
    height: PLUS_D + 10,
    borderRadius: (PLUS_D + 10) / 2,
    backgroundColor: '#FFFFFF',   // white — matches nav bar, no gray ring
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
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.50,
    shadowRadius: 14,
    elevation: 14,
  },

  plusLbl: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '700',
    color: '#c47c0a',
    letterSpacing: 0.4,
  },
});