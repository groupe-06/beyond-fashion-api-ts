import { Request, Response } from 'express';
import prisma from '../database/db.config';

export const searchPostsByTag = async (req: Request, res: Response) => {
    try {
        const { tagName } = req.params;

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
                postLikes: true,
                favorites: true,
            },
        });

        if (posts.length === 0) {
            return res.status(404).json({ message: `No posts found with tag "${tagName}"` });
        }

        const formattedPosts = posts.map(post => ({
            id: post.id,
            content: post.content,
            description: post.description,
            views: post.views,
            tags: post.tag.map(t => t.name),
            likes: post.postLikes.length, 
            favorites: post.favorites.length, 
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
                user: {
                    select: {
                        firstname: true,
                        lastname: true,
                        email: true,
                        address: true,
                    },
                },
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

export const searchSellerAndArticles = async (req: Request, res: Response) => {
    try {
        const sellerId = parseInt(req.params.sellerId);

        if (!sellerId) {
            return res.status(400).json({ message: 'Seller ID is required.' });
        }

        const user = await prisma.user.findUnique({
            where: { id: sellerId },
            include: {
                roles: true, 
            },
        });

        if (!user) {
            return res.status(404).json({ message: `User with ID ${sellerId} not found!` });
        }

        if (!user.roles.some(r => r.name === 'SELLER')) {
            return res.status(401).json({ message: 'This user does not have the SELLER role' });
        }

        const articles = await prisma.article.findMany({
            where: {
                userId: sellerId,
            },
            include: {
                category: true, 
                tags: true, 
            },
        });
        const formattedSeller = {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            address: user.address,
            articles: articles.map(article => ({
                id: article.id,
                name: article.name,
                category: article.category ? article.category.name : null,
                tags: article.tags.map(tag => tag.name),
            })),
        };

        return res.status(200).json({ seller: formattedSeller });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to search seller and articles', error });
    }
};

export const searchArticlesByCategory = async (req: Request, res: Response) => {
    try {
        const { categoryName } = req.params;

        const articles = await prisma.article.findMany({
            where: {
                category: {
                    name: categoryName,
                },
            },
            include: {
                category: true, 
                tags: true, 
                user: {
                    select: {
                        firstname: true,
                        lastname: true,
                        email: true,
                        address: true,
                    },
                },
            },
        });

        if (articles.length === 0) {
            return res.status(404).json({ message: `No articles found in category "${categoryName}"` });
        }

        return res.status(200).json({ articles });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to search articles by category', error });
    }
};

export const searchArticlesByTag = async (req: Request, res: Response) => {
    try {
        const { tagName } = req.params;

        const articles = await prisma.article.findMany({
            where: {
                tags: {
                    some: {
                        name: tagName,
                    },
                },
            },
            include: {
                category: true,
                tags: true,
                user: {
                    select: {
                        firstname: true,
                        lastname: true,
                        email: true,
                        address: true,
                    },
                },
            },
        });

        if (articles.length === 0) {
            return res.status(404).json({ message: `No articles found with tag "${tagName}"` });
        }

        return res.status(200).json({ articles });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to search articles by tag', error });
    }
};
