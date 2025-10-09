import api from './api';
import { Drink } from './drinkService';

export interface Session {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  totalDrinks: number;
  totalStandards: number;
  bph: number;
  peakBph: number;
  avgBph: number;
  createdAt: string;
  updatedAt: string;
}

export interface SessionWithDrinks {
  session: Session;
  drinks: Drink[];
}

export const sessionService = {
  /**
   * Get or create user's active session
   */
  async getActiveSession(): Promise<SessionWithDrinks> {
    const response = await api.get('/sessions/active');
    return response.data;
  },

  /**
   * Manually end the current session
   */
  async endSession(): Promise<Session> {
    const response = await api.post('/sessions/end');
    return response.data;
  },

  /**
   * Get user's session history
   */
  async getSessionHistory(limit = 20, offset = 0): Promise<Session[]> {
    const response = await api.get('/sessions/history', {
      params: { limit, offset },
    });
    return response.data;
  },

  /**
   * Get a specific session by ID
   */
  async getSession(sessionId: string): Promise<SessionWithDrinks> {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },
};
