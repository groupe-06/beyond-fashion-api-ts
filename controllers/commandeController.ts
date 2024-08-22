import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sendSms from '../utils/sendSms'
const prisma = new PrismaClient();



export const createCommande = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { articles } = req.body;

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
        return res.status(400).json({ message: 'Invalid request data.' });
    }

    try {
        // Vérification du rôle "TAILOR"
        const user = await prisma.user.findUnique({
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

        // Calcul du prix total et traitement de la commande
        let totalPrice = 0;

        const commande = await prisma.$transaction(async (prisma) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let existingCommande = await prisma.commande.findFirst({
                where: {
                    userId: userId,
                    date: {
                        gte: today,
                        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                    }
                },
                include: { commandeArticles: true }
            });

            if (!existingCommande) {
                // Création d'une nouvelle commande si elle n'existe pas encore
                existingCommande = await prisma.commande.create({
                    data: {
                        userId: userId,
                        totalPrice: 0,
                        date: today,
                        commandeArticles: {
                            create: []
                        }
                    },
                    include: { commandeArticles: true }
                });
            }

            // Initializing totalPrice with the current total from existing articles
            totalPrice = existingCommande.commandeArticles.reduce((sum, item) => sum + item.quantity * item.prixUnitaire, 0);

            for (const item of articles) {
                const article = await prisma.article.findUnique({
                    where: { id: item.articleId }
                });

                if (!article) {
                    throw new Error(`Article with id ${item.articleId} not found`);
                }

                if (item.quantity > article.stockQuantity) {
                    throw new Error(`Quantity for article ${article.name} exceeds stock`);
                }

                const existingArticleInCommande = existingCommande.commandeArticles.find(ca => ca.articleId === item.articleId);

                if (existingArticleInCommande) {
                    // Mise à jour de la quantité de l'article existant dans la commande
                    const newQuantity = existingArticleInCommande.quantity + item.quantity;
                    if (newQuantity > article.stockQuantity) {
                        throw new Error(`Total quantity for article ${article.name} exceeds stock`);
                    }

                    await prisma.commandeArticle.update({
                        where: { id: existingArticleInCommande.id },
                        data: { quantity: newQuantity, prixUnitaire: article.unitPrice }
                    });

                    console.log(`Updated article: ID = ${item.articleId}, Quantity = ${newQuantity}, Unit Price = ${article.unitPrice}`);
                } else {
                    // Ajout d'un nouvel article à la commande existante
                    await prisma.commandeArticle.create({
                        data: {
                            articleId: item.articleId,
                            commandeId: existingCommande.id,
                            quantity: item.quantity,
                            prixUnitaire: article.unitPrice
                        }
                    });

                    console.log(`Added article: ID = ${item.articleId}, Quantity = ${item.quantity}, Unit Price = ${article.unitPrice}`);
                }

                // Update totalPrice with the newly added or updated article
                totalPrice += item.quantity * article.unitPrice;
            }

            // Mise à jour du prix total de la commande
            await prisma.commande.update({
                where: { id: existingCommande.id },
                data: { totalPrice: totalPrice }
            });

            console.log(`Final Total Price: ${totalPrice}`);

            return existingCommande;
        });

        // Response with details of the command and its articles
        const updatedCommande = await prisma.commande.findUnique({
            where: { id: commande.id },
            include: { commandeArticles: true }
        });

        res.status(201).json({
            commandeId: updatedCommande?.id,
            totalPrice: updatedCommande?.totalPrice,
            articles: updatedCommande?.commandeArticles.map(article => ({
                articleId: article.articleId,
                quantity: article.quantity,
                prixUnitaire: article.prixUnitaire
            }))
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while processing the order.', error: error.message });
    }
};

// Function to handle deletion of an article from a commande and update the total price
export const deleteCommandeArticle = async (req: Request, res: Response) => {
    const { commandeId, articleId } = req.body; // Use body instead of params for input

    try {
        // Trouver l'entrée de commande_article avec commandeId et articleId
        const commandeArticle = await prisma.commandeArticle.findFirst({
            where: {
                commandeId: parseInt(commandeId),
                articleId: parseInt(articleId)
            }
        });

        if (!commandeArticle) {
            return res.status(404).json({ message: 'Article not found in this commande.' });
        }

        // Supprimer l'article de la commande
        await prisma.commandeArticle.delete({
            where: { id: commandeArticle.id } // Utiliser l'id unique de l'entrée trouvée
        });

        // Recalculer le prix total de la commande
        const updatedCommande = await prisma.commande.findUnique({
            where: { id: parseInt(commandeId) },
            include: { commandeArticles: true }
        });

        let newTotalPrice = 0;
        updatedCommande?.commandeArticles.forEach(item => {
            newTotalPrice += item.quantity * item.prixUnitaire;
        });

        // Mettre à jour le prix total de la commande
        await prisma.commande.update({
            where: { id: parseInt(commandeId) },
            data: { totalPrice: newTotalPrice }
        });

        res.status(200).json({ message: 'Article removed and commande updated.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while deleting the article from the order.', error: error.message });
    }
};
export const completePurchase = async (req: Request, res: Response) => {
    const { commandeId } = req.body;
    const userId = (req as any).userId; // Assume this is set by authentication middleware

    if (!commandeId) {
        return res.status(400).json({ message: 'Commande ID is required.' });
    }

    try {
        // Récupérer la commande avec ses articles et vérifier l'utilisateur associé
        const commande = await prisma.commande.findUnique({
            where: { id: commandeId },
            include: { commandeArticles: true }
        });

        if (!commande) {
            return res.status(404).json({ message: 'Commande not found.' });
        }

        // Vérifier si l'utilisateur connecté est bien celui qui a passé la commande
        if (commande.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized to complete this purchase.' });
        }

        // Calculer le total de la commande
        const totalPrice = commande.commandeArticles.reduce((sum, item) => sum + item.quantity * item.prixUnitaire, 0);

        // Supprimer la commande et les articles associés
        await prisma.$transaction(async (prisma) => {
            // Supprimer les articles de la commande
            await prisma.commandeArticle.deleteMany({
                where: { commandeId: commandeId }
            });

            // Supprimer la commande
            await prisma.commande.delete({
                where: { id: commandeId }
            });

            // Mettre à jour les quantités des articles (décrémenter le stock)
            for (const item of commande.commandeArticles) {
                await prisma.article.update({
                    where: { id: item.articleId },
                    data: {
                        stockQuantity: {
                            decrement: item.quantity
                        }
                    }
                });
            }
        });

        // Envoyer un SMS au client
        const user = await prisma.user.findUnique({
            where: { id: commande.userId },
            select: { phoneNumber: true }
        });

        if (user?.phoneNumber) {
            const message = `Votre achat a été complété avec succès. Montant payé: ${totalPrice} USD.`;
            await sendSms(user.phoneNumber, message);
        }

        res.status(200).json({ message: 'Purchase completed and command deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while completing the purchase.', error: error.message });
    }
};