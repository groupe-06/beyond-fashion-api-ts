import { Request, Response } from 'express';
import prisma from '../database/db.config';

export const addMeasurement = async (req: Request, res: Response) => {
  const { shoulder, chest, waist, hips, sleeveLength, neck, back, armhole, thigh, calf, bust, inseam } = req.body;
  const userId = (req as any).userId;
  
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.gender === 'MALE') {
      const maleMeasurement = await prisma.maleMeasurement.create({
        data: {
          userId,
          shoulder,
          chest,
          waist,
          hips,
          sleeveLength,
          neck,
          back,
          armhole,
          thigh,
          calf
        }
      });
      return res.status(201).json(maleMeasurement);
    } else if (user.gender === 'FEMALE') {
      const femaleMeasurement = await prisma.femaleMeasurement.create({
        data: {
          userId,
          shoulder,
          chest,
          waist,
          hips,
          bust,
          inseam,
          thigh
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

    if (user.gender === 'MALE') {
      const updatedMaleMeasurement = await prisma.maleMeasurement.update({
        where: { id: Number(measurementId) },
        data: {
          ...req.body
        }
      });
      return res.status(200).json(updatedMaleMeasurement);
    } else if (user.gender === 'FEMALE') {
      const updatedFemaleMeasurement = await prisma.femaleMeasurement.update({
        where: { id: Number(measurementId) },
        data: {
          ...req.body
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
      const maleMeasurements = await prisma.maleMeasurement.findMany({ where: { userId } });
      return res.status(200).json(maleMeasurements);
    } else if (user.gender === 'FEMALE') {
      const femaleMeasurements = await prisma.femaleMeasurement.findMany({ where: { userId } });
      return res.status(200).json(femaleMeasurements);
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
