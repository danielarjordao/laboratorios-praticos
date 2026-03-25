import { Router } from 'express';
import {
    createBudget,
    readBudgets,
    updateBudget,
    deleteBudget
} from '../controllers/budgetController.js';

const router = Router();

router.post('/', createBudget);
router.get('/', readBudgets);
router.patch('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;
