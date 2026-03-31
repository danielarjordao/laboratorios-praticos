import { Router } from 'express';
import {
    createRecurring,
    readRecurring,
    updateRecurring,
    deleteRecurring
} from '../controllers/recurringController.js';

const router = Router();

// Rota POST: Cria uma nova transação recorrente
// URL: POST /api/v1/recurring
router.post('/', createRecurring);

// Rota GET: Lista todas as transações recorrentes de um perfil
// URL: GET /api/v1/recurring?profile_id=XXX
router.get('/', readRecurring);

// Rota PATCH: Atualiza os detalhes de uma transação recorrente existente
// URL: PATCH /api/v1/recurring/:id
router.patch('/:id', updateRecurring);

// Rota DELETE: Deleta uma transação recorrente
// URL: DELETE /api/v1/recurring/:id
router.delete('/:id', deleteRecurring);

export default router;
