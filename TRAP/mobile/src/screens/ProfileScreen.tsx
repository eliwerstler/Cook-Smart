import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { drinkService, Drink } from '../services/drinkService';
import DrinkCard from '../components/DrinkCard';
import CommentModal from '../components/CommentModal';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedDrinkId, setSelectedDrinkId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadUserDrinks();
    }
  }, [user?.id]);

  const loadUserDrinks = async (isRefreshing = false) => {
    if (!user?.id) return;

    try {
      if (!isRefreshing) setLoading(true);
      const userDrinks = await drinkService.getUserDrinks(user.id, 50, 0);
      setDrinks(userDrinks);
    } catch (error) {
      console.error('Error loading user drinks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUserDrinks(true);
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
    loadUserDrinks(true);
  };

  const renderDrink = ({ item }: { item: Drink }) => (
    <DrinkCard
      drink={item}
      onLike={() => handleLike(item.id, item.isLiked || false)}
      onComment={() => handleComment(item.id)}
    />
  );

  const renderHeader = () => (
    <>
      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.username?.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.lifetimeDrinks || 0}</Text>
            <Text style={styles.statLabel}>Drinks</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user?.totalStandards.toFixed(1) || 0}
            </Text>
            <Text style={styles.statLabel}>Standards</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user?.peakBph.toFixed(1) || 0}
            </Text>
            <Text style={styles.statLabel}>Peak BPH</Text>
          </View>
        </View>

        <Text style={styles.bio}>{user?.bio || 'No bio yet'}</Text>
      </View>

      {/* Posts Header */}
      <View style={styles.postsHeader}>
        <Ionicons name="grid-outline" size={20} color="#000" />
        <Text style={styles.postsHeaderText}>POSTS</Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.username}>{user?.username}</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {loading && drinks.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0095f6" />
        </View>
      ) : (
        <FlatList
          data={drinks}
          renderItem={renderDrink}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>📸</Text>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptySubtext}>
                Start drinking and share your first photo!
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0095f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: '#333',
  },
  postsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    gap: 8,
  },
  postsHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 60,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
