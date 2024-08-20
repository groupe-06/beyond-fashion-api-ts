import { Router } from 'express';
import { createComment, deleteComment } from '../controllers/commentController';
import { getToken } from '../middlewares/authMiddlewares';


const CommentRouter = Router();

CommentRouter.post('/comment/:postId', getToken,createComment);
CommentRouter.delete('/comment/:commentId', getToken, deleteComment);
export default CommentRouter;