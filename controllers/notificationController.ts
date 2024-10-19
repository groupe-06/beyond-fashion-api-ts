import prisma from '../database/db.config';

async function sendNotification(receiverId: number, content: string, type: string, postId = null, followerId = null) {
    await prisma.notification.create({
        data: {
            receiverId: receiverId,
            content: content,
            type: type,
            postId: postId,
            followerId: followerId
        },
    });
}

export default sendNotification;
