import { Request, Response } from 'express';
import prisma from '../database/db.config'; // Adjust the path to your Prisma client

export const rechargeCredit = async (req: Request, res: Response) => {
    const { amount } = req.body;
    const userId = (req as any).userId;

    try {
        // Fetch the user and their role from the database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { roles: true },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has the 'TAILOR' role
        const isTailor = user.roles.some(role => role.name === 'TAILOR');

        if (!isTailor) {
            return res.status(403).json({ message: 'Only tailors can recharge credit' });
        }

        // Update the user's credit by adding the recharge amount
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                credit: user.credit + amount,
            },
        });

        // Optionally, you can record this recharge in a separate Recharge table if needed
        await prisma.recharge.create({
            data: {
                userId: userId,
                receiverId: userId,
                amount: amount,
                code: generateUniqueCode(), // Implement a function to generate a unique code
                isUsed: true,
            },
        });

        return res.status(200).json({
            message: 'Credit recharged successfully',
            newCreditBalance: updatedUser.credit,
        });
    } catch (error) {
        console.error('Error recharging credit:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Helper function to generate a unique code for the recharge
function generateUniqueCode(): number {
    return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit code
}
