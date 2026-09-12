import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView
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

export const PaywallModal = ({ visible, onClose, requiredTier, currentTier }) => {
  const tierDetails = {
    shadow: {
      name: 'Shadow Tier',
      price: '$12.99/month',
      features: [
        '✓ Ad-free streaming',
        '✓ HD quality',
        '✓ Offline downloads'
      ]
    },
    abyss: {
      name: 'Abyss Tier',
      price: '$19.99/month',
      features: [
        '✓ 4K streaming',
        '✓ Priority support',
        '✓ Exclusive content'
      ]
    }
  };

  const tier = tierDetails[requiredTier] || tierDetails.shadow;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[NYXSCREAM.void, NYXSCREAM.shadow]}
          style={styles.content}
        >
          <Text style={styles.title}>Unlock {tier.name}</Text>
          <Text style={styles.price}>{tier.price}</Text>

          {tier.features.map((feature, idx) => (
            <Text key={idx} style={styles.feature}>
              {feature}
            </Text>
          ))}

          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => console.log('[PaywallModal] Subscribe tapped')}
          >
            <Text style={styles.subscribeText}>SUBSCRIBE NOW</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeText}>MAYBE LATER</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NYXSCREAM.void
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: NYXSCREAM.electric,
    marginBottom: 10,
    letterSpacing: 1
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: NYXSCREAM.scream,
    marginBottom: 30
  },
  feature: {
    fontSize: 14,
    color: NYXSCREAM.ghost,
    marginBottom: 12,
    paddingLeft: 20
  },
  subscribeButton: {
    backgroundColor: NYXSCREAM.scream,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 30,
    marginBottom: 12
  },
  subscribeText: {
    color: NYXSCREAM.ghost,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 40
  },
  closeText: {
    color: NYXSCREAM.nyx,
    fontWeight: '700',
    fontSize: 12
  }
});
