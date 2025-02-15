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
exports.reportPost = void 0;
const db_config_1 = __importDefault(require("../database/db.config"));
const notificationController_1 = __importDefault(require("../controllers/notificationController")); // Update the path if necessary
const smsController_1 = __importDefault(require("../controllers/smsController"));
// Fonction pour supprimer les entités liées à un post
function deleteRelatedEntities(postId) {
    return __awaiter(this, void 0, void 0, function* () {
        const deleteActions = [
            db_config_1.default.report.deleteMany({ where: { postId } }),
            db_config_1.default.comment.deleteMany({ where: { postId } }),
            db_config_1.default.postLike.deleteMany({ where: { postId } }),
            db_config_1.default.postDislike.deleteMany({ where: { postId } }),
            db_config_1.default.favorite.deleteMany({ where: { postId } }),
        ];
        yield Promise.all(deleteActions);
    });
}
const reportPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { postId, reason } = req.body;
    try {
        if (!userId) {
            return res.status(401).json({ message: 'Vous devez être connecté pour signaler un post.' });
        }
        const post = yield db_config_1.default.post.findUnique({
            where: { id: postId },
            include: { author: true }
        });
        if (!post) {
            return res.status(404).json({ message: 'Le post que vous essayez de signaler n\'existe pas.' });
        }
        if (post.authorId === userId) {
            return res.status(400).json({ message: 'Vous ne pouvez pas signaler votre propre post.' });
        }
        const existingReport = yield db_config_1.default.report.findFirst({
            where: {
                userId,
                postId
            }
        });
        if (existingReport) {
            return res.status(400).json({ message: 'Vous avez déjà signalé ce post.' });
        }
        yield db_config_1.default.report.create({
            data: {
                userId,
                postId,
                reason,
            }
        });
        const reportCount = yield db_config_1.default.report.count({
            where: { postId }
        });
        if (reportCount > 3) {
            yield deleteRelatedEntities(postId);
            yield (0, notificationController_1.default)(post.authorId, null, 'Votre post a été supprimé en raison de multiples signalements.', "REPORT", postId);
            yield db_config_1.default.post.delete({
                where: { id: postId }
            });
            return res.status(200).json({ message: 'Le post a été supprimé en raison de multiples signalements.' });
        }
        else {
            yield (0, notificationController_1.default)(post.authorId, null, `Votre post a été signalé pour la raison suivante : ${reason}`, "REPORT", postId);
        }
        if (reportCount >= 1) {
            yield (0, smsController_1.default)(post.authorId, postId);
        }
        res.status(201).json({ message: 'Votre signalement a été envoyé avec succès.' });
    }
    catch (error) {
        console.error('Erreur lors du signalement:', error);
        res.status(500).json({ message: 'Une erreur est survenue lors de l\'envoi du signalement.', error });
    }
});
exports.reportPost = reportPost;
