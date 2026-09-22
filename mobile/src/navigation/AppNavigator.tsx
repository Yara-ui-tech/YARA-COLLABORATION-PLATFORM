import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import CurriculumScreen from '../screens/CurriculumScreen';
import YaraKidsScreen from '../screens/YaraKidsScreen';
import LiveStreamScreen from '../screens/LiveStreamScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { Text } from 'react-native';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: '#0f172a' },
          headerTintColor: '#ffffff',
          headerTitleStyle: { fontWeight: 'bold' },
          tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#1e293b' },
          tabBarActiveTintColor: '#818cf8',
          tabBarInactiveTintColor: '#64748b',
          tabBarIcon: ({ color }) => {
            let icon = '🏠';
            if (route.name === 'Curriculum') icon = '🧠';
            if (route.name === 'Kids') icon = '✨';
            if (route.name === 'Live') icon = '🔴';
            if (route.name === 'Profile') icon = '👤';
            return <Text style={{ fontSize: 16 }}>{icon}</Text>;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'YARA Home' }} />
        <Tab.Screen name="Curriculum" component={CurriculumScreen} options={{ title: 'Roadmap' }} />
        <Tab.Screen name="Kids" component={YaraKidsScreen} options={{ title: 'YARA Kids' }} />
        <Tab.Screen name="Live" component={LiveStreamScreen} options={{ title: 'Live Broadcast' }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
