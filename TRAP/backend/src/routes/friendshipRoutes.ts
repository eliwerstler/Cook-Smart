import { Router } from 'express';
import { friendshipController } from '../controllers/friendshipController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// All friendship routes require authentication
router.use(authMiddleware);

// Send friend request
router.post('/request', friendshipController.sendFriendRequest);

// Accept friend request
router.post('/:friendshipId/accept', friendshipController.acceptFriendRequest);

// Reject or cancel friend request
router.delete('/:friendshipId', friendshipController.rejectFriendRequest);

// Remove friend (unfriend)
router.delete('/remove/:friendId', friendshipController.removeFriend);

// Get all friends
router.get('/', friendshipController.getFriends);

// Get pending friend requests (received)
router.get('/requests/pending', friendshipController.getPendingRequests);

// Get sent friend requests
router.get('/requests/sent', friendshipController.getSentRequests);

// Get friendship status with another user
router.get('/status/:userId', friendshipController.getFriendshipStatus);

// Search for users
router.get('/search', friendshipController.searchUsers);

export default router;
