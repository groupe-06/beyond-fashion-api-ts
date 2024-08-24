import { Express, Request, Response } from 'express';
import prisma from '../database/db.config';
import cloudinary from '../config/cloudinary';
import { sendMail } from '../utils/utils';

export const createPost = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { content, description, tags } = req.body;
    const file = req.file;

    try {
        if (!userId) {
            return res.status(401).json({ message: 'User not found!' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { roles: true },
        });

        if (!user) {
            return res.status(401).json({ message: `User with ID ${userId} not found!` });
        }

        if (!user.roles.some(r => r.name === 'TAILOR')) {
            return res.status(401).json({ message: 'You are not authorized to create a post' });
        }

        if (user.credit == 0) {
            return res.status(400).json({ message: 'You are out of credit. Please refill your credit.' });
        }


        if (!file && !content) {
            return res.status(400).json({ message: 'Either file or text content is required.' });
        }

        let mediaUrl: string | undefined;
        if (file) {
            const media = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(file.buffer);
            });
            mediaUrl = (media as any).secure_url;
        }


        // Ensure tags is an array
        let parsedTags = tags;
        if (typeof tags === 'string') {
            try {
                parsedTags = JSON.parse(tags);
            } catch (e) {
                parsedTags = [tags];
            }
        }
        if (!Array.isArray(parsedTags)) {
            parsedTags = parsedTags ? [parsedTags] : [];
        }

        const validTags: { id: number }[] = [];
        if (parsedTags && parsedTags.length > 0) {
            for (const tagName of parsedTags) {
                const tag = await prisma.tag.findUnique({
                    where: { name: tagName },
                });
                if (!tag) {
                    return res.status(400).json({ message: `Tag "${tagName}" does not exist.` });
                }
                validTags.push({ id: tag.id });
            }
        }

        user.credit -= 2;
        await prisma.user.update({ where: { id: userId }, data: { credit: user.credit } });

        if (user.credit <= 6) {
            sendMail(user.email, 'Credit Refill Alert', `You have ${user.credit} credits left. Please consider refilling your account.`);
        }

        const post = await prisma.post.create({
            data: {
                content: mediaUrl || content,
                description: description || '',
                author: { connect: { id: userId } },
                tag: {
                    connectOrCreate: parsedTags.map((tagName: string) => ({
                        where: { name: tagName },
                        create: { name: tagName },
                    })),
                },
            },
            include: {
                tag: true,
            },
        });

        return res.status(201).json({ message: 'Post created successfully', post });

    } catch (error) {
        console.error('Error in createPost:', error);
        return res.status(500).json({
            message: 'Failed to create post',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};


export const updatePost = async (req: Request, res: Response) => {
    const postId = parseInt(req.params.id);
    const userId = (req as any).userId;
    let { content, description, tags } = req.body;

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

        if (!postId) {
            return res.status(400).json({ message: 'Post ID is required.' });
        }

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: { tag: true }
        });
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        if (post.authorId !== userId) {
            return res.status(401).json({ message: 'You are not authorized to update this post.' });
        }

        // Ensure tags is an array
        let parsedTags = tags;
        if (typeof tags === 'string') {
            try {
                parsedTags = JSON.parse(tags);
            } catch (e) {
                parsedTags = [tags];
            }
        }
        if (!Array.isArray(parsedTags)) {
            parsedTags = parsedTags ? [parsedTags] : [];
        }

        console.log('Tags after processing:', parsedTags);

        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: {
                content,
                description,
                tag: {
                    set: [], // Remove all existing tags
                    connectOrCreate: parsedTags.map((tagName: string) => ({
                        where: { name: tagName },
                        create: { name: tagName },
                    })),
                }
            },
            include: {
                tag: true,
            }
        });

        return res.status(200).json({ message: 'Post updated successfully', post: updatedPost });

    } catch (error) {
        console.error('Error in updatePost:', error);
        return res.status(500).json({
            message: 'Failed to update post',
            error: error instanceof Error ? error.message : String(error)
        });
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

        if (!user || !user.roles.some(r => r.name === 'TAILOR')) {
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

        if (post.authorId !== userId) {
            return res.status(401).json({ message: 'You are not authorized to delete this post.' });
        }

        const jourEnMillis = 24 * 60 * 60 * 1000;
        const isPostOlderThanOneDay = post.publishedAt.getTime() + jourEnMillis < Date.now();

        if (isPostOlderThanOneDay) {

            await prisma.comment.deleteMany({ where: { postId } });
            await prisma.postLike.deleteMany({ where: { postId } });
            await prisma.favorite.deleteMany({ where: { postId } });
            await prisma.rate.deleteMany({ where: { postId } });


            await prisma.post.delete({ where: { id: postId } });
            return res.status(200).json({ message: 'Post deleted successfully. No refund is possible as the post is older than one day.' });
        } else {

            user.credit += 2;
            await prisma.user.update({ where: { id: userId }, data: { credit: user.credit } });

            await prisma.comment.deleteMany({ where: { postId } });
            await prisma.postLike.deleteMany({ where: { postId } });
            await prisma.favorite.deleteMany({ where: { postId } });
            await prisma.rate.deleteMany({ where: { postId } });

            await prisma.post.delete({ where: { id: postId } });
            return res.status(200).json({ message: 'Post deleted successfully and credits refunded.' });
        }

    } catch (error) {
        res.status(500).json({ message: 'Failed to delete post', error });
    }
};
