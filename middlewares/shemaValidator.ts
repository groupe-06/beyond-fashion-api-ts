import { Express, Response, Request, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

const validerRequête = (schéma: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            schéma.parse(req.body);
            next(); 
        } catch (erreur) {
            if (erreur instanceof z.ZodError) {
                const messages = erreur.errors.map(e => e.message);
                res.status(400).send({ messages });
            } else {
                throw erreur;
            }
        }
    };
};

const postSchema = z.object({
    content: z.string().min(1, "Le contenu est requis"),
});

const commentSchema = z.object({
    content: z.string().min(1, "Le contenu est requis").max(800, "Le commentaire ne doit pas dépasser 800 caractères"),
});

const userSchema = z.object({
    email: z.string().email().min(1, "L'email est requis"),
    password: z.string().min(8, "Le mot de passe doit comporter au moins 8 caractères").max(20, "Le mot de passe ne doit pas dépasser 20 caractères"),
    lastname: z.string().min(1, "Le nom de famille est requis"),
    firstname: z.string().min(1, "Le prénom est requis"),
    phoneNumber: z.string().min(9, "Le numéro de téléphone doit comporter 9 chiffres"),
    address: z.string().min(1, "L'adresse est requise"),
    gender: z.string().min(1, "Le genre est requis"),
});

const validatePostRequest = validerRequête(postSchema);
const validateCommentRequest = validerRequête(commentSchema);
const validateUserRequest = validerRequête(userSchema);

export { validatePostRequest, validateCommentRequest, validateUserRequest };