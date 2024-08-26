import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sendSms from '../utils/sendSms'
import { generatePDFReceipt,sendMail } from '../utils/utils'
import path from 'path';
import fs from 'fs';
const prisma = new PrismaClient();



export const createCommande = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { articles } = req.body;

    try {
        if (!userId) {
            return res.status(401).json({ message: 'userId from token not found' });
        }

        if (!articles || !Array.isArray(articles) || articles.length === 0) {
            return res.status(400).json({ message: 'Invalid request data.' });
        }

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

        const command = await prisma.commande.create({
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

        for (const item of articles) {
            const article = await prisma.article.findUnique({
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

            const conversion = await prisma.conversion.findFirst({
                where: {
                    fromUnitId: item.unitId,
                    toUnitId: article.category.unit.id,
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

                await prisma.commandeArticle.update({
                    where: { id: existingArticleInCommande.id },
                    data: { quantity: newQuantity, prixUnitaire: article.unitPrice }
                });
            } else {
                // Ajouter un nouvel article à la commande existante
                await prisma.commandeArticle.create({
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
        const updatedCommande = await prisma.commande.update({
            where: { id: command.id },
            data: { totalPrice },
            include: {
                commandeArticles: true,
            },
        });

        res.status(201).json({ updatedCommande });
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: 'An error occurred while processing the order.', error: error.message });
        } else {
            console.error('Unexpected error', error);
            res.status(500).json({ message: 'An unexpected error occurred.' });
        }
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
        // Vérifiez si l'erreur est une instance d'Error
        if (error instanceof Error) {
            console.error(error.message);
            res.status(500).json({ message: 'An error occurred while deleting the article from the order.', error: error.message });
        } else {
            console.error('Unexpected error', error);
            res.status(500).json({ message: 'An unexpected error occurred.' });
        }
    }
};

export const completePurchase = async (req: Request, res: Response) => {
    const { commandeId } = req.body;
    const userId = (req as any).userId;

    if (!commandeId) {
        return res.status(400).json({ message: 'Commande ID is required.' });
    }

    try {
        // Récupérer la commande avec ses articles
        const commande = await prisma.commande.findUnique({
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
        await prisma.commande.update({
            where: { id: commandeId },
            data: { etat: 'CONFIRMED' }
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

        // Envoyer un SMS au client
        const user = await prisma.user.findUnique({
            where: { id: commande.userId },
            select: { phoneNumber: true }
        });

        if (user?.phoneNumber) {
            const message = `Votre achat a été complété avec succès. Montant payé: ${totalPrice} USD.`;
            await sendSms(user.phoneNumber, message);
        }

        res.status(200).json({ message: 'Purchase completed successfully.' });
    } catch (error: unknown) {
        console.error(error);

        if (error instanceof Error) {
            res.status(500).json({ message: 'An error occurred while completing the purchase.', error: error.message });
        } else {
            res.status(500).json({ message: 'An unknown error occurred.' });
        }
    }
};

export const markCommandeAsRecupere = async (req: Request, res: Response) => {
    const { commandeId } = req.body;
    const userId = (req as any).userId;

    try {
        // Récupérer la commande
        const commande = await prisma.commande.findUnique({
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
        const updatedCommande = await prisma.commande.update({
            where: { id: commandeId },
            data: { etat: 'TAKED' }
        });

        // Génération du reçu PDF
        const receiptPath = await generatePDFReceipt(updatedCommande);

        // Envoyer le reçu par email au client
        if (commande.user?.email) {
            const subject = 'Votre commande a été récupérée avec succès';
            const message = `Cher client, votre commande (ID: ${commandeId}) a été récupérée avec succès. Le reçu est joint en pièce jointe. Merci de votre confiance en Beyound Fashion.`;
            console.log(commande.user);
        
            
            await sendMail(commande.user.email, subject, message, receiptPath);
        }

        // Envoyer un SMS au client pour confirmer la récupération
        if (commande.user?.phoneNumber) {
            const smsMessage = `Votre commande a été récupérée avec succès. Beyound Fashion vous remercie de votre confiance.`;
            await sendSms(commande.user.phoneNumber, smsMessage);
        }

        // Envoyer le fichier PDF en réponse (Option 1)
        res.download(receiptPath, `receipt_${commandeId}.pdf`, (err) => {
            if (err) {
                console.error('Erreur lors de l\'envoi du fichier:', err);
                res.status(500).json({ error: 'Erreur lors de l\'envoi du fichier PDF' });
            }
        });

    } catch (error) {
        console.error('Erreur lors de la mise à jour de la commande:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la commande' });
    }
};


export const cancelCommande = async (req: Request, res: Response) => {
    const { commandeId } = req.body;
    const userId = (req as any).userId; // Assuming req.user contains the logged-in user's information
  
    try {
      await prisma.$transaction(async (prisma) => {
        // Récupérer la commande avec ses articles
        const commande = await prisma.commande.findUnique({
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
          await prisma.article.update({
            where: { id: item.articleId },
            data: {
              stockQuantity: {
                increment: item.quantity
              }
            }
          });
        }
  
        // Supprimer les articles associés à la commande
        await prisma.commandeArticle.deleteMany({
          where: { commandeId: commandeId }
        });
  
        // Supprimer la commande
        await prisma.commande.delete({
          where: { id: commandeId }
        });
      });
  
      res.status(200).json({ message: 'Commande annulée et supprimée avec succès.' });
    } catch (error) {
      console.error(error);
  
      if (error instanceof Error) {
        res.status(500).json({ message: 'Une erreur est survenue lors de l\'annulation de la commande.', error: error.message });
      } else {
        res.status(500).json({ message: 'Une erreur inconnue est survenue.' });
      }
    }
  };