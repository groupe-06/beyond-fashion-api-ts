import { Request, Response } from 'express';
import prisma from '../database/db.config';

export const addMeasurement = async (req: Request, res: Response) => {
  const { shoulder, chest, waist, hips, sleeveLength, neck, back, armhole, thigh, calf, bust, inseam } = req.body;
  const userId = (req as any).userId;

   // Convertir les valeurs en Float ou null si elles sont non définies ou vides
   const toFloat = (value: any) => value ? parseFloat(value) : null;
  
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.gender === 'MALE') {
      const maleMeasurement = await prisma.maleMeasurement.create({
        data: {
          userId,
          shoulder: toFloat(shoulder),
          chest: toFloat(chest),
          waist: toFloat(waist),
          hips: toFloat(hips),
          sleeveLength: toFloat(sleeveLength),
          neck: toFloat(neck),
          back: toFloat(back),
          armhole: toFloat(armhole),
          thigh: toFloat(thigh),
          calf: toFloat(calf)
        }
      });
      return res.status(201).json(maleMeasurement);
    } else if (user.gender === 'FEMALE') {
      const femaleMeasurement = await prisma.femaleMeasurement.create({
        data: {
          userId,
          shoulder: toFloat(shoulder),
          chest: toFloat(chest),
          waist: toFloat(waist),
          hips: toFloat(hips),
          bust: toFloat(bust),
          inseam: toFloat(inseam),
          thigh: toFloat(thigh)
        }
      });
      return res.status(201).json(femaleMeasurement);
    } else {
      return res.status(400).json({ message: 'Invalid gender' });
    }
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Unknown error occurred' });
  }
};

export const updateMeasurement = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const measurementId = req.params.id;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

     // Transformer les données reçues en float
    const data = Object.fromEntries(
      Object.entries(req.body).map(([key, value]) => [key, parseFloat(value as string)])
    );

    if (user.gender === 'MALE') {
      const updatedMaleMeasurement = await prisma.maleMeasurement.update({
        where: { id: Number(measurementId) },
        data: {
          ...data
        }
      });
      return res.status(200).json(updatedMaleMeasurement);
    } else if (user.gender === 'FEMALE') {
      const updatedFemaleMeasurement = await prisma.femaleMeasurement.update({
        where: { id: Number(measurementId) },
        data: {
          ...data
        }
      });
      return res.status(200).json(updatedFemaleMeasurement);
    } else {
      return res.status(400).json({ message: 'Invalid gender' });
    }
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Unknown error occurred' });
  }
};

export const deleteMeasurement = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const measurementId = req.params.id;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.gender === 'MALE') {
      await prisma.maleMeasurement.delete({ where: { id: Number(measurementId) } });
      return res.status(204).json({ message: 'Male measurement deleted' });
    } else if (user.gender === 'FEMALE') {
      await prisma.femaleMeasurement.delete({ where: { id: Number(measurementId) } });
      return res.status(204).json({ message: 'Female measurement deleted' });
    } else {
      return res.status(400).json({ message: 'Invalid gender' });
    }
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Unknown error occurred' });
  }
};

export const getMeasurements = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.gender === 'MALE') {
      const data = await prisma.maleMeasurement.findMany({ where: { userId } });
      return res.status(200).json({message: 'Mesures récupérées avec succès',  data});
    } else if (user.gender === 'FEMALE') {
      const data = await prisma.femaleMeasurement.findMany({ where: { userId } });
      return res.status(200).json({message: 'Mesures récupérées avec succès',  data});
    } else {
      return res.status(400).json({ message: 'Invalid gender' });
    }
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Unknown error occurred' });
  }
};
export const getMeasurementsbis = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  console.log('Requested userId:', userId);

  if (!userId) {
    console.error('UserId is missing in the request params');
    return res.status(400).json({ error: 'UserId is required' });
  }

  const parsedUserId = parseInt(userId, 10);

  if (isNaN(parsedUserId)) {
    console.error('Invalid userId format:', userId);
    return res.status(400).json({ error: 'Invalid userId format' });
  }

  try {
    const user = await prisma.user.findUnique({ 
      where: { id: parsedUserId },
      select: { id: true, gender: true }
    });

    console.log('User found:', user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let data;
    if (user.gender === 'MALE') {
      data = await prisma.maleMeasurement.findMany({ where: { userId: user.id } });
    } else if (user.gender === 'FEMALE') {
      data = await prisma.femaleMeasurement.findMany({ where: { userId: user.id } });
    } else {
      return res.status(400).json({ message: 'Invalid gender' });
    }

    console.log('Measurements found:', data);

    return res.status(200).json({ message: 'Mesures récupérées avec succès', data });
  } catch (error) {
    console.error('Error in getMeasurementsbis:', error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Unknown error occurred' });
  }
};