
import { Request, Response } from 'express';
import prisma from '../database/db.config'; // Assurez-vous que c'est la bonne instance Prisma

export const createUnit = async (req: Request, res: Response) => {
  const { name } = req.body;

  try {

    if (!name) {
      return res.status(400).json({ message: 'Missing required field: name' });
    }

    const existingUnit = await prisma.unit.findFirst({
      where: { name },
    });

    if(existingUnit) {
      return res.status(400).json({ message: 'Unit with name ' + name + ' already exists' });
    }

    const newUnit = await prisma.unit.create({
      data: {
        name,
      },
    });

    return res.status(201).json(newUnit);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: `Erreur lors de la création de l'unité : ${error.message}` });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

