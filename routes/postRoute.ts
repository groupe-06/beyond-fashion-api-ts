import { Router } from 'express';
import { createPost, updatePost, deletePost } from '../controllers/postController';
import { getToken } from '../middlewares/authMiddlewares';
import {validatePostRequest} from '../middlewares/shemaValidator';
import  upload  from '../config/multer';
import { getUserPosts } from '../controllers/postController';
import { getAllPosts } from '../controllers/postController';


const router = Router();

router.post('/create',getToken, upload.single('file'), createPost);
router.put('/update/:id', getToken,validatePostRequest, updatePost);
router.delete('/delete/:id', getToken, deletePost);
router.get('/get-post',getToken, getUserPosts);
router.get('/getAllPost',getToken, getAllPosts);



export default router;
