import { Router } from 'express';
import { readMonthlySummary } from '../controllers/dashboardController.js';

const router = Router();

// Rota GET: Obtém o resumo mensal do dashboard
// URL: GET /api/v1/dashboard/summary
router.get('/summary', readMonthlySummary);

export default router;
