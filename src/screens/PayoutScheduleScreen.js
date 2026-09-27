// COMPLETE FILE - PayoutScheduleScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db, auth } from '../services/Firebase';
import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

const NYXSCREAM = {
  void: '#0D0221',
  shadow: '#1A0A2E',
  scream: '#FF003C',
  nyx: '#9D00FF',
  electric: '#00F0FF',
  ghost: '#E0E0E0',
  mist: '#6B6B6B'
};

export default function PayoutScheduleScreen({ navigation }) {
  const [payoutData, setPayoutData] = useState({
    nextPayoutDate: null,
    payoutFrequency: 'monthly',
    minimumThreshold: 25,
    bankAccount: {
      accountHolderName: '',
      accountNumber: '••••••••1234',
      routingNumber: '•••••••',
      bankName: ''
    },
    taxInfo: {
      ssn: '•••••••89',
      w9Filed: false
    }
  });

  const [payoutHistory, setPayoutHistory] = useState([]);
  const [currentEarnings, setCurrentEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [editingBank, setEditingBank] = useState(false);

  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    routingNumber: '',
    bankName: ''
  });

  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    // Load payout settings
    const loadPayoutData = async () => {
      try {
        const creatorDoc = await getDoc(doc(db, 'creators', userId));
        if (creatorDoc.exists()) {
          const data = creatorDoc.data();
          setPayoutData(prev => ({
            ...prev,
            payoutFrequency: data.payoutFrequency || 'monthly',
            minimumThreshold: data.minimumThreshold || 25,
            nextPayoutDate: data.nextPayoutDate,
            bankAccount: data.bankAccount || prev.bankAccount,
            taxInfo: data.taxInfo || prev.taxInfo
          }));
        }
      } catch (error) {
        console.error('Error loading payout data:', error);
      }
    };

    // Subscribe to payout history
    const historyQuery = query(
      collection(db, 'payouts'),
      where('creatorId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      historyQuery,
      (snapshot) => {
        const history = [];
        snapshot.forEach((doc) => {
          history.push({
            id: doc.id,
            ...doc.data()
          });
        });
        history.sort((a, b) => b.date - a.date);
        setPayoutHistory(history);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching payout history:', error);
        setLoading(false);
      }
    );

    loadPayoutData();
    calculateCurrentEarnings();

    return unsubscribe;
  }, [userId]);

  const calculateCurrentEarnings = async () => {
    if (!userId) return;

    try {
      const subscriptionsQuery = query(
        collection(db, 'subscriptions'),
        where('creatorId', '==', userId),
        where('status', '==', 'active')
      );

      onSnapshot(subscriptionsQuery, (snapshot) => {
        let total = 0;
        snapshot.forEach((doc) => {
          const sub = doc.data();
          if (sub.tier === 'shadow') total += 7.99;
          if (sub.tier === 'abyss') total += 13.59;
        });
        setCurrentEarnings(total);
      });
    } catch (error) {
      console.error('Error calculating earnings:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Pending';
    const date = new Date(timestamp.toDate ? timestamp.toDate() : timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getPayoutStatus = (status) => {
    switch(status) {
      case 'completed': return { color: NYXSCREAM.electric, text: '✓ COMPLETED' };
      case 'processing': return { color: NYXSCREAM.nyx, text: '⟳ PROCESSING' };
      case 'pending': return { color: NYXSCREAM.mist, text: '◉ PENDING' };
      case 'failed': return { color: NYXSCREAM.scream, text: '✕ FAILED' };
      default: return { color: NYXSCREAM.mist, text: 'UNKNOWN' };
    }
  };

  const handleBankUpdate = async () => {
    if (!bankForm.accountHolderName || !bankForm.accountNumber || !bankForm.routingNumber || !bankForm.bankName) {
      Alert.alert('Missing Info', 'Please fill all bank account details');
      return;
    }

    try {
      await updateDoc(doc(db, 'creators', userId), {
        bankAccount: {
          accountHolderName: bankForm.accountHolderName,
          accountNumber: bankForm.accountNumber,
          routingNumber: bankForm.routingNumber,
          bankName: bankForm.bankName
        }
      });

      setPayoutData(prev => ({
        ...prev,
        bankAccount: bankForm
      }));

      setBankModalVisible(false);
      Alert.alert('Success', 'Bank account updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update bank account');
      console.error('Error updating bank account:', error);
    }
  };

  const PayoutHistoryCard = ({ payout }) => {
    const status = getPayoutStatus(payout.status);
    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View>
            <Text style={styles.historyAmount}>${payout.amount.toFixed(2)}</Text>
            <Text style={styles.historyDate}>{formatDate(payout.date)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.text}</Text>
          </View>
        </View>

        <View style={styles.historyDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Period</Text>
            <Text style={styles.detailValue}>{payout.period}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Subscribers</Text>
            <Text style={styles.detailValue}>{payout.subscriberCount}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account</Text>
            <Text style={styles.detailValue}>••••{payout.bankAccount?.slice(-4)}</Text>
          </View>
        </View>

        {payout.status === 'failed' && (
          <View style={styles.failureReason}>
            <Text style={styles.failureText}>Reason: {payout.failureReason}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
          <Text style={styles.headerTitle}>PAYOUT SCHEDULE</Text>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={NYXSCREAM.electric} />
          <Text style={styles.loadingText}>Loading payout info...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
        <Text style={styles.headerTitle}>PAYOUT SCHEDULE</Text>
        <Text style={styles.headerSubtitle}>Manage your payouts & bank account</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NYXSCREAM.electric} />
        }
      >
        {/* Current Earnings Card */}
        <View style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>Current Month Earnings</Text>
          <Text style={styles.earningsAmount}>${currentEarnings.toFixed(2)}</Text>
          
          {currentEarnings >= payoutData.minimumThreshold ? (
            <View style={styles.readyBadge}>
              <Text style={styles.readyText}>✓ Ready for payout</Text>
            </View>
          ) : (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>
                Need ${(payoutData.minimumThreshold - currentEarnings).toFixed(2)} more
              </Text>
            </View>
          )}
        </View>

        {/* Payout Settings Card */}
        <View style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Payout Settings</Text>
          
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Payout Frequency</Text>
              <Text style={styles.settingValue}>{payoutData.payoutFrequency === 'monthly' ? 'Monthly' : 'Weekly'}</Text>
            </View>
            <Text style={styles.settingBadge}>Every {payoutData.payoutFrequency === 'monthly' ? '1st' : 'Monday'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Minimum Payout Threshold</Text>
              <Text style={styles.settingValue}>${payoutData.minimumThreshold}</Text>
            </View>
            <Text style={styles.settingBadge}>Auto-hold if lower</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Next Payout Date</Text>
              <Text style={styles.settingValue}>{formatDate(payoutData.nextPayoutDate)}</Text>
            </View>
            <Text style={styles.settingBadge}>Estimated</Text>
          </View>
        </View>

        {/* Bank Account Card */}
        <View style={styles.bankCard}>
          <View style={styles.bankHeader}>
            <Text style={styles.cardTitle}>Bank Account</Text>
            <TouchableOpacity
              onPress={() => {
                setEditingBank(true);
                setBankForm({
                  accountHolderName: payoutData.bankAccount.accountHolderName,
                  accountNumber: '',
                  routingNumber: '',
                  bankName: payoutData.bankAccount.bankName
                });
                setBankModalVisible(true);
              }}
            >
              <Text style={styles.editButton}>EDIT</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bankInfo}>
            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Account Holder</Text>
              <Text style={styles.bankValue}>{payoutData.bankAccount.accountHolderName || 'Not set'}</Text>
            </View>

            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Bank</Text>
              <Text style={styles.bankValue}>{payoutData.bankAccount.bankName || 'Not set'}</Text>
            </View>

            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Account Number</Text>
              <Text style={styles.bankValue}>{payoutData.bankAccount.accountNumber}</Text>
            </View>

            <View style={styles.bankRow}>
              <Text style={styles.bankLabel}>Routing Number</Text>
              <Text style={styles.bankValue}>{payoutData.bankAccount.routingNumber}</Text>
            </View>
          </View>
        </View>

        {/* Tax Info Card */}
        <View style={styles.taxCard}>
          <Text style={styles.cardTitle}>Tax Information</Text>
          
          <View style={styles.taxRow}>
            <View>
              <Text style={styles.taxLabel}>SSN on File</Text>
              <Text style={styles.taxValue}>{payoutData.taxInfo.ssn}</Text>
            </View>
            <View style={[styles.taxStatus, payoutData.taxInfo.w9Filed && styles.taxStatusGood]}>
              <Text style={styles.taxStatusText}>
                {payoutData.taxInfo.w9Filed ? '✓ W9 Filed' : '◉ Pending'}
              </Text>
            </View>
          </View>

          <Text style={styles.taxNote}>
            {payoutData.taxInfo.w9Filed 
              ? 'Your W-9 form is on file and verified' 
              : 'A W-9 form is required before payouts can be processed'}
          </Text>
        </View>

        {/* Payout History */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Payout History</Text>
          
          {payoutHistory.length > 0 ? (
            <FlatList
              scrollEnabled={false}
              data={payoutHistory}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <PayoutHistoryCard payout={item} />}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No payout history yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bank Account Modal */}
      <Modal
        visible={bankModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setBankModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Bank Account</Text>
              <TouchableOpacity onPress={() => setBankModalVisible(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Account Holder Name"
              placeholderTextColor={NYXSCREAM.mist}
              value={bankForm.accountHolderName}
              onChangeText={(text) => setBankForm({ ...bankForm, accountHolderName: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Account Number"
              placeholderTextColor={NYXSCREAM.mist}
              value={bankForm.accountNumber}
              onChangeText={(text) => setBankForm({ ...bankForm, accountNumber: text })}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Routing Number"
              placeholderTextColor={NYXSCREAM.mist}
              value={bankForm.routingNumber}
              onChangeText={(text) => setBankForm({ ...bankForm, routingNumber: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Bank Name"
              placeholderTextColor={NYXSCREAM.mist}
              value={bankForm.bankName}
              onChangeText={(text) => setBankForm({ ...bankForm, bankName: text })}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleBankUpdate}>
              <Text style={styles.submitButtonText}>UPDATE BANK ACCOUNT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  earningsCard: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.electric,
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center'
  },
  earningsLabel: {
    color: NYXSCREAM.mist,
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 1
  },
  earningsAmount: {
    color: NYXSCREAM.electric,
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 12
  },
  readyBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4
  },
  readyText: {
    color: NYXSCREAM.electric,
    fontSize: 12,
    fontWeight: '700'
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 0, 60, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4
  },
  pendingText: {
    color: NYXSCREAM.scream,
    fontSize: 12,
    fontWeight: '700'
  },
  settingsCard: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  cardTitle: {
    color: NYXSCREAM.ghost,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10
  },
  settingLabel: {
    color: NYXSCREAM.mist,
    fontSize: 12,
    marginBottom: 4
  },
  settingValue: {
    color: NYXSCREAM.ghost,
    fontSize: 14,
    fontWeight: '700'
  },
  settingBadge: {
    color: NYXSCREAM.electric,
    fontSize: 11,
    fontWeight: '700',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3
  },
  divider: {
    height: 1,
    backgroundColor: NYXSCREAM.nyx,
    marginVertical: 8
  },
  bankCard: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.electric,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  editButton: {
    color: NYXSCREAM.scream,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1
  },
  bankInfo: {
    backgroundColor: NYXSCREAM.void,
    borderRadius: 6,
    padding: 12
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  bankLabel: {
    color: NYXSCREAM.mist,
    fontSize: 12
  },
  bankValue: {
    color: NYXSCREAM.ghost,
    fontSize: 12,
    fontWeight: '700'
  },
  taxCard: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: NYXSCREAM.nyx
  },
  taxLabel: {
    color: NYXSCREAM.mist,
    fontSize: 12,
    marginBottom: 4
  },
  taxValue: {
    color: NYXSCREAM.ghost,
    fontSize: 14,
    fontWeight: '700'
  },
  taxStatus: {
    backgroundColor: 'rgba(255, 0, 60, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4
  },
  taxStatusGood: {
    backgroundColor: 'rgba(0, 240, 255, 0.2)'
  },
  taxStatusText: {
    color: NYXSCREAM.scream,
    fontSize: 11,
    fontWeight: '700'
  },
  taxNote: {
    color: NYXSCREAM.mist,
    fontSize: 11,
    lineHeight: 16
  },
  historySection: {
    marginBottom: 24
  },
  historyTitle: {
    color: NYXSCREAM.ghost,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 1
  },
  historyCard: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  historyAmount: {
    color: NYXSCREAM.ghost,
    fontSize: 18,
    fontWeight: '900'
  },
  historyDate: {
    color: NYXSCREAM.mist,
    fontSize: 11,
    marginTop: 4
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3
  },
  statusText: {
    color: NYXSCREAM.void,
    fontSize: 10,
    fontWeight: '700'
  },
  historyDetails: {
    backgroundColor: NYXSCREAM.void,
    borderRadius: 6,
    padding: 10,
    marginBottom: 10
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  detailLabel: {
    color: NYXSCREAM.mist,
    fontSize: 11
  },
  detailValue: {
    color: NYXSCREAM.ghost,
    fontSize: 11,
    fontWeight: '700'
  },
  failureReason: {
    backgroundColor: 'rgba(255, 0, 60, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: NYXSCREAM.scream,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 4
  },
  failureText: {
    color: NYXSCREAM.scream,
    fontSize: 11
  },
  separator: {
    height: 8
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30
  },
  emptyStateText: {
    color: NYXSCREAM.mist,
    fontSize: 14
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: NYXSCREAM.shadow,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: NYXSCREAM.nyx,
    paddingBottom: 12
  },
  modalTitle: {
    color: NYXSCREAM.ghost,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1
  },
  modalCloseButton: {
    color: NYXSCREAM.scream,
    fontSize: 20,
    fontWeight: '700'
  },
  input: {
    backgroundColor: NYXSCREAM.void,
    borderWidth: 1,
    borderColor: NYXSCREAM.electric,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: NYXSCREAM.ghost,
    marginBottom: 12,
    fontSize: 14
  },
  submitButton: {
    backgroundColor: NYXSCREAM.scream,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 12
  },
  submitButtonText: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2
  }
});
