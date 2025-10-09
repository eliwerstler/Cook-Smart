import api from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  profilePhoto?: string;
  bio?: string;
  lifetimeDrinks?: number;
  totalStandards?: number;
  avgBph?: number;
  peakBph?: number;
}

export interface FriendshipStatus {
  status: 'none' | 'pending' | 'accepted' | 'blocked' | 'self';
  friendshipId?: string;
  isSender?: boolean;
}

export interface UserWithStatus extends User {
  friendshipStatus: FriendshipStatus;
}

export interface Friendship {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sender: User;
  receiver: User;
}

export interface Friend {
  friendshipId: string;
  friend: User;
  createdAt: string;
}

export const friendshipService = {
  /**
   * Send a friend request
   */
  async sendFriendRequest(receiverId: string): Promise<Friendship> {
    const response = await api.post('/friends/request', { receiverId });
    return response.data;
  },

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(friendshipId: string): Promise<Friendship> {
    const response = await api.post(`/friends/${friendshipId}/accept`);
    return response.data;
  },

  /**
   * Reject or cancel a friend request
   */
  async rejectFriendRequest(friendshipId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/friends/${friendshipId}`);
    return response.data;
  },

  /**
   * Remove a friend (unfriend)
   */
  async removeFriend(friendId: string): Promise<{ success: boolean }> {
    const response = await api.delete(`/friends/remove/${friendId}`);
    return response.data;
  },

  /**
   * Get all friends
   */
  async getFriends(): Promise<Friend[]> {
    const response = await api.get('/friends');
    return response.data;
  },

  /**
   * Get pending friend requests (received)
   */
  async getPendingRequests(): Promise<Friendship[]> {
    const response = await api.get('/friends/requests/pending');
    return response.data;
  },

  /**
   * Get sent friend requests
   */
  async getSentRequests(): Promise<Friendship[]> {
    const response = await api.get('/friends/requests/sent');
    return response.data;
  },

  /**
   * Get friendship status with another user
   */
  async getFriendshipStatus(userId: string): Promise<FriendshipStatus> {
    const response = await api.get(`/friends/status/${userId}`);
    return response.data;
  },

  /**
   * Search for users by username or email
   */
  async searchUsers(query: string, limit = 20): Promise<UserWithStatus[]> {
    const response = await api.get('/friends/search', {
      params: { query, limit },
    });
    return response.data;
  },
};
