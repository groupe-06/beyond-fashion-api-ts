import { Request, Response } from 'express';
import prisma from '../database/db.config';

export const incrementPostViews = async (req: Request, res: Response) => {
    const postId = parseInt(req.params.id);

    try {
        // Vérifie si l'ID du post est valide
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required.' });
        }

        // Récupère le post
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });

        // Vérifie si le post existe
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Incrémente le nombre de vues
        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: { views: post.views + 1 },
        });

        // Renvoie le post mis à jour
        return res.status(200).json({ message: 'Post views updated', views: updatedPost.views });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to increment post views', error });
    }
};
