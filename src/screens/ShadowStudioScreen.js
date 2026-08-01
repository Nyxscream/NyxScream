// Shadow Studio - Creator Dashboard
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getCreatorDashboard, getCreatorTier } from '../services/CreatorService';
import { getUserSubscription } from '../services/SubscriptionService';

const NYXSCREAM = {
  void: '#0D0221',
  shadow: '#1A0A2E',
  scream: '#FF003C',
  nyx: '#9D00FF',
  electric: '#00F0FF',
  ghost: '#E0E0E0',
  mist: '#6B6B6B'
};

const MOCK_DASHBOARD = {
  profile: {
    name: 'DarkWhisper',
    followers: 45000,
    totalEchoes: 235,
    totalWatchTime: 125000
  },
  recentStreams: [
    { id: '1', title: 'Midnight Horror', status: 'LIVE', viewers: 1250 },
    { id: '2', title: 'Dark Vibes', status: 'Ended', viewers: 892 }
  ],
  earnings: {
    totalEarnings: 8450,
    voidAds: 2100,
    shadowSubs: 4200,
    echoTips: 2150
  }
};

export default function ShadowStudioScreen({ route, navigation }) {
  const [dashboard, setDashboard] = useState(MOCK_DASHBOARD);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { creatorId } = route.params || {};

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setTimeout(() => {
      setDashboard(MOCK_DASHBOARD);
      setSubscription({ tier: 'shadow', status: 'active' });
      setLoading(false);
    }, 500);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={NYXSCREAM.scream} />
          <Text style={styles.loadingText}>Loading studio...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
        <Text style={styles.headerTitle}>SHADOW STUDIO</Text>
        <Text style={styles.headerSubtitle}>Creator Dashboard</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NYXSCREAM.scream} />}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <LinearGradient colors={[NYXSCREAM.nyx, NYXSCREAM.shadow]} style={styles.profileGradient}>
            <Text style={styles.profileAvatar}>👤</Text>
            <Text style={styles.profileName}>{dashboard.profile.name}</Text>
            <Text style={styles.profileStats}>
              {dashboard.profile.followers.toLocaleString()} followers • {dashboard.profile.totalEchoes} echoes
            </Text>
          </LinearGradient>
        </View>

        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <Text style={styles.cardTitle}>💰 TOTAL EARNINGS</Text>
          <Text style={styles.earningsAmount}>
            ${dashboard.earnings.totalEarnings.toLocaleString()}
          </Text>

          <View style={styles.earningsBreakdown}>
            <View style={styles.earningItem}>
              <Text style={styles.earningLabel}>Void Ads</Text>
              <Text style={styles.earningValue}>${dashboard.earnings.voidAds}</Text>
            </View>
            <View style={styles.earningItem}>
              <Text style={styles.earningLabel}>Shadow Subs</Text>
              <Text style={styles.earningValue}>${dashboard.earnings.shadowSubs}</Text>
            </View>
            <View style={styles.earningItem}>
              <Text style={styles.earningLabel}>Echo Tips</Text>
              <Text style={styles.earningValue}>${dashboard.earnings.echoTips}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Cast')}
          >
            <Text style={styles.actionIcon}>🎥</Text>
            <Text style={styles.actionLabel}>GO LIVE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Cast')}
          >
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionLabel}>UPLOAD</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionLabel}>ANALYTICS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionLabel}>SETTINGS</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Streams */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔴 RECENT ECHOES</Text>
          <FlatList
            scrollEnabled={false}
            data={dashboard.recentStreams}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.streamItem}>
                <View style={styles.streamLeft}>
                  <Text style={styles.streamTitle}>{item.title}</Text>
                  <Text style={styles.streamStatus}>{item.status}</Text>
                </View>
                <View style={styles.streamRight}>
                  <Text style={styles.streamViewers}>👥 {item.viewers}</Text>
                </View>
              </View>
            )}
          />
        </View>

        {/* Subscription Info */}
        {subscription && (
          <View style={styles.subscriptionCard}>
            <Text style={styles.cardTitle}>💜 YOUR ESSENCE</Text>
            <Text style={styles.subscriptionTier}>{subscription.tier.toUpperCase()}</Text>
            <Text style={styles.subscriptionStatus}>Status: {subscription.status}</Text>
          </View>
        )}

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
    padding: 20
  },
  profileCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20
  },
  profileGradient: {
    paddingVertical: 25,
    alignItems: 'center'
  },
  profileAvatar: {
    fontSize: 60,
    marginBottom: 12
  },
  profileName: {
    fontSize: 24,
    fontWeight: '900',
    color: NYXSCREAM.ghost,
    marginBottom: 8
  },
  profileStats: {
    color: NYXSCREAM.electric,
    fontSize: 12,
    letterSpacing: 1
  },
  earningsCard: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 2,
    borderColor: NYXSCREAM.scream,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20
  },
  cardTitle: {
    color: NYXSCREAM.scream,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 12
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: NYXSCREAM.electric,
    marginBottom: 16
  },
  earningsBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  earningItem: {
    flex: 1,
    backgroundColor: NYXSCREAM.void,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center'
  },
  earningLabel: {
    color: NYXSCREAM.mist,
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6
  },
  earningValue: {
    color: NYXSCREAM.electric,
    fontWeight: '900',
    fontSize: 14
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 10
  },
  actionCard: {
    width: '48%',
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: 'center'
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  actionLabel: {
    color: NYXSCREAM.ghost,
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1
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
  streamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: NYXSCREAM.shadow,
    borderLeftWidth: 3,
    borderLeftColor: NYXSCREAM.scream,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 4
  },
  streamLeft: {
    flex: 1
  },
  streamTitle: {
    color: NYXSCREAM.ghost,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 4
  },
  streamStatus: {
    color: NYXSCREAM.mist,
    fontSize: 11
  },
  streamRight: {
    alignItems: 'flex-end'
  },
  streamViewers: {
    color: NYXSCREAM.electric,
    fontWeight: '700',
    fontSize: 12
  },
  subscriptionCard: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20
  },
  subscriptionTier: {
    fontSize: 20,
    fontWeight: '900',
    color: NYXSCREAM.nyx,
    marginBottom: 8
  },
  subscriptionStatus: {
    color: NYXSCREAM.mist,
    fontSize: 12
  }
});