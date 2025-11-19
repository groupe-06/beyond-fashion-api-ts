"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CategoryController_1 = require("../controllers/CategoryController");
const router = (0, express_1.Router)();
router.post('/create', CategoryController_1.createCategory);
router.delete('/:categoryId', CategoryController_1.deleteCategory);
exports.default = router;
