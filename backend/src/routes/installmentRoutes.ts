import { Router } from 'express';
import {
	createInstallmentPlan,
	readInstallmentPlans,
	updateInstallmentPlan,
	deleteInstallmentPlan
} from '../controllers/installmentController.js';

const router = Router();

// Rota POST: Cria um novo plano de parcelamento
// URL: POST /api/v1/installments
router.post('/', createInstallmentPlan);

// Rota GET: Lista todos os planos de parcelamento
// URL: GET /api/v1/installments?profile_id=XXX
router.get('/', readInstallmentPlans);

// Rota PATCH: Atualiza os detalhes de um plano de parcelamento existente
// URL: PATCH /api/v1/installments/:id
router.patch('/:id', updateInstallmentPlan);

// Rota DELETE: Deleta um plano de parcelamento
// URL: DELETE /api/v1/installments/:id
router.delete('/:id', deleteInstallmentPlan);

export default router;
