import { Router } from 'express';
import {
    createRecurring,
    readRecurring,
    updateRecurring,
    deleteRecurring
} from '../controllers/recurringController.js';

const router = Router();

router.post('/', createRecurring);
router.get('/', readRecurring);
router.patch('/:id', updateRecurring);
router.delete('/:id', deleteRecurring);

export default router;
