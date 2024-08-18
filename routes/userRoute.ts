import { Router } from 'express';
import { createUser, getAllUsers, getUserById, deleteUser, updateUser, login, updateProfile } from '../controllers/userController';
import { getToken } from '../middlewares/authMiddlewares';
import  upload  from '../config/multer';



const router = Router();

router.post('/create',upload.single('photo'), createUser);
router.get('/getAll', getToken, getAllUsers);
router.get('/get-one', getToken, getUserById);
router.put('/update', getToken, updateUser);
router.delete('/delete/:id', deleteUser);
router.post('/login', login);
router.put('/update-profile', getToken, updateProfile);

export default router;