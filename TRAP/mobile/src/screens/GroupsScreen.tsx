import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { friendshipService, Friend, Friendship } from '../services/friendshipService';

type TabType = 'friends' | 'requests';

export default function GroupsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);

      const [friendsData, requestsData] = await Promise.all([
        friendshipService.getFriends(),
        friendshipService.getPendingRequests(),
      ]);

      setFriends(friendsData);
      setPendingRequests(requestsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(friendshipId));
      await friendshipService.acceptFriendRequest(friendshipId);

      // Reload data to update both lists
      await loadData(true);
      Alert.alert('Success', 'Friend request accepted!');
    } catch (error: any) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to accept friend request');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(friendshipId);
        return next;
      });
    }
  };

  const handleRejectRequest = async (friendshipId: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(friendshipId));
      await friendshipService.rejectFriendRequest(friendshipId);

      // Remove from local state
      setPendingRequests(prev => prev.filter(req => req.id !== friendshipId));
    } catch (error: any) {
      console.error('Error rejecting friend request:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to reject friend request');
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(friendshipId);
        return next;
      });
    }
  };

  const handleRemoveFriend = async (friendId: string, friendshipId: string) => {
    Alert.alert(
      'Remove Friend',
      'Are you sure you want to remove this friend?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessingIds(prev => new Set(prev).add(friendshipId));
              await friendshipService.removeFriend(friendId);

              // Remove from local state
              setFriends(prev => prev.filter(f => f.friendshipId !== friendshipId));
            } catch (error: any) {
              console.error('Error removing friend:', error);
              Alert.alert('Error', error.response?.data?.error || 'Failed to remove friend');
            } finally {
              setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(friendshipId);
                return next;
              });
            }
          },
        },
      ]
    );
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.listItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.friend.username.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.friend.username}</Text>
        {item.friend.bio && <Text style={styles.bio} numberOfLines={1}>{item.friend.bio}</Text>}
        <Text style={styles.stats}>
          {item.friend.lifetimeDrinks || 0} drinks • {item.friend.peakBph?.toFixed(1) || 0} peak BPH
        </Text>
      </View>
      {processingIds.has(item.friendshipId) ? (
        <ActivityIndicator size="small" color="#0095f6" />
      ) : (
        <TouchableOpacity
          onPress={() => handleRemoveFriend(item.friend.id, item.friendshipId)}
          style={styles.removeButton}
        >
          <Ionicons name="person-remove-outline" size={20} color="#ed4956" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderRequest = ({ item }: { item: Friendship }) => (
    <View style={styles.listItem}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.sender.username.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.sender.username}</Text>
        {item.sender.bio && <Text style={styles.bio} numberOfLines={1}>{item.sender.bio}</Text>}
      </View>
      {processingIds.has(item.id) ? (
        <ActivityIndicator size="small" color="#0095f6" />
      ) : (
        <View style={styles.requestActions}>
          <TouchableOpacity
            onPress={() => handleAcceptRequest(item.id)}
            style={styles.acceptButton}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleRejectRequest(item.id)}
            style={styles.rejectButton}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0095f6" />
        </View>
      );
    }

    if (activeTab === 'friends') {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>👥</Text>
          <Text style={styles.emptyTitle}>No friends yet</Text>
          <Text style={styles.emptySubtext}>
            Search for friends in the Discover tab to get started!
          </Text>
        </View>
      );
    } else {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📭</Text>
          <Text style={styles.emptyTitle}>No pending requests</Text>
          <Text style={styles.emptySubtext}>
            Friend requests will appear here
          </Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests ({pendingRequests.length})
          </Text>
          {pendingRequests.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={activeTab === 'friends' ? friends : pendingRequests}
        renderItem={activeTab === 'friends' ? renderFriend : renderRequest}
        keyExtractor={(item) => activeTab === 'friends' ? (item as Friend).friendshipId : (item as Friendship).id}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={
          (activeTab === 'friends' ? friends : pendingRequests).length === 0
            ? styles.emptyList
            : undefined
        }
      />
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
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#000',
  },
  badge: {
    backgroundColor: '#ed4956',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listItem: {
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
  removeButton: {
    padding: 8,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#0095f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    borderWidth: 1,
    borderColor: '#dbdbdb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  rejectButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
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
    paddingHorizontal: 40,
  },
});
