import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createRole = async (req: Request, res: Response) => {
    const { name } = req.body;
    try {
        const role = await prisma.role.create({
            data: { name },
        });
        res.status(201).json({ message: 'Role created successfully', role });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create role', error });
    }
};

export const getAllRoles = async (req: Request, res: Response) => {
    try {
        const roles = await prisma.role.findMany();
        res.json({ message: 'Roles fetched successfully', roles });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch roles', error });
    }
};

export const getRoleById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const role = await prisma.role.findUnique({
            where: { id: Number(id) },
        });
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.json({ message: 'Role fetched successfully', role });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch role', error });
    }
};

export const updateRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const role = await prisma.role.update({
            where: { id: Number(id) },
            data: { name },
        });
        res.json({ message: 'Role updated successfully', role });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update role', error });
    }
};

export const deleteRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.role.delete({
            where: { id: Number(id) },
        });
        res.status(204).json({ message: 'Role deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete role', error });
    }
};