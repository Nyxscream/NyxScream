import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../services/Theme';

const MediaCard = ({ item, onPress }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    card: {
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 16,
      backgroundColor: colors.shadow,
    },
    thumbnail: {
      width: '100%',
      height: 200,
      backgroundColor: colors.void,
    },
    content: {
      padding: 12,
    },
    title: {
      color: colors.ghost,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    metadata: {
      color: colors.mist,
      fontSize: 12,
    },
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={
          item.thumbnail
            ? { uri: item.thumbnail }
            : require('../assets/images/video-thumbnail.png')
        }
        style={styles.thumbnail}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.metadata}>{item.creator}</Text>
        <Text style={styles.metadata}>{item.views} views</Text>
      </View>
    </TouchableOpacity>
  );
};

export default MediaCard;
