import { Router } from 'express';
import { createCategory, deleteCategory } from '../controllers/CategoryController';
import { getToken } from '../middlewares/authMiddlewares';

const router = Router();

router.post('/', getToken, createCategory);
router.delete('/:categoryId', getToken, deleteCategory);

export default router;
