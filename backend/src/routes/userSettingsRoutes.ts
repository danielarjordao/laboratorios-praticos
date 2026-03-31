import { Router } from 'express';
import { createUserSettings, readUserSettings, updateUserSettings } from '../controllers/userSettingsController.js';

const router = Router();

// Rota POST: Cria novas configurações de usuário
// URL: POST /api/v1/user-settings
router.post('/', createUserSettings);

// Rota GET: Lê as configurações de usuário
// URL: GET /api/v1/user-settings?user_id=XXX
router.get('/', readUserSettings);

// Rota PATCH: Atualiza as configurações de usuário
// URL: PATCH /api/v1/user-settings/:user_id
router.patch('/:user_id', updateUserSettings);

export default router;
