import { Router } from 'express';
import { createPost, updatePost, deletePost } from '../controllers/postController';
import { getToken } from '../middlewares/authMiddlewares';
import {validatePostRequest} from '../middlewares/shemaValidator';
import  upload  from '../config/multer';

const router = Router();



router.post('/create',getToken, validatePostRequest, upload.single('content'), createPost);
router.put('/update/:id', getToken,validatePostRequest, updatePost);
router.delete('/delete/:id', getToken, deletePost);

export default router;