import { Router } from 'express';
import * as accountController from '../controllers/accountController.js';

const router = Router();

// Rota POST: Cria uma nova conta
// URL: POST /api/v1/accounts
router.post('/', accountController.createAccount);

// Rota GET: Lista todas as contas de um perfil
// URL: GET /api/v1/accounts?profile_id=XXX
router.get('/', accountController.readAccounts);

// Rota PATCH: Atualiza os detalhes de uma conta existente
// URL: PATCH /api/v1/accounts/:id
router.patch('/:id', accountController.updateAccount);

// Rota DELETE: Deleta uma conta (soft delete)
// URL: DELETE /api/v1/accounts/:id
router.delete('/:id', accountController.deleteAccount);

export default router;
