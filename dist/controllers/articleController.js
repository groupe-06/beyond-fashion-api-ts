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
exports.deleteArticle = exports.updateArticle = exports.createArticle = void 0;
const client_1 = require("@prisma/client");
const notificationController_1 = __importDefault(require("./notificationController"));
const sendSms_1 = __importDefault(require("../utils/sendSms"));
const prisma = new client_1.PrismaClient();
// Création d'un article
const createArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, stockQuantity, unitPrice, photo, color, categoryId, tags } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        // Vérifier l'existence de la catégorie
        const category = yield prisma.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            return res.status(400).json({ message: 'Category does not exist' });
        }
        // Vérifier l'existence des tags
        const tagRecords = yield prisma.tag.findMany({
            where: { id: { in: tags } },
        });
        if (tagRecords.length !== tags.length) {
            return res.status(400).json({ message: 'Some tags do not exist' });
        }
        // Créer l'article
        const article = yield prisma.article.create({
            data: {
                name,
                stockQuantity,
                unitPrice,
                photo,
                color,
                userId,
                categoryId,
                tags: {
                    connect: tags.map((id) => ({ id })),
                },
            },
        });
        return res.status(201).json(article);
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: 'An unknown error occurred' });
    }
});
exports.createArticle = createArticle;
// Mise à jour d'un article
const updateArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { articleId } = req.params;
    const { name, stockQuantity, unitPrice, photo, color, categoryId, tags } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    try {
        // Vérifier si l'article existe et appartient à l'utilisateur
        const article = yield prisma.article.findUnique({
            where: { id: parseInt(articleId) },
        });
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        if (article.userId !== userId) {
            return res.status(403).json({ message: 'You do not have permission to update this article' });
        }
        // Mettre à jour l'article
        const updatedArticle = yield prisma.article.update({
            where: { id: parseInt(articleId) },
            data: {
                name,
                stockQuantity,
                unitPrice,
                photo,
                color,
                categoryId,
                tags: {
                    set: [],
                    connect: tags.map((id) => ({ id })),
                },
            },
        });
        return res.status(200).json(updatedArticle);
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: 'An unknown error occurred' });
    }
});
exports.updateArticle = updateArticle;
// Suppression d'un article
const deleteArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { articleId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const { reason } = req.body; // Get the deletion reason from the request body
    try {
        // Verify if the article exists and belongs to the user
        const article = yield prisma.article.findUnique({
            where: { id: parseInt(articleId) },
        });
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }
        if (article.userId !== userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this article' });
        }
        // Get the list of users who ordered this article
        const commandes = yield prisma.commandeArticle.findMany({
            where: { articleId: parseInt(articleId) },
            include: {
                commande: {
                    include: {
                        user: true, // Include user details to send notification and SMS
                    },
                },
            },
        });
        // Delete the article from CommandeArticle and Article
        yield prisma.$transaction([
            prisma.commandeArticle.deleteMany({
                where: { articleId: parseInt(articleId) },
            }),
            prisma.article.delete({
                where: { id: parseInt(articleId) },
            }),
        ]);
        // Update totalPrice for each commande affected by the deletion
        for (const commande of commandes) {
            const updatedCommande = yield prisma.commande.findUnique({
                where: { id: commande.commande.id },
                include: { commandeArticles: true }
            });
            if (updatedCommande) {
                let newTotalPrice = 0;
                updatedCommande.commandeArticles.forEach(item => {
                    newTotalPrice += item.quantity * item.prixUnitaire;
                });
                // Update the totalPrice of the commande
                yield prisma.commande.update({
                    where: { id: updatedCommande.id },
                    data: { totalPrice: newTotalPrice }
                });
                // Send notifications and SMS to users who ordered this article
                const user = commande.commande.user;
                yield (0, notificationController_1.default)(user.id, null, `The article "${article.name}" you ordered has been deleted. Reason: ${reason}`, "ARTICLE");
                yield (0, sendSms_1.default)(user.phoneNumber, `Dear ${user.firstname}, the article "${article.name}" you ordered has been deleted. Reason: ${reason}`);
            }
        }
        return res.status(200).json({ message: 'Article and related orders deleted successfully, notifications sent' });
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: 'An unknown error occurred' });
    }
});
exports.deleteArticle = deleteArticle;
