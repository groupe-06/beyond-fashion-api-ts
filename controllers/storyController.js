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
exports.getAuthorByStoryId = exports.deleteStory = exports.getAllStoryByConnectedUser = exports.getAllStories = exports.createStory = void 0;
const db_config_1 = __importDefault(require("../database/db.config"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const node_cron_1 = __importDefault(require("node-cron"));
const createStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content, description } = req.body;
        const userId = req.userId;
        const file = req.file;
        if (!userId) {
            return res.status(401).json({ message: 'Your user ID is undefined. Please login and try again' });
        }
        const user = yield db_config_1.default.user.findUnique({
            where: { id: Number(userId) },
            include: {
                roles: true,
            }
        });
        if (!user) {
            return res.status(404).json({ message: `User with ID ${userId} not found` });
        }
        if (!user.roles.find(r => r.name === 'TAILOR')) {
            return res.status(401).json({ message: 'You are not allowed to create a story' });
        }
        let mediaUrl = content;
        if (file) {
            const media = yield new Promise((resolve, reject) => {
                const uploadStream = cloudinary_1.default.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                });
                uploadStream.end(file.buffer);
            });
            mediaUrl = media.secure_url;
        }
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 1);
        const story = yield db_config_1.default.story.create({
            data: {
                content: mediaUrl,
                description: description || '',
                authorId: userId,
                expiresAt
            }
        });
        return res.status(201).json({ message: 'Story created successfully', story });
    }
    catch (error) {
        return res.status(500).json({ message: 'Something went wrong. Please try again', error });
    }
});
exports.createStory = createStory;
const getAllStories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stories = yield db_config_1.default.story.findMany({
            include: {
                author: {
                    select: {
                        firstname: true,
                        lastname: true,
                        photoUrl: true
                    }
                }
            }
        });
        return res.status(200).json({ message: 'Stories fetched successfully', stories });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to fetch stories', error });
    }
});
exports.getAllStories = getAllStories;
const getAllStoryByConnectedUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        const stories = yield db_config_1.default.story.findMany({
            where: { authorId: Number(userId) },
            orderBy: {
                publishedAt: 'desc', // Sort by the most recent stories
            },
        });
        return res.status(200).json({ message: 'Stories fetched successfully', stories });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to fetch stories', error });
    }
});
exports.getAllStoryByConnectedUser = getAllStoryByConnectedUser;
const deleteStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const StorytId = parseInt(req.params.id);
        const stories = yield db_config_1.default.story.findUnique({
            where: { id: StorytId },
        });
        const userId = req.userId;
        if ((stories === null || stories === void 0 ? void 0 : stories.authorId) !== userId) {
            return res.status(401).json({ message: 'You are not authorized to delete this story.' });
        }
        const story = yield db_config_1.default.story.delete({
            where: { id: Number(StorytId) },
        });
        return res.status(200).json({ message: 'Story deleted successfully', story });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to delete story', error });
    }
});
exports.deleteStory = deleteStory;
// Endpoint pour récupérer les informations de l'auteur d'une story
const getAuthorByStoryId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { storyId } = req.params; // Récupérer le storyId depuis les paramètres de l'URL
    try {
        // Récupérer la story et inclure les informations de l'auteur (user)
        const story = yield db_config_1.default.story.findUnique({
            where: { id: Number(storyId) },
            include: {
                author: true, // Inclure les informations de l'auteur (user)
            },
        });
        if (!story) {
            return res.status(404).json({ message: `Story with ID ${storyId} not found` });
        }
        // Vérifier si l'auteur est présent
        if (!story.author) {
            return res.status(404).json({ message: 'Author not found for this story' });
        }
        return res.status(200).json({ message: 'Author fetched successfully', author: story.author });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to fetch author', error });
    }
});
exports.getAuthorByStoryId = getAuthorByStoryId;
const deleteExpiredStories = () => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    try {
        const result = yield db_config_1.default.story.deleteMany({
            where: { expiresAt: { lt: now } },
        });
        console.log(`Deleted ${result.count} stories`);
    }
    catch (error) {
        console.error('Error deleting stories:', error);
    }
});
node_cron_1.default.schedule('* * * * *', deleteExpiredStories);
