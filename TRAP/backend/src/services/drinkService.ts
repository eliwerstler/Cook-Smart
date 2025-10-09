import prisma from '../utils/prisma';
import { sessionService } from './sessionService';

interface CreateDrinkInput {
  userId: string;
  drinkType: string;
  alcoholContent: number;
  caption?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
}

export const drinkService = {
  /**
   * Create a new drink post
   * Automatically handles session creation/updating and BPH calculations
   */
  async createDrink(input: CreateDrinkInput) {
    const { userId, drinkType, alcoholContent, caption, photoUrl, latitude, longitude, location } = input;

    // Get or create active session for user
    const session = await sessionService.getOrCreateActiveSession(userId);

    // Create the drink
    // Note: photoUrl is required in schema, so we use a placeholder if none provided
    const drink = await prisma.drink.create({
      data: {
        userId,
        sessionId: session.id,
        drinkType,
        alcoholContent,
        caption,
        photoUrl: photoUrl || 'https://via.placeholder.com/400', // Placeholder until Cloudinary integration
        latitude,
        longitude,
        location,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    // Update session stats (calculates live BPH)
    const updatedSession = await sessionService.updateSessionStats(session.id);

    // Update user lifetime stats
    await sessionService.updateUserStats(userId);

    return {
      drink,
      session: updatedSession,
    };
  },

  /**
   * Get a single drink by ID with user info and like/comment counts
   */
  async getDrinkById(drinkId: string, requestingUserId?: string) {
    const drink = await prisma.drink.findUnique({
      where: { id: drinkId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        likes: requestingUserId
          ? {
              where: { userId: requestingUserId },
              select: { id: true },
            }
          : false,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!drink) {
      throw new Error('Drink not found');
    }

    return {
      ...drink,
      isLiked: requestingUserId ? drink.likes && drink.likes.length > 0 : false,
    };
  },

  /**
   * Get feed of drinks from friends and followed users
   * Ordered by most recent first
   */
  async getFeed(userId: string, limit = 20, offset = 0) {
    // Get user's friends (both directions)
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: 'accepted',
      },
      select: {
        senderId: true,
        receiverId: true,
      },
    });

    // Extract friend IDs
    const friendIds = friendships.map((f) => (f.senderId === userId ? f.receiverId : f.senderId));

    // Include user's own drinks in feed
    const userIds = [...friendIds, userId];

    // Get drinks
    const drinks = await prisma.drink.findMany({
      where: {
        userId: { in: userIds },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return drinks.map((drink) => ({
      ...drink,
      isLiked: drink.likes.length > 0,
    }));
  },

  /**
   * Get all drinks for a specific user
   */
  async getUserDrinks(userId: string, requestingUserId?: string, limit = 20, offset = 0) {
    const drinks = await prisma.drink.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        likes: requestingUserId
          ? {
              where: { userId: requestingUserId },
              select: { id: true },
            }
          : false,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return drinks.map((drink) => ({
      ...drink,
      isLiked: requestingUserId && drink.likes ? drink.likes.length > 0 : false,
    }));
  },

  /**
   * Get drinks for a specific session
   */
  async getSessionDrinks(sessionId: string) {
    const drinks = await prisma.drink.findMany({
      where: { sessionId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return drinks;
  },

  /**
   * Like a drink
   */
  async likeDrink(drinkId: string, userId: string) {
    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_drinkId: {
          userId,
          drinkId,
        },
      },
    });

    if (existingLike) {
      throw new Error('Already liked this drink');
    }

    const like = await prisma.like.create({
      data: {
        userId,
        drinkId,
      },
    });

    return like;
  },

  /**
   * Unlike a drink
   */
  async unlikeDrink(drinkId: string, userId: string) {
    const like = await prisma.like.findUnique({
      where: {
        userId_drinkId: {
          userId,
          drinkId,
        },
      },
    });

    if (!like) {
      throw new Error('Like not found');
    }

    await prisma.like.delete({
      where: {
        userId_drinkId: {
          userId,
          drinkId,
        },
      },
    });

    return { success: true };
  },

  /**
   * Add a comment to a drink
   */
  async addComment(drinkId: string, userId: string, text: string) {
    const comment = await prisma.comment.create({
      data: {
        drinkId,
        userId,
        content: text,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return comment;
  },

  /**
   * Get comments for a drink
   */
  async getComments(drinkId: string, limit = 50, offset = 0) {
    const comments = await prisma.comment.findMany({
      where: { drinkId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
      skip: offset,
    });

    return comments;
  },

  /**
   * Delete a drink (only by owner)
   */
  async deleteDrink(drinkId: string, userId: string) {
    const drink = await prisma.drink.findUnique({
      where: { id: drinkId },
    });

    if (!drink) {
      throw new Error('Drink not found');
    }

    if (drink.userId !== userId) {
      throw new Error('Not authorized to delete this drink');
    }

    await prisma.drink.delete({
      where: { id: drinkId },
    });

    // Update session stats after deletion
    await sessionService.updateSessionStats(drink.sessionId);

    // Update user lifetime stats
    await sessionService.updateUserStats(userId);

    return { success: true };
  },
};
