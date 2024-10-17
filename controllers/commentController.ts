import { Request, Response } from 'express';
import prisma from '../database/db.config';
import sendNotification from '../controllers/notificationController';

export const createComment = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { content, parentId, postId } = req.body;

    try {

        if(!userId){
            return res.status(401).json({ message: 'userId from token not present' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: `User with ID ${userId} not found` });
        }


        if (!postId){
            return res.status(400).json({ message: 'postId not present' });
        }
        
        const post = await prisma.post.findUnique({
            where: { id: parseInt(postId) },
            include: { author: true }
        });
  
        if (!post) {
            return res.status(404).json({ message: `Post with ID ${postId} not found` });
        }

        let parentComment = null;
        if (parentId) {
            parentComment = await prisma.comment.findUnique({
                where: { id: parseInt(parentId) },
                include: { author: true }
            });
    
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
        }
  
        // Créez le commentaire ou sous-commentaire
        const commentData: any = {
            content,
            author: { connect: { id: userId } },
            post: { connect: { id: parseInt(postId) } },
        };
  
        if (parentId) {
            commentData.parent = { connect: { id: parseInt(parentId) } };
        }
  
        const comment = await prisma.comment.create({ 
          data: commentData,
          include: { 
            author: { // Inclure les détails de l'auteur du commentaire
                select: {
                    firstname: true,
                    lastname: true,
                    photoUrl: true
                }
            },
            replies: { // Inclure les sous-commentaires
                include: {
                    author: { // Inclure les détails de l'auteur du sous-commentaire
                        select: {
                            firstname: true,
                            lastname: true,
                            photoUrl: true
                        }
                    }
                }
            }
        }
        });

        if(parentComment){
          await sendNotification(post.author.id, `${user.firstname} ${user.lastname} vient de commenter votre post ${content.substring(0, 30)}...`);
          await sendNotification(parentComment.authorId, `${user.firstname} ${user.lastname} a repondu à votre commenteraire ${content.substring(0, 30)}...`);
        }else{
            await sendNotification(post.authorId, `${user.firstname} ${user.lastname} vient de commenter votre post ${content.substring(0, 30)}...`);
        }
  
        res.status(201).json({ message: 'Comment created successfully', comment });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create comment', error });
    }
};

  export const updateComment = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { commentId } = req.params;
    const { content } = req.body;
  
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: parseInt(commentId) }
      });
  
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
  
      if (comment.authorId !== userId) {
        return res.status(403).json({ message: 'You are not authorized to update this comment' });
      }
  
      const updatedComment = await prisma.comment.update({
        where: { id: parseInt(commentId) },
        data: { content }
      });
  
      res.status(200).json({ message: 'Comment updated successfully', updatedComment });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update comment', error });
    }
  };
    

  export const deleteComment = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { commentId } = req.params;
  
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: parseInt(commentId) },
        include: { post: true },
      });
  
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
  
      // Check if the user is the author of the comment or the author of the post
      if (comment.authorId === userId || comment.post.authorId === userId) {
        
        // Step 1: Delete all replies to the comment
        await prisma.comment.deleteMany({
          where: {
            parentId: parseInt(commentId),
          },
        });
  
        // Step 2: Delete the main comment
        await prisma.comment.delete({
          where: { id: parseInt(commentId) },
        });
  
        return res.status(200).json({ message: 'Comment and its replies deleted successfully' });
      } else {
        return res.status(403).json({ message: 'You are not authorized to delete this comment' });
      }
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete comment', error });
    }
  };

  export const getCommentsWithReplies = async (req: Request, res: Response) => {
    const { postId } = req.params;
    try {
      // Récupérer tous les commentaires du post
      const comments = await prisma.comment.findMany({
        where: { postId: parseInt(postId) },
        include: {
          author: {
            select: {
              firstname: true,
              lastname: true,
              photoUrl: true
            },
          } ,
          replies: {
            include: { 
              author: {
                select: {
                  firstname: true,
                  lastname: true,
                  photoUrl: true
                },
              } 
            },
          },
        },
        orderBy: { createdAt: 'desc' } // Trier par date de création
      });
  
      // Fonction récursive pour structurer les commentaires et sous-commentaires
      const buildCommentTree = (comments: any[], parentId: number | null = null):any => {
        return comments
          .filter(comment => comment.parentId === parentId)
          .map(comment => ({
            ...comment,
            replies: buildCommentTree(comments, comment.id)
          }));
      };
  
      // Générer la structure hiérarchique des commentaires
      const commentTree = buildCommentTree(comments);
  
      res.status(200).json(commentTree);
    } catch (error) {
      res.status(500).json({ message: 'Failed to retrieve comments', error });
    }
  };
  
  