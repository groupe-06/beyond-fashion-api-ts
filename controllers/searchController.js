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
exports.searchArticlesByTag = exports.searchArticlesByCategory = exports.searchSellerAndArticles = exports.searchArticlesByFirstLetter = exports.searchPostsByTag = void 0;
const db_config_1 = __importDefault(require("../database/db.config"));
const searchPostsByTag = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tagName } = req.params;
        const posts = yield db_config_1.default.post.findMany({
            where: {
                tag: {
                    some: {
                        name: tagName,
                    },
                },
            },
            include: {
                author: {
                    select: {
                        firstname: true,
                        lastname: true,
                    },
                },
                tag: true,
                postLikes: true,
                favorites: true,
            },
        });
        if (posts.length === 0) {
            return res.status(404).json({ message: `No posts found with tag "${tagName}"` });
        }
        const formattedPosts = posts.map(post => ({
            id: post.id,
            content: post.content,
            description: post.description,
            views: post.views,
            tags: post.tag.map(t => t.name),
            likes: post.postLikes.length,
            favorites: post.favorites.length,
            author: {
                firstname: post.author.firstname,
                lastname: post.author.lastname,
            },
        }));
        return res.status(200).json({ posts: formattedPosts });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to search posts by tag', error });
    }
});
exports.searchPostsByTag = searchPostsByTag;
const searchArticlesByFirstLetter = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { letter } = req.params;
        const articles = yield db_config_1.default.article.findMany({
            where: {
                name: {
                    startsWith: letter,
                },
            },
            include: {
                category: true,
                tags: true,
                user: {
                    select: {
                        firstname: true,
                        lastname: true,
                        email: true,
                        address: true,
                    },
                },
            },
        });
        if (articles.length === 0) {
            return res.status(404).json({ message: `No articles found starting with "${letter}"` });
        }
        return res.status(200).json({ articles });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to search articles by first letter', error });
    }
});
exports.searchArticlesByFirstLetter = searchArticlesByFirstLetter;
const searchSellerAndArticles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sellerId = parseInt(req.params.sellerId);
        if (!sellerId) {
            return res.status(400).json({ message: 'Seller ID is required.' });
        }
        const user = yield db_config_1.default.user.findUnique({
            where: { id: sellerId },
            include: {
                roles: true,
            },
        });
        if (!user) {
            return res.status(404).json({ message: `User with ID ${sellerId} not found!` });
        }
        if (!user.roles.some(r => r.name === 'SELLER')) {
            return res.status(401).json({ message: 'This user does not have the SELLER role' });
        }
        const articles = yield db_config_1.default.article.findMany({
            where: {
                userId: sellerId,
            },
            include: {
                category: true,
                tags: true,
            },
        });
        const formattedSeller = {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            address: user.address,
            articles: articles.map(article => ({
                id: article.id,
                name: article.name,
                category: article.category ? article.category.name : null,
                tags: article.tags.map(tag => tag.name),
            })),
        };
        return res.status(200).json({ seller: formattedSeller });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to search seller and articles', error });
    }
});
exports.searchSellerAndArticles = searchSellerAndArticles;
const searchArticlesByCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { categoryName } = req.params;
        const articles = yield db_config_1.default.article.findMany({
            where: {
                category: {
                    name: categoryName,
                },
            },
            include: {
                category: true,
                tags: true,
                user: {
                    select: {
                        firstname: true,
                        lastname: true,
                        email: true,
                        address: true,
                    },
                },
            },
        });
        if (articles.length === 0) {
            return res.status(404).json({ message: `No articles found in category "${categoryName}"` });
        }
        return res.status(200).json({ articles });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to search articles by category', error });
    }
});
exports.searchArticlesByCategory = searchArticlesByCategory;
const searchArticlesByTag = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tagName } = req.params;
        const articles = yield db_config_1.default.article.findMany({
            where: {
                tags: {
                    some: {
                        name: tagName,
                    },
                },
            },
            include: {
                category: true,
                tags: true,
                user: {
                    select: {
                        firstname: true,
                        lastname: true,
                        email: true,
                        address: true,
                    },
                },
            },
        });
        if (articles.length === 0) {
            return res.status(404).json({ message: `No articles found with tag "${tagName}"` });
        }
        return res.status(200).json({ articles });
    }
    catch (error) {
        return res.status(500).json({ message: 'Failed to search articles by tag', error });
    }
});
exports.searchArticlesByTag = searchArticlesByTag;
