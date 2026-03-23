import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';

const router = Router();

// Rota POST: Cria uma nova categoria
// URL: POST /api/v1/categories
router.post('/', categoryController.createCategory);

export default router;
