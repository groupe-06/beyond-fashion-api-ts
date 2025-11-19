"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const shareController_1 = __importDefault(require("../controllers/shareController"));
const authMiddlewares_1 = require("../middlewares/authMiddlewares");
const router = express_1.default.Router();
router.post('/share/:postId/to/:targetUserId', authMiddlewares_1.getToken, shareController_1.default);
exports.default = router;
