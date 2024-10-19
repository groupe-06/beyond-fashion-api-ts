import prisma from '../database/db.config';

async function sendNotification(receiverId: number, emetorId = null, content: string, type: string, postId = null) {
    await prisma.notification.create({
        data: {
            receiverId: receiverId,
            emetorId: emetorId,
            content: content,
            type: type,
            postId: postId
        },
    });
}

export default sendNotification;
