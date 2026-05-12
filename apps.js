import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Font from 'expo-font';

// 1. ALL IMPORTS AT THE TOP
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import LiveStreamScreen from './src/screens/LiveStreamScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  // LOAD THE FONT
  const [fontsLoaded] = Font.useFonts({
    'Nyx-Main': require('./src/assets/fronts/Orbitron-VariableFont_wght.ttf'),
  });

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <NavigationContainer>
      {/* 2. THE NAVIGATION STACK (The "Map" of your app) */}
      <Stack.Navigator 
        initialRouteName="Login" 
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0D0D0D' }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="LiveStream" component={LiveStreamScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
