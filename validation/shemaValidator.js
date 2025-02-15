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
exports.validateCommentRequest = exports.validatePostRequest = exports.commentSchema = exports.postSchema = void 0;
const zod_1 = require("zod");
// Schéma existant pour les posts////////////////////////////////////////////////////////////////////////////
exports.postSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, "content is required"),
    // description: z.string().min(1,"description is required")//////////////////////////////////////////////////////////
});
// Nouveau schéma pour les commentaires/////////////////////////////////////////////////////////////
exports.commentSchema = zod_1.z.object({
    content: zod_1.z.string().max(800, "Le commentaire ne doit pas dépasser 800 caractères").min(3, "Le commentaire doit avoir minimum 3 caractères"),
});
// Middleware existant pour la validation des posts/////////////////////////////////////////////////
const validatePostRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        exports.postSchema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: error.errors[0].message });
        }
        else {
            res.status(500).json({ message: 'Une erreur est survenue lors de la validation' });
        }
    }
});
exports.validatePostRequest = validatePostRequest;
// Nouveau middleware pour la validation des commentaires/////////////////////////////////////////////////////////////////////
const validateCommentRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        exports.commentSchema.parse(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ message: error.errors[0].message });
        }
        else {
            res.status(500).json({ message: 'Une erreur est survenue lors de la validation' });
        }
    }
});
exports.validateCommentRequest = validateCommentRequest;
