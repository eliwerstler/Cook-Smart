import { Request, Response } from 'express';
import { authService } from '../services/authService';

export const authController = {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;

      // Validation
      if (!username || !email || !password) {
        return res.status(400).json({
          error: 'Username, email, and password are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: 'Password must be at least 6 characters'
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Invalid email format'
        });
      }

      // Username validation (alphanumeric and underscore only)
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({
          error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
        });
      }

      const result = await authService.register({ username, email, password });

      return res.status(201).json({
        message: 'User registered successfully',
        user: result.user,
        token: result.token
      });

    } catch (error: any) {
      console.error('Registration error:', error);

      if (error.message.includes('already')) {
        return res.status(409).json({ error: error.message });
      }

      return res.status(500).json({
        error: 'Registration failed. Please try again.'
      });
    }
  },

  /**
   * POST /api/auth/login
   * Login existing user
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required'
        });
      }

      const result = await authService.login({ email, password });

      return res.status(200).json({
        message: 'Login successful',
        user: result.user,
        token: result.token
      });

    } catch (error: any) {
      console.error('Login error:', error);

      if (error.message.includes('Invalid')) {
        return res.status(401).json({ error: error.message });
      }

      return res.status(500).json({
        error: 'Login failed. Please try again.'
      });
    }
  },

  /**
   * GET /api/auth/me
   * Get current user from token
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      // User is already attached to req by auth middleware
      const user = (req as any).user;

      return res.status(200).json({ user });

    } catch (error: any) {
      console.error('Get current user error:', error);
      return res.status(500).json({
        error: 'Failed to get user information'
      });
    }
  }
};
