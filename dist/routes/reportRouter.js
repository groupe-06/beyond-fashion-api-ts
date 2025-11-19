"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_1 = require("../controllers/reportController");
const authMiddlewares_1 = require("../middlewares/authMiddlewares");
const reportRouter = (0, express_1.Router)();
// Route pour signaler un post
reportRouter.post('/report', authMiddlewares_1.getToken, reportController_1.reportPost);
exports.default = reportRouter;
