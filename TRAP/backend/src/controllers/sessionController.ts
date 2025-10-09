import { Request, Response } from 'express';
import { sessionService } from '../services/sessionService';
import { drinkService } from '../services/drinkService';

export const sessionController = {
  /**
   * GET /api/sessions/active
   * Get or create user's active session
   */
  async getActiveSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      const session = await sessionService.getOrCreateActiveSession(userId);

      // Get drinks for this session
      const drinks = await drinkService.getSessionDrinks(session.id);

      res.json({
        session,
        drinks,
      });
    } catch (error: any) {
      console.error('Get active session error:', error);
      res.status(500).json({ error: error.message || 'Failed to get active session' });
    }
  },

  /**
   * POST /api/sessions/end
   * Manually end the current session
   */
  async endSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;

      // Find active session
      const activeSession = await sessionService.getOrCreateActiveSession(userId);

      if (activeSession.endTime) {
        return res.status(400).json({ error: 'Session already ended' });
      }

      // End the session
      const endedSession = await sessionService.endSession(activeSession.id);

      res.json(endedSession);
    } catch (error: any) {
      console.error('End session error:', error);
      res.status(500).json({ error: error.message || 'Failed to end session' });
    }
  },

  /**
   * GET /api/sessions/history
   * Get user's session history
   */
  async getSessionHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const sessions = await sessionService.getUserSessions(userId, limit, offset);

      res.json(sessions);
    } catch (error: any) {
      console.error('Get session history error:', error);
      res.status(500).json({ error: error.message || 'Failed to get session history' });
    }
  },

  /**
   * GET /api/sessions/:id
   * Get a specific session by ID
   */
  async getSession(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user.id;

      const session = await sessionService.getSessionById(id);

      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Check if user is authorized to view this session
      if (session.userId !== userId) {
        return res.status(403).json({ error: 'Not authorized to view this session' });
      }

      // Get drinks for this session
      const drinks = await drinkService.getSessionDrinks(id);

      res.json({
        session,
        drinks,
      });
    } catch (error: any) {
      console.error('Get session error:', error);
      res.status(500).json({ error: error.message || 'Failed to get session' });
    }
  },
};
