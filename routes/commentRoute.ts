import { Router } from 'express';
import { createComment, deleteComment } from '../controllers/commentController';
import { getToken } from '../middlewares/authMiddlewares';
import { validateCommentRequest } from '../validation/shemaValidator';


const router = Router();

router.post('/:postId/comment', getToken, validateCommentRequest, createComment);
router.delete('/comment/:commentId', getToken, deleteComment);
export default router;