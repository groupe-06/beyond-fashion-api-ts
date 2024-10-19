import { Request, Response } from 'express';
import prisma from '../database/db.config';
import sendNotification from '../controllers/notificationController'; // Update the path if necessary
import  sendReportWarningSms  from '../controllers/smsController';
// Fonction pour supprimer les entités liées à un post
async function deleteRelatedEntities(postId: number) {
    const deleteActions = [
        prisma.report.deleteMany({ where: { postId } }),
        prisma.comment.deleteMany({ where: { postId } }),
        prisma.postLike.deleteMany({ where: { postId } }),
        prisma.postDislike.deleteMany({ where: { postId } }),
        prisma.favorite.deleteMany({ where: { postId } }),
    ];

    await Promise.all(deleteActions);
}

export const reportPost = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { postId, reason } = req.body;

    try {
        if (!userId) {
            return res.status(401).json({ message: 'Vous devez être connecté pour signaler un post.' });
        }

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: { author: true }
        });

        if (!post) {
            return res.status(404).json({ message: 'Le post que vous essayez de signaler n\'existe pas.' });
        }
/* 
         if (post.authorId === userId) {
            return res.status(400).json({ message: 'Vous ne pouvez pas signaler votre propre post.' });
        }  
  */
         const existingReport = await prisma.report.findFirst({
            where: {
                userId,
                postId
            }
        });
 /* 
       if (existingReport) {
            return res.status(400).json({ message: 'Vous avez déjà signalé ce post.' });
        }  */
 
        await prisma.report.create({
            data: {
                userId,
                postId,
                reason,
            }
        });

        const reportCount = await prisma.report.count({
            where: { postId }
        });

        if (reportCount >3) {
            await deleteRelatedEntities(postId);
            await sendNotification(post.authorId, null, 'Votre post a été supprimé en raison de multiples signalements.', "REPORT", postId);
            await prisma.post.delete({
                where: { id: postId }
            });
            return res.status(200).json({ message: 'Le post a été supprimé en raison de multiples signalements.' });
        } 
        
          
        else {
            await sendNotification(post.authorId, null, `Votre post a été signalé pour la raison suivante : ${reason}`, "REPORT", postId);
        }
        if (reportCount >= 1) {
            await sendReportWarningSms(post.authorId, postId);
          }
        res.status(201).json({ message: 'Votre signalement a été envoyé avec succès.' });

    } catch (error) {
        console.error('Erreur lors du signalement:', error);
        res.status(500).json({ message: 'Une erreur est survenue lors de l\'envoi du signalement.', error });
    }
};
