import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Linking,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { NYXSCREAM } from '../services/Theme';
import { SubscriptionService } from '../services/SubscriptionService';

export const PaywallModal = ({ visible, onClose, requiredTier, currentTier }) => {
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  const tiers = [
    {
      id: 'shadow',
      name: 'SHADOW',
      price: '$9.99',
      period: '/month',
      color: NYXSCREAM.electric,
      benefits: [
        '3000+ hours content',
        'HD quality',
        'Ad-free experience',
        'Offline downloads',
        'Standard support'
      ]
    },
    {
      id: 'abyss',
      name: 'ABYSS',
      price: '$16.99',
      period: '/month',
      color: NYXSCREAM.scream,
      benefits: [
        'All SHADOW features',
        '4K quality',
        'Early access',
        'Priority support',
        'Exclusive content'
      ]
    }
  ];

  const handleUpgrade = async (tierName) => {
    try {
      setLoading(true);
      setSelectedTier(tierName);

      // Call SubscriptionService to upgrade
      const result = await SubscriptionService.upgradeSubscription(tierName);

      if (result && result.checkoutUrl) {
        // Open Stripe Checkout in browser
        await WebBrowser.openBrowserAsync(result.checkoutUrl);
      } else {
        console.error('No checkout URL returned');
        alert('Error: Could not create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Error upgrading subscription: ' + error.message);
    } finally {
      setLoading(false);
      setSelectedTier(null);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🔓 UNLOCK PREMIUM</Text>
            <Text style={styles.subtitle}>
              Upgrade to {requiredTier?.toUpperCase() || 'SHADOW'} for exclusive content
            </Text>
          </View>

          {/* Tiers */}
          <ScrollView style={styles.tiersContainer}>
            {tiers.map((tier) => (
              <View key={tier.id} style={[styles.tierCard, { borderColor: tier.color }]}>
                {/* Tier Header - Name & Price */}
                <View style={styles.tierHeader}>
                  <View>
                    <Text style={[styles.tierName, { color: tier.color }]}>
                      {tier.name}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>{tier.price}</Text>
                      <Text style={styles.period}>{tier.period}</Text>
                    </View>
                  </View>

                  {/* Current Tier Badge */}
                  {currentTier === tier.id && (
                    <View style={[styles.currentBadge, { borderColor: tier.color }]}>
                      <Text style={[styles.currentBadgeText, { color: tier.color }]}>
                        ✓ CURRENT
                      </Text>
                    </View>
                  )}
                </View>

                {/* Benefits List */}
                <View style={styles.benefitsList}>
                  {tier.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Text style={[styles.checkmark, { color: tier.color }]}>✓</Text>
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>

                {/* Upgrade Button */}
                {currentTier !== tier.id && (
                  <TouchableOpacity
                    style={[
                      styles.upgradeButton,
                      { backgroundColor: tier.color }
                    ]}
                    onPress={() => handleUpgrade(tier.id)}
                    disabled={loading && selectedTier === tier.id}
                  >
                    {loading && selectedTier === tier.id ? (
                      <ActivityIndicator color={NYXSCREAM.void} size="small" />
                    ) : (
                      <Text style={styles.upgradeButtonText}>UPGRADE NOW</Text>
                    )}
                  </TouchableOpacity>
                )}

                {currentTier === tier.id && (
                  <View style={[styles.currentButton, { backgroundColor: tier.color }]}>
                    <Text style={styles.currentButtonText}>✓ CURRENT PLAN</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          {/* Footer - Close Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.closeButtonText}>MAYBE LATER</Text>
            </TouchableOpacity>
          </View>

          {/* Terms Note */}
          <Text style={styles.termsText}>
            By upgrading, you agree to recurring charges. Cancel anytime in Settings.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0D0221',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    maxHeight: '90%',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FF003C',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
  },
  tiersContainer: {
    marginBottom: 16,
  },
  tierCard: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#1A0A2E',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tierName: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 28,
    fontWeight: '900',
    color: '#E0E0E0',
  },
  period: {
    fontSize: 12,
    color: '#6B6B6B',
    marginLeft: 4,
  },
  currentBadge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  benefitsList: {
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkmark: {
    fontSize: 16,
    marginRight: 8,
    fontWeight: '900',
  },
  benefitText: {
    fontSize: 13,
    color: '#E0E0E0',
    flex: 1,
  },
  upgradeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 0,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0D0221',
    letterSpacing: 1,
  },
  currentButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 0.6,
  },
  currentButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0D0221',
    letterSpacing: 1,
  },
  footer: {
    marginBottom: 16,
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6B6B6B',
    borderRadius: 8,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#6B6B6B',
    letterSpacing: 1,
  },
  termsText: {
    fontSize: 11,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 16,
  },
});