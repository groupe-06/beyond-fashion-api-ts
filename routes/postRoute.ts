import { Router } from 'express';
import { createPost } from '../controllers/postController';
import { getToken } from '../middlewares/authMiddlewares';
import  upload  from '../config/multer';

const router = Router();



router.post('/create',upload.single('content'), getToken, createPost);

export default router;