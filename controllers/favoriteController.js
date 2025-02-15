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
exports.removeFavorite = exports.allFavorites = exports.toggleFavorite = void 0;
const db_config_1 = __importDefault(require("../database/db.config"));
const toggleFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const postId = parseInt(req.params.postId);
        const post = yield db_config_1.default.post.findUnique({
            where: { id: postId }
        });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        const existingFavorite = yield db_config_1.default.favorite.findFirst({
            where: {
                postId,
                userId
            }
        });
        if (existingFavorite) {
            yield db_config_1.default.favorite.delete({
                where: { id: existingFavorite.id }
            });
            yield db_config_1.default.post.update({
                where: { id: postId },
                data: { nbFavorites: post.nbFavorites > 0 ? post.nbFavorites - 1 : 0 },
            });
            return res.status(200).json({ message: "Post removed from favorites" });
        }
        else {
            const favorite = yield db_config_1.default.favorite.create({
                data: {
                    postId,
                    userId,
                }
            });
            yield db_config_1.default.post.update({
                where: { id: postId },
                data: { nbFavorites: post.nbFavorites + 1 },
            });
            return res.status(201).json({ message: "Post added to favorites successfully", favorite });
        }
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.toggleFavorite = toggleFavorite;
const allFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const favorites = yield db_config_1.default.favorite.findMany({
            where: { userId },
            include: {
                post: true
            }
        });
        return res.status(200).json(favorites);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.allFavorites = allFavorites;
const removeFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const favoriteId = parseInt(req.params.id);
        const userId = req.userId;
        const favorite = yield db_config_1.default.favorite.findUnique({
            where: { id: favoriteId }
        });
        if (!favorite) {
            return res.status(404).json({ message: "Favorite not found" });
        }
        if (favorite.userId !== userId) {
            return res.status(403).json({ message: "You are not authorized to remove this favorite" });
        }
        yield db_config_1.default.favorite.delete({
            where: { id: favoriteId }
        });
        yield db_config_1.default.post.update({
            where: { id: favorite.postId },
            data: {
                nbFavorites: {
                    decrement: 1
                }
            }
        });
        return res.status(200).json({ message: "Favorite removed successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.removeFavorite = removeFavorite;
