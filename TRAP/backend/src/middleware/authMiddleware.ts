import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';

/**
 * Middleware to protect routes - requires valid JWT token
 * Attaches user to request object
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required. Please provide a valid token.'
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    // Verify token and get user
    const user = await authService.verifyToken(token);

    // Attach user to request object
    (req as any).user = user;

    next();

  } catch (error: any) {
    console.error('Auth middleware error:', error);

    if (error.message.includes('expired')) {
      return res.status(401).json({
        error: 'Token expired. Please log in again.'
      });
    }

    return res.status(401).json({
      error: 'Invalid authentication token.'
    });
  }
};

/**
 * Optional auth middleware - doesn't block request if no token
 * Just attaches user if token is present
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = await authService.verifyToken(token);
      (req as any).user = user;
    }

    next();

  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};
