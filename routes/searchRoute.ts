import { Router } from 'express';
import { searchPostsByTag, searchArticlesByFirstLetter, searchSellerAndArticles, searchArticlesByCategory, searchArticlesByTag } from '../controllers/searchController';
import { getToken } from '../middlewares/authMiddlewares';

const router = Router();

router.get('/post-by-tag/:tagName', searchPostsByTag);
router.get('/article-by-letters/:letter', searchArticlesByFirstLetter);
router.get('/article-by-seller/:sellerId', searchSellerAndArticles);
router.get('/article-by-category/:categoryName', searchArticlesByCategory)
router.get('/article-by-tag/:tagName', searchArticlesByTag);
export default router;
