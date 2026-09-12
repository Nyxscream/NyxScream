// Main App Entry Point - React Navigation Setup
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext, AuthProvider } from './src/services/AuthContext';
import { initializeIAP } from './src/services/PaymentService';
import { PaywallModal } from './src/components/PaywallModal';

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
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ProfileEditScreen from './src/screens/ProfileEditScreen';
import LanguageSelectScreen from './src/screens/LanguageSelectScreen';
import VerificationScreen from './src/screens/VerificationScreen';

// Phase 17-18 Screens
import NYXAcademyScreen from './src/screens/NYXAcademyScreen';
import PhilanthropyDashboardScreen from './src/screens/PhilanthropyDashboardScreen';
import TokenDashboardScreen from './src/screens/TokenDashboardScreen';

// Admin & Moderator Screens
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import ModeratorPanelScreen from './src/screens/ModeratorPanelScreen';

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

// ============================================
// ERROR BOUNDARY COMPONENT
// ============================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: NYXSCREAM.void }}
        >
          <Text style={{ color: NYXSCREAM.scream, fontSize: 18, fontWeight: 'bold' }}>⚠️ Something went wrong</Text>
          <Text style={{ color: NYXSCREAM.ghost, fontSize: 12, marginTop: 10, paddingHorizontal: 20, textAlign: 'center' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// ============================================
// PAYWALL CONTEXT (for showing paywall modals)
// ============================================
export const PaywallContext = React.createContext();

export const PaywallProvider = ({ children }) => {
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [requiredTier, setRequiredTier] = useState('shadow');
  const [currentTier, setCurrentTier] = useState('void');

  const showPaywall = (tier = 'shadow') => {
    setRequiredTier(tier);
    setPaywallVisible(true);
  };

  const hidePaywall = () => {
    setPaywallVisible(false);
  };

  const value = {
    paywallVisible,
    showPaywall,
    hidePaywall,
    requiredTier,
    currentTier,
    setCurrentTier
  };

  return (
    <PaywallContext.Provider value={value}>
      {children}
    </PaywallContext.Provider>
  );
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
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
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
const MainStack = ({ user }) => {
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
        <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
        <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
        <Stack.Screen name="Verification" component={VerificationScreen} />
      </Stack.Group>

      {/* Admin & Moderator Screens - Permission Guarded */}
      {user?.role === 'admin' && (
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
          <Stack.Screen name="ModeratorPanel" component={ModeratorPanelScreen} />
        </Stack.Group>
      )}

      {user?.role === 'moderator' && (
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="ModeratorPanel" component={ModeratorPanelScreen} />
        </Stack.Group>
      )}

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
      {user ? <MainStack user={user} /> : <AuthStack />}
    </NavigationContainer>
  );
};

// Main App Content component wrapped safely inside providers
function AppContent() {
  const authContext = React.useContext(AuthContext);
  const user = authContext ? authContext.user : null;
  const loading = authContext ? authContext.loading : false;

  const paywallContext = React.useContext(PaywallContext);
  const paywallVisible = paywallContext ? paywallContext.paywallVisible : false;
  const hidePaywall = paywallContext ? paywallContext.hidePaywall : () => {};
  const requiredTier = paywallContext ? paywallContext.requiredTier : 'shadow';
  const currentTier = paywallContext ? paywallContext.currentTier : 'void';

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: NYXSCREAM.void }}>
        <Text style={{ color: NYXSCREAM.ghost }}>◉ Echoing...</Text>
      </View>
    );
  }

  return (
    <>
      <RootNavigator user={user} />
      {/* Phase 17: Paywall Modal */}
      <PaywallModal
        visible={paywallVisible}
        onClose={hidePaywall}
        requiredTier={requiredTier}
        currentTier={currentTier}
      />
    </>
  );
}

// Main App Component
export default function App() {
  useEffect(() => {
    // Initialize IAP (Google Play & App Store) with proper error handling
    const initPayments = async () => {
      try {
        const result = await initializeIAP();
        if (!result.success) {
          console.warn('[App] Payment system initialization failed:', result.error);
          // App continues without payment features if IAP fails
        }
      } catch (error) {
        console.error('[App] Unexpected error during IAP initialization:', error);
      }
    };
    initPayments();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <PaywallProvider>
          <AppContent />
        </PaywallProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
