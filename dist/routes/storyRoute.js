"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddlewares_1 = require("../middlewares/authMiddlewares");
const storyController_1 = require("../controllers/storyController");
const multer_1 = __importDefault(require("../config/multer"));
const router = (0, express_1.Router)();
router.post('/new', multer_1.default.single('content'), authMiddlewares_1.getToken, storyController_1.createStory);
router.post('/delete/:id', authMiddlewares_1.getToken, storyController_1.deleteStory);
router.post('/connect-user', authMiddlewares_1.getToken, storyController_1.getAllStoryByConnectedUser);
router.get('/author/:storyId', storyController_1.getAuthorByStoryId);
router.post('/all', storyController_1.getAllStories);
exports.default = router;
