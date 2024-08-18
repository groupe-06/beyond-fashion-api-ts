import express from 'express';
import { likePost } from '../controllers/likeController';
import { dislikePost } from '../controllers/dislikeController';
import { getToken } from '../middlewares/authMiddlewares';
const reactionRouter = express.Router();

// Like route
reactionRouter.post('/like',getToken, likePost);

// Dislike route
reactionRouter.post('/dislike',getToken, dislikePost);

export default reactionRouter;
