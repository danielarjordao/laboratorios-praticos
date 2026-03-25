import { Router } from 'express';
import {
    createGoal,
    readGoals,
    updateGoal,
    deleteGoal
} from '../controllers/goalController.js';

const router = Router();

router.post('/', createGoal);
router.get('/', readGoals);
router.patch('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;
