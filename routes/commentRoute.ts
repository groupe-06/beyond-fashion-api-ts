import { Router } from 'express';
import { createComment, updateComment, deleteComment,getCommentsWithReplies } from '../controllers/commentController';
import { getToken } from '../middlewares/authMiddlewares';
import { validateCommentRequest } from '../middlewares/shemaValidator';

const router = Router();

router.post('/create', getToken, validateCommentRequest, createComment);
router.put('/update/:commentId', getToken, updateComment);
router.delete('/delete/:commentId', getToken, deleteComment);
router.get('/all/:postId', getCommentsWithReplies);

export default router;

