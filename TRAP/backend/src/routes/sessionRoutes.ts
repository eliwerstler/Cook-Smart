import express from 'express';
import { sessionController } from '../controllers/sessionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// All session routes require authentication
router.use(authMiddleware);

// Get active session
router.get('/active', sessionController.getActiveSession);

// End current session
router.post('/end', sessionController.endSession);

// Get session history
router.get('/history', sessionController.getSessionHistory);

// Get specific session
router.get('/:id', sessionController.getSession);

export default router;
