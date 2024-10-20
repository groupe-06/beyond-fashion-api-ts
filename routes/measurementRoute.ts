import { Router } from 'express';
import { addMeasurement, updateMeasurement, deleteMeasurement, getMeasurements,getMeasurementsbis } from '../controllers/measurementController';
import { getToken } from '../middlewares/authMiddlewares';

const router = Router();

router.post('/add', getToken, addMeasurement);
router.put('/update/:id', getToken, updateMeasurement);
router.delete('/delete/:id', getToken, deleteMeasurement);
router.get('/all', getToken, getMeasurements);
router.get('/:userId', getMeasurementsbis);
export default router;
