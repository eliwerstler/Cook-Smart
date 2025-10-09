import { Request, Response } from 'express';
import { friendshipService } from '../services/friendshipService';

export const friendshipController = {
  /**
   * POST /api/friends/request
   * Send a friend request
   */
  async sendFriendRequest(req: Request, res: Response) {
    try {
      const senderId = (req as any).user.id;
      const { receiverId } = req.body;

      if (!receiverId || typeof receiverId !== 'string') {
        return res.status(400).json({ error: 'receiverId is required' });
      }

      const friendship = await friendshipService.sendFriendRequest(senderId, receiverId);
      res.status(201).json(friendship);
    } catch (error: any) {
      console.error('Send friend request error:', error);
      if (error.message.includes('Cannot') || error.message.includes('Already')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Failed to send friend request' });
    }
  },

  /**
   * POST /api/friends/:friendshipId/accept
   * Accept a friend request
   */
  async acceptFriendRequest(req: Request, res: Response) {
    try {
      const { friendshipId } = req.params;
      const userId = (req as any).user.id;

      const friendship = await friendshipService.acceptFriendRequest(friendshipId, userId);
      res.json(friendship);
    } catch (error: any) {
      console.error('Accept friend request error:', error);
      if (error.message === 'Friend request not found') {
        return res.status(404).json({ error: 'Friend request not found' });
      }
      if (error.message.includes('Not authorized')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Failed to accept friend request' });
    }
  },

  /**
   * DELETE /api/friends/:friendshipId
   * Reject or cancel a friend request
   */
  async rejectFriendRequest(req: Request, res: Response) {
    try {
      const { friendshipId } = req.params;
      const userId = (req as any).user.id;

      const result = await friendshipService.rejectFriendRequest(friendshipId, userId);
      res.json(result);
    } catch (error: any) {
      console.error('Reject friend request error:', error);
      if (error.message === 'Friend request not found') {
        return res.status(404).json({ error: 'Friend request not found' });
      }
      if (error.message.includes('Not authorized')) {
        return res.status(403).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Failed to reject friend request' });
    }
  },

  /**
   * DELETE /api/friends/remove/:friendId
   * Remove a friend (unfriend)
   */
  async removeFriend(req: Request, res: Response) {
    try {
      const { friendId } = req.params;
      const userId = (req as any).user.id;

      const result = await friendshipService.removeFriend(userId, friendId);
      res.json(result);
    } catch (error: any) {
      console.error('Remove friend error:', error);
      if (error.message === 'Friendship not found') {
        return res.status(404).json({ error: 'Friendship not found' });
      }
      res.status(500).json({ error: error.message || 'Failed to remove friend' });
    }
  },

  /**
   * GET /api/friends
   * Get all friends for the current user
   */
  async getFriends(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const friends = await friendshipService.getFriends(userId);
      res.json(friends);
    } catch (error: any) {
      console.error('Get friends error:', error);
      res.status(500).json({ error: error.message || 'Failed to get friends' });
    }
  },

  /**
   * GET /api/friends/requests/pending
   * Get pending friend requests (received by user)
   */
  async getPendingRequests(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const requests = await friendshipService.getPendingRequests(userId);
      res.json(requests);
    } catch (error: any) {
      console.error('Get pending requests error:', error);
      res.status(500).json({ error: error.message || 'Failed to get pending requests' });
    }
  },

  /**
   * GET /api/friends/requests/sent
   * Get sent friend requests
   */
  async getSentRequests(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const requests = await friendshipService.getSentRequests(userId);
      res.json(requests);
    } catch (error: any) {
      console.error('Get sent requests error:', error);
      res.status(500).json({ error: error.message || 'Failed to get sent requests' });
    }
  },

  /**
   * GET /api/friends/status/:userId
   * Get friendship status with another user
   */
  async getFriendshipStatus(req: Request, res: Response) {
    try {
      const currentUserId = (req as any).user.id;
      const { userId } = req.params;

      const status = await friendshipService.getFriendshipStatus(currentUserId, userId);
      res.json(status);
    } catch (error: any) {
      console.error('Get friendship status error:', error);
      res.status(500).json({ error: error.message || 'Failed to get friendship status' });
    }
  },

  /**
   * GET /api/friends/search
   * Search for users by username or email
   */
  async searchUsers(req: Request, res: Response) {
    try {
      const currentUserId = (req as any).user.id;
      const { query } = req.query;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const users = await friendshipService.searchUsers(query.trim(), currentUserId, limit);
      res.json(users);
    } catch (error: any) {
      console.error('Search users error:', error);
      res.status(500).json({ error: error.message || 'Failed to search users' });
    }
  },
};
