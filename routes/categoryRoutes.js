"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CategoryController_1 = require("../controllers/CategoryController");
const authMiddlewares_1 = require("../middlewares/authMiddlewares");
const router = (0, express_1.Router)();
router.post('/', authMiddlewares_1.getToken, CategoryController_1.createCategory);
router.delete('/:categoryId', authMiddlewares_1.getToken, CategoryController_1.deleteCategory);
exports.default = router;
