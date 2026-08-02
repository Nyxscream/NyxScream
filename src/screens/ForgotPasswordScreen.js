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

const NYXSCREAM = {
  void: '#0D0221',
  shadow: '#1A0A2E',
  scream: '#FF003C',
  nyx: '#9D00FF',
  electric: '#00F0FF',
  ghost: '#E0E0E0',
  mist: '#6B6B6B'
};

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: verification code, 3: new password

  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    // Simulate email sending
    setTimeout(() => {
      Alert.alert('Success', 'Check your email for reset code');
      setStep(2);
      setLoading(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← BACK</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>RECOVER SHADOW</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {step === 1 && (
          <View style={styles.section}>
            <Text style={styles.stepTitle}>Step 1: Enter Email</Text>
            <Text style={styles.stepText}>
              Enter your email and we'll send you a code to reset your password.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={NYXSCREAM.mist}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleRequestReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={NYXSCREAM.void} />
              ) : (
                <Text style={styles.submitButtonText}>SEND RESET CODE</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <Text style={styles.stepTitle}>Step 2: Enter Code</Text>
            <Text style={styles.stepText}>
              Enter the 6-digit code sent to {email}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="000000"
              placeholderTextColor={NYXSCREAM.mist}
              maxLength={6}
              keyboardType="number-pad"
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => setStep(3)}
            >
              <Text style={styles.submitButtonText}>VERIFY CODE</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.section}>
            <Text style={styles.stepTitle}>Step 3: New Password</Text>
            <Text style={styles.stepText}>
              Enter your new password
            </Text>

            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor={NYXSCREAM.mist}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={NYXSCREAM.mist}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                Alert.alert('Success', 'Password reset! Please login.', [
                  { text: 'OK', onPress: () => navigation.navigate('ShadowGate') }
                ]);
              }}
            >
              <Text style={styles.submitButtonText}>RESET PASSWORD</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.helpBox}>
          <Text style={styles.helpTitle}>💡 Not receiving code?</Text>
          <Text style={styles.helpText}>
            Check your spam folder or try a different email address.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NYXSCREAM.void },
  header: { paddingVertical: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: NYXSCREAM.scream },
  backButton: { color: NYXSCREAM.electric, fontWeight: '700', fontSize: 12, marginBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: NYXSCREAM.scream, letterSpacing: 2 },
  content: { flex: 1, padding: 20 },
  section: { backgroundColor: NYXSCREAM.shadow, borderWidth: 1, borderColor: NYXSCREAM.nyx, borderRadius: 8, padding: 20, marginBottom: 20 },
  stepTitle: { color: NYXSCREAM.ghost, fontSize: 18, fontWeight: '900', marginBottom: 10 },
  stepText: { color: NYXSCREAM.mist, fontSize: 13, lineHeight: 20, marginBottom: 20 },
  input: { backgroundColor: NYXSCREAM.void, borderWidth: 1, borderColor: NYXSCREAM.electric, color: NYXSCREAM.ghost, paddingVertical: 12, paddingHorizontal: 15, borderRadius: 6, fontFamily: 'monospace', marginBottom: 15 },
  submitButton: { backgroundColor: NYXSCREAM.scream, paddingVertical: 14, borderRadius: 6, alignItems: 'center' },
  submitButtonText: { color: NYXSCREAM.void, fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  helpBox: { backgroundColor: 'rgba(157, 0, 255, 0.1)', borderWidth: 1, borderColor: NYXSCREAM.nyx, borderRadius: 8, padding: 15, marginTop: 20 },
  helpTitle: { color: NYXSCREAM.ghost, fontWeight: '900', marginBottom: 8 },
  helpText: { color: NYXSCREAM.mist, fontSize: 12, lineHeight: 18 }
});
