import { Router } from 'express';
import * as transactionController from '../controllers/transactionController.js';

const router = Router();

// Rota POST aponta para a função no Controller
router.post('/', transactionController.createTransaction);

// Rota GET: Lista todas as transações (ex: /api/v1/transactions?profile_id=XXX)
router.get('/', transactionController.getTransactions);

// Rota PATCH com parâmetro de ID
router.patch('/:id', transactionController.updateTransaction);

// Rota DELETE com parâmetro de ID
router.delete('/:id', transactionController.deleteTransaction);

// Exporta o router para ser usado no server.ts
export default router;
