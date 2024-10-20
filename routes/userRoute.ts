import { Router } from 'express';
import { register, getAllUsers, getUser, deleteUser, updateUser, login, updateProfile, blockUser, unblockUser, logout, verifyValidityToken, getUserNotifications, getAllUsersForMessage } from '../controllers/userController';
import { getToken, getTokenFromHeader } from '../middlewares/authMiddlewares';
import  upload  from '../config/multer';
import { getUserPosts } from '../controllers/postController';



const router = Router();

router.post('/register', upload.single('photo'), register);

//Notifications
router.get('/notifications', getToken, getUserNotifications);
router.get('/get-one', getToken, getUser);
router.put('/update', getToken, updateUser);
router.delete('/delete/:id', deleteUser);
router.post('/login', login);
router.put('/update-profile', getToken, updateProfile);
router.post('/block/:blockedId',getToken, blockUser);
router.post('/unblock/:deblockedId',getToken, unblockUser);
router.get('/get-post',getToken, getUserPosts);
router.get('/logout', getTokenFromHeader, logout);
router.post('/verify', verifyValidityToken);
router.get('/user-by-id/:userId', getUser);

router.get('/get-all-for-message', getAllUsersForMessage);

router.get('/getAll', getAllUsers);






export default router;