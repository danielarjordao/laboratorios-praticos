import { Router } from 'express';
import {
    createBudget,
    readBudgets,
    updateBudget,
    deleteBudget
} from '../controllers/budgetController.js';

const router = Router();

// Rota POST: Cria um novo orçamento
// URL: POST /api/v1/budgets
router.post('/', createBudget);

// Rota GET: Lista todos os orçamentos de um perfil
// URL: GET /api/v1/budgets?profile_id=XXX
router.get('/', readBudgets);

// Rota PATCH: Atualiza os detalhes de um orçamento existente
// URL: PATCH /api/v1/budgets/:id
router.patch('/:id', updateBudget);

// Rota DELETE: Deleta um orçamento (soft delete)
// URL: DELETE /api/v1/budgets/:id
router.delete('/:id', deleteBudget);

export default router;
