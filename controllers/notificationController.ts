import prisma from '../database/db.config';

async function sendNotification(receiverId: number, emetorId: number | null = null, content: string, type: string, postId: number | null = null) {
    await prisma.notification.create({
        data: {
            receiverId,
            emetorId,
            content,
            type,
            postId
        },
    });
}

export default sendNotification;