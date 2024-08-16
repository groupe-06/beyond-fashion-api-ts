import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const cryptPassword = (password: string ) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};

export const comparePasswords = (password: string, hashedPassword: string ) => {
    return bcrypt.compareSync(password, hashedPassword);
};

export const generateToken = async (user: any) => {
    const token = jwt.sign({ userId: user.id}, process.env.JWT_SECRET || '9f86d081884c7d659a2feaa0c55ad023', { expiresIn: '24h' });
    return token;
};


