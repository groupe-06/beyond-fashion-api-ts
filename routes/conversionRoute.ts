import { Router } from 'express';
import { createConversion } from '../controllers/conversionController';

const router = Router();

router.post('/create', createConversion);

export default router;