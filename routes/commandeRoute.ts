import { Router } from 'express';
import { getToken } from '../middlewares/authMiddlewares';
import { createCommande,deleteCommandeArticle,completePurchase,markCommandeAsRecupere,cancelCommande} from '../controllers/commandeController';
const commandeRouter = Router();

// Appliquer le middleware getToken uniquement sur cette route
commandeRouter.post('/commande', getToken, createCommande);
commandeRouter.delete('/delete-article', deleteCommandeArticle);
commandeRouter.post('/complete-purchase', getToken, completePurchase);
commandeRouter.post('/Taked',getToken, markCommandeAsRecupere);
commandeRouter.post('/Cancel',getToken, cancelCommande);
export default commandeRouter;
