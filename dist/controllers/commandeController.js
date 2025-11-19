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
exports.cancelCommande = exports.markCommandeAsRecupere = exports.completePurchase = exports.deleteCommandeArticle = exports.createCommande = void 0;
const client_1 = require("@prisma/client");
const sendSms_1 = __importDefault(require("../utils/sendSms"));
const utils_1 = require("../utils/utils");
const prisma = new client_1.PrismaClient();
const createCommande = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const { commandDetails } = req.body;
    try {
        if (!userId) {
            return res.status(401).json({ message: 'userId from token not found' });
        }
        if (!commandDetails || !Array.isArray(commandDetails) || commandDetails.length === 0) {
            return res.status(400).json({ message: 'Invalid request data.' });
        }
        // Vérification du rôle "TAILOR"
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: { roles: true }
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isTailor = user.roles.some(role => role.name === 'TAILOR');
        if (!isTailor) {
            return res.status(403).json({ message: 'Only users with the TAILOR role can place an order.' });
        }
        const command = yield prisma.commande.create({
            data: {
                userId,
                commandeArticles: {
                    create: [],
                },
            },
            include: {
                commandeArticles: true,
            },
        });
        let totalPrice = 0;
        for (const item of commandDetails) {
            const article = yield prisma.article.findUnique({
                where: { id: item.articleId },
                include: {
                    category: {
                        select: {
                            unit: {
                                select: {
                                    id: true
                                }
                            }
                        }
                    }
                }
            });
            if (!article) {
                throw new Error(`Article with id ${item.articleId} not found`);
            }
            if (item.quantity > article.stockQuantity) {
                throw new Error(`Quantity for article ${article.name} exceeds stock`);
            }
            const conversion = yield prisma.conversion.findFirst({
                where: {
                    fromUnitId: article.category.unit.id,
                    toUnitId: item.unitId
                },
            });
            const convertedQuantity = conversion ? item.quantity * conversion.value : item.quantity;
            if (convertedQuantity > article.stockQuantity) {
                throw new Error(`Total quantity for article ${article.name} exceeds stock`);
            }
            const existingArticleInCommande = command.commandeArticles.find(ca => ca.articleId === item.articleId);
            if (existingArticleInCommande) {
                // Mise à jour de la quantité de l'article existant
                const newQuantity = existingArticleInCommande.quantity + convertedQuantity;
                yield prisma.commandeArticle.update({
                    where: { id: existingArticleInCommande.id },
                    data: { quantity: newQuantity, prixUnitaire: article.unitPrice }
                });
            }
            else {
                // Ajouter un nouvel article à la commande existante
                yield prisma.commandeArticle.create({
                    data: {
                        articleId: item.articleId,
                        commandeId: command.id,
                        quantity: convertedQuantity,
                        prixUnitaire: article.unitPrice,
                        unitId: item.unitId,
                    },
                });
            }
            totalPrice += convertedQuantity * article.unitPrice;
        }
        // Mise à jour du prix total de la commande
        const updatedCommande = yield prisma.commande.update({
            where: { id: command.id },
            data: { totalPrice },
            include: {
                commandeArticles: true,
            },
        });
        res.status(201).json({ updatedCommande });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: 'An error occurred while processing the order.', error: error.message });
        }
        else {
            console.error('Unexpected error', error);
            res.status(500).json({ message: 'An unexpected error occurred.' });
        }
    }
});
exports.createCommande = createCommande;
// Function to handle deletion of an article from a commande and update the total price
const deleteCommandeArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commandeId, articleId } = req.body; // Use body instead of params for input
    try {
        // Trouver l'entrée de commande_article avec commandeId et articleId
        const commandeArticle = yield prisma.commandeArticle.findFirst({
            where: {
                commandeId: parseInt(commandeId),
                articleId: parseInt(articleId)
            }
        });
        if (!commandeArticle) {
            return res.status(404).json({ message: 'Article not found in this commande.' });
        }
        // Supprimer l'article de la commande
        yield prisma.commandeArticle.delete({
            where: { id: commandeArticle.id } // Utiliser l'id unique de l'entrée trouvée
        });
        // Recalculer le prix total de la commande
        const updatedCommande = yield prisma.commande.findUnique({
            where: { id: parseInt(commandeId) },
            include: { commandeArticles: true }
        });
        let newTotalPrice = 0;
        updatedCommande === null || updatedCommande === void 0 ? void 0 : updatedCommande.commandeArticles.forEach(item => {
            newTotalPrice += item.quantity * item.prixUnitaire;
        });
        // Mettre à jour le prix total de la commande
        yield prisma.commande.update({
            where: { id: parseInt(commandeId) },
            data: { totalPrice: newTotalPrice }
        });
        res.status(200).json({ message: 'Article removed and commande updated.' });
    }
    catch (error) {
        // Vérifiez si l'erreur est une instance d'Error
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: 'An error occurred while deleting the article from the order.', error: error.message });
        }
        else {
            console.error('Unexpected error', error);
            res.status(500).json({ message: 'An unexpected error occurred.' });
        }
    }
});
exports.deleteCommandeArticle = deleteCommandeArticle;
const completePurchase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commandeId } = req.body;
    const userId = req.userId;
    if (!commandeId) {
        return res.status(400).json({ message: 'Commande ID is required.' });
    }
    try {
        // Récupérer la commande avec ses articles
        const commande = yield prisma.commande.findUnique({
            where: { id: commandeId },
            include: { commandeArticles: true }
        });
        if (!commande) {
            return res.status(404).json({ message: 'Commande not found.' });
        }
        if (commande.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized to complete this purchase.' });
        }
        // Vérifier si l'état de la commande est PENDING
        if (commande.etat !== 'PENDING') {
            return res.status(400).json({ message: 'Only pending orders can be completed.' });
        }
        const totalPrice = commande.commandeArticles.reduce((sum, item) => sum + item.quantity * item.prixUnitaire, 0);
        // Vérifier si le totalPrice est supérieur à 0
        if (totalPrice <= 0) {
            return res.status(400).json({ message: 'Total price must be greater than 0 to complete the purchase.' });
        }
        // Mettre à jour l'état de la commande en CONFIRMED
        yield prisma.commande.update({
            where: { id: commandeId },
            data: { etat: 'CONFIRMED' }
        });
        // Mettre à jour les quantités des articles (décrémenter le stock)
        for (const item of commande.commandeArticles) {
            yield prisma.article.update({
                where: { id: item.articleId },
                data: {
                    stockQuantity: {
                        decrement: item.quantity
                    }
                }
            });
        }
        // Envoyer un SMS au client
        const user = yield prisma.user.findUnique({
            where: { id: commande.userId },
            select: { phoneNumber: true }
        });
        if (user === null || user === void 0 ? void 0 : user.phoneNumber) {
            const message = `Votre achat a été complété avec succès. Montant payé: ${totalPrice} USD.`;
            yield (0, sendSms_1.default)(user.phoneNumber, message);
        }
        res.status(200).json({ message: 'Purchase completed successfully.' });
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'An error occurred while completing the purchase.', error: error.message });
        }
        else {
            res.status(500).json({ message: 'An unknown error occurred.' });
        }
    }
});
exports.completePurchase = completePurchase;
const markCommandeAsRecupere = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { commandeId } = req.body;
    const userId = req.userId;
    try {
        // Récupérer la commande
        const commande = yield prisma.commande.findUnique({
            where: { id: commandeId },
            include: { user: true } // Include user details to access phone number and email
        });
        if (!commande) {
            return res.status(404).json({ message: 'Commande non trouvée.' });
        }
        // Vérifier que l'auteur de la commande est bien celui qui tente de la confirmer
        if (commande.userId !== userId) {
            return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à confirmer cette commande.' });
        }
        // Vérifier que l'état de la commande est CONFIRMED
        if (commande.etat !== 'CONFIRMED') {
            return res.status(400).json({ message: 'La commande doit être confirmée avant d\'être récupérée.' });
        }
        // Mise à jour de l'état de la commande à TAKED
        const updatedCommande = yield prisma.commande.update({
            where: { id: commandeId },
            data: { etat: 'TAKED' }
        });
        // Génération du reçu PDF
        const receiptPath = yield (0, utils_1.generatePDFReceipt)(updatedCommande);
        // Envoyer le reçu par email au client
        if ((_a = commande.user) === null || _a === void 0 ? void 0 : _a.email) {
            const subject = 'Votre commande a été récupérée avec succès';
            const message = `Cher client, votre commande (ID: ${commandeId}) a été récupérée avec succès. Le reçu est joint en pièce jointe. Merci de votre confiance en Beyound Fashion.`;
            console.log(commande.user);
            yield (0, utils_1.sendMail)(commande.user.email, subject, message, receiptPath);
        }
        // Envoyer un SMS au client pour confirmer la récupération
        if ((_b = commande.user) === null || _b === void 0 ? void 0 : _b.phoneNumber) {
            const smsMessage = `Votre commande a été récupérée avec succès. Beyound Fashion vous remercie de votre confiance.`;
            yield (0, sendSms_1.default)(commande.user.phoneNumber, smsMessage);
        }
        // Envoyer le fichier PDF en réponse (Option 1)
        res.download(receiptPath, `receipt_${commandeId}.pdf`, (err) => {
            if (err) {
                console.error('Erreur lors de l\'envoi du fichier:', err);
                res.status(500).json({ error: 'Erreur lors de l\'envoi du fichier PDF' });
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour de la commande:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la commande' });
    }
});
exports.markCommandeAsRecupere = markCommandeAsRecupere;
const cancelCommande = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commandeId } = req.body;
    const userId = req.userId; // Assuming req.user contains the logged-in user's information
    try {
        yield prisma.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
            // Récupérer la commande avec ses articles
            const commande = yield prisma.commande.findUnique({
                where: { id: commandeId },
                include: { commandeArticles: true }
            });
            if (!commande) {
                throw new Error('Commande non trouvée.');
            }
            // Vérifier que l'auteur de la commande est bien celui qui tente de l'annuler
            if (commande.userId !== userId) {
                throw new Error('Vous n\'êtes pas autorisé à annuler cette commande.');
            }
            if (commande.etat !== 'CONFIRMED') {
                throw new Error('Seules les commandes confirmées peuvent être annulées.');
            }
            // Rétablir les quantités de stock pour chaque article
            for (const item of commande.commandeArticles) {
                yield prisma.article.update({
                    where: { id: item.articleId },
                    data: {
                        stockQuantity: {
                            increment: item.quantity
                        }
                    }
                });
            }
            // Supprimer les articles associés à la commande
            yield prisma.commandeArticle.deleteMany({
                where: { commandeId: commandeId }
            });
            // Supprimer la commande
            yield prisma.commande.delete({
                where: { id: commandeId }
            });
        }));
        res.status(200).json({ message: 'Commande annulée et supprimée avec succès.' });
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error) {
            res.status(500).json({ message: 'Une erreur est survenue lors de l\'annulation de la commande.', error: error.message });
        }
        else {
            res.status(500).json({ message: 'Une erreur inconnue est survenue.' });
        }
    }
});
exports.cancelCommande = cancelCommande;
