import api from './api';
import * as SecureStore from 'expo-secure-store';
import { User, AuthResponse, RegisterRequest, LoginRequest } from '../../../shared/types';

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);

    // Store token securely
    if (response.data.token) {
      await SecureStore.setItemAsync('authToken', response.data.token);
    }

    return response.data;
  },

  /**
   * Login existing user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);

    // Store token securely
    if (response.data.token) {
      await SecureStore.setItemAsync('authToken', response.data.token);
    }

    return response.data;
  },

  /**
   * Get current user from stored token
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<{ user: User }>('/auth/me');
    return response.data.user;
  },

  /**
   * Logout user (clear stored token)
   */
  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('authToken');
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('authToken');
    return !!token;
  },
};
