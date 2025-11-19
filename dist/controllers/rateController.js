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
exports.deleteRate = exports.updateRate = exports.allRates = exports.createRate = void 0;
const db_config_1 = __importDefault(require("../database/db.config"));
const createRate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stars, description } = req.body;
        const userId = req.userId;
        const postId = parseInt(req.params.postId);
        if (stars <= 2 && !description) {
            return res.status(400).json({ message: "Description is required because your rate is 2 stars or less" });
        }
        const post = yield db_config_1.default.post.findUnique({
            where: { id: postId }
        });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        const existingRate = yield db_config_1.default.rate.findFirst({
            where: {
                postId,
                userId
            }
        });
        if (existingRate) {
            return res.status(400).json({ message: "You have already rated this post" });
        }
        const postAuthor = yield db_config_1.default.user.findUnique({
            where: { id: post.authorId }
        });
        if ((postAuthor === null || postAuthor === void 0 ? void 0 : postAuthor.id) === userId) {
            return res.status(400).json({ message: "You cannot rate your own post" });
        }
        const rate = yield db_config_1.default.rate.create({
            data: {
                stars,
                description,
                postId,
                userId,
            }
        });
        return res.status(201).json({ message: "Post rated successfully", rate });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.createRate = createRate;
const allRates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rates = yield db_config_1.default.rate.findMany({
            include: {
                post: true,
                user: {
                    select: {
                        firstname: true,
                        lastname: true,
                        email: true
                    }
                }
            }
        });
        return res.status(200).json(rates);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.allRates = allRates;
const updateRate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { stars, description } = req.body;
        const rateId = parseInt(req.params.id);
        const userId = req.userId;
        const rate = yield db_config_1.default.rate.findUnique({
            where: { id: rateId }
        });
        if (!rate) {
            return res.status(404).json({ message: "Rate not found" });
        }
        if (rate.userId !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this rate" });
        }
        const updatedRate = yield db_config_1.default.rate.update({
            where: { id: rateId },
            data: {
                stars,
                description
            }
        });
        return res.status(200).json({ message: "Rate updated successfully", updatedRate });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.updateRate = updateRate;
const deleteRate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rateId = parseInt(req.params.id);
        const userId = req.userId;
        const rate = yield db_config_1.default.rate.findUnique({
            where: { id: rateId }
        });
        if (!rate) {
            return res.status(404).json({ message: "Rate not found" });
        }
        if (rate.userId !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this rate" });
        }
        yield db_config_1.default.rate.delete({
            where: { id: rateId }
        });
        return res.status(200).json({ message: "Rate deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.deleteRate = deleteRate;
