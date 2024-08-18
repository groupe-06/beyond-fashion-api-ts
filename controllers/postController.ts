import { Request, Response } from 'express';
import prisma from '../database/db.config';
import cloudinary from '../config/cloudinary';

export const createPost = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { description } = req.body;
    let { content } = req.body;
    const file = req.file; 

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
            return res.status(401).json({ message: 'You are not authorized to create a post' });
        }

        if (file) {
            const media = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(file.buffer);  // Envoie du fichier en mémoire vers Cloudinary
            });
            content = (media as any).secure_url;
        }

        if (!content) {
            return res.status(400).json({ message: 'Content is required.' });
        }

        if (user.credit == 0) {
            return res.status(400).json({ message: 'You are out of credit. Please refill your credit.' });
        }
        user.credit -= 2;
        await prisma.user.update({ where: { id: userId }, data: { credit: user.credit } });

        if (user.credit <= 5) {
            return res.status(201).json({ message: 'Your credit is almost over. Please refill your credit.', post: { content, description } });
        } 

        const post = await prisma.post.create({
            data: {
                content,
                description,
                author: { connect: { id: userId } },
            },
        });
        res.status(201).json({ message: 'Post created successfully', post });

    } catch (error) {
        return res.status(500).json({ message: 'Failed to create post', error });
    }
};
