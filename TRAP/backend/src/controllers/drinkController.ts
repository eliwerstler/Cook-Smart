import { Request, Response } from 'express';
import { drinkService } from '../services/drinkService';

export const drinkController = {
  /**
   * POST /api/drinks
   * Create a new drink post
   */
  async createDrink(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { drinkType, alcoholContent, caption, photoUrl, latitude, longitude, location } = req.body;

      // Validation
      if (!drinkType || typeof drinkType !== 'string') {
        return res.status(400).json({ error: 'drinkType is required and must be a string' });
      }

      if (!alcoholContent || typeof alcoholContent !== 'number' || alcoholContent <= 0) {
        return res.status(400).json({ error: 'alcoholContent is required and must be a positive number' });
      }

      if (caption && typeof caption !== 'string') {
        return res.status(400).json({ error: 'caption must be a string' });
      }

      if (photoUrl && typeof photoUrl !== 'string') {
        return res.status(400).json({ error: 'photoUrl must be a string' });
      }

      const result = await drinkService.createDrink({
        userId,
        drinkType,
        alcoholContent,
        caption,
        photoUrl,
        latitude,
        longitude,
        location,
      });

      res.status(201).json(result);
    } catch (error: any) {
      console.error('Create drink error:', error);
      res.status(500).json({ error: error.message || 'Failed to create drink' });
    }
  },

  /**
   * GET /api/drinks/:id
   * Get a single drink by ID
   */
  async getDrink(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const drink = await drinkService.getDrinkById(id, userId);
      res.json(drink);
    } catch (error: any) {
      console.error('Get drink error:', error);
      if (error.message === 'Drink not found') {
        return res.status(404).json({ error: 'Drink not found' });
      }
      res.status(500).json({ error: error.message || 'Failed to get drink' });
    }
  },

  /**
   * GET /api/drinks/feed
   * Get feed of drinks from friends
   */
  async getFeed(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const drinks = await drinkService.getFeed(userId, limit, offset);
      res.json(drinks);
    } catch (error: any) {
      console.error('Get feed error:', error);
      res.status(500).json({ error: error.message || 'Failed to get feed' });
    }
  },

  /**
   * GET /api/drinks/user/:userId
   * Get all drinks for a specific user
   */
  async getUserDrinks(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const requestingUserId = (req as any).user?.id;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const drinks = await drinkService.getUserDrinks(userId, requestingUserId, limit, offset);
      res.json(drinks);
    } catch (error: any) {
      console.error('Get user drinks error:', error);
      res.status(500).json({ error: error.message || 'Failed to get user drinks' });
    }
  },

  /**
   * POST /api/drinks/:id/like
   * Like a drink
   */
  async likeDrink(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const like = await drinkService.likeDrink(id, userId);
      res.status(201).json(like);
    } catch (error: any) {
      console.error('Like drink error:', error);
      if (error.message === 'Already liked this drink') {
        return res.status(400).json({ error: 'Already liked this drink' });
      }
      res.status(500).json({ error: error.message || 'Failed to like drink' });
    }
  },

  /**
   * DELETE /api/drinks/:id/like
   * Unlike a drink
   */
  async unlikeDrink(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const result = await drinkService.unlikeDrink(id, userId);
      res.json(result);
    } catch (error: any) {
      console.error('Unlike drink error:', error);
      if (error.message === 'Like not found') {
        return res.status(404).json({ error: 'Like not found' });
      }
      res.status(500).json({ error: error.message || 'Failed to unlike drink' });
    }
  },

  /**
   * POST /api/drinks/:id/comments
   * Add a comment to a drink
   */
  async addComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;
      const { text } = req.body;

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Comment text is required' });
      }

      const comment = await drinkService.addComment(id, userId, text.trim());
      res.status(201).json(comment);
    } catch (error: any) {
      console.error('Add comment error:', error);
      res.status(500).json({ error: error.message || 'Failed to add comment' });
    }
  },

  /**
   * GET /api/drinks/:id/comments
   * Get comments for a drink
   */
  async getComments(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const comments = await drinkService.getComments(id, limit, offset);
      res.json(comments);
    } catch (error: any) {
      console.error('Get comments error:', error);
      res.status(500).json({ error: error.message || 'Failed to get comments' });
    }
  },

  /**
   * DELETE /api/drinks/:id
   * Delete a drink (only by owner)
   */
  async deleteDrink(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const result = await drinkService.deleteDrink(id, userId);
      res.json(result);
    } catch (error: any) {
      console.error('Delete drink error:', error);
      if (error.message === 'Drink not found') {
        return res.status(404).json({ error: 'Drink not found' });
      }
      if (error.message === 'Not authorized to delete this drink') {
        return res.status(403).json({ error: 'Not authorized to delete this drink' });
      }
      res.status(500).json({ error: error.message || 'Failed to delete drink' });
    }
  },
};
