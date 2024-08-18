import { Router } from 'express';
import { getToken } from '../middlewares/authMiddlewares';
import { createStory, deleteStroy, getAllStoryByConnectedUser, getAllStories } from '../controllers/storyController';

const router = Router();

router.post('/new', getToken, createStory);
router.post('/delete/:id', getToken, deleteStroy);
router.post('/connect-user', getToken, getAllStoryByConnectedUser);
router.post('/all', getAllStories);

export default router;