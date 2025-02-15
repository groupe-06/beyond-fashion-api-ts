"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tagController_1 = require("../controllers/tagController");
const authMiddlewares_1 = require("../middlewares/authMiddlewares");
const router = (0, express_1.Router)();
router.post('/create', authMiddlewares_1.getToken, tagController_1.createTag);
exports.default = router;
