// routes/userRoutes.js
import express from 'express';
import { rechargeCredit } from '../controllers/recharController';
import { getToken } from '../middlewares/authMiddlewares';

const Rechargerouter = express.Router();

// Protect the route with authentication middleware
Rechargerouter.post('/recharge', getToken, rechargeCredit);

export default Rechargerouter;
