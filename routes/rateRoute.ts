import express from 'express';
import { createRate, allRates, updateRate, deleteRate } from '../controllers/rateController';
import { getToken } from "../middlewares/authMiddlewares";


const router = express.Router();

router.post('/create-rate/:postId', getToken, createRate);
router.get('/getAll-rates', getToken, allRates);
router.put('/update-rate/:id', getToken, updateRate);
router.delete('/delete-rate/:id', getToken, deleteRate);

export default router;
