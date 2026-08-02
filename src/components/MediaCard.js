// Reusable Media Card Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

export default function MediaCard({ item, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <LinearGradient colors={[NYXSCREAM.scream, NYXSCREAM.nyx]} style={styles.thumbnail}>
        <Text style={styles.emoji}>{item.thumbnail}</Text>
        {item.status === 'LIVE' && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>● LIVE</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.creator}>{item.creator}</Text>
        <View style={styles.stats}>
          <Text style={styles.stat}>👁️ {item.views?.toLocaleString() || 0}</Text>
          <Text style={styles.stat}>❤️ {item.likes?.toLocaleString() || 0}</Text>
          {item.viewers && <Text style={styles.stat}>👥 {item.viewers}</Text>}
        </View>
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: NYXSCREAM.shadow,
    borderWidth: 1,
    borderColor: NYXSCREAM.nyx,
    marginBottom: 15,
    shadowColor: NYXSCREAM.scream,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5
  },
  thumbnail: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  emoji: {
    fontSize: 60
  },
  liveBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: NYXSCREAM.scream,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4
  },
  liveBadgeText: {
    color: NYXSCREAM.void,
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 1
  },
  info: {
    padding: 15
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: NYXSCREAM.ghost,
    marginBottom: 6,
    lineHeight: 20
  },
  creator: {
    fontSize: 12,
    color: NYXSCREAM.electric,
    fontWeight: '700',
    marginBottom: 10
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10
  },
  stat: {
    fontSize: 11,
    color: NYXSCREAM.mist
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: NYXSCREAM.nyx,
    borderRadius: 4
  },
  categoryText: {
    color: NYXSCREAM.void,
    fontSize: 10,
    fontWeight: '700'
  }
});
