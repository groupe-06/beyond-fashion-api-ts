import { Request, Response } from 'express';
import prisma from '../database/db.config';
import sendNotification from '../controllers/notificationController';

export const likePost = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { postId } = req.body;

    try {

        if(!userId){
            return res.status(401).json({ message: 'userId from token not found' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: `User with ID ${userId} not found` });
        }

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

        /*const existingDislike = await prisma.postDislike.findFirst({
            where: { postId, userId },
        });

        if (existingDislike) {
            // If the user had disliked the post, remove the dislike
            await prisma.postDislike.delete({ where: { id: existingDislike.id } });
        }*/

        if (existingLike) {
            await prisma.postLike.delete({ where: { id: existingLike.id } });
            return res.status(200).json({ message: "Like removed successfully." });
        }

        

        // Create a new like
        await prisma.postLike.create({
            data: {
                userId,
                postId,
            },
        });

        
        await sendNotification(post.authorId, `${user.firstname} ${user.lastname} vient d'aimer votre post. ${post.description ? post.description.substring(0, 30)+'...' : ''}`, "LIKE", postId);
        return res.status(201).json({ message: "Post liked successfully." });
         
    } catch (error) {
        console.error("Error liking post:", error);
        res.status(500).json({ message: "An error occurred while liking the post.", error });
    }
};
