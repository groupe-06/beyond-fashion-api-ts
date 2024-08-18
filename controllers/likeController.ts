import { Request, Response } from 'express';
import prisma from '../database/db.config';
import sendNotification from '../controllers/notificationController';

export const likePost = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { postId } = req.body;

    try {
        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: { author: true },
        });

        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }

        const existingLike = await prisma.postLike.findFirst({
            where: { postId, userId },
        });

        const existingDislike = await prisma.postDislike.findFirst({
            where: { postId, userId },
        });

        if (existingLike) {
            // User has already liked the post, remove the like
            await prisma.postLike.delete({ where: { id: existingLike.id } });
            return res.status(200).json({ message: "Like removed." });
        }

        if (existingDislike) {
            // If the user had disliked the post, remove the dislike
            await prisma.postDislike.delete({ where: { id: existingDislike.id } });
        }

        // Create a new like
        await prisma.postLike.create({
            data: {
                userId,
                postId,
            },
        });

        // Send a notification to the post author
        await sendNotification(post.authorId, `Your post has been liked.`);

        res.status(201).json({ message: "Post liked successfully." });

    } catch (error) {
        console.error("Error liking post:", error);
        res.status(500).json({ message: "An error occurred while liking the post.", error });
    }
};
