import prisma from '../database/db.config';

async function sendNotification(userId: number, content: string) {
    await prisma.notification.create({
        data: {
            receiverId: userId,
            content: content,
        },
    });
}

export default sendNotification;
