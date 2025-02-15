"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddlewares_1 = require("../middlewares/authMiddlewares");
const commandeController_1 = require("../controllers/commandeController");
const commandeRouter = (0, express_1.Router)();
// Appliquer le middleware getToken uniquement sur cette route
commandeRouter.post('/commande', authMiddlewares_1.getToken, commandeController_1.createCommande);
commandeRouter.delete('/delete-article', commandeController_1.deleteCommandeArticle);
commandeRouter.post('/complete-purchase', authMiddlewares_1.getToken, commandeController_1.completePurchase);
commandeRouter.post('/Taked', authMiddlewares_1.getToken, commandeController_1.markCommandeAsRecupere);
commandeRouter.post('/Cancel', authMiddlewares_1.getToken, commandeController_1.cancelCommande);
exports.default = commandeRouter;
