"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// unitRoutes.ts
const express_1 = require("express");
const unitController_1 = require("../controllers/unitController");
const authMiddlewares_1 = require("../middlewares/authMiddlewares");
const router = (0, express_1.Router)();
router.post('/create', authMiddlewares_1.getToken, unitController_1.createUnit);
exports.default = router;
