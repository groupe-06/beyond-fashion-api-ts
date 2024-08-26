// unitRoutes.ts
import { Router } from 'express';
import { createUnit } from '../controllers/unitController';
import { getToken } from '../middlewares/authMiddlewares';

const router = Router();

router.post('/create', getToken, createUnit);

export default router;