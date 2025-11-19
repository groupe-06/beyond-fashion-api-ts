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
exports.getCommentsWithReplies = exports.deleteComment = exports.updateComment = exports.createComment = void 0;
const db_config_1 = __importDefault(require("../database/db.config"));
const notificationController_1 = __importDefault(require("../controllers/notificationController"));
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { content, parentId, postId } = req.body;
    try {
        if (!userId) {
            return res.status(401).json({ message: 'userId from token not present' });
        }
        const user = yield db_config_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ message: `User with ID ${userId} not found` });
        }
        if (!postId) {
            return res.status(400).json({ message: 'postId not present' });
        }
        const post = yield db_config_1.default.post.findUnique({
            where: { id: parseInt(postId) },
            include: { author: true }
        });
        if (!post) {
            return res.status(404).json({ message: `Post with ID ${postId} not found` });
        }
        let parentComment = null;
        if (parentId) {
            parentComment = yield db_config_1.default.comment.findUnique({
                where: { id: parseInt(parentId) },
                include: { author: true }
            });
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
        }
        // Créez le commentaire ou sous-commentaire
        const commentData = {
            content,
            author: { connect: { id: userId } },
            post: { connect: { id: parseInt(postId) } },
        };
        if (parentId) {
            commentData.parent = { connect: { id: parseInt(parentId) } };
        }
        const comment = yield db_config_1.default.comment.create({
            data: commentData,
            include: {
                author: {
                    select: {
                        firstname: true,
                        lastname: true,
                        photoUrl: true
                    }
                },
                replies: {
                    include: {
                        author: {
                            select: {
                                firstname: true,
                                lastname: true,
                                photoUrl: true
                            }
                        }
                    }
                }
            }
        });
        if (parentComment) {
            yield (0, notificationController_1.default)(post.author.id, userId, `vient de commenter votre post. ${content.substring(0, 30)}...`, "COMMENT", postId);
            yield (0, notificationController_1.default)(parentComment.authorId, userId, `a repondu à votre commenteraire. ${content.substring(0, 30)}...`, "COMMENT", postId);
        }
        else {
            yield (0, notificationController_1.default)(post.authorId, userId, `vient de commenter votre post ${content.substring(0, 30)}...`, "COMMENT", postId);
        }
        res.status(201).json({ message: 'Comment created successfully', comment });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create comment', error });
    }
});
exports.createComment = createComment;
const updateComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { commentId } = req.params;
    const { content } = req.body;
    try {
        const comment = yield db_config_1.default.comment.findUnique({
            where: { id: parseInt(commentId) }
        });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        if (comment.authorId !== userId) {
            return res.status(403).json({ message: 'You are not authorized to update this comment' });
        }
        const updatedComment = yield db_config_1.default.comment.update({
            where: { id: parseInt(commentId) },
            data: { content }
        });
        res.status(200).json({ message: 'Comment updated successfully', updatedComment });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update comment', error });
    }
});
exports.updateComment = updateComment;
const deleteComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { commentId } = req.params;
    try {
        const comment = yield db_config_1.default.comment.findUnique({
            where: { id: parseInt(commentId) },
            include: { post: true },
        });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        // Check if the user is the author of the comment or the author of the post
        if (comment.authorId === userId || comment.post.authorId === userId) {
            // Step 1: Delete all replies to the comment
            yield db_config_1.default.comment.deleteMany({
                where: {
                    parentId: parseInt(commentId),
                },
            });
            // Step 2: Delete the main comment
            yield db_config_1.default.comment.delete({
                where: { id: parseInt(commentId) },
            });
            return res.status(200).json({ message: 'Comment and its replies deleted successfully' });
        }
        else {
            return res.status(403).json({ message: 'You are not authorized to delete this comment' });
        }
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to delete comment', error });
    }
});
exports.deleteComment = deleteComment;
const getCommentsWithReplies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    try {
        // Récupérer tous les commentaires du post
        const comments = yield db_config_1.default.comment.findMany({
            where: { postId: parseInt(postId) },
            include: {
                author: {
                    select: {
                        firstname: true,
                        lastname: true,
                        photoUrl: true
                    },
                },
                replies: {
                    include: {
                        author: {
                            select: {
                                firstname: true,
                                lastname: true,
                                photoUrl: true
                            },
                        }
                    },
                },
            },
            orderBy: { createdAt: 'desc' } // Trier par date de création
        });
        // Fonction récursive pour structurer les commentaires et sous-commentaires
        const buildCommentTree = (comments, parentId = null) => {
            return comments
                .filter(comment => comment.parentId === parentId)
                .map(comment => (Object.assign(Object.assign({}, comment), { replies: buildCommentTree(comments, comment.id) })));
        };
        // Générer la structure hiérarchique des commentaires
        const commentTree = buildCommentTree(comments);
        res.status(200).json(commentTree);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to retrieve comments', error });
    }
});
exports.getCommentsWithReplies = getCommentsWithReplies;
