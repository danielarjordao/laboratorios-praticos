import { Router } from 'express';
import * as tagController from '../controllers/tagController.js';

const router = Router();

// Rota POST: Criar Tag
// URL: POST /api/v1/tags
router.post('/', tagController.createTag);

// Rota GET: Listar Tags (ex: /api/v1/tags?profile_id=UUID)
router.get('/', tagController.readTags);

// Rota PATCH: Atualizar Tag
// URL: PATCH /api/v1/tags/:id
router.patch('/:id', tagController.updateTag);

// Rota DELETE: Remover Tag (Soft Delete)
// URL: DELETE /api/v1/tags/:id
router.delete('/:id', tagController.deleteTag);

export default router;
