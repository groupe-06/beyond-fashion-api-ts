import { Router } from 'express';
import { searchPostsByTag, searchArticlesByFirstLetter } from '../controllers/searchController';
import { getToken } from '../middlewares/authMiddlewares';

const router = Router();

router.get('/post-by-tag/:tagName', getToken, searchPostsByTag);
router.get('/article-by-letters/:letter', getToken, searchArticlesByFirstLetter);


export default router;
