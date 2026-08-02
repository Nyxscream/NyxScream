import React, { useState, useContext } from 'react';
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

export default function ProfileEditScreen({ navigation }) {
  const { user, updateUserProfile } = useContext(AuthContext);
  const [name, setName] = useState(user?.displayName || '');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const result = await updateUserProfile({
      displayName: name,
      username: username,
      bio: bio
    });

    if (result.success) {
      Alert.alert('Success', 'Profile updated!');
      navigation.goBack();
    } else {
      Alert.alert('Error', result.error);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
        <Text style={styles.headerTitle}>EDIT PROFILE</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={NYXSCREAM.void} />
            ) : (
              <Text style={styles.saveButtonText}>SAVE CHANGES</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NYXSCREAM.void },
  header: { paddingVertical: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: NYXSCREAM.scream },
  headerTitle: { fontSize: 24, fontWeight: '900', color: NYXSCREAM.scream, letterSpacing: 2 },
  content: { flex: 1, padding: 20 },
  section: { backgroundColor: NYXSCREAM.shadow, borderWidth: 1, borderColor: NYXSCREAM.nyx, borderRadius: 8, padding: 20 },
  label: { color: NYXSCREAM.ghost, fontWeight: '700', fontSize: 12, marginBottom: 8, letterSpacing: 1 },
  input: { backgroundColor: NYXSCREAM.void, borderWidth: 1, borderColor: NYXSCREAM.electric, color: NYXSCREAM.ghost, paddingVertical: 12, paddingHorizontal: 15, borderRadius: 6, marginBottom: 15 },
  inputMultiline: { textAlignVertical: 'top', paddingVertical: 15 },
  saveButton: { backgroundColor: NYXSCREAM.scream, paddingVertical: 14, borderRadius: 6, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: NYXSCREAM.void, fontWeight: '900', fontSize: 14, letterSpacing: 1 }
});
