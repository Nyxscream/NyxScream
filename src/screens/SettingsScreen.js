cat > src/screens/SettingsScreen.js << 'EOF'
// Settings Screen - User Preferences
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthContext } from '../services/AuthContext';

const NYXSCREAM = {
  void: '#0D0221',
  shadow: '#1A0A2E',
  scream: '#FF003C',
  nyx: '#9D00FF',
  electric: '#00F0FF',
  ghost: '#E0E0E0',
  mist: '#6B6B6B'
};

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);
  const [dataUsage, setDataUsage] = useState('normal');

  const handleLogout = () => {
    Alert.alert(
      'Exit the Void',
      'Are you sure you want to leave?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await logout();
            if (result.success) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'ShadowGate' }]
              });
            }
          }
        }
      ]
    );
  };

  const renderToggleSetting = (label, value, onToggle) => (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: NYXSCREAM.shadow, true: NYXSCREAM.nyx }}
        thumbColor={value ? NYXSCREAM.electric : NYXSCREAM.mist}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
        <Text style={styles.headerTitle}>SETTINGS</Text>
        <Text style={styles.headerSubtitle}>Customize your void</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 PROFILE</Text>
          
          <View style={styles.profileCard}>
            <Text style={styles.profileAvatar}>👤</Text>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.displayName || 'Shadow User'}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>📝 Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>🔒 Change Password</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 NOTIFICATIONS</Text>
          {renderToggleSetting('Push Notifications', notificationsEnabled, setNotificationsEnabled)}
          {renderToggleSetting('Creator Alerts', true, () => {})}
          {renderToggleSetting('Chat Mentions', true, () => {})}
          {renderToggleSetting('Weekly Digest', true, () => {})}
        </View>

        {/* Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 DISPLAY</Text>
          {renderToggleSetting('Dark Mode (Always On)', darkMode, setDarkMode)}
          {renderToggleSetting('Auto-play Videos', autoPlay, setAutoPlay)}
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Quality</Text>
            <Text style={styles.settingValue}>1080p</Text>
          </View>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 DATA & PRIVACY</Text>
          
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Data Usage</Text>
            <Text style={styles.settingValue}>{dataUsage}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>🗑️ Clear Watch History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>📋 Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>⚖️ Terms of Service</Text>
          </TouchableOpacity>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 ACCOUNT</Text>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>💳 Payment Methods</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>📱 Linked Devices</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>⚠️ Report Issue</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ ABOUT</Text>

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>App Version</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Built with</Text>
            <Text style={styles.aboutValue}>React Native + Expo</Text>
          </View>

          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>🌐 Visit Website</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>EXIT THE VOID</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NYXSCREAM.void
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: NYXSCREAM.nyx
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: NYXSCREAM.ghost,
    letterSpacing: 3
  },
  headerSubtitle: {
    fontSize: 12,
    color: NYXSCREAM.electric,
    letterSpacing: 1,
    marginTop: 5
  },
  content: {
    flex: 1,
    padding: 20
  },
  section: {
    marginBottom: 25,
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    padding: 15
  },
  sectionTitle: {
    color: NYXSCREAM.ghost,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 15
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: NYXSCREAM.void
  },
  profileAvatar: {
    fontSize: 40,
    marginRight: 12
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    color: NYXSCREAM.ghost,
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 4
  },
  profileEmail: {
    color: NYXSCREAM.mist,
    fontSize: 12
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: NYXSCREAM.void
  },
  settingLabel: {
    color: NYXSCREAM.ghost,
    fontSize: 13,
    fontWeight: '600'
  },
  settingValue: {
    color: NYXSCREAM.electric,
    fontWeight: '700',
    fontSize: 12
  },
  settingButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: NYXSCREAM.void,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: NYXSCREAM.electric
  },
  settingButtonText: {
    color: NYXSCREAM.electric,
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center'
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: NYXSCREAM.void
  },
  aboutLabel: {
    color: NYXSCREAM.mist,
    fontSize: 12
  },
  aboutValue: {
    color: NYXSCREAM.ghost,
    fontWeight: '700',
    fontSize: 12
  },
  logoutButton: {
    backgroundColor: NYXSCREAM.scream,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  logoutButtonText: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2
  }
});
EOF