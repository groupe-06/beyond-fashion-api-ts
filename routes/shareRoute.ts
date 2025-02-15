import express from 'express';
import sharePost from '../controllers/shareController';
import { getToken } from "../middlewares/authMiddlewares";


const router = express.Router();

router.post('/share/:postId/to/:targetUserId', getToken, sharePost);

export default router;
