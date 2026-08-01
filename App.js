// Main App Entry Point - React Navigation Setup
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext, AuthProvider } from './src/services/AuthContext';
import { initializeIAP } from './src/services/PaymentService';

// Screens
import ShadowGateScreen from './src/screens/ShadowGateScreen';
import VoidScreen from './src/screens/VoidScreen';
import EchoScreen from './src/screens/EchoScreen';
import CastScreen from './src/screens/CastScreen';
import ScreamScreen from './src/screens/ScreamScreen';
import ShadowStudioScreen from './src/screens/ShadowStudioScreen';
import EchoPlayerScreen from './src/screens/EchoPlayerScreen';
import LiveScreamScreen from './src/screens/LiveScreamScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Phase 17-18 Screens
import NYXAcademyScreen from './src/screens/NYXAcademyScreen';
import PhilanthropyDashboardScreen from './src/screens/PhilanthropyDashboardScreen';
import TokenDashboardScreen from './src/screens/TokenDashboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const NYXSCREAM = {
  void: '#0D0221',
  shadow: '#1A0A2E',
  scream: '#FF003C',
  nyx: '#9D00FF',
  electric: '#00F0FF',
  ghost: '#E0E0E0',
  mist: '#6B6B6B'
};

// Auth Stack (Login/Signup)
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyle: { backgroundColor: NYXSCREAM.void }
      }}
    >
      <Stack.Screen name="ShadowGate" component={ShadowGateScreen} />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: NYXSCREAM.shadow,
          borderTopWidth: 1,
          borderTopColor: NYXSCREAM.nyx,
          height: 60,
          paddingBottom: 8
        },
        tabBarActiveTintColor: NYXSCREAM.electric,
        tabBarInactiveTintColor: NYXSCREAM.mist,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 4
        }
      }}
    >
      <Tab.Screen
        name="Void"
        component={VoidScreen}
        options={{
          title: 'Void',
          tabBarLabel: '🌑 Void',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🌑</Text>
        }}
      />

      <Tab.Screen
        name="Echo"
        component={EchoScreen}
        options={{
          title: 'Echo',
          tabBarLabel: '🔍 Echo',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔍</Text>
        }}
      />

      <Tab.Screen
        name="Cast"
        component={CastScreen}
        options={{
          title: 'Cast',
          tabBarLabel: '➕ Cast',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>➕</Text>
        }}
      />

      <Tab.Screen
        name="Scream"
        component={ScreamScreen}
        options={{
          title: 'Scream',
          tabBarLabel: '🔴 Scream',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔴</Text>
        }}
      />

      <Tab.Screen
        name="Shadow"
        component={ShadowStudioScreen}
        options={{
          title: 'Shadow',
          tabBarLabel: '👤 Shadow',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>
        }}
      />
    </Tab.Navigator>
  );
};

// Main Stack (with modals)
const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyle: { backgroundColor: NYXSCREAM.void }
      }}
    >
      <Stack.Group>
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ animationEnabled: false }}
        />
        <Stack.Screen name="EchoPlayer" component={EchoPlayerScreen} />
        <Stack.Screen name="LiveScream" component={LiveScreamScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Group>

      {/* Phase 17-18 Modals */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="NYXAcademy" component={NYXAcademyScreen} />
        <Stack.Screen name="PhilanthropyDashboard" component={PhilanthropyDashboardScreen} />
        <Stack.Screen name="TokenDashboard" component={TokenDashboardScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

// Root Navigator
const RootNavigator = ({ user }) => {
  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

// Main App Component
export default function App() {
  useEffect(() => {
    // Initialize IAP (Google Play & App Store)
    initializeIAP();
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: NYXSCREAM.void }}>
        <Text style={{ color: NYXSCREAM.ghost }}>◉ Echoing...</Text>
      </View>
    );
  }

  return <RootNavigator user={user} />;
}
