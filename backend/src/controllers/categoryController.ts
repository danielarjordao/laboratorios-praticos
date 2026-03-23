import type { Request, Response } from 'express';
import * as categoryService from '../services/categoryService.js';
import type { CategoryInput } from '../services/categoryService.js';

// Controlador para criar uma nova categoria
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
		// Validação básica dos dados de entrada
        const body = req.body as Partial<CategoryInput>;

		// Verificar se os campos obrigatórios estão presentes
        if (!body.name || !body.profile_id) {
            res.status(400).json({
                status: 'error',
                message: 'Faltam campos obrigatórios: name, profile_id.'
            });
            return;
        }

		// Criar a nova categoria usando o serviço correspondente
        const newCategory = await categoryService.createCategoryRecord(body as CategoryInput);

		// Responder com a categoria criada
        res.status(201).json({
            status: 'success',
            data: newCategory
        });

    } catch (error: unknown) {
		// Tratamento de erros, garantindo que a resposta seja consistente
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        res.status(400).json({ status: 'error', message });
    }
};
