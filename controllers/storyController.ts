import { Request, Response } from "express";
import prisma from "../database/db.config";
import cloudinary from '../config/cloudinary'; 
import cron from "node-cron";


export const createStory = async (req: Request, res: Response) => {
    try {
        const { content, description } = req.body;
        const userId = (req as any).userId;
        const file = req.file;
     

        if (!userId) {
            return res.status(401).json({ message: 'Your user ID is undefined. Please login and try again' });
        }

        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            include: {
                roles: true,
            }
        });

        if (!user) {
            return res.status(404).json({ message: `User with ID ${userId} not found` });
        }

        if (!user.roles.find(r => r.name === 'TAILOR')) {
            return res.status(401).json({ message: 'You are not allowed to create a story' });
        }

        let mediaUrl = content; 

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

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 1);

        const story = await prisma.story.create({
            data: {
                content: mediaUrl, 
                description: description || '', 
                authorId: userId, 
                expiresAt
            }
        });

        return res.status(201).json({ message: 'Story created successfully', story });
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong. Please try again', error });
    }
};

export const getAllStories = async (req: Request, res: Response) => {
    try {
        const stories = await prisma.story.findMany();
        return res.status(200).json({ message: 'Stories fetched successfully', stories });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch stories', error });
    }
}

export const getAllStoryByConnectedUser = async(req: Request, res: Response) => {
    const userId = (req as any).userId;
    try {
        const stories = await prisma.story.findMany({
            where: { authorId: Number(userId) },
        });
        return res.status(200).json({ message: 'Stories fetched successfully', stories });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to fetch stories', error });
    }
}

export const deleteStory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const story = await prisma.story.delete({
            where: { id: Number(id) },
        });
        return res.status(200).json({ message: 'Story deleted successfully', story });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to delete story', error });
    }
}

const deleteExpiredStories = async () => {
    const now = new Date();
    try {
        const result = await prisma.story.deleteMany({
            where: { expiresAt: { lt: now } },
        });
        console.log(`Deleted ${result.count} stories`);
    } catch (error) {
        console.error('Error deleting stories:', error);
    }
}

cron.schedule('* * * * *', deleteExpiredStories);
