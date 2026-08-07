import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * CreatorVerificationBadge Component
 * 
 * Displays verification badge based on creator tier
 * Tiers: 1 (Emerging), 2 (Arrived), 3 (Rising), 4 (Legend)
 * 
 * Usage:
 * <CreatorVerificationBadge tier={2} size="small" />
 */

const CreatorVerificationBadge = ({ tier = 1, size = 'medium', style = {} }) => {
  // Badge configuration by tier
  const badgeConfig = {
    1: {
      moon: '🌙',
      color: '#6B6B6B',
      backgroundColor: 'rgba(107, 107, 107, 0.1)',
      label: 'Emerging',
      glow: 'none',
      animation: 'none',
    },
    2: {
      moon: '🌕',
      color: '#E0E0E0',
      backgroundColor: 'rgba(224, 224, 224, 0.1)',
      label: 'Arrived',
      glow: 'subtle',
      animation: 'none',
    },
    3: {
      moon: '🌙',
      color: '#FFD700',
      backgroundColor: 'rgba(255, 215, 0, 0.1)',
      label: 'Rising',
      glow: 'none',
      animation: 'none',
    },
    4: {
      moon: '🌕',
      color: '#FFD700',
      backgroundColor: 'rgba(255, 215, 0, 0.15)',
      label: 'Legend',
      glow: 'strong',
      animation: 'glow',
    },
  };

  // Size configuration
  const sizeConfig = {
    small: {
      fontSize: 14,
      padding: 4,
      borderRadius: 4,
      containerSize: 24,
    },
    medium: {
      fontSize: 18,
      padding: 6,
      borderRadius: 6,
      containerSize: 32,
    },
    large: {
      fontSize: 24,
      padding: 8,
      borderRadius: 8,
      containerSize: 40,
    },
  };

  const config = badgeConfig[tier] || badgeConfig[1];
  const sizeStyle = sizeConfig[size] || sizeConfig['medium'];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      ...style,
    },
    badgeBox: {
      width: sizeStyle.containerSize,
      height: sizeStyle.containerSize,
      borderRadius: sizeStyle.borderRadius,
      backgroundColor: config.backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: config.color,
    },
    moon: {
      fontSize: sizeStyle.fontSize,
      color: config.color,
      // Shadow effect for iOS
      textShadowColor: config.glow === 'strong' ? config.color : 'rgba(0,0,0,0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: config.glow === 'strong' ? 4 : 1,
    },
    label: {
      fontSize: 12,
      color: config.color,
      fontWeight: '500',
      fontFamily: 'Inter',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.badgeBox}>
        <Text style={styles.moon}>{config.moon}</Text>
      </View>
      <Text style={styles.label}>{config.label}</Text>
    </View>
  );
};

export default CreatorVerificationBadge;