import { Router } from 'express';
import * as categoryController from '../controllers/categoryController.js';

// Cria um novo router para as rotas de contas
const router = Router();

// Rota POST para criar uma nova categoria, apontando para a função "createCategory" no Controller
router.post('/', categoryController.createCategory);

// Exporta o router para ser usado no server.ts
export default router;
