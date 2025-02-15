"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const rateController_1 = require("../controllers/rateController");
const authMiddlewares_1 = require("../middlewares/authMiddlewares");
const router = express_1.default.Router();
router.post('/create-rate/:postId', authMiddlewares_1.getToken, rateController_1.createRate);
router.get('/getAll-rates', authMiddlewares_1.getToken, rateController_1.allRates);
router.put('/update-rate/:id', authMiddlewares_1.getToken, rateController_1.updateRate);
router.delete('/delete-rate/:id', authMiddlewares_1.getToken, rateController_1.deleteRate);
exports.default = router;
