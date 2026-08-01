// Echo Player Screen - VOD Player
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video } from 'expo-av';

const NYXSCREAM = {
  void: '#0D0221',
  shadow: '#1A0A2E',
  scream: '#FF003C',
  nyx: '#9D00FF',
  electric: '#00F0FF',
  ghost: '#E0E0E0',
  mist: '#6B6B6B'
};

const MOCK_ECHO = {
  id: '1',
  title: 'The Haunting Hour - Full Stream',
  creator: 'DarkWhisper',
  views: 12400,
  likes: 892,
  comments: 234,
  duration: '2:15:30',
  uploadedAt: '2 days ago',
  description: 'A full night of horror gaming and creepy stories. Join us in the darkness.',
  category: 'Horror',
  hlsUrl: 'https://d23dyxqnlz5ey.cloudfront.net/clear/video-player-hls/master.m3u8'
};

const MOCK_COMMENTS = [
  { id: '1', user: 'ShadowFan', comment: 'This was incredible!', likes: 45 },
  { id: '2', user: 'VoidWalker', comment: 'Best content on NyxScream', likes: 32 },
  { id: '3', user: 'EchoListener', comment: 'The ending was wild 🔥', likes: 28 }
];

const MOCK_RECOMMENDATIONS = [
  { id: '1', title: 'Midnight Confessions', creator: 'ShadowVoice', views: 8900 },
  { id: '2', title: 'Paranormal Investigation', creator: 'NyxBeats', views: 6500 },
  { id: '3', title: 'Dark Gaming Marathon', creator: 'Screamer101', views: 4200 }
];

export default function EchoPlayerScreen({ route, navigation }) {
  const [echo, setEcho] = useState(MOCK_ECHO);
  const [liked, setLiked] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const { echoId } = route.params || {};

  useEffect(() => {
    // Load echo data
    setEcho(MOCK_ECHO);
  }, []);

  const renderComment = ({ item }) => (
    <View style={styles.comment}>
      <Text style={styles.commentUser}>{item.user}</Text>
      <Text style={styles.commentText}>{item.comment}</Text>
      <Text style={styles.commentLikes}>❤️ {item.likes}</Text>
    </View>
  );

  const renderRecommendation = ({ item }) => (
    <TouchableOpacity
      style={styles.recommendationCard}
      onPress={() => navigation.push('EchoPlayer', { echoId: item.id })}
    >
      <LinearGradient colors={[NYXSCREAM.scream, NYXSCREAM.nyx]} style={styles.recommendationThumbnail}>
        <Text style={styles.recommendationEmoji}>📺</Text>
      </LinearGradient>
      <View style={styles.recommendationInfo}>
        <Text style={styles.recommendationTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.recommendationCreator}>{item.creator}</Text>
        <Text style={styles.recommendationViews}>👁️ {item.views.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Video Player */}
        <View style={styles.playerContainer}>
          <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.videoPlaceholder}>
            <Video
              source={{ uri: echo.hlsUrl }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="contain"
              shouldPlay={false}
              style={styles.video}
              onLoadStart={() => setVideoLoading(true)}
              onLoad={() => setVideoLoading(false)}
              useNativeControls
            />
            {videoLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color={NYXSCREAM.electric} />
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Echo Info */}
        <View style={styles.echoInfo}>
          <Text style={styles.echoTitle}>{echo.title}</Text>

          <View style={styles.statsRow}>
            <Text style={styles.stat}>👁️ {echo.views.toLocaleString()} views</Text>
            <Text style={styles.stat}>⏱️ {echo.duration}</Text>
            <Text style={styles.stat}>📅 {echo.uploadedAt}</Text>
          </View>

          <View style={styles.creatorRow}>
            <Text style={styles.creatorAvatar}>👤</Text>
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorName}>{echo.creator}</Text>
              <Text style={styles.creatorFollow}>45K followers</Text>
            </View>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>FOLLOW</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, liked && styles.actionBtnActive]}
              onPress={() => setLiked(!liked)}
            >
              <Text style={styles.actionBtnText}>
                {liked ? '❤️' : '🤍'} {echo.likes + (liked ? 1 : 0)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>💬 {echo.comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>📤 Share</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.descriptionBox}>
            <Text style={styles.descriptionLabel}>📝 About</Text>
            <Text style={styles.descriptionText}>{echo.description}</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 COMMENTS ({echo.comments})</Text>
          <FlatList
            scrollEnabled={false}
            data={MOCK_COMMENTS}
            keyExtractor={(item) => item.id}
            renderItem={renderComment}
          />
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔮 MORE FROM THE VOID</Text>
          <FlatList
            scrollEnabled={false}
            data={MOCK_RECOMMENDATIONS}
            keyExtractor={(item) => item.id}
            renderItem={renderRecommendation}
          />
        </View>

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
  content: {
    flex: 1
  },
  playerContainer: {
    width: '100%',
    height: 250,
    backgroundColor: NYXSCREAM.shadow
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  video: {
    width: '100%',
    height: '100%'
  },
  loadingOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  echoInfo: {
    padding: 20
  },
  echoTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: NYXSCREAM.ghost,
    marginBottom: 12
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: NYXSCREAM.shadow
  },
  stat: {
    fontSize: 11,
    color: NYXSCREAM.mist
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: NYXSCREAM.shadow
  },
  creatorAvatar: {
    fontSize: 36,
    marginRight: 12
  },
  creatorInfo: {
    flex: 1
  },
  creatorName: {
    color: NYXSCREAM.ghost,
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 2
  },
  creatorFollow: {
    color: NYXSCREAM.mist,
    fontSize: 11
  },
  followButton: {
    backgroundColor: NYXSCREAM.scream,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4
  },
  followButtonText: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  actionBtn: {
    flex: 1,
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center'
  },
  actionBtnActive: {
    borderColor: NYXSCREAM.scream,
    backgroundColor: 'rgba(255, 0, 60, 0.1)'
  },
  actionBtnText: {
    color: NYXSCREAM.ghost,
    fontWeight: '700',
    fontSize: 12
  },
  descriptionBox: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    padding: 12
  },
  descriptionLabel: {
    color: NYXSCREAM.electric,
    fontWeight: '900',
    fontSize: 12,
    marginBottom: 8
  },
  descriptionText: {
    color: NYXSCREAM.ghost,
    fontSize: 13,
    lineHeight: 20
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: NYXSCREAM.shadow
  },
  sectionTitle: {
    color: NYXSCREAM.ghost,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 12
  },
  comment: {
    backgroundColor: NYXSCREAM.shadow,
    borderLeftWidth: 3,
    borderLeftColor: NYXSCREAM.electric,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 4
  },
  commentUser: {
    color: NYXSCREAM.electric,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 4
  },
  commentText: {
    color: NYXSCREAM.ghost,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6
  },
  commentLikes: {
    color: NYXSCREAM.mist,
    fontSize: 10
  },
  recommendationCard: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx
  },
  recommendationThumbnail: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  recommendationEmoji: {
    fontSize: 40
  },
  recommendationInfo: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center'
  },
  recommendationTitle: {
    color: NYXSCREAM.ghost,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 4
  },
  recommendationCreator: {
    color: NYXSCREAM.electric,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4
  },
  recommendationViews: {
    color: NYXSCREAM.mist,
    fontSize: 10
  }
});