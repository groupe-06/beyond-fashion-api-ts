import { Router } from 'express';
import { followUser, unfollowUser, getUnfollowedTailors,getFollowedUsers,getFollowedUsersbis } from '../controllers/userFollowController';
import { getToken } from '../middlewares/authMiddlewares';

const router = Router();

router.post('/follow/:followingId', getToken, followUser);
router.delete('/unfollow/:followingId', getToken, unfollowUser);
router.get('/getUnfollowedTailors', getToken, getUnfollowedTailors);
router.get('/getFollowedUsers', getToken, getFollowedUsers);
router.get('/getFollowedUsers/:userId', getFollowedUsersbis);

export default router; 
