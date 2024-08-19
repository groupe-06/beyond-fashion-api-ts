import { Router } from 'express';
import { followUser, unfollowUser } from '../controllers/userFollowController';
import { getToken } from '../middlewares/authMiddlewares';

const router = Router();

router.post('/follow/:followingId', getToken, followUser);
router.delete('/unfollow/:followingId', getToken, unfollowUser);


export default router; 