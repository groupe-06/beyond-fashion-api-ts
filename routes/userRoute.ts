import { Router } from 'express';
import { createUser, getAllUsers, getUserById, deleteUser, updateUser, login, updateProfile, blockUser } from '../controllers/userController';
import { getToken } from '../middlewares/authMiddlewares';
import { validateUserRequest } from '../middlewares/shemaValidator';
import { createCommande,deleteCommandeArticle,completePurchase} from '../controllers/commandeController';
import  upload  from '../config/multer';



const router = Router();

router.post('/create',upload.single('photo'),validateUserRequest, createUser);
router.get('/getAll', getToken, getAllUsers);
router.get('/get-one', getToken, getUserById);
router.put('/update', getToken,validateUserRequest, updateUser);
router.delete('/delete/:id', deleteUser);
router.post('/login', login);
router.put('/update-profile', getToken, updateProfile);
router.post('/block/:blockedId',getToken, blockUser);

export default router;