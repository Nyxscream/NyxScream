// NYX Token Dashboard Screen - Wallet & Utility
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
import { getUserWalletBalance, getUserNYXTransactions, purchaseNYXTokens, giftNYXTokens, spendNYXTokens, getNYXTokenInfo, awardNYXTokens } from '../services/TokenService';

const NYXSCREAM = {
  void: '#0D0221',
  shadow: '#1A0A2E',
  scream: '#FF003C',
  nyx: '#9D00FF',
  electric: '#00F0FF',
  ghost: '#E0E0E0',
  mist: '#6B6B6B'
};

export default function TokenDashboardScreen({ route }) {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [giftModalVisible, setGiftModalVisible] = useState(false);
  const [spendModalVisible, setSpendModalVisible] = useState(false);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftAmount, setGiftAmount] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [spendAmount, setSpendAmount] = useState('');
  const [spendPurpose, setSpendPurpose] = useState('tribute');

  const { userId } = route.params || {};

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      if (userId) {
        const [balanceData, txData] = await Promise.all([
          getUserWalletBalance(userId),
          getUserNYXTransactions(userId, 20)
        ]);

        setWallet(balanceData);
        setTransactions(txData);
        setTokenInfo(getNYXTokenInfo());
      }
      setLoading(false);
    } catch (error) {
      console.error('◉ Wallet load failed:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handlePurchase = async () => {
    if (!purchaseAmount || isNaN(purchaseAmount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const result = await purchaseNYXTokens(
        userId,
        parseInt(purchaseAmount),
        'card_method_id',
        'pi_stripe_intent_id'
      );

      if (result.status === 'success') {
        Alert.alert('Success', result.message);
        setPurchaseModalVisible(false);
        setPurchaseAmount('');
        loadWalletData();
      }
    } catch (error) {
      Alert.alert('Error', 'Purchase failed: ' + error.message);
    }
  };

  const handleGift = async () => {
    if (!giftRecipient || !giftAmount || isNaN(giftAmount)) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const result = await giftNYXTokens(
        userId,
        giftRecipient,
        parseInt(giftAmount),
        giftMessage
      );

      if (result.status === 'success') {
        Alert.alert('Success', result.message);
        setGiftModalVisible(false);
        setGiftRecipient('');
        setGiftAmount('');
        setGiftMessage('');
        loadWalletData();
      }
    } catch (error) {
      Alert.alert('Error', 'Gift failed: ' + error.message);
    }
  };

  const handleSpend = async () => {
    if (!spendAmount || isNaN(spendAmount)) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const result = await spendNYXTokens(
        userId,
        parseInt(spendAmount),
        spendPurpose
      );

      if (result.status === 'success') {
        Alert.alert('Success', result.message);
        setSpendModalVisible(false);
        setSpendAmount('');
        loadWalletData();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Spend failed: ' + error.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={NYXSCREAM.nyx} />
          <Text style={styles.loadingText}>Loading NYX Wallet...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.header}>
        <Text style={styles.headerTitle}>NYX TOKEN</Text>
        <Text style={styles.headerSubtitle}>Internal Currency - Stable Value</Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={NYXSCREAM.nyx} />}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <LinearGradient colors={[NYXSCREAM.nyx, NYXSCREAM.electric]} style={styles.balanceGradient}>
            <Text style={styles.balanceLabel}>YOUR NYX BALANCE</Text>
            <Text style={styles.balanceAmount}>{wallet?.balance || 0}</Text>
            <Text style={styles.balanceUSD}>≈ ${((wallet?.balance || 0) * 0.01).toFixed(2)} USD</Text>
            <Text style={styles.balanceSubtext}>$0.01 per token (STABLE)</Text>
          </LinearGradient>
        </View>

        {/* Balance Breakdown */}
        <View style={styles.breakdownGrid}>
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownLabel}>EARNED</Text>
            <Text style={styles.breakdownValue}>{wallet?.earned || 0}</Text>
            <Text style={styles.breakdownUnit}>tokens</Text>
          </View>
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownLabel}>PURCHASED</Text>
            <Text style={styles.breakdownValue}>{wallet?.purchased || 0}</Text>
            <Text style={styles.breakdownUnit}>tokens</Text>
          </View>
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownLabel}>SPENT</Text>
            <Text style={styles.breakdownValue}>{wallet?.spent || 0}</Text>
            <Text style={styles.breakdownUnit}>tokens</Text>
          </View>
        </View>

        {/* Token Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💜 What is NYX Token?</Text>
          <Text style={styles.infoText}>
            NYX is NyxScream's internal currency. It's NOT cryptocurrency. It's stable, secure, and only works on NyxScream. Earn it through activity or purchase it with USD.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setPurchaseModalVisible(true)}
          >
            <Text style={styles.actionIcon}>💳</Text>
            <Text style={styles.actionLabel}>PURCHASE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setGiftModalVisible(true)}
          >
            <Text style={styles.actionIcon}>🎁</Text>
            <Text style={styles.actionLabel}>GIFT</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setSpendModalVisible(true)}
          >
            <Text style={styles.actionIcon}>💸</Text>
            <Text style={styles.actionLabel}>SPEND</Text>
          </TouchableOpacity>
        </View>

        {/* Utility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 NYX UTILITY</Text>
          <View style={styles.utilityList}>
            <View style={styles.utilityItem}>
              <Text style={styles.utilityIcon}>🎁</Text>
              <Text style={styles.utilityText}>Tip creators directly</Text>
            </View>
            <View style={styles.utilityItem}>
              <Text style={styles.utilityIcon}>🗳️</Text>
              <Text style={styles.utilityText}>Vote on platform decisions</Text>
            </View>
            <View style={styles.utilityItem}>
              <Text style={styles.utilityIcon}>🔓</Text>
              <Text style={styles.utilityText}>Access exclusive content</Text>
            </View>
            <View style={styles.utilityItem}>
              <Text style={styles.utilityIcon}>🏆</Text>
              <Text style={styles.utilityText}>Earn rewards through activity</Text>
            </View>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 TRANSACTION HISTORY</Text>
          {transactions.length > 0 ? (
            <FlatList
              scrollEnabled={false}
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <Text style={styles.transactionType}>
                      {item.type === 'earn' && '📈'}
                      {item.type === 'purchase' && '💳'}
                      {item.type === 'spend' && '💸'}
                      {item.type === 'gift_sent' && '🎁'}
                      {item.type === 'gift_received' && '📦'}
                      {' ' + item.type.toUpperCase().replace(/_/g, ' ')}
                    </Text>
                    <Text style={styles.transactionDate}>{item.date}</Text>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    (item.type === 'spend' || item.type === 'gift_sent') && styles.transactionAmountOut
                  ]}>
                    {(item.type === 'spend' || item.type === 'gift_sent') ? '-' : '+'}{item.amount}
                  </Text>
                </View>
              )}
            />
          ) : (
            <Text style={styles.noTransactions}>No transactions yet</Text>
          )}
        </View>

        {/* Token Info Section */}
        {tokenInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ TOKEN INFORMATION</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoItemLabel}>Total Supply</Text>
                <Text style={styles.infoItemValue}>500M</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoItemLabel}>Value</Text>
                <Text style={styles.infoItemValue}>${tokenInfo.valueUSD}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoItemLabel}>Type</Text>
                <Text style={styles.infoItemValue}>Internal</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoItemLabel}>Tradeable</Text>
                <Text style={styles.infoItemValue}>No</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Purchase Modal */}
      <Modal visible={purchaseModalVisible} transparent animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.modalHeader}>
            <Text style={styles.modalTitle}>PURCHASE NYX</Text>
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Amount of NYX Tokens</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor={NYXSCREAM.mist}
              keyboardType="number-pad"
              value={purchaseAmount}
              onChangeText={setPurchaseAmount}
            />

            {purchaseAmount && !isNaN(purchaseAmount) && (
              <View style={styles.costBreakdown}>
                <Text style={styles.costLabel}>Total Cost</Text>
                <Text style={styles.costValue}>${(parseInt(purchaseAmount) * 0.01).toFixed(2)} USD</Text>
              </View>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handlePurchase}>
              <Text style={styles.submitButtonText}>COMPLETE PURCHASE</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setPurchaseModalVisible(false)}>
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Gift Modal */}
      <Modal visible={giftModalVisible} transparent animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.modalHeader}>
            <Text style={styles.modalTitle}>GIFT NYX</Text>
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Recipient User ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter recipient ID"
              placeholderTextColor={NYXSCREAM.mist}
              value={giftRecipient}
              onChangeText={setGiftRecipient}
            />

            <Text style={styles.modalLabel}>Amount of NYX</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor={NYXSCREAM.mist}
              keyboardType="number-pad"
              value={giftAmount}
              onChangeText={setGiftAmount}
            />

            <Text style={styles.modalLabel}>Gift Message</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Add a message"
              placeholderTextColor={NYXSCREAM.mist}
              multiline
              numberOfLines={3}
              value={giftMessage}
              onChangeText={setGiftMessage}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleGift}>
              <Text style={styles.submitButtonText}>SEND GIFT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setGiftModalVisible(false)}>
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Spend Modal */}
      <Modal visible={spendModalVisible} transparent animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient colors={[NYXSCREAM.shadow, NYXSCREAM.void]} style={styles.modalHeader}>
            <Text style={styles.modalTitle}>SPEND NYX</Text>
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Purpose</Text>
            <View style={styles.purposeSelector}>
              {[
                { id: 'tribute', name: '🎁 Tip Creator' },
                { id: 'voting', name: '🗳️ Vote' },
                { id: 'exclusive_content', name: '🔓 Exclusive Content' },
                { id: 'reward', name: '🏆 Reward' }
              ].map((purpose) => (
                <TouchableOpacity
                  key={purpose.id}
                  style={[
                    styles.purposeOption,
                    spendPurpose === purpose.id && styles.purposeOptionSelected
                  ]}
                  onPress={() => setSpendPurpose(purpose.id)}
                >
                  <Text style={styles.purposeOptionText}>{purpose.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor={NYXSCREAM.mist}
              keyboardType="number-pad"
              value={spendAmount}
              onChangeText={setSpendAmount}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSpend}>
              <Text style={styles.submitButtonText}>SPEND NOW</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setSpendModalVisible(false)}>
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
    borderBottomColor: NYXSCREAM.nyx
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: NYXSCREAM.nyx,
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
  balanceCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: NYXSCREAM.nyx,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  balanceGradient: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center'
  },
  balanceLabel: {
    color: NYXSCREAM.void,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10
  },
  balanceAmount: {
    fontSize: 52,
    fontWeight: '900',
    color: NYXSCREAM.void,
    marginBottom: 10
  },
  balanceUSD: {
    color: NYXSCREAM.void,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5
  },
  balanceSubtext: {
    color: NYXSCREAM.void,
    fontSize: 11,
    opacity: 0.8
  },
  breakdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10
  },
  breakdownCard: {
    flex: 1,
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center'
  },
  breakdownLabel: {
    color: NYXSCREAM.mist,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8
  },
  breakdownValue: {
    color: NYXSCREAM.electric,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 5
  },
  breakdownUnit: {
    color: NYXSCREAM.mist,
    fontSize: 10
  },
  infoCard: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginBottom: 20
  },
  infoTitle: {
    color: NYXSCREAM.ghost,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10
  },
  infoText: {
    color: NYXSCREAM.mist,
    fontSize: 13,
    lineHeight: 20
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    gap: 10
  },
  actionButton: {
    flex: 1,
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
    letterSpacing: 1,
    marginBottom: 15
  },
  utilityList: {
    gap: 10
  },
  utilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: NYXSCREAM.shadow,
    borderLeftWidth: 3,
    borderLeftColor: NYXSCREAM.nyx,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 4
  },
  utilityIcon: {
    fontSize: 20,
    marginRight: 12
  },
  utilityText: {
    color: NYXSCREAM.ghost,
    fontSize: 13,
    fontWeight: '500'
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: NYXSCREAM.shadow,
    borderLeftWidth: 3,
    borderLeftColor: NYXSCREAM.nyx,
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
    color: NYXSCREAM.electric,
    fontWeight: '900',
    fontSize: 13
  },
  transactionAmountOut: {
    color: NYXSCREAM.scream
  },
  noTransactions: {
    color: NYXSCREAM.mist,
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 13
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10
  },
  infoItem: {
    width: '48%',
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center'
  },
  infoItemLabel: {
    color: NYXSCREAM.mist,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 5
  },
  infoItemValue: {
    color: NYXSCREAM.electric,
    fontWeight: '900',
    fontSize: 14
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
    color: NYXSCREAM.nyx,
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
  costBreakdown: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.electric,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  costLabel: {
    color: NYXSCREAM.mist,
    fontWeight: '700'
  },
  costValue: {
    color: NYXSCREAM.electric,
    fontWeight: '900',
    fontSize: 16
  },
  purposeSelector: {
    marginBottom: 20
  },
  purposeOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 6,
    marginBottom: 8
  },
  purposeOptionSelected: {
    borderColor: NYXSCREAM.electric,
    backgroundColor: 'rgba(0, 240, 255, 0.1)'
  },
  purposeOptionText: {
    color: NYXSCREAM.ghost,
    fontWeight: '600',
    fontSize: 14
  },
  submitButton: {
    backgroundColor: NYXSCREAM.nyx,
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