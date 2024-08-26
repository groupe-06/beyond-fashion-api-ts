import { Request, Response } from 'express';
import prisma from '../database/db.config';

export const createConversion = async (req: Request, res: Response) => {
    try {
        const { fromUnitId, toUnitId } = req.body;

        // Validation des données
        if (!fromUnitId || !toUnitId) {
            return res.status(400).json({ message: 'Missing required fields: fromUnitId, toUnitId, or value.' });
        }

        // Vérifier si les unités existent
        const fromUnit = await prisma.unit.findUnique({
            where: { id: fromUnitId }
        });

        const toUnit = await prisma.unit.findUnique({
            where: { id: toUnitId }
        });

        if (!fromUnit || !toUnit) {
            return res.status(404).json({ message: 'One or both units not found.' });
        }

        // Vérifier si la conversion existe déjà
        const existingConversion = await prisma.conversion.findFirst({
            where: {
                fromUnitId,
                toUnitId
            }
        });

        if (existingConversion) {
            return res.status(409).json({ message: 'Conversion between these units already exists.' });
        }

        let value = 0;
        if (fromUnit.name === toUnit.name) {
            value = 1;
        }else if (fromUnit.name === 'METRE' && toUnit.name === 'CENTIMETRE') {
            value = 100;
        } else if (fromUnit.name === 'CENTIMETRE' && toUnit.name === 'METRE') {
            value = 0.1;
        } else if (fromUnit.name === 'METRE' && toUnit.name === 'YARD') {
            value = 1.09;
        } else if (fromUnit.name === 'YARD' && toUnit.name === 'METRE') {
            value = 0.91;
        }

        // Créer la conversion
        const conversion = await prisma.conversion.create({
            data: {
                fromUnitId,
                toUnitId,
                value
            }
        });

        return res.status(201).json({ message: 'Conversion created successfully.', conversion });

    } catch (error) {
        console.error('Error creating conversion:', error);
        return res.status(500).json({ message: 'An error occurred while creating the conversion.', error });
    }
};
