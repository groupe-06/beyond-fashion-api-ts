import { Request, Response } from 'express';
import prisma from '../database/db.config';


export const createRate = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { stars, description } = req.body;
        const userId = (req as any).userId as number;
        const postId = parseInt(req.params.postId);

        if (stars <= 2 && !description) {
            return res.status(400).json({ message: "Description is required because your rate is 2 stars or less" });
        }

        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const existingRate = await prisma.rate.findFirst({
            where: {
                postId,
                userId
            }
        });

        if (existingRate) {
            return res.status(400).json({ message: "You have already rated this post" });
        }

        const postAuthor = await prisma.user.findUnique({
            where: { id: post.authorId }
        });

        if (postAuthor?.id === userId) {
            return res.status(400).json({ message: "You cannot rate your own post" });
        }

        const rate = await prisma.rate.create({
            data: {
                stars,
                description,
                postId,
                userId,
            }
        });

        return res.status(201).json({ message: "Post rated successfully", rate });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const allRates = async (req: Request, res: Response): Promise<Response> => {
    try {
        const rates = await prisma.rate.findMany({
            include: {
                post: true,
                user: {
                    select: {
                        firstname: true,
                        lastname: true,
                        email: true
                    }
                }
            }
        });
        return res.status(200).json(rates);
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const updateRate = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { stars, description } = req.body;
        const rateId = parseInt(req.params.id);
        const userId = (req as any).userId as number;

        const rate = await prisma.rate.findUnique({
            where: { id: rateId }
        });

        if (!rate) {
            return res.status(404).json({ message: "Rate not found" });
        }

        if (rate.userId !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this rate" });
        }

        const updatedRate = await prisma.rate.update({
            where: { id: rateId },
            data: {
                stars,
                description
            }
        });

        return res.status(200).json({ message: "Rate updated successfully", updatedRate });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteRate = async (req: Request, res: Response): Promise<Response> => {
    try {
        const rateId = parseInt(req.params.id);
        const userId = (req as any).userId as number;

        const rate = await prisma.rate.findUnique({
            where: { id: rateId }
        });

        if (!rate) {
            return res.status(404).json({ message: "Rate not found" });
        }

        if (rate.userId !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this rate" });
        }

        await prisma.rate.delete({
            where: { id: rateId }
        });

        return res.status(200).json({ message: "Rate deleted successfully" });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};
