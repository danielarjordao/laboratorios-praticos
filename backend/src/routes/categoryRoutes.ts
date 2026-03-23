import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';

const router = Router();

// Rota POST: Cria uma nova categoria
// URL: POST /api/v1/categories
router.post('/', categoryController.createCategory);

// Rota GET: Lista todas as categorias de um perfil específico
// URL: GET /api/v1/categories?profile_id=XXX
router.get('/', categoryController.getCategories);

// Rota PATCH: Atualiza os detalhes de uma categoria existente
// URL: PATCH /api/v1/categories/:id
router.patch('/:id', categoryController.updateCategory);

// Rota DELETE: Deleta uma categoria (soft delete)
// URL: DELETE /api/v1/categories/:id
router.delete('/:id', categoryController.deleteCategory);

export default router;
