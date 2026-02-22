import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../views/HomeScreen';
import SecondScreen from '../views/SecondScreen';
import ThirdScreen from '../views/ThirdScreen';
import FourthScreen from '../views/FourthScreen';

const Tab = createBottomTabNavigator();

const tabIcon = (name, focused, color, size) => (
  <Icon name={name} size={size ?? 24} color={color} />
);

const OwnerTabNavigator = ({ route }) => {
  const userDoc = route.params?.userDoc;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#666',
        tabBarIconStyle: { marginBottom: -2 },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color, size }) => tabIcon(focused ? 'home' : 'home-outline', focused, color, size),
        }}
        initialParams={{ userDoc }}
      />
      <Tab.Screen
        name="SecondTab"
        component={SecondScreen}
        options={{
          title: 'Second',
          tabBarLabel: 'Second',
          tabBarIcon: ({ focused, color, size }) => tabIcon(focused ? 'list' : 'list-outline', focused, color, size),
        }}
      />
      <Tab.Screen
        name="ThirdTab"
        component={ThirdScreen}
        options={{
          title: 'Third',
          tabBarLabel: 'Third',
          tabBarIcon: ({ focused, color, size }) => tabIcon(focused ? 'grid' : 'grid-outline', focused, color, size),
        }}
      />
      <Tab.Screen
        name="FourthTab"
        component={FourthScreen}
        options={{
          title: 'Fourth',
          tabBarLabel: 'Fourth',
          tabBarIcon: ({ focused, color, size }) => tabIcon(focused ? 'person' : 'person-outline', focused, color, size),
        }}
      />
    </Tab.Navigator>
  );
};

export default OwnerTabNavigator;
