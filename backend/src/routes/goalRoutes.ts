import { Router } from 'express';
import {
    handleCreateGoal,
    handleGetGoals,
    handleUpdateGoal,
    handleDeleteGoal
} from '../controllers/goalController.js';

const router = Router();

router.post('/', handleCreateGoal);
router.get('/', handleGetGoals);
router.patch('/:id', handleUpdateGoal);
router.delete('/:id', handleDeleteGoal);

export default router;
