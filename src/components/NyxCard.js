import React from 'react';
import { View, StyleSheet } from 'react-native';

const NYXSCREAM = {
  shadow: '#1A0A2E',
  nyx: '#9D00FF'
};

export default function NyxCard({ children, style }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    borderRadius: 8,
    padding: 15
  }
});
