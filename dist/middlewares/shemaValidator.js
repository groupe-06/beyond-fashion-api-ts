"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCommentRequest = exports.validatePostRequest = void 0;
const zod_1 = require("zod");
const validerRequête = (schéma) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            schéma.parse(req.body);
            next();
        }
        catch (erreur) {
            if (erreur instanceof zod_1.z.ZodError) {
                const messages = erreur.errors.map(e => e.message);
                res.status(400).send({ messages });
            }
            else {
                throw erreur;
            }
        }
    });
};
const postSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, "Le contenu est requis"),
});
const commentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, "Le contenu est requis").max(800, "Le commentaire ne doit pas dépasser 800 caractères"),
});
// const userSchema = z.object({
//     email: z.string().email().min(1, "L'email est requis"),
//     password: z.string().min(8, "Le mot de passe doit comporter au moins 8 caractères").max(20, "Le mot de passe ne doit pas dépasser 20 caractères"),
//     lastname: z.string().min(1, "Le nom de famille est requis"),
//     firstname: z.string().min(1, "Le prénom est requis"),
//     phoneNumber: z.string().min(9, "Le numéro de téléphone doit comporter 9 chiffres"),
//     address: z.string().min(1, "L'adresse est requise"),
//     gender: z.string().min(1, "Le genre est requis"),
// });
const validatePostRequest = validerRequête(postSchema);
exports.validatePostRequest = validatePostRequest;
const validateCommentRequest = validerRequête(commentSchema);
exports.validateCommentRequest = validateCommentRequest;
