import { Request, Response } from 'express';
import prisma from '../database/db.config';

export const createComment = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { postId } = req.params;
  const { content, parentId } = req.body;

  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
      include: { author: true }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Vérifier si le parentId existe et est valide
    let parentComment = null;
    if (parentId) {
      parentComment = await prisma.comment.findUnique({ where: { id: parseInt(parentId) } });
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        author: { connect: { id: userId } },
        post: { connect: { id: parseInt(postId) } },
        parent: parentId ? { connect: { id: parseInt(parentId) } } : undefined // Lier au commentaire parent si fourni
      }
    });

  const notificationReceiverId = parentId ? parentComment?.authorId : post.authorId;
  if (notificationReceiverId !== undefined) {
    await prisma.notification.create({
      data: {
        content: `Nouveau commentaire : "${content.substring(0, 30)}..."`, 
        receiverId: notificationReceiverId  
      }
    });
  }
  
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
