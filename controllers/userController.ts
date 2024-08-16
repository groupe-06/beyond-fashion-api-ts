import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../middlewares/tokenMiddleware';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const createUser = async (req: Request, res: Response) => {
    const { email, password, lastname, firstname, phonenumber, address } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { 
                email, 
                password: hashedPassword, 
                lastname, 
                firstname, 
                phonenumber,
                address,
                roles: {
                    connect: { name: 'SIMPLE' }
                }
            },
        });
        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create user', error });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        const token = await generateToken(user);
        res.json({ message: 'User Logged successfully', token });
    } catch (error) {
        res.status(500).json({ message: 'Failed to login', error });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany();
        res.json({ message: 'Users fetched successfully', users });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User fetched successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user', error });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email, password, lastname, firstname, phonenumber } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(id) },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const hashedPassword = password ? await bcrypt.hash(password, 10) : user.password;
        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: { email, password: hashedPassword, lastname, firstname, phonenumber },
        });
        res.json({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user', error });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({
            where: { id: Number(id) },
        });
        res.status(204).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user', error });
    }
};
