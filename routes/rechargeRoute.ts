// routes/userRoutes.js
import {Router} from 'express';
import { rechargeAmount, creditRecharge } from '../controllers/rechargeController';
import { getToken } from '../middlewares/authMiddlewares';

const router = Router();

router.post('/create', getToken, rechargeAmount);
router.post('/credit-recharge', getToken, creditRecharge);

export default router;
