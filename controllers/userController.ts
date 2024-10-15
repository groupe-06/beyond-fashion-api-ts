import { Request, Response } from 'express';
import { cryptPassword, comparePasswords, generateToken } from '../utils/utils';
import prisma from '../database/db.config';
import cloudinary from '../config/cloudinary';
import jwt from 'jsonwebtoken';


export const register = async (req: Request, res: Response) => {
    try {
        let { email, password, lastname, firstname, phoneNumber, address, gender, confirm_password } = req.body;
        const file = req.file; 
        
        email = email?.trim().toLowerCase();
        password = password?.trim();
        confirm_password = confirm_password?.trim();
        lastname = lastname?.trim();
        firstname = firstname?.trim();
        phoneNumber = phoneNumber?.trim();
        address = address?.trim();
        gender = gender?.trim();

        const userFromDB = await prisma.user.findUnique({ where: { email } });
        if (userFromDB) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        const existingPhoneNumber = await prisma.user.findUnique({ where: { phoneNumber } });
        if (existingPhoneNumber) {
            return res.status(409).json({ message: 'User with this phone number already exists' });
        }

        if (password !== confirm_password) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const role = await prisma.role.findFirst({ where: { name: 'SIMPLE' } });
        if (!role) {
            return res.status(404).json({ message: 'Role SIMPLE not found' });
        }

        const hashedPassword = cryptPassword(password);

        let photoUrl = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
        if (file) {
            const media = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(file.buffer);  
            });
            photoUrl = (media as any).secure_url;
        }

        const user = await prisma.user.create({
            data: { 
                email, 
                password: hashedPassword, 
                lastname, 
                firstname, 
                phoneNumber,
                address,
                gender,
                photoUrl,
                roles: {
                    connect: { name: role.name }
                }
            },
        });
        return res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to create user', error });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email: email?.trim() },
            include: {
                roles: true,
            }
        });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }
        const isMatch = comparePasswords(password?.trim(), user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }
        const token = await generateToken(user);

        const {password: _, ...userWithoutPassword} = user;
        const data = {...userWithoutPassword, token};        
        
        return res.status(200).json({ message: 'User Logged in successfully', data });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to login', error });
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

        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
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
            return res.status(401).json({ message: 'userId from token not found' });
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

        const roleFromDb = await prisma.role.findUnique({
            where: { name: role?.trim() },
        });

        if (!roleFromDb) {
            return res.status(404).json({ message: `Role ${role} not found from DB` });
        }

        const hasAlreadyRole = user.roles.find(r => r.name === role);

        if (hasAlreadyRole) {
            return res.status(400).json({ message: `User is already assigned the role ${role}.` });
        }

        if (role === "TAILOR") {
            const existingRole = user.roles.find(r => r.name === "SELLER");
            if (existingRole) {
                return res.status(400).json({ message: `User is already assigned to the role ${existingRole.name}.` });
            }
        }

        if (role === "SELLER") {
            const existingRole = user.roles.find(r => r.name === "TAILOR");
            if (existingRole) {
                return res.status(400).json({ message: `User is already assigned to the role ${existingRole.name}.` });
            }
        }

        let updatedUser;
        if (role === "TAILOR") {
            updatedUser = await prisma.user.update({
                where: { id: Number(userId) },
                data: { 
                    roles: { connect: [{ id: roleFromDb.id }] }, 
                    credit: 40 
                },
            });
        } else {
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

export const blockUser = async (req: Request, res: Response) => {
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
    const blockedId = parseInt(req.params.deblockedId);

    try {
        if (!blockerId) {
            return res.status(401).json({ message: 'You are not authorized to unblock this user.' });
        }

        if (blockerId === blockedId) {
            return res.status(400).json({ message: 'You cannot unblock yourself.' });
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
            return res.status(404).json({ message: 'Block not found.' });
        }

        await prisma.block.delete({
            where: {
                blockerId_blockedId: {
                    blockerId: blockerId,
                    blockedId: blockedId,
                },
            },
        });

        return res.status(200).json({ message: 'User unblocked successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to unblock user', error });
    }
};

export const verifyValidityToken = async (req: Request, res: Response) => {
    const {token} = req.body;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    try{
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || '9f86d081884c7d659a2feaa0c55ad023') as jwt.JwtPayload;
        console.log(decodedToken);
        return res.status(200).json({ message: 'Valid token'});
    }catch(error) {
        console.log('Token verification error:', error);
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }
}

export const verifyValidityUserToken = async (req: Request, res: Response) => {
    // Récupérer le header Authorization
    const authHeader = req.headers.authorization;

    // Vérifier si le token est présent dans le header et qu'il commence bien par 'Bearer'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided or incorrect format' });
    }

    // Extraire le token (enlever 'Bearer ')
    const token = authHeader.split(' ')[1];
    console.log('Token:', token);

    // Vérifier si Prisma est bien connecté et si le modèle est disponible
    console.log('Prisma blackListToken model:', prisma.blackListToken);

    try {
        // Vérifier si le token est blacklisté
        const blacklistedToken = await prisma.blackListToken.findUnique({
            where: {
                token: token
            }
        });

        if (blacklistedToken) {
            return res.status(401).json({ message: 'Unauthorized: Token blacklisted' });
        }

        // Décoder et vérifier le token JWT
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || '9f86d081884c7d659a2feaa0c55ad023') as jwt.JwtPayload;
        console.log(decodedToken);

        return res.status(200).json({ message: 'Valid token' });
    } catch (error) {
        console.log('Token verification error:', error);
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
    }
};


//res.clearCookie('token');
//return res.status(200).json({ message: 'Logged out successfully' });

export const logout = async (req: Request, res: Response) => {
    const token = (req as any).token;

    try {
        // Vérifier si le token est déjà blacklisté
        const tokenExists = await prisma.blackListToken.findUnique({
            where: { token }
        });

        if (tokenExists) {
            return res.status(400).json({ message: 'Token already blacklisted' });
        }

        // Enregistrer le token dans la table blacklistToken
        await prisma.blackListToken.create({
            data: { token }
        });

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
