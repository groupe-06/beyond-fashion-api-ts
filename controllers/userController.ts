import { Request, Response } from 'express';
import { cryptPassword, comparePasswords, generateToken  } from '../utils/utils';
import prisma from '../database/db.config';



export const createUser = async (req: Request, res: Response) => {
    const { email, password, lastname, firstname, phoneNumber, address, gender, confirm_password } = req.body;
    try {
        if (password !== confirm_password) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        const hashedPassword = cryptPassword(password);
        const user = await prisma.user.create({
            data: { 
                email, 
                password: hashedPassword, 
                lastname, 
                firstname, 
                phoneNumber,
                address,
                gender,
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
            return res.status(404).json({ message: 'Invalid email or password' });
        }
        const isMatch =  comparePasswords(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = await generateToken(user);
        res.json({ message: 'User Logged successfully', ...user, token });
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
    const userId = (req as any).userId;
    try {
        const user = await prisma.user.findUnique({
            where: { id: +userId },
            include: {
                roles: true,
            }
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
    const userId = (req as any).userId;
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const updatedUser = await prisma.user.update({
            where: { id: Number(userId) },
            data: req.body
        });

        res.status(201).json({ message: 'User updated successfully', user: updatedUser });
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

export const updateProfile = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { role } = req.body;
    try {

        if(!userId){
            return res.status(401).json({ message: 'You are not authorized to update this profile.' });
        }

        let user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            include: {
                roles: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: `User with ID ${userId} not found` });
        }

        const roleFromDb =  await prisma.role.findUnique({
            where: { name: role },
        });

        if(!roleFromDb){
            return res.status(404).json({ message: `Role ${role} not found from DB` });
        }

        const hasAlreadyRole = user.roles.find(r => r.name === role);

        if(hasAlreadyRole){
            return res.status(400).json({ message: `User is already assigned the role ${role}.` });
        }    

        if(role === "TAILOR"){
            const role = user.roles.find(role => role.name === "SELLER");
            if(role){
                return res.status(400).json({ message: `User is already assigned to the role ${role.name}.` });
            }
        }

        if(role === "SELLER"){
            const role = user.roles.find(role => role.name === "TAILOR");
            if(role){
                return res.status(400).json({ message: `User is already assigned to the role ${role.name}.` });
            }
        }

        
        let updatedUser;
        if( role === "TAILOR"){
            updatedUser = await prisma.user.update({
                where: { id: Number(userId) },
                data: { roles: { connect: [{ id: roleFromDb.id }] }, credit: 40 },
            });
        }else {
            updatedUser = await prisma.user.update({
                where: { id: Number(userId) },
                data: { roles: { connect: [{ id: roleFromDb.id }] } },
            });
        }
        
        
      
        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile', error });
    }
};



export const blockUser = async (req:Request, res:Response) => {
    const blockerId = (req as any).userId; 
    const blockedId = parseInt(req.params.blockedId); 

    try {
        if (!blockerId) {
            return res.status(401).json({ message: 'You are not authorized to block this user.' });
        }

        if (blockerId === blockedId) {
            return res.status(400).json({ message: 'You cannot block yourself.' });
        }

        const blockedUser = await prisma.user.findUnique({
            where: { id: blockedId },
        });

        if (!blockedUser) {
            return res.status(404).json({ message: `User with ID ${blockedId} not found` });
        }

        const existingBlock = await prisma.block.findUnique({
            where: {
                blockerId_blockedId: {
                    blockerId: blockerId,
                    blockedId: blockedId,
                },
            },
        });

        if (existingBlock) {
            return res.status(400).json({ message: 'This user is already blocked.' });
        }

        const block = await prisma.block.create({
            data: {
                blockerId: blockerId,
                blockedId: blockedId,
            },
        });

        return res.status(200).json({ message: 'User blocked successfully', block });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to block user', error });
    }
};

export const unblockUser = async (req: Request, res: Response) => {
    const blockerId = (req as any).userId; 
    const blockedId = parseInt(req.params.blockedId); 

    try {
        if (!blockerId) {
            return res.status(401).json({ message: 'You are not authorized to unblock this user.' });
        }

        const existingBlock = await prisma.block.findUnique({
            where: {
                blockerId_blockedId: {
                    blockerId: blockerId,
                    blockedId: blockedId,
                },
            },
        });

        if (!existingBlock) {
            return res.status(404).json({ message: 'This user is not blocked.' });
        }

        await prisma.block.delete({
            where: {
                blockerId_blockedId: {
                    blockerId: blockerId,
                    blockedId: blockedId,
                },
            },
        });

        return res.status(201).json({ message: 'User unblocked successfully' });

        } catch (error) {
        return res.status(500).json({ message: 'Failed to unblock user', error });
    }
}

