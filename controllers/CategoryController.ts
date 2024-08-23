// controllers/CategoryController.ts
import { Request, Response } from 'express';
import prisma from '../database/db.config'; // ton instance Prisma

export const createCategory = async (req: Request, res: Response) => {
  const { name, image, unitId } = req.body;

  try {
    // Vérifier si la catégorie existe déjà
    const existingCategory = await prisma.category.findFirst({
      where: { name },
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'La catégorie existe déjà' });
    }

    // Créer la catégorie
    const newCategory = await prisma.category.create({
      data: {
        name,
        image,
        unitId,
      },
    });

    return res.status(201).json(newCategory);
  } catch (error) {
    // Cast error to Error if it's an instance of Error
    if (error instanceof Error) {
      return res.status(500).json({ error: 'Erreur lors de la création de la catégorie : ' + error.message });
    } else {
      return res.status(500).json({ error: 'Une erreur inconnue est survenue' });
    }
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const categoryId = Number(req.params.categoryId);

  try {
    // Vérifier si la catégorie est liée à des articles
    const articleCount = await prisma.article.count({
      where: { categoryId },
    });

    if (articleCount > 0) {
      return res.status(400).json({ message: 'Category cannot be deleted because it is linked to articles' });
    }

    // Supprimer la catégorie
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    // Cast error to Error if it's an instance of Error
    if (error instanceof Error) {
      return res.status(500).json({ message: 'Erreur lors de la suppression de la catégorie : ' + error.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};