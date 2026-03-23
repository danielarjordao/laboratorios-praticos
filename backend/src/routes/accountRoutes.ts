import { Router } from 'express';
import * as accountController from '../controllers/accountController.js';

const router = Router();

// Rota POST: Cria uma nova conta
// URL: POST /api/v1/accounts
router.post('/', accountController.createAccount);

// Rota GET: Lista todas as contas de um perfil
router.get('/', accountController.getAccounts);

// Rota DELETE: Deleta uma conta (soft delete)
// URL: DELETE /api/v1/accounts/:id
router.delete('/:id', accountController.deleteAccount);

export default router;
