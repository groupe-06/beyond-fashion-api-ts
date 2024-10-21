// import { Request, Response } from 'express';
// import prisma from '../database/db.config';
// import sendNotification from './notificationController';


// async function sharePost(req: Request, res: Response) {
//   const userId = (req as any).userId;
//   const postId = parseInt(req.params.postId);

//   try {
//       if (!userId) {
//           return res.status(401).json({ message: 'User not found!' });
//       }

//       const post = await prisma.post.findUnique({
//           where: { id: postId },
//           include: { author: true } 
//       });

//       if (!post) {
//           return res.status(404).json({ message: 'Post not found.' });
//       }

//       // Créer une entrée de partage
//       await prisma.share.create({
//           data: {
//               postId: post.id,
//               userId: userId,
//           },
//       });

//       // Envoyer une notification à l'auteur du post
//       await sendNotification(post.authorId, userId, 'New Post Shared', `Le post a ete partager `);

//       return res.status(200).json({
//           message: 'Post shared successfully.'
//       });

//   } catch (error) {
//       console.error('Error in sharePost:', error);
//       return res.status(500).json({
//           message: 'Failed to share post.',
//           error: error instanceof Error ? error.message : String(error)
//       });
//   }
// }

// export default sharePost;
   
