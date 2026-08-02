import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  LinearProgress
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getCreatorTick, requestVerification, checkVerificationEligibility, TICK_LEVELS } from '../services/CreatorVerificationService';

const NYXSCREAM = {
  void: '#0D0221',
  shadow: '#1A0A2E',
  scream: '#FF003C',
  nyx: '#9D00FF',
  electric: '#00F0FF',
  ghost: '#E0E0E0',
  mist: '#6B6B6B'
};

export default function VerificationScreen({ route, navigation }) {
  const { userId, creatorStats } = route.params || {};
  const [currentTick, setCurrentTick] = useState(TICK_LEVELS.GRAY);
  const [loading, setLoading] = useState(true);
  const [eligibility, setEligibility] = useState(null);

  useEffect(() => {
    loadVerificationData();
  }, []);

  const loadVerificationData = async () => {
    setLoading(true);
    const tick = await getCreatorTick(userId);
    setCurrentTick(tick);

    const nextTick = getNextTick(tick.level);
    if (nextTick) {
      const elig = checkVerificationEligibility(creatorStats, nextTick);
      setEligibility(elig);
    }
    setLoading(false);
  };

  const getNextTick = (currentLevel) => {
    const ticks = ['BLUE', 'YELLOW', 'GOLDEN'];
    if (currentLevel < 3) {
      return ticks[currentLevel];
    }
    return null;
  };

  const handleApplyForVerification = () => {
    if (eligibility?.eligible) {
      Alert.prompt(
        'Apply for Verification',
        'Tell us why you deserve this tick',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Apply',
            onPress: async (reason) => {
              setLoading(true);
              const result = await requestVerification(userId, {
                name: 'Creator Name',
                description: reason,
                ...creatorStats
              });

              if (result.success) {
                Alert.alert('Success', 'Application submitted! Our team will review it.');
              } else {
                Alert.alert('Error', result.error);
              }
              setLoading(false);
            }
          }
        ]
      );
    } else {
      const missing = eligibility?.reasons || [];
      Alert.alert('Not Eligible Yet', missing.join('\n\n'));
    }
  };

  const renderTickCard = (tickLevel, isCurrent) => (
    <View style={[styles.tickCard, isCurrent && styles.tickCardActive]}>
      <Text style={styles.tickIcon}>{tickLevel.icon}</Text>
      <Text style={styles.tickName}>{tickLevel.name}</Text>
      <Text style={styles.tickLevel}>Level {tickLevel.level}</Text>
      
      <View style={styles.featuresList}>
        {tickLevel.features.slice(0, 3).map((feature, idx) => (
          <Text key={idx} style={styles.featureText}>✓ {feature.replace(/_/g, ' ')}</Text>
        ))}
        {tickLevel.features.length > 3 && (
          <Text style={styles.moreFeatures}>+{tickLevel.features.length - 3} more</Text>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={NYXSCREAM.electric} />
          <Text style={{ color: NYXSCREAM.ghost, marginTop: 15 }}>Loading verification...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
        <Text style={styles.headerTitle}>CREATOR VERIFICATION</Text>
        <Text style={styles.headerSubtitle}>Earn your tick mark</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.currentTickSection}>
          <Text style={styles.sectionTitle}>YOUR CURRENT TICK</Text>
          {renderTickCard(currentTick, true)}
        </View>

        {eligibility && getNextTick(currentTick.level) && (
          <View style={styles.nextTickSection}>
            <Text style={styles.sectionTitle}>NEXT TIER: {TICK_LEVELS[getNextTick(currentTick.level)].name}</Text>
            
            {eligibility.reasons.length > 0 ? (
              <View style={styles.requirementsBox}>
                <Text style={styles.requirementsTitle}>Requirements Not Met:</Text>
                {eligibility.reasons.map((reason, idx) => (
                  <Text key={idx} style={styles.requirementItem}>❌ {reason}</Text>
                ))}
              </View>
            ) : (
              <View style={styles.requirementsBox}>
                <Text style={styles.requirementsTitle}>✓ You're Eligible!</Text>
                <TouchableOpacity style={styles.applyButton} onPress={handleApplyForVerification}>
                  <Text style={styles.applyButtonText}>APPLY NOW</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View style={styles.allTicksSection}>
          <Text style={styles.sectionTitle}>ALL TIERS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {Object.values(TICK_LEVELS).map((tick, idx) => (
              <View key={idx} style={{ marginRight: 10 }}>
                {renderTickCard(tick, tick.level === currentTick.level)}
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 How Ticks Work</Text>
          <Text style={styles.infoText}>
            Higher ticks unlock more features and show credibility to your audience. Meet requirements and apply for your verification!
          </Text>
        </View>

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
  content: { flex: 1, padding: 20 },
  sectionTitle: { color: NYXSCREAM.ghost, fontSize: 14, fontWeight: '900', letterSpacing: 2, marginBottom: 15 },
  currentTickSection: { marginBottom: 25 },
  nextTickSection: { marginBottom: 25 },
  tickCard: { backgroundColor: NYXSCREAM.shadow, borderWidth: 1, borderColor: NYXSCREAM.nyx, borderRadius: 8, padding: 15, alignItems: 'center' },
  tickCardActive: { borderColor: NYXSCREAM.electric, backgroundColor: 'rgba(0, 240, 255, 0.1)' },
  tickIcon: { fontSize: 40, marginBottom: 10 },
  tickName: { color: NYXSCREAM.ghost, fontWeight: '900', fontSize: 16, marginBottom: 4 },
  tickLevel: { color: NYXSCREAM.mist, fontSize: 12, marginBottom: 12 },
  featuresList: { marginTop: 10 },
  featureText: { color: NYXSCREAM.electric, fontSize: 11, marginBottom: 6 },
  moreFeatures: { color: NYXSCREAM.mist, fontSize: 10, fontStyle: 'italic' },
  requirementsBox: { backgroundColor: NYXSCREAM.shadow, borderWidth: 1, borderColor: NYXSCREAM.nyx, borderRadius: 8, padding: 15 },
  requirementsTitle: { color: NYXSCREAM.ghost, fontWeight: '900', marginBottom: 10 },
  requirementItem: { color: NYXSCREAM.mist, fontSize: 12, marginBottom: 6 },
  applyButton: { backgroundColor: NYXSCREAM.scream, paddingVertical: 12, borderRadius: 6, alignItems: 'center', marginTop: 15 },
  applyButtonText: { color: NYXSCREAM.void, fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  allTicksSection: { marginBottom: 25 },
  horizontalScroll: { marginBottom: 15 },
  infoBox: { backgroundColor: 'rgba(157, 0, 255, 0.1)', borderWidth: 1, borderColor: NYXSCREAM.nyx, borderRadius: 8, padding: 15 },
  infoTitle: { color: NYXSCREAM.ghost, fontWeight: '900', marginBottom: 8 },
  infoText: { color: NYXSCREAM.mist, fontSize: 12, lineHeight: 18 }
});
