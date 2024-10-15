import { Router } from 'express';
import { getToken } from '../middlewares/authMiddlewares';
import { createStory, deleteStory, getAllStoryByConnectedUser, getAllStories,getAuthorByStoryId  } from '../controllers/storyController';
import  upload  from '../config/multer';


const router = Router();

router.post('/new', upload.single('content'), getToken, createStory);
router.post('/delete/:id', getToken, deleteStory);
router.post('/connect-user', getToken, getAllStoryByConnectedUser);
router.get('/author/:storyId', getAuthorByStoryId);
router.post('/all', getAllStories);

export default router;