import { Router } from 'express';
import { incrementPostViews } from '../controllers/viewController';

const router = Router();

// Route pour consulter et incrémenter les vues d'un post
router.post('/:id', incrementPostViews);

export default router;
