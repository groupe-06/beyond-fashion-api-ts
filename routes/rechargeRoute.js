"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/userRoutes.js
const express_1 = require("express");
const rechargeController_1 = require("../controllers/rechargeController");
const authMiddlewares_1 = require("../middlewares/authMiddlewares");
const router = (0, express_1.Router)();
router.post('/create', authMiddlewares_1.getToken, rechargeController_1.rechargeAmount);
router.post('/credit-recharge', authMiddlewares_1.getToken, rechargeController_1.creditRecharge);
exports.default = router;
