import { Router } from 'express';
import { register, getAllUsers, getUserById, deleteUser, updateUser, login, updateProfile, blockUser, unblockUser } from '../controllers/userController';
import { getToken } from '../middlewares/authMiddlewares';
// import { validateUserRequest } from '../middlewares/shemaValidator';
import { createCommande,deleteCommandeArticle,completePurchase} from '../controllers/commandeController';
import  upload  from '../config/multer';



const router = Router();

router.post('/register', upload.single('photo'), register);
router.get('/getAll', getToken, getAllUsers);
router.get('/get-one', getToken, getUserById);
router.put('/update', getToken, updateUser);
router.delete('/delete/:id', deleteUser);
router.post('/login', login);
router.put('/update-profile', getToken, updateProfile);
router.post('/block/:blockedId',getToken, blockUser);
router.post('/unblock/:deblockedId',getToken, unblockUser);



export default router;