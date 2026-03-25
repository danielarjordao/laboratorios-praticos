import { Router } from 'express';
import {
    handleCreateRecurring,
    handleGetRecurring,
    handleUpdateRecurring,
    handleDeleteRecurring
} from '../controllers/recurringController.js';

const router = Router();

router.post('/', handleCreateRecurring);
router.get('/', handleGetRecurring);
router.patch('/:id', handleUpdateRecurring);
router.delete('/:id', handleDeleteRecurring);

export default router;
