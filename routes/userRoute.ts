import { Router } from 'express';
import { register, getAllUsers, getUserById, deleteUser, updateUser, login, updateProfile, blockUser, unblockUser, logout, verifyValidityToken, getUserByIdBis, getUserNotifications } from '../controllers/userController';
import { getToken, getTokenFromHeader } from '../middlewares/authMiddlewares';
import  upload  from '../config/multer';
import { getUserPosts } from '../controllers/postController';



const router = Router();

router.post('/register', upload.single('photo'), register);
router.get('/getAll', getToken, getAllUsers);
router.get('/get-one', getToken, getUserById);
router.get('/:userId', getUserByIdBis);
router.put('/update', getToken, updateUser);
router.delete('/delete/:id', deleteUser);
router.post('/login', login);
router.put('/update-profile', getToken, updateProfile);
router.post('/block/:blockedId',getToken, blockUser);
router.post('/unblock/:deblockedId',getToken, unblockUser);

router.get('/get-post',getToken, getUserPosts);
router.get('/logout', getTokenFromHeader, logout);
router.post('/verify', verifyValidityToken);

//Notifications
router.get('/notifications', getToken, getUserNotifications);



export default router;