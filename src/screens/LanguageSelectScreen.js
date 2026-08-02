import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SUPPORTED_LANGUAGES, setUserLanguage } from '../services/i18nService';

const NYXSCREAM = {
  void: '#0D0221',
  shadow: '#1A0A2E',
  scream: '#FF003C',
  nyx: '#9D00FF',
  electric: '#00F0FF',
  ghost: '#E0E0E0',
  mist: '#6B6B6B'
};

export default function LanguageSelectScreen({ navigation, route }) {
  const { userId } = route.params || {};
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleSelectLanguage = async (lang) => {
    setSelectedLanguage(lang);
    if (userId) {
      await setUserLanguage(userId, lang);
    }
    navigation.goBack();
  };

  const renderLanguage = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.languageItem,
        selectedLanguage === item[0] && styles.languageItemSelected
      ]}
      onPress={() => handleSelectLanguage(item[0])}
    >
      <Text style={styles.languageText}>{item[1]}</Text>
      {selectedLanguage === item[0] && (
        <Text style={styles.checkmark}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
        <Text style={styles.headerTitle}>SELECT LANGUAGE</Text>
      </LinearGradient>

      <FlatList
        data={Object.entries(SUPPORTED_LANGUAGES)}
        keyExtractor={(item) => item[0]}
        renderItem={renderLanguage}
        contentContainerStyle={styles.content}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NYXSCREAM.void },
  header: { paddingVertical: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: NYXSCREAM.electric },
  headerTitle: { fontSize: 24, fontWeight: '900', color: NYXSCREAM.ghost, letterSpacing: 2 },
  content: { paddingHorizontal: 15, paddingVertical: 15 },
  languageItem: { 
    backgroundColor: NYXSCREAM.shadow, 
    borderWidth: 1, 
    borderColor: NYXSCREAM.nyx, 
    borderRadius: 8, 
    paddingVertical: 16, 
    paddingHorizontal: 15, 
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  languageItemSelected: { 
    borderColor: NYXSCREAM.electric, 
    backgroundColor: 'rgba(0, 240, 255, 0.1)' 
  },
  languageText: { 
    color: NYXSCREAM.ghost, 
    fontWeight: '700', 
    fontSize: 14 
  },
  checkmark: { 
    color: NYXSCREAM.electric, 
    fontWeight: '900', 
    fontSize: 16 
  }
});
