import prisma from '../database/db.config';

async function sendNotification(receiverId: number, emetorId: number | null = null, content: string, type: string, postId: number | null = null) {
    await prisma.notification.create({
        data: {
            receiver: {
                connect: {
                    id: receiverId
                }
            },
            emetor: emetorId ? {
                connect: {
                    id: emetorId
                }
            } : undefined,
            content: content,
            type: type,
            postId: postId
        },
    });
}

export default sendNotification;