// Cast Screen - Stream Creation & Upload
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';

const NYXSCREAM = {
  void: '#0D0221',
  shadow: '#1A0A2E',
  scream: '#FF003C',
  nyx: '#9D00FF',
  electric: '#00F0FF',
  ghost: '#E0E0E0',
  mist: '#6B6B6B'
};

const CATEGORIES = [
  { id: 'horror', name: 'Horror', emoji: '👻' },
  { id: 'music', name: 'Music', emoji: '🎵' },
  { id: 'gaming', name: 'Gaming', emoji: '🎮' },
  { id: 'dark-talk', name: 'Dark Talk', emoji: '💬' },
  { id: 'art', name: 'Art', emoji: '🎨' },
  { id: 'paranormal', name: 'Paranormal', emoji: '✨' }
];

const VISIBILITY_OPTIONS = [
  { id: 'theVoid', name: 'The Void (Public)', price: 'Free' },
  { id: 'shadow', name: 'Shadow (Subscribers)', price: '$12.99/mo' },
  { id: 'abyss', name: 'Abyss (Premium)', price: '$19.99/mo' }
];

export default function CastScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('horror');
  const [selectedVisibility, setSelectedVisibility] = useState('theVoid');
  const [selectedFile, setSelectedFile] = useState(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [visibilityModalVisible, setVisibilityModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [goingLive, setGoingLive] = useState(false);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*'
      });

      if (!result.cancelled) {
        setSelectedFile(result);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleCastIntoVoid = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    setUploading(true);

    try {
      // Simulate upload
      setTimeout(() => {
        Alert.alert(
          'Success',
          'Your echo has been cast into the void!',
          [{ text: 'OK', onPress: () => {
            setTitle('');
            setDescription('');
            setSelectedFile(null);
            setUploading(false);
          }}]
        );
      }, 2000);
    } catch (error) {
      Alert.alert('Error', 'Upload failed');
      setUploading(false);
    }
  };

  const handleGoLive = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Stream title is required');
      return;
    }

    setGoingLive(true);

    try {
      // Simulate stream creation
      setTimeout(() => {
        setGoingLive(false);
        navigation.navigate('LiveScream', { 
          streamTitle: title,
          streamKey: `stream_${Date.now()}`
        });
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to start stream');
      setGoingLive(false);
    }
  };

  const selectedCategoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name || 'Select Category';
  const selectedVisibilityName = VISIBILITY_OPTIONS.find(v => v.id === selectedVisibility)?.name || 'Select Visibility';

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
        <Text style={styles.headerTitle}>CAST INTO VOID</Text>
        <Text style={styles.headerSubtitle}>Create & Stream</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 ECHO DETAILS</Text>

          <TextInput
            style={styles.input}
            placeholder="Echo Title"
            placeholderTextColor={NYXSCREAM.mist}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Void Description (optional)"
            placeholderTextColor={NYXSCREAM.mist}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 ABYSS CATEGORY</Text>

          <TouchableOpacity
            style={styles.selector}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={styles.selectorText}>{selectedCategoryName}</Text>
            <Text style={styles.selectorArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 VISIBILITY</Text>

          <TouchableOpacity
            style={styles.selector}
            onPress={() => setVisibilityModalVisible(true)}
          >
            <Text style={styles.selectorText}>{selectedVisibilityName}</Text>
            <Text style={styles.selectorArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📤 UPLOAD VIDEO (Optional)</Text>

          <TouchableOpacity style={styles.uploadButton} onPress={pickFile}>
            <Text style={styles.uploadButtonText}>
              {selectedFile ? '✓ File Selected' : '+ Select Video'}
            </Text>
          </TouchableOpacity>

          {selectedFile && (
            <Text style={styles.fileName}>{selectedFile.name}</Text>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.goLiveButton}
            onPress={handleGoLive}
            disabled={goingLive}
          >
            {goingLive ? (
              <ActivityIndicator color={NYXSCREAM.void} />
            ) : (
              <Text style={styles.goLiveButtonText}>🔴 GO LIVE</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.castButton}
            onPress={handleCastIntoVoid}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={NYXSCREAM.void} />
            ) : (
              <Text style={styles.castButtonText}>✨ CAST INTO VOID</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Category Modal */}
      <Modal visible={categoryModalVisible} transparent animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.modalHeader}>
            <Text style={styles.modalTitle}>SELECT ABYSS</Text>
          </LinearGradient>

          <FlatList
            data={CATEGORIES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setSelectedCategory(item.id);
                  setCategoryModalVisible(false);
                }}
              >
                <Text style={styles.modalOptionText}>
                  {item.emoji} {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setCategoryModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>CLOSE</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* Visibility Modal */}
      <Modal visible={visibilityModalVisible} transparent animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.modalHeader}>
            <Text style={styles.modalTitle}>SELECT VISIBILITY</Text>
          </LinearGradient>

          <FlatList
            data={VISIBILITY_OPTIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => {
                  setSelectedVisibility(item.id);
                  setVisibilityModalVisible(false);
                }}
              >
                <View>
                  <Text style={styles.modalOptionText}>{item.name}</Text>
                  <Text style={styles.modalOptionPrice}>{item.price}</Text>
                </View>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setVisibilityModalVisible(false)}
          >
            <Text style={styles.modalCloseText}>CLOSE</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
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
    borderBottomColor: NYXSCREAM.scream
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: NYXSCREAM.scream,
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
    marginBottom: 25
  },
  sectionTitle: {
    color: NYXSCREAM.ghost,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 12
  },
  input: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    color: NYXSCREAM.ghost,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 6,
    fontFamily: 'monospace',
    marginBottom: 10
  },
  inputMultiline: {
    textAlignVertical: 'top'
  },
  selector: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  selectorText: {
    color: NYXSCREAM.ghost,
    fontWeight: '600',
    fontSize: 14
  },
  selectorArrow: {
    color: NYXSCREAM.electric,
    fontSize: 10
  },
  uploadButton: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: NYXSCREAM.electric,
    paddingVertical: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadButtonText: {
    color: NYXSCREAM.electric,
    fontWeight: '700',
    fontSize: 14
  },
  fileName: {
    color: NYXSCREAM.mist,
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic'
  },
  actionButtons: {
    gap: 12
  },
  goLiveButton: {
    backgroundColor: NYXSCREAM.scream,
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: 'center'
  },
  goLiveButtonText: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2
  },
  castButton: {
    backgroundColor: NYXSCREAM.nyx,
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: 'center'
  },
  castButtonText: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 2
  },
  modalContainer: {
    flex: 1,
    backgroundColor: NYXSCREAM.void
  },
  modalHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: NYXSCREAM.scream,
    letterSpacing: 2
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: NYXSCREAM.shadow
  },
  modalOptionText: {
    color: NYXSCREAM.ghost,
    fontWeight: '700',
    fontSize: 16
  },
  modalOptionPrice: {
    color: NYXSCREAM.mist,
    fontSize: 12,
    marginTop: 4
  },
  modalClose: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: NYXSCREAM.shadow,
    borderTopWidth: 1,
    borderTopColor: NYXSCREAM.nyx,
    alignItems: 'center'
  },
  modalCloseText: {
    color: NYXSCREAM.ghost,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1
  }
});