import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../services/Firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const NYXSCREAM = {
  void: '#0D0221',
  shadow: '#1A0A2E',
  scream: '#FF003C',
  nyx: '#9D00FF',
  electric: '#00F0FF',
  ghost: '#E0E0E0',
  mist: '#6B6B6B'
};

export default function SubscriberListScreen({ navigation }) {
  const [subscribers, setSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    shadowCount: 0,
    abyssCount: 0,
    monthlyRevenue: 0,
    averageLifetimeValue: 0
  });

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    // Subscribe to user's subscribers in real-time
    const subscribersQuery = query(
      collection(db, 'subscriptions'),
      where('creatorId', '==', userId),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(
      subscribersQuery,
      (snapshot) => {
        const subscribersList = [];
        snapshot.forEach((doc) => {
          subscribersList.push({
            id: doc.id,
            ...doc.data()
          });
        });

        // Sort by subscription date (newest first)
        subscribersList.sort((a, b) => b.subscribedAt - a.subscribedAt);
        setSubscribers(subscribersList);
        filterSubscribers(subscribersList, searchQuery, selectedTier);
        calculateStats(subscribersList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching subscribers:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const filterSubscribers = (list, query, tier) => {
    let filtered = [...list];

    // Filter by tier
    if (tier !== 'all') {
      filtered = filtered.filter(sub => sub.tier === tier);
    }

    // Filter by search query
    if (query.trim()) {
      filtered = filtered.filter(sub =>
        sub.subscriberName?.toLowerCase().includes(query.toLowerCase()) ||
        sub.subscriberEmail?.toLowerCase().includes(query.toLowerCase())
      );
    }

    setFilteredSubscribers(filtered);
  };

  const calculateStats = (list) => {
    const shadowCount = list.filter(s => s.tier === 'shadow').length;
    const abyssCount = list.filter(s => s.tier === 'abyss').length;

    let monthlyRevenue = 0;
    list.forEach(sub => {
      if (sub.tier === 'shadow') monthlyRevenue += 7.99;
      if (sub.tier === 'abyss') monthlyRevenue += 13.59;
    });

    const lifetimeValues = list.map(sub => {
      const monthsSubscribed = sub.monthsSubscribed || 1;
      if (sub.tier === 'shadow') return 7.99 * monthsSubscribed;
      if (sub.tier === 'abyss') return 13.59 * monthsSubscribed;
      return 0;
    });

    const averageLifetime = lifetimeValues.length > 0
      ? lifetimeValues.reduce((a, b) => a + b, 0) / lifetimeValues.length
      : 0;

    setStats({
      totalSubscribers: list.length,
      shadowCount,
      abyssCount,
      monthlyRevenue: monthlyRevenue.toFixed(2),
      averageLifetimeValue: averageLifetime.toFixed(2)
    });
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    filterSubscribers(subscribers, text, selectedTier);
  };

  const handleTierFilter = (tier) => {
    setSelectedTier(tier);
    filterSubscribers(subscribers, searchQuery, tier);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp.toDate ? timestamp.toDate() : timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getTierColor = (tier) => {
    return tier === 'abyss' ? NYXSCREAM.scream : NYXSCREAM.electric;
  };

  const SubscriberCard = ({ subscriber }) => (
    <View style={styles.subscriberCard}>
      <View style={styles.subscriberHeader}>
        <View style={styles.subscriberInfo}>
          <Text style={styles.subscriberName}>{subscriber.subscriberName || 'Anonymous'}</Text>
          <Text style={styles.subscriberEmail}>{subscriber.subscriberEmail}</Text>
        </View>
        <View style={[styles.tierBadge, { backgroundColor: getTierColor(subscriber.tier) }]}>
          <Text style={styles.tierText}>${subscriber.tier === 'abyss' ? '16.99' : '9.99'}</Text>
        </View>
      </View>

      <View style={styles.subscriberStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Subscribed</Text>
          <Text style={styles.statValue}>{formatDate(subscriber.subscribedAt)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Months</Text>
          <Text style={styles.statValue}>{subscriber.monthsSubscribed || 1}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Lifetime Value</Text>
          <Text style={styles.statValue}>
            ${subscriber.tier === 'abyss' 
              ? (13.59 * (subscriber.monthsSubscribed || 1)).toFixed(0)
              : (7.99 * (subscriber.monthsSubscribed || 1)).toFixed(0)
            }
          </Text>
        </View>
      </View>

      {subscriber.status === 'active' && (
        <View style={styles.activeIndicator}>
          <Text style={styles.activeText}>✓ ACTIVE</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
          <Text style={styles.headerTitle}>SUBSCRIBERS</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={NYXSCREAM.electric} />
          <Text style={styles.loadingText}>Loading subscribers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
        <Text style={styles.headerTitle}>SUBSCRIBERS</Text>
        <Text style={styles.headerSubtitle}>{stats.totalSubscribers} active subscribers</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NYXSCREAM.electric} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { borderColor: NYXSCREAM.electric }]}>
            <Text style={styles.statCardLabel}>Monthly Revenue</Text>
            <Text style={styles.statCardValue}>${stats.monthlyRevenue}</Text>
          </View>
          <View style={[styles.statCard, { borderColor: NYXSCREAM.scream }]}>
            <Text style={styles.statCardLabel}>Avg Lifetime Value</Text>
            <Text style={styles.statCardValue}>${stats.averageLifetimeValue}</Text>
          </View>
        </View>

        {/* Tier Breakdown */}
        <View style={styles.tierBreakdown}>
          <Text style={styles.breakdownTitle}>Tier Breakdown</Text>
          <View style={styles.tierRow}>
            <View style={styles.tierColumn}>
              <Text style={styles.tierName}>Shadow Tier</Text>
              <Text style={styles.tierCount}>{stats.shadowCount}</Text>
              <Text style={styles.tierPrice}>$9.99/mo</Text>
            </View>
            <View style={styles.tierColumn}>
              <Text style={styles.tierName}>Abyss Tier</Text>
              <Text style={styles.tierCount}>{stats.abyssCount}</Text>
              <Text style={styles.tierPrice}>$16.99/mo</Text>
            </View>
          </View>
        </View>

        {/* Search & Filter */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search subscribers..."
            placeholderTextColor={NYXSCREAM.mist}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Tier Filter Buttons */}
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedTier === 'all' && styles.filterButtonActive
            ]}
            onPress={() => handleTierFilter('all')}
          >
            <Text style={[
              styles.filterButtonText,
              selectedTier === 'all' && styles.filterButtonTextActive
            ]}>
              All ({stats.totalSubscribers})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedTier === 'shadow' && styles.filterButtonActive
            ]}
            onPress={() => handleTierFilter('shadow')}
          >
            <Text style={[
              styles.filterButtonText,
              selectedTier === 'shadow' && styles.filterButtonTextActive
            ]}>
              Shadow ({stats.shadowCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedTier === 'abyss' && styles.filterButtonActive
            ]}
            onPress={() => handleTierFilter('abyss')}
          >
            <Text style={[
              styles.filterButtonText,
              selectedTier === 'abyss' && styles.filterButtonTextActive
            ]}>
              Abyss ({stats.abyssCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Subscribers List */}
        {filteredSubscribers.length > 0 ? (
          <FlatList
            scrollEnabled={false}
            data={filteredSubscribers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <SubscriberCard subscriber={item} />}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No subscribers found</Text>
          </View>
        )}
      </ScrollView>
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
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: NYXSCREAM.scream
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: NYXSCREAM.scream,
    letterSpacing: 3,
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 12,
    color: NYXSCREAM.electric,
    letterSpacing: 1
  },
  content: {
    flex: 1,
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    color: NYXSCREAM.ghost,
    marginTop: 12,
    fontSize: 14
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20
  },
  statCard: {
    flex: 1,
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center'
  },
  statCardLabel: {
    color: NYXSCREAM.mist,
    fontSize: 11,
    marginBottom: 6,
    letterSpacing: 1
  },
  statCardValue: {
    color: NYXSCREAM.ghost,
    fontSize: 20,
    fontWeight: '900'
  },
  tierBreakdown: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20
  },
  breakdownTitle: {
    color: NYXSCREAM.ghost,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1
  },
  tierRow: {
    flexDirection: 'row',
    gap: 12
  },
  tierColumn: {
    flex: 1,
    backgroundColor: NYXSCREAM.void,
    borderRadius: 6,
    padding: 12,
    alignItems: 'center'
  },
  tierName: {
    color: NYXSCREAM.electric,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6
  },
  tierCount: {
    color: NYXSCREAM.ghost,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4
  },
  tierPrice: {
    color: NYXSCREAM.mist,
    fontSize: 11
  },
  searchContainer: {
    marginBottom: 12
  },
  searchInput: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.electric,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: NYXSCREAM.ghost,
    fontSize: 14
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: NYXSCREAM.mist,
    borderRadius: 6,
    alignItems: 'center'
  },
  filterButtonActive: {
    backgroundColor: NYXSCREAM.scream,
    borderColor: NYXSCREAM.scream
  },
  filterButtonText: {
    color: NYXSCREAM.ghost,
    fontSize: 12,
    fontWeight: '600'
  },
  filterButtonTextActive: {
    color: NYXSCREAM.void,
    fontWeight: '700'
  },
  subscriberCard: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12
  },
  subscriberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  subscriberInfo: {
    flex: 1,
    marginRight: 12
  },
  subscriberName: {
    color: NYXSCREAM.ghost,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4
  },
  subscriberEmail: {
    color: NYXSCREAM.mist,
    fontSize: 12
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center'
  },
  tierText: {
    color: NYXSCREAM.void,
    fontWeight: '700',
    fontSize: 12
  },
  subscriberStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12
  },
  statItem: {
    flex: 1
  },
  statLabel: {
    color: NYXSCREAM.mist,
    fontSize: 10,
    marginBottom: 4,
    letterSpacing: 0.5
  },
  statValue: {
    color: NYXSCREAM.ghost,
    fontSize: 13,
    fontWeight: '700'
  },
  activeIndicator: {
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderRadius: 4
  },
  activeText: {
    color: NYXSCREAM.electric,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1
  },
  separator: {
    height: 8,
    backgroundColor: 'transparent'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyStateText: {
    color: NYXSCREAM.mist,
    fontSize: 14
  }
});
