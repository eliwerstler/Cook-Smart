import express from 'express';
import { drinkController } from '../controllers/drinkController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// All drink routes require authentication
router.use(authMiddleware);

// Create a new drink
router.post('/', drinkController.createDrink);

// Get feed
router.get('/feed', drinkController.getFeed);

// Get user's drinks
router.get('/user/:userId', drinkController.getUserDrinks);

// Get single drink
router.get('/:id', drinkController.getDrink);

// Like/unlike a drink
router.post('/:id/like', drinkController.likeDrink);
router.delete('/:id/like', drinkController.unlikeDrink);

// Comments
router.post('/:id/comments', drinkController.addComment);
router.get('/:id/comments', drinkController.getComments);

// Delete drink
router.delete('/:id', drinkController.deleteDrink);

export default router;
