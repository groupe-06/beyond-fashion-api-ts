import { Request, Response } from 'express';
import prisma from '../database/db.config';

export const toggleFavorite = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId as number;
        const postId = parseInt(req.params.postId);

        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const existingFavorite = await prisma.favorite.findFirst({
            where: {
                postId,
                userId
            }
        });

        if (existingFavorite) {
            
            await prisma.favorite.delete({
                where: { id: existingFavorite.id }
            });

            await prisma.post.update({
                where: { id: postId },
                data: { nbFavorites: post.nbFavorites > 0 ? post.nbFavorites - 1 : 0 },
            });

            return res.status(200).json({ message: "Post removed from favorites" });
        } else {
            const favorite = await prisma.favorite.create({
                data: {
                    postId,
                    userId,
                }
            });

            await prisma.post.update({
                where: { id: postId },
                data: { nbFavorites: post.nbFavorites + 1 },
            });

            return res.status(201).json({ message: "Post added to favorites successfully", favorite });
        }
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};


export const allFavorites = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userId = (req as any).userId as number;

        const favorites = await prisma.favorite.findMany({
            where: { userId },
            include: {
                post: true
            }
        });

        return res.status(200).json(favorites);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const removeFavorite = async (req: Request, res: Response): Promise<Response> => {
    try {
        const favoriteId = parseInt(req.params.id);
        const userId = (req as any).userId as number;

        const favorite = await prisma.favorite.findUnique({
            where: { id: favoriteId }
        });

        if (!favorite) {
            return res.status(404).json({ message: "Favorite not found" });
        }

        if (favorite.userId !== userId) {
            return res.status(403).json({ message: "You are not authorized to remove this favorite" });
        }

        await prisma.favorite.delete({
            where: { id: favoriteId }
        });

        await prisma.post.update({
            where: { id: favorite.postId },
            data: {
                nbFavorites: {
                    decrement: 1
                }
            }
        });

        return res.status(200).json({ message: "Favorite removed successfully" });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

