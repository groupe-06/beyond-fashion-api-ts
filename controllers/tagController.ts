import { Request, Response } from 'express';
import prisma from '../database/db.config';


export const createTag = async (req: Request, res: Response) => {
    try {

      const userId = (req as any).userId;
      const { name } = req.body;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized.' });
      }

      if (!name) {
        return res.status(400).json({ message: 'Tag name is required.' });
      }
  
      const existingTag = await prisma.tag.findFirst({
        where: { name:name},
      });
  
      if (existingTag) {
        return res.status(400).json({ message: 'Tag already exists.' });
      }
  
      const newTag = await prisma.tag.create({
        data: {
          name,
        },
      });
  
      return res.status(201).json({ message: 'Tag created successfully', tag: newTag });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to create tag', error });
    }
  };





// export const getUser = async (req: Request, res: Response) => {
//     const userId = parseInt(req.params.id);
//     try {
//         const user = await prisma.user.findUnique({
//             where: { id: userId },
//             include: {
//                 roles: true,
//                 posts: {
//                     include: {
//                         author: true,
//                     },
//                 },
//             },
//         });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found.' });
//         }
//         return res.status(200).json(user);
//     } catch (error) {
//         return res.status(500).json({ message: 'Failed to get user', error });
//     }
// };
