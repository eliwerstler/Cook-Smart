import api from './api';

export interface CreateDrinkData {
  drinkType: string;
  alcoholContent: number;
  caption?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
}

export interface Drink {
  id: string;
  userId: string;
  sessionId: string;
  drinkType: string;
  alcoholContent: number;
  caption?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  isLiked?: boolean;
  _count?: {
    likes: number;
    comments: number;
  };
}

export interface Comment {
  id: string;
  drinkId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export const drinkService = {
  /**
   * Create a new drink post
   */
  async createDrink(data: CreateDrinkData): Promise<{ drink: Drink; session: any }> {
    const response = await api.post('/drinks', data);
    return response.data;
  },

  /**
   * Get feed of drinks from friends
   */
  async getFeed(limit = 20, offset = 0): Promise<Drink[]> {
    const response = await api.get('/drinks/feed', {
      params: { limit, offset },
    });
    return response.data;
  },

  /**
   * Get a single drink by ID
   */
  async getDrink(drinkId: string): Promise<Drink> {
    const response = await api.get(`/drinks/${drinkId}`);
    return response.data;
  },

  /**
   * Get drinks for a specific user
   */
  async getUserDrinks(userId: string, limit = 20, offset = 0): Promise<Drink[]> {
    const response = await api.get(`/drinks/user/${userId}`, {
      params: { limit, offset },
    });
    return response.data;
  },

  /**
   * Like a drink
   */
  async likeDrink(drinkId: string): Promise<void> {
    await api.post(`/drinks/${drinkId}/like`);
  },

  /**
   * Unlike a drink
   */
  async unlikeDrink(drinkId: string): Promise<void> {
    await api.delete(`/drinks/${drinkId}/like`);
  },

  /**
   * Add a comment to a drink
   */
  async addComment(drinkId: string, text: string): Promise<Comment> {
    const response = await api.post(`/drinks/${drinkId}/comments`, { text });
    return response.data;
  },

  /**
   * Get comments for a drink
   */
  async getComments(drinkId: string, limit = 50, offset = 0): Promise<Comment[]> {
    const response = await api.get(`/drinks/${drinkId}/comments`, {
      params: { limit, offset },
    });
    return response.data;
  },

  /**
   * Delete a drink
   */
  async deleteDrink(drinkId: string): Promise<void> {
    await api.delete(`/drinks/${drinkId}`);
  },
};
