import { Router } from 'express';
import { getToken } from '../middlewares/authMiddlewares';
import { createCommande,deleteCommandeArticle,completePurchase} from '../controllers/commandeController';
const commandeRouter = Router();

// Appliquer le middleware getToken uniquement sur cette route
commandeRouter.post('/commande', getToken, createCommande);
commandeRouter.delete('/delete-article', deleteCommandeArticle);
commandeRouter.post('/complete-purchase', getToken, completePurchase);
export default commandeRouter;
