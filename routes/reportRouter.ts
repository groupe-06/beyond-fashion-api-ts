import { Router } from 'express';
import { reportPost } from '../controllers/reportController';
import { getToken } from '../middlewares/authMiddlewares';

const reportRouter = Router();

// Route pour signaler un post
reportRouter.post('/report',getToken, reportPost);

export default reportRouter;
