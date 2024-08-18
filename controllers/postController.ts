import { Request, Response } from 'express';
import prisma from '../database/db.config';
import cloudinary from '../config/cloudinary';

export const createPost = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { description } = req.body;
    let { content } = req.body;
    const file = req.file; // Access the uploaded file

    try {
        if (!userId) {
            return res.status(401).json({ message: 'You are not authorized to create a post.' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                roles: true,
            },
        });

        if (!user || !user.roles.some(r => r.name === 'TAILOR')) {
            return res.status(401).json({ message: 'You are not authorized to create a post as a seller.' });
        }

        if (file) {
            const media = await cloudinary.uploader.upload(file.path, { resource_type: 'auto' });
            content = media.secure_url;
        }

        if (!description) {
            return res.status(400).json({ message: 'Description is required.' });
        }

        if (user.credit <= 0) {
            return res.status(400).json({ message: 'You are out of credit. Please refill your credit.' });
        }
        user.credit -= 2;
        await prisma.user.update({ where: { id: userId }, data: { credit: user.credit } });

        if (user.credit <= 5) {
            res.status(201).json({ message: 'Your credit is almost over. Please refill your credit.', post: { content, description } });
        } else {
            const post = await prisma.post.create({
                data: {
                    content,
                    description,
                    author: { connect: { id: userId } },
                },
            });
            res.status(201).json({ message: 'Post created successfully', post });
        }

    } catch (error) {
        res.status(500).json({ message: 'Failed to create post', error });
    }
};