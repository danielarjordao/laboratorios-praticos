import { Router } from 'express';
import * as transactionController from '../controllers/transactionController.js';

const router = Router();

// Rota POST: Cria uma nova transação
// URL: POST /api/v1/transactions
router.post('/', transactionController.createTransaction);

// Rota GET: Lista todas as transações de um perfil
// URL: GET /api/v1/transactions?profile_id=XXX
router.get('/', transactionController.readTransactions);

// Rota GET: Obtém os detalhes de uma transação específica
// URL: GET /api/v1/transactions/:id
router.get('/:id', transactionController.readTransactionById);

// Rota PATCH: Atualiza os detalhes de uma transação existente
// URL: PATCH /api/v1/transactions/:id
router.patch('/:id', transactionController.updateTransaction);

// Rota DELETE: Deleta uma transação
// URL: DELETE /api/v1/transactions/:id
router.delete('/:id', transactionController.deleteTransaction);

export default router;
