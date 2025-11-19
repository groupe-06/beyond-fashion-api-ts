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
exports.likePost = void 0;
const db_config_1 = __importDefault(require("../database/db.config"));
const notificationController_1 = __importDefault(require("../controllers/notificationController"));
const likePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { postId } = req.body;
    try {
        if (!userId) {
            return res.status(401).json({ message: 'userId from token not found' });
        }
        const result = yield db_config_1.default.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                return res.status(404).json({ message: `User with ID ${userId} not found` });
            }
            const post = yield prisma.post.findUnique({
                where: { id: postId },
                include: { author: true },
            });
            if (!post) {
                return res.status(404).json({ message: "Post not found." });
            }
            const existingLike = yield prisma.postLike.findFirst({
                where: { postId, userId },
            });
            /*const existingDislike = await prisma.postDislike.findFirst({
                where: { postId, userId },
            });
    
            if (existingDislike) {
                // If the user had disliked the post, remove the dislike
                await prisma.postDislike.delete({ where: { id: existingDislike.id } });
            }*/
            if (existingLike) {
                yield prisma.postLike.delete({ where: { id: existingLike.id } });
                return res.status(200).json({ message: "Like removed successfully." });
            }
            yield prisma.postLike.create({
                data: {
                    userId,
                    postId,
                },
            });
            yield (0, notificationController_1.default)(post.authorId, userId, `vient d'aimer votre post. ${post.description ? post.description.substring(0, 30) + '...' : ''}`, "LIKE", postId);
            return res.status(201).json({ message: "Post liked successfully." });
        }));
    }
    catch (error) {
        console.error("Error liking post:", error);
        res.status(500).json({ message: "An error occurred while liking the post.", error });
    }
});
exports.likePost = likePost;
