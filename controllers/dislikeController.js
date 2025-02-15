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
exports.dislikePost = void 0;
const db_config_1 = __importDefault(require("../database/db.config"));
const dislikePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { postId } = req.body;
    try {
        const post = yield db_config_1.default.post.findUnique({
            where: { id: postId },
            include: { author: true },
        });
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }
        const existingDislike = yield db_config_1.default.postDislike.findFirst({
            where: { postId, userId },
        });
        const existingLike = yield db_config_1.default.postLike.findFirst({
            where: { postId, userId },
        });
        if (existingDislike) {
            // User has already disliked the post, remove the dislike
            yield db_config_1.default.postDislike.delete({ where: { id: existingDislike.id } });
            return res.status(200).json({ message: "Dislike removed." });
        }
        if (existingLike) {
            // If the user had liked the post, remove the like
            yield db_config_1.default.postLike.delete({ where: { id: existingLike.id } });
        }
        // Create a new dislike
        yield db_config_1.default.postDislike.create({
            data: {
                userId,
                postId,
            },
        });
        // Send a notification to the post author
        //await sendNotification(post.authorId, `Your post has been disliked.`);
        res.status(201).json({ message: "Post disliked successfully." });
    }
    catch (error) {
        console.error("Error disliking post:", error);
        res.status(500).json({ message: "An error occurred while disliking the post.", error });
    }
});
exports.dislikePost = dislikePost;
