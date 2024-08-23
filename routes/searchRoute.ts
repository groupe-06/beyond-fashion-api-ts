import { Router } from 'express';
import { searchPostsByTag, searchArticlesByFirstLetter, searchSellerAndArticles, searchArticlesByCategory, searchArticlesByTag } from '../controllers/searchController';
import { getToken } from '../middlewares/authMiddlewares';

const router = Router();

router.get('/post-by-tag/:tagName', getToken, searchPostsByTag);
router.get('/article-by-letters/:letter', getToken, searchArticlesByFirstLetter);
router.get('/article-by-seller/:sellerId', getToken, searchSellerAndArticles);
router.get('/article-by-category/:categoryName', getToken, searchArticlesByCategory)
router.get('/article-by-tag/:tagName', getToken, searchArticlesByTag);
export default router;
