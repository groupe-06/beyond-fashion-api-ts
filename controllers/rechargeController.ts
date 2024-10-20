import { Request, Response } from 'express';
import prisma from '../database/db.config'; // Adjust the path to your Prisma client
import { sendMail } from '../utils/utils';
import { sendSMS } from '../utils/utils';

export const rechargeAmount = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        const { amount, receiverEmail } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'userId from token not found' });
        }

        const parsedAmount = Number(amount);

        console.log(amount);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { roles: true },
        });

        if (!user) {
            return res.status(404).json({ message: `User with ID ${userId} not found` });
        }

        const isTailor = user.roles.some(role => role.name === 'TAILOR');

        if (!isTailor) {
            return res.status(403).json({ message: 'Only tailors can do this action' });
        }

        if(!parsedAmount){
            return res.status(400).json({ message: 'Amount is required' });
        }

        let code = await generateUniqueCode();
    
        if(!code){
            return res.status(500).json({ message: 'Failed to generate code' });
        }

        if(parsedAmount < 100 || parsedAmount > 2000){
            return res.status(400).json({ message: 'Amount must be between 100 and 2000' });
        }

        if(receiverEmail){
            const receiver = await prisma.user.findUnique({
                where: { email: receiverEmail },
                include: { roles: true },
            });

            if(!receiver){
                return res.status(404).json({ message: `Receiver with email ${receiverEmail} not found` });
            }

            if(!receiver?.roles.find(role => role.name === 'TAILOR')){
                return res.status(403).json({ message: 'This receiver does not have the TAILOR role' });
            }

            const recharge = await prisma.recharge.create({
                data: {
                    userId,
                    receiverId: receiver.id,
                    amount: parsedAmount,
                    code: BigInt(code),
                },
            });
            sendMail(user.email, 'Beyound fashion recharge', `Félicitations votre achat de recharge à ${receiver.firstname} ${receiver.lastname} est effectué avec succes.`);
            sendMail(receiver.email, 'Beyound fashion recharge', `${user.firstname} ${user.lastname} vient de vous faire un achat de recharge. Le code de rechargement est : ${recharge.code}`);
            sendSMS(receiver.phoneNumber, `${user.firstname} ${user.lastname} vient de vous faire un achat de recharge. Le code de rechargement est : ${recharge.code}`);
            return res.status(201).json({ message: 'Recharge created successfully', ...recharge, code: recharge.code.toString() });
        }

        const recharge = await prisma.recharge.create({
            data: {
                userId: userId,
                amount: parsedAmount,
                code: Number(code), // Implement a function to generate a unique code
            },
        });
        sendMail(user.email, 'Beyound fashion recharge', `Félicitations votre achat de recharge est effectué avec succes. Votre code de rechargement est : ${recharge.code}`);
        sendSMS(user.phoneNumber, `Félicitations votre achat de recharge est effectué avec succes. Votre code de rechargement est : ${recharge.code}`);
        const data = {...recharge, code: recharge.code.toString()};
        return res.status(201).json({ message: 'Recharge created successfully', data });
    } catch (error) {
        console.error('Error recharging credit:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const generateUniqueCode = async (): Promise<number | undefined> => {
    const generateCode = (): number => {
        return Math.floor(1000000000 + Math.random() * 9000000000);
    };

    let code;
    let isUnique = false;

    while (!isUnique) {
        code = generateCode();
        const existingRecharge = await prisma.recharge.findUnique({ where: {code} });

        if (!existingRecharge) {
            isUnique = true;
        }
    }

    return code;
};

export const creditRecharge = async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { code } = req.body;
    try{

        if (!userId) {
            return res.status(401).json({ message: 'userId from token not found' });
        }

        if(!code){
            return res.status(400).json({ message: 'Code is required' });
        }

         // Vérifier si le code contient uniquement des chiffres
        const isNumeric = /^\d+$/.test(code);

        if (!isNumeric) {
            return res.status(400).json({ message: 'The code must contain only digits.' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if(!user) {
            return res.status(404).json({ message: `User with ID ${userId} not found` });
        }

        const recharge = await prisma.recharge.findUnique({
            where: { code: BigInt(code) },
        });

        if(!recharge){
            return res.status(404).json({ message: 'No recharge found with this code' });
        }

        if(recharge.isUsed){
            return res.status(400).json({ message: 'This code is already used' });
        }

        if(recharge.receiverId){
            if(recharge.receiverId !== userId){
                return res.status(403).json({ message: 'This recharge is not yours' });
            }

            const creditRecharge = recharging(recharge.amount);
            const user = await prisma.user.update({
                where: { id: userId },
                data: { credit: { increment: creditRecharge } },
            });

            await prisma.recharge.update({
                where: { id: recharge.id },
                data: { isUsed: true },
            });

            const credit = user.credit;
            
            return res.status(201).json({ message: `Credit recharge successful. Your new credit is now ${user.credit}`, credit });
        }

        const creditRecharge = recharging(recharge.amount);
        const modifiedUser = await prisma.user.update({
            where: { id: userId },
            data: { credit: { increment: creditRecharge } },
        });
        await prisma.recharge.update({
            where: { id: recharge.id },
            data: { isUsed: true },
        });

        const credit = modifiedUser.credit
       
        return res.status(201).json({ message: `Credit recharge successful. Your new credit is now ${modifiedUser.credit}`, credit });
    }catch(error) {
        return res.status(500).json({ message: 'Failed to recharge credit', error });
    }
}

function recharging(amount: number): number {
    switch(amount){
        case 100:
            return 10;
        case 300:
            return 32;
        case 500:
            return 52;
        case 1000:
            return 104;
        case 1200:
            return 128;
        case 1500:
            return 160;
        case 2000:
           return 210;
        default:
            return 0;
    }
}
