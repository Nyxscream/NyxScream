// Live Scream Screen - Live Stream Viewing
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av';
import { getMuxStreamStatus } from '../services/MuxService';

const NYXSCREAM = {
  void: '#0D0221',
  shadow: '#1A0A2E',
  scream: '#FF003C',
  nyx: '#9D00FF',
  electric: '#00F0FF',
  ghost: '#E0E0E0',
  mist: '#6B6B6B'
};

const MOCK_LIVE_STREAM = {
  id: '1',
  title: 'Midnight Horror Marathon LIVE',
  creator: 'DarkWhisper',
  viewers: 1250,
  startedAt: '2h ago',
  category: 'Horror',
  playbackId: 'mock_playback_123',
  hlsUrl: 'https://d23dyxqnlz5ey.cloudfront.net/clear/video-player-hls/master.m3u8'
};

const MOCK_LIVE_CHAT = [
  { id: '1', user: 'ShadowFan', message: 'OMG THIS IS INSANE', timestamp: '12:34', type: 'user' },
  { id: '2', user: 'SYSTEM', message: 'VoidWalker joined the scream', timestamp: '12:35', type: 'system' },
  { id: '3', user: 'VoidWalker', message: 'First time here, love it!', timestamp: '12:36', type: 'user' },
  { id: '4', user: 'EchoListener', message: 'This is pure art 🔥', timestamp: '12:37', type: 'user' }
];

export default function LiveScreamScreen({ route, navigation }) {
  const [stream, setStream] = useState(MOCK_LIVE_STREAM);
  const [chatMessages, setChatMessages] = useState(MOCK_LIVE_CHAT);
  const [messageInput, setMessageInput] = useState('');
  const [viewerCount, setViewerCount] = useState(MOCK_LIVE_STREAM.viewers);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isTipping, setIsTipping] = useState(false);

  const { streamId, streamTitle, streamKey } = route.params || {};

  useEffect(() => {
    setStream(MOCK_LIVE_STREAM);
    setLoading(false);

    // Simulate viewer count changes
    const interval = setInterval(() => {
      setViewerCount((prev) => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      user: 'YouShadow',
      message: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'user'
    };

    setChatMessages([...chatMessages, newMessage]);
    setMessageInput('');
  };

  const handleTip = (amount) => {
    setIsTipping(true);
    setTimeout(() => {
      setChatMessages([
        ...chatMessages,
        {
          id: Date.now().toString(),
          user: 'SYSTEM',
          message: `YouShadow sent a $${amount} tribute!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'tribute'
        }
      ]);
      setIsTipping(false);
    }, 500);
  };

  const renderChatMessage = ({ item }) => (
    <View style={[styles.chatMessage, item.type === 'system' && styles.chatMessageSystem]}>
      <Text style={styles.chatUser}>{item.user}</Text>
      <Text style={styles.chatText}>{item.message}</Text>
      <Text style={styles.chatTime}>{item.timestamp}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={NYXSCREAM.scream} />
          <Text style={styles.loadingText}>Joining the scream...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.videoContainer}>
        {/* Video Player */}
        <Video
          source={{ uri: stream.hlsUrl }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="contain"
          shouldPlay={true}
          style={styles.video}
          useNativeControls
        />

        {/* Live Badge & Viewer Count */}
        <View style={styles.streamBadges}>
          <LinearGradient colors={[NYXSCREAM.scream, 'transparent']} style={styles.liveBadgeGradient}>
            <View style={styles.liveBadgeContainer}>
              <Text style={styles.liveBadge}>● LIVE</Text>
              <Text style={styles.viewerCount}>👥 {viewerCount.toLocaleString()}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Stream Info Overlay */}
        {showControls && (
          <LinearGradient colors={['transparent', NYXSCREAM.shadow]} style={styles.streamInfoOverlay}>
            <View style={styles.streamInfoContainer}>
              <View style={styles.streamTitleRow}>
                <Text style={styles.streamTitle} numberOfLines={2}>
                  {stream.title}
                </Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.creatorRow}>
                <Text style={styles.creatorAvatar}>👤</Text>
                <Text style={styles.creatorName}>{stream.creator}</Text>
                <TouchableOpacity style={styles.followBtnSmall}>
                  <Text style={styles.followBtnSmallText}>FOLLOW</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Tap to toggle controls */}
        <TouchableOpacity
          style={styles.tapToToggle}
          onPress={() => setShowControls(!showControls)}
        />
      </View>

      {/* Chat Section */}
      <View style={styles.chatSection}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatHeaderTitle}>💬 SCREAM CHAT</Text>
          <Text style={styles.chatCount}>{chatMessages.length} messages</Text>
        </View>

        <FlatList
          data={chatMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderChatMessage}
          contentContainerStyle={styles.chatList}
          inverted
          scrollEnabled
        />

        {/* Tip Buttons */}
        <View style={styles.tipButtons}>
          <TouchableOpacity
            style={styles.tipBtn}
            onPress={() => handleTip(1)}
            disabled={isTipping}
          >
            <Text style={styles.tipBtnText}>$1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tipBtn}
            onPress={() => handleTip(5)}
            disabled={isTipping}
          >
            <Text style={styles.tipBtnText}>$5</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tipBtn}
            onPress={() => handleTip(10)}
            disabled={isTipping}
          >
            <Text style={styles.tipBtnText}>$10</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tipBtn}
            onPress={() => handleTip(50)}
            disabled={isTipping}
          >
            <Text style={styles.tipBtnText}>$50</Text>
          </TouchableOpacity>
        </View>

        {/* Message Input */}
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
  videoContainer: {
    width: '100%',
    height: 250,
    backgroundColor: NYXSCREAM.shadow,
    position: 'relative'
  },
  video: {
    width: '100%',
    height: '100%'
  },
  streamBadges: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10
  },
  liveBadgeGradient: {
    paddingVertical: 10,
    paddingHorizontal: 15
  },
  liveBadgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  liveBadge: {
    color: NYXSCREAM.ghost,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1
  },
  viewerCount: {
    color: NYXSCREAM.ghost,
    fontWeight: '700',
    fontSize: 12
  },
  streamInfoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 10,
    paddingHorizontal: 12,
    paddingTop: 20
  },
  streamInfoContainer: {
    marginBottom: 10
  },
  streamTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  streamTitle: {
    flex: 1,
    color: NYXSCREAM.ghost,
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 20,
    marginRight: 8
  },
  closeButton: {
    color: NYXSCREAM.ghost,
    fontSize: 20,
    fontWeight: '900'
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  creatorAvatar: {
    fontSize: 24
  },
  creatorName: {
    color: NYXSCREAM.ghost,
    fontWeight: '700',
    fontSize: 12,
    flex: 1
  },
  followBtnSmall: {
    backgroundColor: NYXSCREAM.scream,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 3
  },
  followBtnSmallText: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 9
  },
  tapToToggle: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  chatSection: {
    flex: 1,
    backgroundColor: NYXSCREAM.shadow,
    borderTopWidth: 1,
    borderTopColor: NYXSCREAM.nyx
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: NYXSCREAM.void
  },
  chatHeaderTitle: {
    color: NYXSCREAM.ghost,
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1
  },
  chatCount: {
    color: NYXSCREAM.mist,
    fontSize: 10
  },
  chatList: {
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  chatMessage: {
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: NYXSCREAM.void,
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: NYXSCREAM.electric
  },
  chatMessageSystem: {
    borderLeftColor: NYXSCREAM.nyx,
    backgroundColor: 'rgba(157, 0, 255, 0.1)'
  },
  chatUser: {
    color: NYXSCREAM.electric,
    fontWeight: '700',
    fontSize: 11,
    marginBottom: 2
  },
  chatText: {
    color: NYXSCREAM.ghost,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 3
  },
  chatTime: {
    color: NYXSCREAM.mist,
    fontSize: 9
  },
  tipButtons: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: NYXSCREAM.void
  },
  tipBtn: {
    flex: 1,
    backgroundColor: NYXSCREAM.scream,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center'
  },
  tipBtnText: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 11
  },
  chatInputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: NYXSCREAM.void,
    gap: 6
  },
  chatInput: {
    flex: 1,
    backgroundColor: NYXSCREAM.void,
    borderWidth: 1,
    borderColor: NYXSCREAM.electric,
    color: NYXSCREAM.ghost,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 12
  },
  sendButton: {
    backgroundColor: NYXSCREAM.scream,
    width: 36,
    height: 36,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonText: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 16
  }
});