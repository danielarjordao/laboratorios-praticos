import { Router } from 'express';
import * as accountController from '../controllers/accountController.js';

// Cria um novo router para as rotas de contas
const router = Router();

// Rota POST para criar uma nova conta, apontando para a função "createAccount" no Controller
router.post('/', accountController.createAccount);

// Exporta o router para ser usado no server.ts
export default router;
