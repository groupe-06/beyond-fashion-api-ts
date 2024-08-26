import { Router } from 'express';
import { createCategory, deleteCategory } from '../controllers/CategoryController';
import { getToken } from '../middlewares/authMiddlewares';

const router = Router();

router.post('/create', createCategory);
router.delete('/:categoryId', deleteCategory);

export default router;