// Void Screen - Main Feed with Trending Content
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator
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

// Mock data - replace with real API calls
const MOCK_ECHOES = [
  {
    id: '1',
    title: 'The Haunting Hour',
    creator: 'DarkWhisper',
    thumbnail: '🌑',
    views: 2400,
    likes: 156,
    category: 'Horror',
    status: 'LIVE',
    viewers: 342
  },
  {
    id: '2',
    title: 'Midnight Confessions',
    creator: 'ShadowVoice',
    thumbnail: '👻',
    views: 1890,
    likes: 203,
    category: 'Dark Talk',
    status: 'Echoing',
    viewers: 0
  },
  {
    id: '3',
    title: 'Void Vibes Playlist',
    creator: 'NyxBeats',
    thumbnail: '🎵',
    views: 3200,
    likes: 512,
    category: 'Music',
    status: 'Manifesting',
    viewers: 0
  },
  {
    id: '4',
    title: 'Horror Game Marathon',
    creator: 'Screamer101',
    thumbnail: '🎮',
    views: 1564,
    likes: 289,
    category: 'Gaming',
    status: 'Echoing',
    viewers: 0
  }
];

export default function VoidScreen({ navigation }) {
  const [echoes, setEchoes] = useState(MOCK_ECHOES);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadEchoes();
  }, []);

  const loadEchoes = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setEchoes(MOCK_ECHOES);
      setLoading(false);
    }, 500);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEchoes();
    setRefreshing(false);
  };

  const renderEchoCard = ({ item }) => (
    <TouchableOpacity
      style={styles.echoCard}
      onPress={() => navigation.navigate('EchoPlayer', { echoId: item.id })}
    >
      <LinearGradient colors={[NYXSCREAM.scream, NYXSCREAM.nyx]} style={styles.thumbnail}>
        <Text style={styles.thumbnailText}>{item.thumbnail}</Text>
        {item.status === 'LIVE' && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>● LIVE</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.echoInfo}>
        <Text style={styles.echoTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.creatorName}>{item.creator}</Text>

        <View style={styles.statsRow}>
          <Text style={styles.stat}>👁️ {item.views.toLocaleString()}</Text>
          <Text style={styles.stat}>❤️ {item.likes.toLocaleString()}</Text>
          {item.viewers > 0 && <Text style={styles.stat}>👥 {item.viewers}</Text>}
        </View>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryFilter = () => (
    <View style={styles.filterContainer}>
      {['all', 'horror', 'music', 'gaming', 'dark-talk'].map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.filterButton,
            activeFilter === category && styles.filterButtonActive
          ]}
          onPress={() => setActiveFilter(category)}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === category && styles.filterTextActive
            ]}
          >
            {category.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading && echoes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={NYXSCREAM.scream} />
          <Text style={styles.loadingText}>Summoning echoes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
        <Text style={styles.headerTitle}>THE VOID</Text>
        <Text style={styles.headerSubtitle}>Discover echoes from the darkness</Text>
      </LinearGradient>

      <FlatList
        style={styles.list}
        data={echoes}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderCategoryFilter}
        renderItem={renderEchoCard}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NYXSCREAM.scream} />}
        contentContainerStyle={styles.listContent}
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 15,
    gap: 8,
    backgroundColor: NYXSCREAM.shadow
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: NYXSCREAM.mist,
    borderRadius: 20,
    backgroundColor: 'transparent'
  },
  filterButtonActive: {
    borderColor: NYXSCREAM.scream,
    backgroundColor: 'rgba(255, 0, 60, 0.2)'
  },
  filterText: {
    color: NYXSCREAM.mist,
    fontSize: 11,
    fontWeight: '700'
  },
  filterTextActive: {
    color: NYXSCREAM.scream
  },
  list: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20
  },
  echoCard: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx
  },
  thumbnail: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  thumbnailText: {
    fontSize: 60
  },
  liveBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: NYXSCREAM.scream,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4
  },
  liveBadgeText: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 1
  },
  echoInfo: {
    padding: 15
  },
  echoTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: NYXSCREAM.ghost,
    marginBottom: 6
  },
  creatorName: {
    fontSize: 12,
    color: NYXSCREAM.electric,
    fontWeight: '700',
    marginBottom: 10
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10
  },
  stat: {
    fontSize: 11,
    color: NYXSCREAM.mist
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: NYXSCREAM.nyx,
    borderRadius: 4
  },
  categoryText: {
    color: NYXSCREAM.void,
    fontSize: 10,
    fontWeight: '700'
  }
});