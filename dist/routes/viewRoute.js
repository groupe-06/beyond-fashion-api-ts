"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const viewController_1 = require("../controllers/viewController");
const router = (0, express_1.Router)();
// Route pour consulter et incrémenter les vues d'un post
router.post('/:id', viewController_1.incrementPostViews);
exports.default = router;
