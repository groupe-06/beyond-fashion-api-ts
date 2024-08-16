import { Router } from 'express';
import { createUser, getAllUsers, getUserById, updateUser, deleteUser, login } from '../controllers/userController';

const router = Router();

router.post('/create', createUser);
router.get('/getAll', getAllUsers);
router.get('/get/:id', getUserById);
router.put('/update/:id', updateUser);
router.delete('/delete/:id', deleteUser);
router.post('/login', login);

export default router;