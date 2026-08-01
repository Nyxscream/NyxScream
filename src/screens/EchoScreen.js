// Echo Screen - Search & Discovery
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
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

const MOCK_CREATORS = [
  { id: '1', name: 'DarkWhisper', followers: 45000, tier: 'scream', verified: true },
  { id: '2', name: 'ShadowVoice', followers: 32000, tier: 'echo', verified: true },
  { id: '3', name: 'NyxBeats', followers: 28000, tier: 'echo', verified: false },
  { id: '4', name: 'Screamer101', followers: 15000, tier: 'whisper', verified: false }
];

const MOCK_CATEGORIES = [
  { id: '1', name: 'Horror', count: 1250, emoji: '👻' },
  { id: '2', name: 'Music', count: 890, emoji: '🎵' },
  { id: '3', name: 'Gaming', count: 650, emoji: '🎮' },
  { id: '4', name: 'Dark Talk', count: 420, emoji: '💬' },
  { id: '5', name: 'Art', count: 380, emoji: '🎨' },
  { id: '6', name: 'Paranormal', count: 310, emoji: '✨' }
];

export default function EchoScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('categories');

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (query.length === 0) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setTimeout(() => {
      const results = MOCK_CREATORS.filter(creator =>
        creator.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setSearching(false);
    }, 300);
  };

  const getTierBadge = (tier) => {
    const badges = {
      whisper: { icon: '🤫', color: NYXSCREAM.electric },
      echo: { icon: '🔊', color: NYXSCREAM.nyx },
      scream: { icon: '🔴', color: NYXSCREAM.scream }
    };
    return badges[tier] || badges.whisper;
  };

  const renderCreatorCard = ({ item }) => (
    <TouchableOpacity
      style={styles.creatorCard}
      onPress={() => navigation.navigate('ShadowStudio', { creatorId: item.id })}
    >
      <View style={styles.creatorAvatar}>
        <Text style={styles.avatarText}>👤</Text>
      </View>

      <View style={styles.creatorInfo}>
        <View style={styles.creatorNameRow}>
          <Text style={styles.creatorName}>{item.name}</Text>
          {item.verified && <Text style={styles.verifiedBadge}>✓</Text>}
        </View>
        <Text style={styles.followerCount}>
          {item.followers.toLocaleString()} followers
        </Text>
      </View>

      <View style={[styles.tierBadge, { borderColor: getTierBadge(item.tier).color }]}>
        <Text style={styles.tierText}>{getTierBadge(item.tier).icon}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryCard = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('Void', { category: item.name })}
    >
      <LinearGradient colors={[NYXSCREAM.nyx, NYXSCREAM.shadow]} style={styles.categoryGradient}>
        <Text style={styles.categoryEmoji}>{item.emoji}</Text>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.categoryCount}>{item.count} echoes</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
        <Text style={styles.headerTitle}>ECHO</Text>
        <Text style={styles.headerSubtitle}>Search & Discover</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search creators..."
          placeholderTextColor={NYXSCREAM.mist}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searching && <ActivityIndicator size="small" color={NYXSCREAM.electric} style={styles.searchSpinner} />}
      </View>

      {searchQuery.length > 0 ? (
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>SEARCH RESULTS</Text>
          {searchResults.length > 0 ? (
            <FlatList
              scrollEnabled={false}
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={renderCreatorCard}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No creators found</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'categories' && styles.tabActive]}
              onPress={() => setActiveTab('categories')}
            >
              <Text style={[styles.tabText, activeTab === 'categories' && styles.tabTextActive]}>
                CATEGORIES
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'trending' && styles.tabActive]}
              onPress={() => setActiveTab('trending')}
            >
              <Text style={[styles.tabText, activeTab === 'trending' && styles.tabTextActive]}>
                TRENDING
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'categories' ? (
            <FlatList
              scrollEnabled={false}
              data={MOCK_CATEGORIES}
              keyExtractor={(item) => item.id}
              renderItem={renderCategoryCard}
              numColumns={2}
              columnWrapperStyle={styles.categoryGrid}
            />
          ) : (
            <FlatList
              scrollEnabled={false}
              data={MOCK_CREATORS.slice(0, 4)}
              keyExtractor={(item) => item.id}
              renderItem={renderCreatorCard}
            />
          )}
        </View>
      )}
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
    borderBottomColor: NYXSCREAM.electric
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: NYXSCREAM.electric,
    letterSpacing: 3
  },
  headerSubtitle: {
    fontSize: 12,
    color: NYXSCREAM.nyx,
    letterSpacing: 1,
    marginTop: 5
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchInput: {
    flex: 1,
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.electric,
    color: NYXSCREAM.ghost,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 6,
    fontFamily: 'monospace'
  },
  searchSpinner: {
    marginLeft: 10
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10
  },
  sectionTitle: {
    color: NYXSCREAM.ghost,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 15
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: NYXSCREAM.mist
  },
  tabActive: {
    borderBottomColor: NYXSCREAM.electric
  },
  tabText: {
    color: NYXSCREAM.mist,
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 1
  },
  tabTextActive: {
    color: NYXSCREAM.electric
  },
  creatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10
  },
  creatorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: NYXSCREAM.nyx,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  avatarText: {
    fontSize: 24
  },
  creatorInfo: {
    flex: 1
  },
  creatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  creatorName: {
    color: NYXSCREAM.ghost,
    fontWeight: '900',
    fontSize: 14,
    marginRight: 6
  },
  verifiedBadge: {
    color: NYXSCREAM.electric,
    fontWeight: '900',
    fontSize: 12
  },
  followerCount: {
    color: NYXSCREAM.mist,
    fontSize: 11
  },
  tierBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tierText: {
    fontSize: 18
  },
  categoryGrid: {
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10
  },
  categoryCard: {
    flex: 1,
    minHeight: 140,
    borderRadius: 8,
    overflow: 'hidden'
  },
  categoryGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15
  },
  categoryEmoji: {
    fontSize: 40,
    marginBottom: 8
  },
  categoryName: {
    color: NYXSCREAM.ghost,
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 4
  },
  categoryCount: {
    color: NYXSCREAM.ghost,
    fontSize: 10,
    opacity: 0.7
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyStateText: {
    color: NYXSCREAM.mist,
    fontSize: 14
  }
});