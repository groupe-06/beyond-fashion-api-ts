import prisma from '../database/db.config';

async function sendNotification(receiverId: number, content: string) {
    await prisma.notification.create({
        data: {
            receiverId: receiverId,
            content: content,
        },
    });
}

export default sendNotification;
