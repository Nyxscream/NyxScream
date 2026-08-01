// Philanthropy Dashboard Screen - Master Only (Real-time Impact Tracking)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPhilanthropyMetrics, getPhilanthropyTransactions, getImpactReport, recordAllocation, getTimePeriodTotals, getTopContributors } from '../services/PhilanthropyService';

const NYXSCREAM = {
  void: '#0D0221',
  shadow: '#1A0A2E',
  scream: '#FF003C',
  nyx: '#9D00FF',
  electric: '#00F0FF',
  ghost: '#E0E0E0',
  mist: '#6B6B6B'
};

export default function PhilanthropyDashboardScreen() {
  const [metrics, setMetrics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [impactReport, setImpactReport] = useState(null);
  const [topContributors, setTopContributors] = useState([]);
  const [timePeriods, setTimePeriods] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allocationModalVisible, setAllocationModalVisible] = useState(false);
  const [allocationCategory, setAllocationCategory] = useState('motherlessBabies');
  const [allocationAmount, setAllocationAmount] = useState('');
  const [allocationDescription, setAllocationDescription] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [metricsData, transactionData, reportData, contributorsData, periodData] = await Promise.all([
        getPhilanthropyMetrics(),
        getPhilanthropyTransactions(20),
        getImpactReport(),
        getTopContributors(5),
        getTimePeriodTotals()
      ]);

      setMetrics(metricsData);
      setTransactions(transactionData);
      setImpactReport(reportData);
      setTopContributors(contributorsData);
      setTimePeriods(periodData);
      setLoading(false);
    } catch (error) {
      console.error('◉ Dashboard load failed:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleAllocate = async () => {
    if (!allocationAmount || isNaN(allocationAmount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const result = await recordAllocation(
        allocationCategory,
        parseFloat(allocationAmount),
        allocationDescription
      );

      if (result.status === 'success') {
        Alert.alert('Success', result.message);
        setAllocationModalVisible(false);
        setAllocationAmount('');
        setAllocationDescription('');
        loadDashboardData();
      }
    } catch (error) {
      Alert.alert('Error', 'Allocation failed: ' + error.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={NYXSCREAM.scream} />
          <Text style={styles.loadingText}>Loading Impact Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
        <Text style={styles.headerTitle}>PHILANTHROPY LEDGER</Text>
        <Text style={styles.headerSubtitle}>lessPrivileges Impact Tracking</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NYXSCREAM.scream} />}
      >
        {/* Total Donated Card */}
        <View style={styles.heroCard}>
          <LinearGradient colors={[NYXSCREAM.scream, NYXSCREAM.nyx]} style={styles.heroGradient}>
            <Text style={styles.heroLabel}>TOTAL RAISED FOR lessPrivileges</Text>
            <Text style={styles.heroAmount}>${metrics?.totalDonated?.toLocaleString() || '0'}</Text>
            <Text style={styles.heroSubtext}>through {metrics?.totalTransactions || 0} tributes from our shadows</Text>
          </LinearGradient>
        </View>

        {/* Time Period Stats */}
        {timePeriods && (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>THIS WEEK</Text>
              <Text style={styles.statValue}>${timePeriods.weeklyTotal.toLocaleString()}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>THIS MONTH</Text>
              <Text style={styles.statValue}>${timePeriods.monthlyTotal.toLocaleString()}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>DAILY AVG</Text>
              <Text style={styles.statValue}>${timePeriods.dailyAverage.toLocaleString()}</Text>
            </View>
          </View>
        )}

        {/* Impact Message */}
        {impactReport && (
          <View style={styles.impactCard}>
            <Text style={styles.impactIcon}>{impactReport.impactSummary.icon}</Text>
            <Text style={styles.impactMessage}>{impactReport.impactSummary.message}</Text>
          </View>
        )}

        {/* Allocation Button */}
        <TouchableOpacity
          style={styles.allocateButton}
          onPress={() => setAllocationModalVisible(true)}
        >
          <Text style={styles.allocateButtonText}>◉ ALLOCATE FUNDS TO CAUSES</Text>
        </TouchableOpacity>

        {/* Top Contributors */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 TOP CONTRIBUTORS</Text>
          <FlatList
            scrollEnabled={false}
            data={topContributors}
            keyExtractor={(item) => item.donorId}
            renderItem={({ item, index }) => (
              <View style={styles.contributorCard}>
                <View style={styles.contributorRank}>
                  <Text style={styles.rankNumber}>#{index + 1}</Text>
                </View>
                <View style={styles.contributorInfo}>
                  <Text style={styles.contributorId}>{item.donorId.substring(0, 20)}...</Text>
                  <Text style={styles.contributorStats}>{item.tributeCount} tributes</Text>
                </View>
                <Text style={styles.contributorAmount}>${item.totalContributed.toLocaleString()}</Text>
              </View>
            )}
          />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 RECENT TRIBUTES</Text>
          <FlatList
            scrollEnabled={false}
            data={transactions.slice(0, 10)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <Text style={styles.transactionType}>Tribute</Text>
                  <Text style={styles.transactionDate}>{item.date}</Text>
                </View>
                <Text style={styles.transactionAmount}>${item.amount.toLocaleString()}</Text>
              </View>
            )}
          />
        </View>

        {/* Allocation Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 ALLOCATION CATEGORIES</Text>
          <View style={styles.allocationGrid}>
            <View style={styles.allocationItem}>
              <Text style={styles.allocationIcon}>👶</Text>
              <Text style={styles.allocationName}>Motherless Babies</Text>
              <Text style={styles.allocationPercent}>% allocated</Text>
            </View>
            <View style={styles.allocationItem}>
              <Text style={styles.allocationIcon}>📚</Text>
              <Text style={styles.allocationName}>Education</Text>
              <Text style={styles.allocationPercent}>% allocated</Text>
            </View>
            <View style={styles.allocationItem}>
              <Text style={styles.allocationIcon}>🏥</Text>
              <Text style={styles.allocationName}>Healthcare</Text>
              <Text style={styles.allocationPercent}>% allocated</Text>
            </View>
            <View style={styles.allocationItem}>
              <Text style={styles.allocationIcon}>🏘️</Text>
              <Text style={styles.allocationName}>Community</Text>
              <Text style={styles.allocationPercent}>% allocated</Text>
            </View>
            <View style={styles.allocationItem}>
              <Text style={styles.allocationIcon}>🍲</Text>
              <Text style={styles.allocationName}>Food Security</Text>
              <Text style={styles.allocationPercent}>% allocated</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Allocation Modal */}
      <Modal
        visible={allocationModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAllocationModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.modalHeader}>
            <Text style={styles.modalTitle}>ALLOCATE FUNDS</Text>
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Select Category</Text>
            <View style={styles.categorySelector}>
              {[
                { id: 'motherlessBabies', name: '👶 Motherless Babies' },
                { id: 'education', name: '📚 Education' },
                { id: 'healthcare', name: '🏥 Healthcare' },
                { id: 'communityWelfare', name: '🏘️ Community Welfare' },
                { id: 'foodSecurity', name: '🍲 Food Security' }
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    allocationCategory === cat.id && styles.categoryOptionSelected
                  ]}
                  onPress={() => setAllocationCategory(cat.id)}
                >
                  <Text style={styles.categoryOptionText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Amount (USD)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor={NYXSCREAM.mist}
              keyboardType="decimal-pad"
              value={allocationAmount}
              onChangeText={setAllocationAmount}
            />

            <Text style={styles.modalLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Why this allocation?"
              placeholderTextColor={NYXSCREAM.mist}
              multiline
              numberOfLines={4}
              value={allocationDescription}
              onChangeText={setAllocationDescription}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleAllocate}>
              <Text style={styles.submitButtonText}>ALLOCATE NOW</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setAllocationModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
          </ScrollView>
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
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: NYXSCREAM.scream
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: NYXSCREAM.scream,
    letterSpacing: 2
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
  heroCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: NYXSCREAM.scream,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  heroGradient: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  heroLabel: {
    color: NYXSCREAM.ghost,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10
  },
  heroAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: NYXSCREAM.ghost,
    marginBottom: 10
  },
  heroSubtext: {
    color: NYXSCREAM.ghost,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10
  },
  statCard: {
    flex: 1,
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center'
  },
  statLabel: {
    color: NYXSCREAM.mist,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8
  },
  statValue: {
    color: NYXSCREAM.electric,
    fontSize: 18,
    fontWeight: '900'
  },
  impactCard: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 2,
    borderColor: NYXSCREAM.scream,
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginBottom: 20
  },
  impactIcon: {
    fontSize: 40,
    marginBottom: 10
  },
  impactMessage: {
    color: NYXSCREAM.ghost,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22
  },
  allocateButton: {
    backgroundColor: NYXSCREAM.nyx,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: NYXSCREAM.nyx,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  allocateButtonText: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1
  },
  section: {
    marginBottom: 25
  },
  sectionTitle: {
    color: NYXSCREAM.ghost,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 15
  },
  contributorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.fog,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10
  },
  contributorRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: NYXSCREAM.scream,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  rankNumber: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 14
  },
  contributorInfo: {
    flex: 1
  },
  contributorId: {
    color: NYXSCREAM.ghost,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 4
  },
  contributorStats: {
    color: NYXSCREAM.mist,
    fontSize: 11
  },
  contributorAmount: {
    color: NYXSCREAM.electric,
    fontWeight: '900',
    fontSize: 12
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: NYXSCREAM.shadow,
    borderLeftWidth: 3,
    borderLeftColor: NYXSCREAM.scream,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
    borderRadius: 4
  },
  transactionLeft: {
    flex: 1
  },
  transactionType: {
    color: NYXSCREAM.ghost,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 3
  },
  transactionDate: {
    color: NYXSCREAM.mist,
    fontSize: 11
  },
  transactionAmount: {
    color: NYXSCREAM.scream,
    fontWeight: '900',
    fontSize: 13
  },
  allocationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  allocationItem: {
    width: '48%',
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 12
  },
  allocationIcon: {
    fontSize: 28,
    marginBottom: 8
  },
  allocationName: {
    color: NYXSCREAM.ghost,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 5
  },
  allocationPercent: {
    color: NYXSCREAM.electric,
    fontSize: 12,
    fontWeight: '900'
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
  modalContent: {
    flex: 1,
    padding: 20
  },
  modalLabel: {
    color: NYXSCREAM.ghost,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 15
  },
  categorySelector: {
    marginBottom: 20
  },
  categoryOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.fog,
    borderRadius: 6,
    marginBottom: 8
  },
  categoryOptionSelected: {
    borderColor: NYXSCREAM.scream,
    backgroundColor: 'rgba(255, 0, 60, 0.1)'
  },
  categoryOptionText: {
    color: NYXSCREAM.ghost,
    fontWeight: '600',
    fontSize: 14
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
  submitButton: {
    backgroundColor: NYXSCREAM.scream,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10
  },
  submitButtonText: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: NYXSCREAM.mist,
    alignItems: 'center',
    marginBottom: 30
  },
  cancelButtonText: {
    color: NYXSCREAM.mist,
    fontWeight: '700',
    fontSize: 14
  }
});