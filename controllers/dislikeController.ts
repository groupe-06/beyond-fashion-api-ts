import { Request, Response } from 'express';
import prisma from '../database/db.config';
import sendNotification from '../controllers/notificationController';

export const dislikePost = async (req: Request, res: Response) => {
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

        const existingDislike = await prisma.postDislike.findFirst({
            where: { postId, userId },
        });

        const existingLike = await prisma.postLike.findFirst({
            where: { postId, userId },
        });

        if (existingDislike) {
            // User has already disliked the post, remove the dislike
            await prisma.postDislike.delete({ where: { id: existingDislike.id } });
            return res.status(200).json({ message: "Dislike removed." });
        }

        if (existingLike) {
            // If the user had liked the post, remove the like
            await prisma.postLike.delete({ where: { id: existingLike.id } });
        }

        // Create a new dislike
        await prisma.postDislike.create({
            data: {
                userId,
                postId,
            },
        });

        // Send a notification to the post author
        await sendNotification(post.authorId, `Your post has been disliked.`);

        res.status(201).json({ message: "Post disliked successfully." });

    } catch (error) {
        console.error("Error disliking post:", error);
        res.status(500).json({ message: "An error occurred while disliking the post.", error });
    }
};
