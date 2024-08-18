import { Router } from 'express';
import { createPost } from '../controllers/ postController';
import { getToken } from '../middlewares/authMiddlewares';
const postRouter = Router();

postRouter.post('/create', getToken, createPost);

export default postRouter;

