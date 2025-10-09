import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { friendshipService, UserWithStatus } from '../services/friendshipService';

export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    if (query.trim().length < 2) {
      return;
    }

    try {
      setLoading(true);
      const results = await friendshipService.searchUsers(query.trim());
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      setPendingActions(prev => new Set(prev).add(userId));
      await friendshipService.sendFriendRequest(userId);

      // Update local state
      setSearchResults(results =>
        results.map(user =>
          user.id === userId
            ? {
                ...user,
                friendshipStatus: {
                  status: 'pending' as const,
                  isSender: true,
                },
              }
            : user
        )
      );
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to send friend request');
    } finally {
      setPendingActions(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleCancelRequest = async (friendshipId: string, userId: string) => {
    try {
      setPendingActions(prev => new Set(prev).add(userId));
      await friendshipService.rejectFriendRequest(friendshipId);

      // Update local state
      setSearchResults(results =>
        results.map(user =>
          user.id === userId
            ? {
                ...user,
                friendshipStatus: { status: 'none' as const },
              }
            : user
        )
      );
    } catch (error: any) {
      console.error('Error cancelling friend request:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to cancel friend request');
    } finally {
      setPendingActions(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleAcceptRequest = async (friendshipId: string, userId: string) => {
    try {
      setPendingActions(prev => new Set(prev).add(userId));
      await friendshipService.acceptFriendRequest(friendshipId);

      // Update local state
      setSearchResults(results =>
        results.map(user =>
          user.id === userId
            ? {
                ...user,
                friendshipStatus: { status: 'accepted' as const },
              }
            : user
        )
      );
      Alert.alert('Success', 'Friend request accepted!');
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to accept friend request');
    } finally {
      setPendingActions(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const renderActionButton = (user: UserWithStatus) => {
    const isPending = pendingActions.has(user.id);
    const { status, friendshipId, isSender } = user.friendshipStatus;

    if (isPending) {
      return (
        <ActivityIndicator size="small" color="#0095f6" />
      );
    }

    switch (status) {
      case 'accepted':
        return (
          <View style={styles.friendBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#0095f6" />
            <Text style={styles.friendBadgeText}>Friends</Text>
          </View>
        );

      case 'pending':
        if (isSender) {
          // User sent the request - show cancel option
          return (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => friendshipId && handleCancelRequest(friendshipId, user.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          );
        } else {
          // User received the request - show accept option
          return (
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => friendshipId && handleAcceptRequest(friendshipId, user.id)}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          );
        }

      case 'none':
      default:
        return (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleSendRequest(user.id)}
          >
            <Ionicons name="person-add" size={20} color="#fff" />
          </TouchableOpacity>
        );
    }
  };

  const renderUser = ({ item }: { item: UserWithStatus }) => (
    <View style={styles.userItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.username.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        {item.bio && <Text style={styles.bio} numberOfLines={1}>{item.bio}</Text>}
        {item.lifetimeDrinks !== undefined && (
          <Text style={styles.stats}>
            {item.lifetimeDrinks} drinks • {item.peakBph?.toFixed(1) || 0} peak BPH
          </Text>
        )}
      </View>
      {renderActionButton(item)}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0095f6" />
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : searchQuery.trim().length >= 2 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🔍</Text>
          <Text style={styles.emptyTitle}>No users found</Text>
          <Text style={styles.emptySubtext}>Try searching for a different username</Text>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>🔍</Text>
          <Text style={styles.placeholderTitle}>Search for Friends</Text>
          <Text style={styles.placeholderSubtitle}>
            Enter a username to find and add friends
          </Text>
        </View>
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
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingVertical: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0095f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  stats: {
    fontSize: 12,
    color: '#999',
  },
  addButton: {
    backgroundColor: '#0095f6',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dbdbdb',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  acceptButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#0095f6',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  friendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  friendBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0095f6',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
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
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
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
    paddingHorizontal: 40,
  },
});
