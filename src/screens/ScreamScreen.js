// Scream Screen - Live Streams & Chat
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
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

const MOCK_LIVE_STREAMS = [
  {
    id: '1',
    title: 'Midnight Horror Marathon',
    creator: 'DarkWhisper',
    viewers: 1250,
    thumbnail: '🌑',
    category: 'Horror',
    duration: '2h 15m'
  },
  {
    id: '2',
    title: 'Dark Ambient Music Session',
    creator: 'ShadowVoice',
    viewers: 842,
    thumbnail: '🎵',
    category: 'Music',
    duration: '1h 45m'
  },
  {
    id: '3',
    title: 'Paranormal Investigation Live',
    creator: 'NyxBeats',
    viewers: 567,
    thumbnail: '✨',
    category: 'Paranormal',
    duration: '55m'
  }
];

const MOCK_CHAT_MESSAGES = [
  { id: '1', user: 'ShadowFan', message: 'This is insane!', timestamp: '12:34' },
  { id: '2', user: 'VoidWalker', message: 'Love the vibe', timestamp: '12:35' },
  { id: '3', user: 'EchoListener', message: 'Fire content 🔥', timestamp: '12:36' }
];

export default function ScreamScreen({ navigation }) {
  const [liveStreams, setLiveStreams] = useState(MOCK_LIVE_STREAMS);
  const [chatMessages, setChatMessages] = useState(MOCK_CHAT_MESSAGES);
  const [messageInput, setMessageInput] = useState('');
  const [selectedStream, setSelectedStream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLiveStreams();
  }, []);

  const loadLiveStreams = async () => {
    setLoading(true);
    setTimeout(() => {
      setLiveStreams(MOCK_LIVE_STREAMS);
      setLoading(false);
    }, 500);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLiveStreams();
    setRefreshing(false);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      user: 'YouShadow',
      message: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessageInput('');
  };

  const renderLiveStreamCard = ({ item }) => (
    <TouchableOpacity
      style={styles.streamCard}
      onPress={() => {
        setSelectedStream(item);
        navigation.navigate('LiveScream', { streamId: item.id });
      }}
    >
      <LinearGradient colors={[NYXSCREAM.scream, NYXSCREAM.nyx]} style={styles.streamThumbnail}>
        <Text style={styles.streamEmoji}>{item.thumbnail}</Text>
        <View style={styles.liveIndicator}>
          <Text style={styles.liveIndicatorText}>● LIVE</Text>
        </View>
      </LinearGradient>

      <View style={styles.streamInfo}>
        <Text style={styles.streamTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.creatorName}>{item.creator}</Text>

        <View style={styles.streamMeta}>
          <Text style={styles.viewers}>👥 {item.viewers.toLocaleString()} watching</Text>
          <Text style={styles.duration}>⏱️ {item.duration}</Text>
        </View>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderChatMessage = ({ item }) => (
    <View style={styles.chatMessage}>
      <Text style={styles.chatUser}>{item.user}</Text>
      <Text style={styles.chatText}>{item.message}</Text>
      <Text style={styles.chatTime}>{item.timestamp}</Text>
    </View>
  );

  if (loading && liveStreams.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={NYXSCREAM.scream} />
          <Text style={styles.loadingText}>Connecting to screams...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
        <Text style={styles.headerTitle}>SCREAM</Text>
        <Text style={styles.headerSubtitle}>Live Streams & Chat</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔴 NOW ECHOING</Text>
          <FlatList
            horizontal
            scrollEnabled
            data={liveStreams}
            keyExtractor={(item) => item.id}
            renderItem={renderLiveStreamCard}
            contentContainerStyle={styles.horizontalList}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {selectedStream && (
          <View style={styles.chatSection}>
            <Text style={styles.sectionTitle}>💬 SCREAM CHAT</Text>
            
            <View style={styles.chatContainer}>
              <FlatList
                data={chatMessages}
                keyExtractor={(item) => item.id}
                renderItem={renderChatMessage}
                contentContainerStyle={styles.chatList}
                scrollEnabled
              />
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.chatInputContainer}
            >
              <TextInput
                style={styles.chatInput}
                placeholder="Join the scream..."
                placeholderTextColor={NYXSCREAM.mist}
                value={messageInput}
                onChangeText={setMessageInput}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
              >
                <Text style={styles.sendButtonText}>→</Text>
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        )}

        {!selectedStream && (
          <View style={styles.placeholderSection}>
            <Text style={styles.placeholderText}>
              Join a stream to chat with the void
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={[]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NYXSCREAM.scream} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NYXSCREAM.void
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: NYXSCREAM.ghost,
    marginTop: 15,
    fontSize: 14
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
    paddingHorizontal: 15,
    paddingVertical: 15
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    color: NYXSCREAM.ghost,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 12
  },
  horizontalList: {
    paddingRight: 15
  },
  streamCard: {
    marginRight: 12,
    width: 200,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: NYXSCREAM.shadow
  },
  streamThumbnail: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  streamEmoji: {
    fontSize: 50
  },
  liveIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: NYXSCREAM.scream,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4
  },
  liveIndicatorText: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 9,
    letterSpacing: 1
  },
  streamInfo: {
    padding: 12
  },
  streamTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: NYXSCREAM.ghost,
    marginBottom: 4
  },
  creatorName: {
    fontSize: 11,
    color: NYXSCREAM.electric,
    fontWeight: '700',
    marginBottom: 8
  },
  streamMeta: {
    marginBottom: 8
  },
  viewers: {
    fontSize: 10,
    color: NYXSCREAM.mist,
    marginBottom: 4
  },
  duration: {
    fontSize: 10,
    color: NYXSCREAM.mist
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: NYXSCREAM.nyx,
    borderRadius: 4
  },
  categoryText: {
    color: NYXSCREAM.void,
    fontSize: 9,
    fontWeight: '700'
  },
  chatSection: {
    flex: 1,
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    overflow: 'hidden'
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  chatList: {
    paddingVertical: 5
  },
  chatMessage: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: NYXSCREAM.void
  },
  chatUser: {
    color: NYXSCREAM.electric,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 2
  },
  chatText: {
    color: NYXSCREAM.ghost,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4
  },
  chatTime: {
    color: NYXSCREAM.mist,
    fontSize: 10
  },
  chatInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: NYXSCREAM.void,
    gap: 8
  },
  chatInput: {
    flex: 1,
    backgroundColor: NYXSCREAM.void,
    borderWidth: 1,
    borderColor: NYXSCREAM.electric,
    color: NYXSCREAM.ghost,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    fontFamily: 'monospace',
    fontSize: 12
  },
  sendButton: {
    backgroundColor: NYXSCREAM.scream,
    width: 40,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonText: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 18
  },
  placeholderSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  placeholderText: {
    color: NYXSCREAM.mist,
    fontSize: 14,
    textAlign: 'center'
  }
});