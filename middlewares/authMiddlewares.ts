import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const getToken = (req: Request, res: Response, next:NextFunction) =>{
    const authHeader = req.header('Authorization');
    if(!authHeader){
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    if (!authHeader.startsWith('Bearer ') || !authHeader.startsWith('Bearer')) {
        return res.status(401).json({ message: 'Authorization header malformed' });
    }

    const token = authHeader.replace('Bearer ', '');
    

    if(!token){
        return res.status(401).json({message: 'No token provided'});
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || '9f86d081884c7d659a2feaa0c55ad023') as jwt.JwtPayload;
        (req as any).userId = decodedToken.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }

 
    
}
