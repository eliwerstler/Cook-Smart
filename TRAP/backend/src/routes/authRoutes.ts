import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Public route
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Login existing user
 * Public route
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/me
 * Get current user from token
 * Protected route - requires authentication
 */
router.get('/me', authMiddleware, authController.getCurrentUser);

export default router;
