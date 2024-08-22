import { Router } from 'express';
import { getToken } from '../middlewares/authMiddlewares';
import { createCommande } from '../controllers/commandeController';

const router = Router();

// Appliquer le middleware getToken uniquement sur cette route
router.post('/commande', getToken, createCommande);

export default router;
