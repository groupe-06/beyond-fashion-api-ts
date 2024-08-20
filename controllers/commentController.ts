import { Request, Response } from 'express';
import prisma from '../database/db.config';

export const createComment = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { postId } = req.params;
  const { content } = req.body;

  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
      include: { author: true }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        author: { connect: { id: userId } },
        post: { connect: { id: parseInt(postId) } }
      }
    });

    // Envoyer une notification à l'auteur du post
    await prisma.notification.create({
      data: {
        content: `Nouveau commentaire sur votre post : "${content.substring(0, 30)}..."`,
        receiverId: post.authorId
      }
    });

    res.status(201).json({ message: 'Comment created successfully', comment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create comment', error });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { commentId } = req.params;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
      include: { post: true }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.authorId !== userId && comment.post.authorId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to delete this comment' });
    }

    await prisma.comment.delete({
      where: { id: parseInt(commentId) }
    });

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete comment', error });
  }
};