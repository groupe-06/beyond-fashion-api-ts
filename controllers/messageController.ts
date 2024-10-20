import { Request, Response } from "express";
import prisma from "../database/db.config";

export const createMessage = async (req: Request, res: Response) => {
  try{
    const { receiverId, content } = req.body;
    const senderId = (req as any).userId;
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content
      }
    });
    
    return res.status(201).json({ msg: 'Message sent successfully', message, status: true});
  }catch(error){
    return res.status(500).json({ msg: 'Error sending message', error, status: false });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { receiverId } = req.query;

    if (!receiverId) {
      return res.status(400).json({ message: 'receiverId is required', status: false });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { AND: [{ senderId: userId }, { receiverId: Number(receiverId) }] },
          { AND: [{ senderId: Number(receiverId) }, { receiverId: userId }] }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return res.status(200).json({ message: 'Messages fetched successfully', messages, status: true });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching messages', error, status: false });
  }
};

export const deleteMessage = async (req: Request, res: Response) =>{
  try{
    const { id } = req.params;
    await prisma.message.delete({
      where: { id: Number(id) },
    });
    return res.status(204).json({ msg: 'Message deleted successfully', status: true });
  }catch(error){
    return res.status(500).json({ msg: 'Error deleting message', error, status: false });
  }
}
