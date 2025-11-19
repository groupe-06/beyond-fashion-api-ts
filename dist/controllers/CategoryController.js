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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.createCategory = void 0;
const db_config_1 = __importDefault(require("../database/db.config")); // ton instance Prisma
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, image, unitId } = req.body;
    try {
        // Vérifier si la catégorie existe déjà
        if (!name || !unitId || !image) {
            return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
        }
        const unit = yield db_config_1.default.unit.findUnique({
            where: { id: unitId },
        });
        if (!unit) {
            return res.status(400).json({ message: 'Unit wiht id ' + unitId + ' not found' });
        }
        const existingCategory = yield db_config_1.default.category.findFirst({
            where: { name },
        });
        if (existingCategory) {
            return res.status(400).json({ message: 'La catégorie existe déjà' });
        }
        // Créer la catégorie
        const newCategory = yield db_config_1.default.category.create({
            data: {
                name,
                image,
                unitId,
            },
        });
        return res.status(201).json(newCategory);
    }
    catch (error) {
        // Cast error to Error if it's an instance of Error
        if (error instanceof Error) {
            return res.status(500).json({ error: 'Erreur lors de la création de la catégorie : ' + error.message });
        }
        else {
            return res.status(500).json({ error: 'Une erreur inconnue est survenue' });
        }
    }
});
exports.createCategory = createCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryId = Number(req.params.categoryId);
    try {
        // Vérifier si la catégorie est liée à des articles
        const articleCount = yield db_config_1.default.article.count({
            where: { categoryId },
        });
        if (articleCount > 0) {
            return res.status(400).json({ message: 'Category cannot be deleted because it is linked to articles' });
        }
        // Supprimer la catégorie
        yield db_config_1.default.category.delete({
            where: { id: categoryId },
        });
        return res.status(200).json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        // Cast error to Error if it's an instance of Error
        if (error instanceof Error) {
            return res.status(500).json({ message: 'Erreur lors de la suppression de la catégorie : ' + error.message });
        }
        else {
            return res.status(500).json({ message: 'An unknown error occurred' });
        }
    }
});
exports.deleteCategory = deleteCategory;
