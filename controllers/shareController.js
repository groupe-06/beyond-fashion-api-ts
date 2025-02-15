"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_config_1 = __importDefault(require("../database/db.config"));
const notificationController_1 = __importDefault(require("./notificationController"));
function sharePost(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.userId;
        const postId = parseInt(req.params.postId);
        const recipientId = parseInt(req.params.userId);
        try {
            if (!userId) {
                return res.status(401).json({ message: 'User not found!' });
            }
            const post = yield db_config_1.default.post.findUnique({
                where: { id: postId },
                include: { author: true }
            });
            if (!post) {
                return res.status(404).json({ message: 'Post not found.' });
            }
            // Créer une entrée de partage
            yield db_config_1.default.share.create({
                data: {
                    postId: post.id,
                    userId: userId,
                },
            });
            // Envoyer une notification à l'auteur du post
            yield (0, notificationController_1.default)(post.authorId, userId, 'New Post Shared', `Le post a ete partager `);
            return res.status(200).json({
                message: 'Post shared successfully.'
            });
        }
        catch (error) {
            console.error('Error in sharePost:', error);
            return res.status(500).json({
                message: 'Failed to share post.',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    });
}
exports.default = sharePost;
