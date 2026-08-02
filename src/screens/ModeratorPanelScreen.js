import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput
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

export default function ModeratorPanelScreen() {
  const [activeTab, setActiveTab] = useState('ai_flags');

  const [aiFlags, setAiFlags] = useState([
    {
      id: 1,
      user: 'User123',
      content: 'Video upload - hate speech detected',
      aiScore: 85,
      risks: ['hateSpeech', 'toxicity'],
      flaggedAt: new Date(Date.now() - 5 * 60000),
      status: 'pending',
      aiConfidence: 0.92
    },
    {
      id: 2,
      user: 'Creator456',
      content: 'Chat message - harassment pattern',
      aiScore: 72,
      risks: ['harassment'],
      flaggedAt: new Date(Date.now() - 15 * 60000),
      status: 'pending',
      aiConfidence: 0.88
    },
    {
      id: 3,
      user: 'User789',
      content: 'Stream - NSFW content detected',
      aiScore: 65,
      risks: ['nsfw'],
      flaggedAt: new Date(Date.now() - 30 * 60000),
      status: 'pending',
      aiConfidence: 0.76
    }
  ]);

  const handleModeratorDecision = (flagId, decision) => {
    let message = '';
    let action = '';

    if (decision === 'ban') {
      message = 'User will be BANNED';
      action = 'approve_ban';
    } else if (decision === 'warn') {
      message = 'User will be WARNED';
      action = 'approve_warning';
    } else if (decision === 'dismiss') {
      message = 'Flag is FALSE POSITIVE (AI will learn from this)';
      action = 'false_positive';
    }

    Alert.alert(
      'Confirm Decision',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: decision === 'dismiss' ? 'default' : 'destructive',
          onPress: () => {
            setAiFlags(aiFlags.map(f => f.id === flagId ? { ...f, status: 'reviewed' } : f));
            Alert.alert('✓ Recorded', `Moderator decision: ${action}\nAI will learn from human reviews`);
          }
        }
      ]
    );
  };

  const renderAIFlag = ({ item }) => (
    <View style={styles.flagCard}>
      {/* AI Detected Badge */}
      <View style={styles.aiHeader}>
        <Text style={styles.aiDetected}>🤖 AI DETECTED</Text>
        <View style={styles.confidenceBox}>
          <Text style={styles.confidenceText}>{Math.round(item.aiConfidence * 100)}% confident</Text>
        </View>
      </View>

      {/* Risk Score */}
      <View style={styles.riskBar}>
        <View style={[styles.riskFill, { width: `${item.aiScore}%` }]} />
      </View>
      <Text style={styles.riskScore}>Risk Score: {item.aiScore}/100</Text>

      {/* Content Info */}
      <Text style={styles.flagUser}>
        <Text style={styles.label}>User:</Text> {item.user}
      </Text>
      <Text style={styles.flagContent}>
        <Text style={styles.label}>Content:</Text> {item.content}
      </Text>

      {/* Risks Detected */}
      <View style={styles.risksContainer}>
        {item.risks.map((risk, idx) => (
          <View key={idx} style={styles.riskTag}>
            <Text style={styles.riskTagText}>{risk}</Text>
          </View>
        ))}
      </View>

      {/* HUMAN DECISION REQUIRED */}
      {item.status === 'pending' && (
        <View style={styles.decisionSection}>
          <Text style={styles.decisionTitle}>⚠️ REQUIRES HUMAN DECISION</Text>
          
          <View style={styles.decisionButtons}>
            <TouchableOpacity
              style={styles.banBtn}
              onPress={() => handleModeratorDecision(item.id, 'ban')}
            >
              <Text style={styles.btnText}>🚫 BAN USER</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.warnBtn}
              onPress={() => handleModeratorDecision(item.id, 'warn')}
            >
              <Text style={styles.btnText}>⚠️ WARN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dismissBtn}
              onPress={() => handleModeratorDecision(item.id, 'dismiss')}
            >
              <Text style={styles.dismissBtnText}>✓ FALSE POSITIVE</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
        <Text style={styles.headerTitle}>MODERATOR PANEL</Text>
        <Text style={styles.headerSubtitle}>AI Detects • Human Decides</Text>
      </LinearGradient>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ai_flags' && styles.activeTab]}
          onPress={() => setActiveTab('ai_flags')}
        >
          <Text style={[styles.tabText, activeTab === 'ai_flags' && styles.activeTabText]}>
            🤖 AI Flags ({aiFlags.filter(f => f.status === 'pending').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviewed' && styles.activeTab]}
          onPress={() => setActiveTab('reviewed')}
        >
          <Text style={[styles.tabText, activeTab === 'reviewed' && styles.activeTabText]}>
            ✓ Reviewed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
            📊 Stats
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'ai_flags' && (
          <FlatList
            scrollEnabled={false}
            data={aiFlags.filter(f => f.status === 'pending')}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderAIFlag}
          />
        )}

        {activeTab === 'stats' && (
          <View style={styles.statsBox}>
            <Text style={styles.statsTitle}>📊 AI & MODERATION STATS</Text>
            <Text style={styles.statLine}>🤖 Total AI Flags: 1,247</Text>
            <Text style={styles.statLine}>✓ Approved Bans: 423</Text>
            <Text style={styles.statLine}>⚠️ Approved Warnings: 512</Text>
            <Text style={styles.statLine}>😊 False Positives: 156 (AI learning...)</Text>
            <Text style={styles.statLine}>⏱️ Avg Review Time: 8 minutes</Text>
            <Text style={styles.statLine}>👥 Active Moderators: 12</Text>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NYXSCREAM.void },
  header: { paddingVertical: 20, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: NYXSCREAM.electric },
  headerTitle: { fontSize: 24, fontWeight: '900', color: NYXSCREAM.ghost, letterSpacing: 2 },
  headerSubtitle: { fontSize: 12, color: NYXSCREAM.electric, marginTop: 5 },
  tabs: { flexDirection: 'row', backgroundColor: NYXSCREAM.shadow, borderBottomWidth: 1, borderBottomColor: NYXSCREAM.nyx },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: NYXSCREAM.electric },
  tabText: { color: NYXSCREAM.mist, fontWeight: '700', fontSize: 11 },
  activeTabText: { color: NYXSCREAM.electric },
  content: { flex: 1, padding: 15 },
  flagCard: { backgroundColor: NYXSCREAM.shadow, borderWidth: 2, borderColor: NYXSCREAM.electric, borderRadius: 8, padding: 15, marginBottom: 15 },
  aiHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  aiDetected: { color: NYXSCREAM.electric, fontWeight: '900', fontSize: 13 },
  confidenceBox: { backgroundColor: 'rgba(0, 240, 255, 0.2)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 4 },
  confidenceText: { color: NYXSCREAM.electric, fontSize: 11, fontWeight: '700' },
  riskBar: { height: 8, backgroundColor: NYXSCREAM.void, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  riskFill: { height: '100%', backgroundColor: NYXSCREAM.scream },
  riskScore: { color: NYXSCREAM.electric, fontWeight: '700', fontSize: 12, marginBottom: 12 },
  flagUser: { color: NYXSCREAM.mist, fontSize: 12, marginBottom: 6 },
  flagContent: { color: NYXSCREAM.mist, fontSize: 12, marginBottom: 12 },
  label: { color: NYXSCREAM.ghost, fontWeight: '700' },
  risksContainer: { flexDirection: 'row', gap: 8, marginBottom: 15, flexWrap: 'wrap' },
  riskTag: { backgroundColor: NYXSCREAM.scream, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4 },
  riskTagText: { color: NYXSCREAM.void, fontWeight: '700', fontSize: 11 },
  decisionSection: { borderTopWidth: 1, borderTopColor: NYXSCREAM.nyx, paddingTop: 12 },
  decisionTitle: { color: NYXSCREAM.scream, fontWeight: '900', marginBottom: 12, fontSize: 12 },
  decisionButtons: { flexDirection: 'row', gap: 8 },
  banBtn: { flex: 1, backgroundColor: NYXSCREAM.scream, paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  warnBtn: { flex: 1, backgroundColor: '#FFD700', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  dismissBtn: { flex: 1, backgroundColor: NYXSCREAM.void, borderWidth: 1, borderColor: '#00FF00', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  btnText: { color: NYXSCREAM.void, fontWeight: '900', fontSize: 11 },
  dismissBtnText: { color: '#00FF00', fontWeight: '700', fontSize: 11 },
  statsBox: { backgroundColor: NYXSCREAM.shadow, borderWidth: 1, borderColor: NYXSCREAM.nyx, borderRadius: 8, padding: 15 },
  statsTitle: { color: NYXSCREAM.ghost, fontWeight: '900', fontSize: 14, marginBottom: 12 },
  statLine: { color: NYXSCREAM.electric, fontSize: 13, fontWeight: '700', marginBottom: 8 }
});
