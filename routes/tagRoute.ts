import { Router } from 'express';
import {createTag} from '../controllers/tagController';
import { getToken } from '../middlewares/authMiddlewares';


const router = Router();

router.post('/create', getToken, createTag);
export default router;

