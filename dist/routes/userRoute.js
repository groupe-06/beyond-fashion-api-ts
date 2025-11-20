"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddlewares_1 = require("../middlewares/authMiddlewares");
const multer_1 = __importDefault(require("../config/multer"));
const postController_1 = require("../controllers/postController");
const router = (0, express_1.Router)();
router.post('/register', multer_1.default.single('photo'), userController_1.register);
router.get('/getAll', userController_1.getAllUsers);
//Notifications
router.get('/notifications', authMiddlewares_1.getToken, userController_1.getUserNotifications);
router.get('/get-one', authMiddlewares_1.getToken, userController_1.getUser);
router.put('/update', authMiddlewares_1.getToken, userController_1.updateUser);
router.delete('/delete/:id', userController_1.deleteUser);
router.post('/login', userController_1.login);
router.put('/update-profile', authMiddlewares_1.getToken, userController_1.updateProfile);
router.post('/block/:blockedId', authMiddlewares_1.getToken, userController_1.blockUser);
router.post('/unblock/:deblockedId', authMiddlewares_1.getToken, userController_1.unblockUser);
router.get('/get-post', authMiddlewares_1.getToken, postController_1.getUserPosts);
router.get('/logout', authMiddlewares_1.getTokenFromHeader, userController_1.logout);
router.post('/verify', userController_1.verifyValidityToken);
router.get('/verify-token', userController_1.verifyValidityUserToken);
router.get('/user-by-id/:userId', userController_1.getUser);
exports.default = router;
