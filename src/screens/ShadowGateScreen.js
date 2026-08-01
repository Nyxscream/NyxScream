// Shadow Gate Screen - Login & Registration
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
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

export default function ShadowGateScreen({ navigation }) {
  const { signup, login } = React.useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!isLogin && !name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);

    if (isLogin) {
      const result = await login(email, password);
      if (result.success) {
        navigation.navigate('Main');
      } else {
        Alert.alert('Login Failed', result.error);
      }
    } else {
      const result = await signup(email, password, name);
      if (result.success) {
        Alert.alert('Success', 'Account created! Welcome to NyxScream');
        navigation.navigate('Main');
      } else {
        Alert.alert('Signup Failed', result.error);
      }
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.void, NYXSCREAM.shadow]} style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.headerSection}>
            <Text style={styles.logo}>🌑 NYXSCREAM</Text>
            <Text style={styles.tagline}>Where Darkness Meets Sound</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {isLogin ? 'ENTER THE VOID' : 'MANIFEST YOUR SHADOW'}
            </Text>

            {!isLogin && (
              <TextInput
                style={styles.input}
                placeholder="Your Name"
                placeholderTextColor={NYXSCREAM.mist}
                value={name}
                onChangeText={setName}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={NYXSCREAM.mist}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={NYXSCREAM.mist}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.authButton}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={NYXSCREAM.void} />
              ) : (
                <Text style={styles.authButtonText}>
                  {isLogin ? 'ENTER VOID' : 'MANIFEST'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.toggleText}>
                {isLogin
                  ? "Don't have an account? Manifest here"
                  : 'Already a shadow? Enter the void'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>🌑 What is NyxScream?</Text>
            <Text style={styles.infoText}>
              High-tech horror streaming. Faceless creators. Mature audiences. Welcome to the echo chamber where darkness meets sound.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NYXSCREAM.void
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: NYXSCREAM.scream,
    letterSpacing: 3,
    marginBottom: 10
  },
  tagline: {
    fontSize: 14,
    color: NYXSCREAM.electric,
    letterSpacing: 2,
    fontStyle: 'italic'
  },
  formCard: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 2,
    borderColor: NYXSCREAM.scream,
    borderRadius: 12,
    padding: 25,
    marginBottom: 30
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: NYXSCREAM.ghost,
    letterSpacing: 2,
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    backgroundColor: NYXSCREAM.void,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    color: NYXSCREAM.ghost,
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginBottom: 15,
    fontFamily: 'monospace'
  },
  authButton: {
    backgroundColor: NYXSCREAM.scream,
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 15
  },
  authButtonText: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2
  },
  toggleText: {
    color: NYXSCREAM.electric,
    textAlign: 'center',
    fontSize: 12,
    textDecorationLine: 'underline',
    letterSpacing: 0.5
  },
  infoSection: {
    backgroundColor: 'rgba(157, 0, 255, 0.1)',
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    padding: 20,
    marginBottom: 30
  },
  infoTitle: {
    color: NYXSCREAM.ghost,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10
  },
  infoText: {
    color: NYXSCREAM.mist,
    fontSize: 12,
    lineHeight: 20
  }
});