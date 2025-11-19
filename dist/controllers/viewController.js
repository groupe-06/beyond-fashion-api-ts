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
exports.incrementPostViews = void 0;
const db_config_1 = __importDefault(require("../database/db.config"));
const incrementPostViews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = parseInt(req.params.id);
    try {
        // Vérifie si l'ID du post est valide
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required.' });
        }
        // Récupère le post
        const post = yield db_config_1.default.post.findUnique({
            where: { id: postId },
        });
        // Vérifie si le post existe
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        // Incrémente le nombre de vues
        const updatedPost = yield db_config_1.default.post.update({
            where: { id: postId },
            data: { views: post.views + 1 },
        });
        // Renvoie le post mis à jour
        return res.status(200).json({ message: 'Post views updated', post: updatedPost });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to increment post views', error });
    }
});
exports.incrementPostViews = incrementPostViews;
