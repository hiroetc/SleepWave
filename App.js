import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { C } from './src/styles';

import HomeScreen from './src/screens/HomeScreen';
import StatsScreen from './src/screens/StatsScreen';
import SocialScreen from './src/screens/SocialScreen';
import BabyScreen from './src/screens/BabyScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Ana',        component: HomeScreen,  emoji: '🌙' },
  { name: 'İstatistik', component: StatsScreen, emoji: '📊' },
  { name: 'Günlük',     component: SocialScreen, emoji: '📓' },
  { name: 'Bebek',      component: BabyScreen,  emoji: '🍼' },
];

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: C.bg,
            borderTopColor: C.bg3,
            borderTopWidth: 1,
            height: 58,
            paddingTop: 2,
            paddingBottom: 4,
          },
          tabBarActiveTintColor: C.accent,
          tabBarInactiveTintColor: C.dim,
        }}
      >
        {TABS.map(tab => (
          <Tab.Screen
            key={tab.name}
            name={tab.name}
            component={tab.component}
            options={{
              tabBarIcon: ({ focused }) => (
                <Text style={{ fontSize: 16, lineHeight: 20 }}>{tab.emoji}</Text>
              ),
              tabBarLabel: ({ focused }) => (
                <Text style={{ fontSize: 9, fontWeight: focused ? '600' : '400', color: focused ? C.accent : C.dim, lineHeight: 13 }}>
                  {tab.name}
                </Text>
              ),
            }}
          />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}