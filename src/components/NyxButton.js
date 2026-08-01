import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const NYXSCREAM = {
  void: '#0D0221',
  scream: '#FF003C',
  nyx: '#9D00FF',
  ghost: '#E0E0E0'
};

export default function NyxButton({ title, onPress, variant = 'primary', style }) {
  const buttonStyle = variant === 'primary' ? styles.primary : styles.secondary;

  return (
    <TouchableOpacity style={[buttonStyle, style]} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: NYXSCREAM.scream,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center'
  },
  secondary: {
    backgroundColor: NYXSCREAM.nyx,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center'
  },
  text: {
    color: NYXSCREAM.ghost,
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1
  }
});
