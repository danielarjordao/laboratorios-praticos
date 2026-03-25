import { Router } from 'express';
import { createInstallmentPlan } from '../controllers/installmentController.js';
import { readInstallmentPlans } from '../controllers/installmentController.js';
import { updateInstallmentPlan } from '../controllers/installmentController.js';
import { deleteInstallmentPlan } from '../controllers/installmentController.js';

const router = Router();

router.post('/', createInstallmentPlan);
router.get('/', readInstallmentPlans);
router.patch('/:id', updateInstallmentPlan);
router.delete('/:id', deleteInstallmentPlan);

export default router;
