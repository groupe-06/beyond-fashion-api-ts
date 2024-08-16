import { Router } from 'express';
import { createRole, getAllRoles, getRoleById, updateRole, deleteRole } from '../controllers/roleController';

const router = Router();

router.post('/create', createRole); 
router.get('/getAll', getAllRoles); 
router.get('/get/:id', getRoleById); 
router.put('/update/:id', updateRole); 
router.delete('/delete/:id', deleteRole); 

export default router;