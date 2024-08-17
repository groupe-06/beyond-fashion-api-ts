import { Router } from 'express';
import { createPost, updatePost, deletePost } from '../controllers/postController';
import { getToken } from '../middlewares/authMiddlewares';
const router = Router();

router.post('/create', getToken, createPost);
router.put('/update/:id', getToken, updatePost);
router.delete('/delete/:id', getToken, deletePost);

export default router;