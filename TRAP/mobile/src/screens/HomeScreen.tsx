import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { drinkService, Drink } from '../services/drinkService';
import DrinkCard from '../components/DrinkCard';
import CommentModal from '../components/CommentModal';

export default function HomeScreen() {
  const { user } = useAuth();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedDrinkId, setSelectedDrinkId] = useState<string | null>(null);

  const loadFeed = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      const feedData = await drinkService.getFeed(20, 0);
      setDrinks(feedData);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed(true);
  };

  const handleLike = async (drinkId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await drinkService.unlikeDrink(drinkId);
      } else {
        await drinkService.likeDrink(drinkId);
      }

      // Update local state
      setDrinks(drinks.map(d =>
        d.id === drinkId
          ? {
              ...d,
              isLiked: !isLiked,
              _count: {
                ...d._count!,
                likes: isLiked ? d._count!.likes - 1 : d._count!.likes + 1
              }
            }
          : d
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = (drinkId: string) => {
    setSelectedDrinkId(drinkId);
    setCommentModalVisible(true);
  };

  const handleCloseComments = () => {
    setCommentModalVisible(false);
    setSelectedDrinkId(null);
    // Refresh feed to update comment counts
    loadFeed(true);
  };

  const renderDrink = ({ item }: { item: Drink }) => (
    <DrinkCard
      drink={item}
      onLike={() => handleLike(item.id, item.isLiked || false)}
      onComment={() => handleComment(item.id)}
    />
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0095f6" />
        </View>
      );
    }

    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>📸</Text>
        <Text style={styles.placeholderTitle}>No posts yet</Text>
        <Text style={styles.placeholderSubtitle}>
          Start drinking and share your first photo!
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>TRAP</Text>
      </View>

      <FlatList
        data={drinks}
        renderItem={renderDrink}
        keyExtractor={(item) => item.id}
        contentContainerStyle={drinks.length === 0 ? styles.emptyList : undefined}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      />

      {selectedDrinkId && (
        <CommentModal
          visible={commentModalVisible}
          drinkId={selectedDrinkId}
          onClose={handleCloseComments}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    paddingVertical: 12,
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyList: {
    flexGrow: 1,
  },
  placeholder: {
    alignItems: 'center',
    padding: 40,
    marginTop: 100,
  },
  placeholderText: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
