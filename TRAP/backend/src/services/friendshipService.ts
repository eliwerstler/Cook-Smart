import prisma from '../utils/prisma';

export const friendshipService = {
  /**
   * Send a friend request
   */
  async sendFriendRequest(senderId: string, receiverId: string) {
    // Check if users are the same
    if (senderId === receiverId) {
      throw new Error('Cannot send friend request to yourself');
    }

    // Check if friendship already exists (in either direction)
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        throw new Error('Already friends with this user');
      }
      if (existingFriendship.status === 'pending') {
        throw new Error('Friend request already pending');
      }
      if (existingFriendship.status === 'blocked') {
        throw new Error('Cannot send friend request to this user');
      }
    }

    // Create new friend request
    const friendship = await prisma.friendship.create({
      data: {
        senderId,
        receiverId,
        status: 'pending',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePhoto: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });

    return friendship;
  },

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(friendshipId: string, userId: string) {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new Error('Friend request not found');
    }

    // Only the receiver can accept
    if (friendship.receiverId !== userId) {
      throw new Error('Not authorized to accept this friend request');
    }

    if (friendship.status !== 'pending') {
      throw new Error('Friend request is not pending');
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'accepted' },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePhoto: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePhoto: true,
          },
        },
      },
    });

    return updatedFriendship;
  },

  /**
   * Reject or cancel a friend request
   */
  async rejectFriendRequest(friendshipId: string, userId: string) {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new Error('Friend request not found');
    }

    // Receiver can reject, sender can cancel
    if (friendship.receiverId !== userId && friendship.senderId !== userId) {
      throw new Error('Not authorized to modify this friend request');
    }

    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return { success: true };
  },

  /**
   * Remove a friend (unfriend)
   */
  async removeFriend(userId: string, friendId: string) {
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
        status: 'accepted',
      },
    });

    if (!friendship) {
      throw new Error('Friendship not found');
    }

    await prisma.friendship.delete({
      where: { id: friendship.id },
    });

    return { success: true };
  },

  /**
   * Get all friends for a user
   */
  async getFriends(userId: string) {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
        status: 'accepted',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePhoto: true,
            bio: true,
            totalStandards: true,
            avgBph: true,
            peakBph: true,
            lifetimeDrinks: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePhoto: true,
            bio: true,
            totalStandards: true,
            avgBph: true,
            peakBph: true,
            lifetimeDrinks: true,
          },
        },
      },
    });

    // Map to return just the friend (not the current user)
    return friendships.map((f) => ({
      friendshipId: f.id,
      friend: f.senderId === userId ? f.receiver : f.sender,
      createdAt: f.createdAt,
    }));
  },

  /**
   * Get pending friend requests (received by user)
   */
  async getPendingRequests(userId: string) {
    const requests = await prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: 'pending',
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePhoto: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requests;
  },

  /**
   * Get sent friend requests (sent by user)
   */
  async getSentRequests(userId: string) {
    const requests = await prisma.friendship.findMany({
      where: {
        senderId: userId,
        status: 'pending',
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePhoto: true,
            bio: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return requests;
  },

  /**
   * Get friendship status between two users
   */
  async getFriendshipStatus(userId: string, otherUserId: string) {
    if (userId === otherUserId) {
      return { status: 'self' };
    }

    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
    });

    if (!friendship) {
      return { status: 'none' };
    }

    return {
      status: friendship.status,
      friendshipId: friendship.id,
      isSender: friendship.senderId === userId,
    };
  },

  /**
   * Search for users by username or email
   */
  async searchUsers(query: string, currentUserId: string, limit = 20) {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
          { id: { not: currentUserId } }, // Exclude current user
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
        profilePhoto: true,
        bio: true,
        lifetimeDrinks: true,
        totalStandards: true,
        avgBph: true,
        peakBph: true,
      },
      take: limit,
    });

    // For each user, get friendship status
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        const status = await this.getFriendshipStatus(currentUserId, user.id);
        return {
          ...user,
          friendshipStatus: status,
        };
      })
    );

    return usersWithStatus;
  },
};
