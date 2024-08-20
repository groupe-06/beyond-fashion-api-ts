import { Request, Response } from 'express';
import prisma from '../database/db.config';

export const followUser = async (req: Request, res: Response) => {
  const followerId = (req as any).userId;//le any c'est pour acceder directement aux userid 
  const { followingId } = req.params;

  try {
    if (!followerId) {
      return res.status(401).json({ message: 'You are not authorized to follow users.' });
    }

    // Vérifier si l'utilisateur n'est pas déjà dans la liste des followings
    const existingFollow = await prisma.userFollow.findFirst({
      where: {
        followerId: followerId,
        followingId: parseInt(followingId)
      }
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'You are already followingggggggggggggggg this user.' });
    }

    // Créer la relation de suivi (d'abonnements)
    const follow = await prisma.userFollow.create({
      data: {
        follower: { connect: { id: followerId } },
        following: { connect: { id: parseInt(followingId) } }
      }
    });

    res.status(201).json({ message: 'Successfully followed the user', follow });
  } catch (error) {
    res.status(500).json({ message: 'Failed to follow user', error });
  }
};

export const unfollowUser = async (req: Request, res: Response) => {
  const followerId = (req as any).userId;
  const { followingId } = req.params;

  try {
    if (!followerId) {
      return res.status(401).json({ message: 'You are not authorized to unfollow users.' });
    }

    // Supprimer la relation de suivi(desabonnement)
    const unfollow = await prisma.userFollow.deleteMany({
      where: {
        followerId: followerId,
        followingId: parseInt(followingId)
      }
    });

    if (unfollow.count === 0) {
      return res.status(404).json({ message: 'You are not following this user.' });
    }

    res.status(200).json({ message: 'Successfully unfollowed the user byeeeeeeeeeeeeee' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unfollow user soryyyyyyyyyyyyyyyy', error });
  }
};
