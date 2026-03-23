import { Router } from 'express';
import * as transactionController from '../controllers/transactionController.js';

const router = Router();

// Rota POST aponta para a função no Controller
router.post('/', transactionController.createTransaction);

// Exporta o router para ser usado no server.ts
export default router;
