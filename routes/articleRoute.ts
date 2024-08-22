import { Router } from 'express';
import { createArticle, updateArticle, deleteArticle } from '../controllers/articleController';
import { verifyToken } from '../middlewares/tokenMiddleware';

const router = Router();

router.post('/', verifyToken, createArticle);
router.put('/:articleId', verifyToken, updateArticle);
router.delete('/:articleId', verifyToken, deleteArticle);

export default router;
