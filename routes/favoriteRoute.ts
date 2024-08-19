import { Router } from 'express';
import { toggleFavorite, allFavorites, removeFavorite } from '../controllers/favoriteController';
import { getToken } from "../middlewares/authMiddlewares";


const router = Router();

router.post('/add-to-favorites/:postId', getToken, toggleFavorite);
router.get('/get-all-favorites', getToken, allFavorites);
router.delete('/remove-favorite/:id', getToken, removeFavorite);

export default router;
