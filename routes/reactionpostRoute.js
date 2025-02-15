"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const likeController_1 = require("../controllers/likeController");
const dislikeController_1 = require("../controllers/dislikeController");
const authMiddlewares_1 = require("../middlewares/authMiddlewares");
const reactionRouter = express_1.default.Router();
// Like route
reactionRouter.post('/like', authMiddlewares_1.getToken, likeController_1.likePost);
// Dislike route
reactionRouter.post('/dislike', authMiddlewares_1.getToken, dislikeController_1.dislikePost);
exports.default = reactionRouter;
