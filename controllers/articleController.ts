import prisma from '../database/db.config';
import { Request, Response } from 'express';
import  sendNotification  from './notificationController';
import  sendSMS  from '../utils/sendSms';


// Création d'un article
export const createArticle = async (req: Request, res: Response) => {
    const { name, stockQuantity, unitPrice, photo, color, categoryId, tags } = req.body;
    const userId = req.user?.userId; 

    try {
        // Vérifier l'existence de la catégorie
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!category) {
            return res.status(400).json({ message: 'Category does not exist' });
        }

        // Vérifier l'existence des tags
        const tagRecords = await prisma.tag.findMany({
            where: { id: { in: tags } },
        });

        if (tagRecords.length !== tags.length) {
            return res.status(400).json({ message: 'Some tags do not exist' });
        }

        // Créer l'article
        const article = await prisma.article.create({
            data: {
                name,
                stockQuantity,
                unitPrice,
                photo,
                color,
                userId,
                categoryId,
                tags: {
                    connect: tags.map((id: number) => ({ id })),
                },
            },
        });

        return res.status(201).json(article);
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: 'An unknown error occurred' });
    }
};

// Mise à jour d'un article
export const updateArticle = async (req: Request, res: Response) => {
    const { articleId } = req.params;
    const { name, stockQuantity, unitPrice, photo, color, categoryId, tags } = req.body;
    const userId = req.user?.userId;

    try {
        // Vérifier si l'article existe et appartient à l'utilisateur
        const article = await prisma.article.findUnique({
            where: { id: parseInt(articleId) },
        });

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        if (article.userId !== userId) {
            return res.status(403).json({ message: 'You do not have permission to update this article' });
        }

        // Mettre à jour l'article
        const updatedArticle = await prisma.article.update({
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
                    connect: tags.map((id: number) => ({ id })),
                },
            },
        });

        return res.status(200).json(updatedArticle);
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: 'An unknown error occurred' });
    }
};

// Suppression d'un article
export const deleteArticle = async (req: Request, res: Response) => {
    const { articleId } = req.params;
    const userId = req.user?.userId;
    const { reason } = req.body; // Get the deletion reason from the request body

    try {
        // Verify if the article exists and belongs to the user
        const article = await prisma.article.findUnique({
            where: { id: parseInt(articleId) },
        });

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        if (article.userId !== userId) {
            return res.status(403).json({ message: 'You do not have permission to delete this article' });
        }

        // Supprimer l'article
        await prisma.article.delete({
            where: { id: parseInt(articleId) },
        });

        return res.status(200).json({ message: 'Article deleted successfully' });
        // Get the list of users who ordered this article
        const commandes = await prisma.commandeArticle.findMany({
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
        await prisma.$transaction([
            prisma.commandeArticle.deleteMany({
                where: { articleId: parseInt(articleId) },
            }),
            prisma.article.delete({
                where: { id: parseInt(articleId) },
            }),
        ]);

        // Update totalPrice for each commande affected by the deletion
        for (const commande of commandes) {
            const updatedCommande = await prisma.commande.findUnique({
                where: { id: commande.commande.id },
                include: { commandeArticles: true }
            });

            if (updatedCommande) {
                let newTotalPrice = 0;
                updatedCommande.commandeArticles.forEach(item => {
                    newTotalPrice += item.quantity * item.prixUnitaire;
                });

                // Update the totalPrice of the commande
                await prisma.commande.update({
                    where: { id: updatedCommande.id },
                    data: { totalPrice: newTotalPrice }
                });

                // Send notifications and SMS to users who ordered this article
                const user = commande.commande.user;
                await sendNotification(user.id, `The article "${article.name}" you ordered has been deleted. Reason: ${reason}`);
                await sendSMS(user.phoneNumber, `Dear ${user.firstname}, the article "${article.name}" you ordered has been deleted. Reason: ${reason}`);
            }
        }

        return res.status(200).json({ message: 'Article and related orders deleted successfully, notifications sent' });
    } catch (error) {
        console.error(error);
        if (error instanceof Error) {
            return res.status(500).json({ message: error.message });
        }
        return res.status(500).json({ message: 'An unknown error occurred' });
    }
};

