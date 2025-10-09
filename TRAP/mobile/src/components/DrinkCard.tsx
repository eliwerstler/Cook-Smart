import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Drink } from '../services/drinkService';

interface DrinkCardProps {
  drink: Drink;
  onLike?: () => void;
  onComment?: () => void;
}

export default function DrinkCard({ drink, onLike, onComment }: DrinkCardProps) {
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const getDrinkEmoji = (drinkType: string) => {
    const emojiMap: Record<string, string> = {
      'Beer': '🍺',
      'Wine': '🍷',
      'Cocktail': '🍹',
      'Shot': '🥃',
      'Mixed Drink': '🍸',
      'Champagne': '🥂',
    };
    return emojiMap[drinkType] || '🍺';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {drink.user.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.username}>{drink.user.username}</Text>
          <Text style={styles.timestamp}>{formatTimeAgo(drink.createdAt)}</Text>
        </View>
      </View>

      {/* Photo */}
      <Image
        source={{ uri: drink.photoUrl }}
        style={styles.photo}
        resizeMode="cover"
      />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Ionicons
            name={drink.isLiked ? 'heart' : 'heart-outline'}
            size={28}
            color={drink.isLiked ? '#ed4956' : '#000'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Drink Info */}
      <View style={styles.info}>
        <Text style={styles.drinkType}>
          {getDrinkEmoji(drink.drinkType)} {drink.drinkType} - {drink.alcoholContent} std
        </Text>

        {drink._count && drink._count.likes > 0 && (
          <Text style={styles.likes}>
            {drink._count.likes} {drink._count.likes === 1 ? 'like' : 'likes'}
          </Text>
        )}

        {drink.caption && (
          <Text style={styles.caption}>
            <Text style={styles.captionUsername}>{drink.user.username}</Text> {drink.caption}
          </Text>
        )}

        {drink._count && drink._count.comments > 0 && (
          <TouchableOpacity onPress={onComment}>
            <Text style={styles.viewComments}>
              View all {drink._count.comments} comments
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0095f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  photo: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
  },
  actions: {
    flexDirection: 'row',
    padding: 12,
  },
  actionButton: {
    marginRight: 16,
  },
  info: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  drinkType: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  likes: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  caption: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  captionUsername: {
    fontWeight: '600',
  },
  viewComments: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});
