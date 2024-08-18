import { Router } from 'express';
import { createPost, updatePost, deletePost } from '../controllers/postController';
import { getToken } from '../middlewares/authMiddlewares';
import {validatePostRequest} from '../middlewares/shemaValidator';
const router = Router();

router.post('/create', getToken, validatePostRequest, createPost);
router.put('/update/:id', getToken,validatePostRequest, updatePost);
router.delete('/delete/:id', getToken, deletePost);

export default router;