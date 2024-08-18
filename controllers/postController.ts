import { Request, Response } from 'express';
import prisma from '../database/db.config';

export const createPost = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { content, description } = req.body;
    try {

        if (!userId) {
            return res.status(401).json({ message: 'User not found !!' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                roles: true,
            },
        });

        if (!user) {
            return res.status(401).json({ message: `User with ID ${userId} not found!!` });
        }

        if (!user.roles.some(r => r.name === 'TAILOR')) {
            return res.status(401).json({ message: 'You are not authorized to create a post' });
        }

        if (!content) {
            return res.status(400).json({ message: 'Content are required.' });
        }

        if (user.credit == 0) {
            return res.status(400).json({ message: 'Your credit is almost over. Please refill your credit.' });
        }
        user.credit -= 2;
        await prisma.user.update({ where: { id: userId }, data: { credit: user.credit } });
        

        if (user.credit <= 5) {
            
            //Envoie de mail , notification et de sms
        }

        const post = await prisma.post.create({
            data: {
                content,
                description: description || '',
                author: { connect: { id: userId } },
            },
        });
        return res.status(201).json({ message: 'Post created successfully', post });

    } catch (error) {
        return res.status(500).json({ message: 'Failed to create post', error });
    }

};


export const updatePost = async(req:Request, res:Response) => {
    const postId = parseInt(req.params.id);
    const userId = (req as any).userId;
    const { content, description } = req.body;

    try {

        if (!userId) {
            return res.status(401).json({ message: 'User not found !!' });
        }
        
        // console.log(`userId: ${userId}`);
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                roles: true,
            },
        });
        
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required.' });
        }
        // console.log(`postId: ${postId}`);
        
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        
        if ((post.authorId as any)!== userId) {
            // console.log(`postAutor: ${(post.authorId)}`);
            return res.status(401).json({ message: 'You are not authorized to update this post.' });
        }

        await prisma.post.update({ where: { id: postId }, data: { content, description } });
        return res.status(201).json({ message: 'Post updated successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'Failed to update post', error });
    }
};

export const deletePost = async (req: Request, res: Response) => {
    const postId = parseInt(req.params.id);
    const userId = (req as any).userId;

    try {

        if (!userId) {
            return res.status(401).json({ message: 'User not found!!' });
        }
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                roles: true,
            },
        });
        
        if (!user ||!user.roles.some(r => r.name === 'TAILOR')) {
            return res.status(401).json({ message: 'You are not authorized to delete this post' });
        }
        
        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required.' });
        }
        
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        if ((post.authorId as any)!== userId) {
            return res.status(401).json({ message: 'You are not authorized to delete this post.' });
        }
            // si la date du post > 1jour : on ne peut plus remboursee
        // user.credit += 2;
        // await prisma.user.update({ where: { id: userId }, data: { credit: user.credit } });

        await prisma.post.delete({ where: { id: postId } });
        
        res.status(200).json({ message: 'Post deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Failed to delete post', error });
    }

}









