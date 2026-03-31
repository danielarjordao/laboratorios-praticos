import { Router } from 'express';
import { createProfile, readProfiles, updateProfile, deleteProfile } from '../controllers/profileController.js';

const router = Router();

// Rota POST: Cria um novo perfil
// URL: POST /api/v1/profiles
router.post('/', createProfile);

// Rota GET: Lista todos os perfis de um usuário
// URL: GET /api/v1/profiles?user_id=XXX
router.get('/', readProfiles);

// Rota PATCH: Atualiza os detalhes de um perfil existente
// URL: PATCH /api/v1/profiles/:id
router.patch('/:id', updateProfile);

// Rota DELETE: Deleta um perfil (soft delete)
// URL: DELETE /api/v1/profiles/:id
router.delete('/:id', deleteProfile);

export default router;
