import { Request, Response } from 'express';
import prisma from '../database/db.config';

export const searchPostsByTag = async (req: Request, res: Response) => {
    try {
        const { tagName } = req.params;

        // Find posts with the specified tag and include author and tags
        const posts = await prisma.post.findMany({
            where: {
                tag: {
                    some: {
                        name: tagName,
                    },
                },
            },
            include: {
                author: {
                    select: {
                        firstname: true,
                        lastname: true,
                    },
                },
                tag: true,
            },
        });

        if (posts.length === 0) {
            return res.status(404).json({ message: `No posts found with tag "${tagName}"` });
        }

        // Format response to include post details, tags, and author info
        const formattedPosts = posts.map(post => ({
            id: post.id,
            content: post.content,
            description: post.description,
            tags: post.tag.map(t => t.name),
            author: {
                firstname: post.author.firstname,
                lastname: post.author.lastname,
            },
        }));

        return res.status(200).json({ posts: formattedPosts });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to search posts by tag', error });
    }
};

export const searchArticlesByFirstLetter = async (req: Request, res: Response) => {
    try {
        const { letter } = req.params;

        const articles = await prisma.article.findMany({
            where: {
                name: {
                    startsWith: letter,
                },
            },
            include: {
                category: true,
                tags: true,
            },
        });

        if (articles.length === 0) {
            return res.status(404).json({ message: `No articles found starting with "${letter}"` });
        }

        return res.status(200).json({ articles });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to search articles by first letter', error });
    }
};
