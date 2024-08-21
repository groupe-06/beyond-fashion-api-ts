import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Schéma existant pour les posts////////////////////////////////////////////////////////////////////////////
export const postSchema = z.object({
  content: z.string().min(1, "content is required"),
  // description: z.string().min(1,"description is required")//////////////////////////////////////////////////////////
});

// Nouveau schéma pour les commentaires/////////////////////////////////////////////////////////////
export const commentSchema = z.object({
  content: z.string().max(800, "Le commentaire ne doit pas dépasser 800 caractères").min(3, "Le commentaire doit avoir minimum 3 caractères"),
});

// Middleware existant pour la validation des posts/////////////////////////////////////////////////
export const validatePostRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    postSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      res.status(500).json({ message: 'Une erreur est survenue lors de la validation' });
    }
  }
};

// Nouveau middleware pour la validation des commentaires/////////////////////////////////////////////////////////////////////
export const validateCommentRequest = async (req: Request, res: Response, next: NextFunction) => {
  try {
    commentSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.errors[0].message });
    } else {
      res.status(500).json({ message: 'Une erreur est survenue lors de la validation' });
    }
  }
};