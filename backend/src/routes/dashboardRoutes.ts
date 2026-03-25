import { Router } from 'express';
import { readMonthlySummary } from '../controllers/dashboardController.js';

const router = Router();
router.get('/summary', readMonthlySummary);

export default router;
