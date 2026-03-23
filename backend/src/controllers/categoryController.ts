import type { Request, Response } from 'express';
import * as categoryService from '../services/categoryService.js';
import type { CategoryInput } from '../services/categoryService.js';

// Controlador de Categorias.
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as CategoryInput;

        // Validação de Defesa dos campos obrigatórios.
        if (!body.name || !body.profile_id || !body.type) {
            res.status(400).json({
                status: 'error',
                message: 'Missing required fields: name, profile_id, type.'
            });
            return;
        }

        // Chamada ao serviço com nome corrigido
        const newCategory = await categoryService.createCategory(body);

        // Resposta de Sucesso
        res.status(201).json({
            status: 'success',
            data: newCategory
        });

    } catch (error: unknown) {
        let message = 'An unknown error occurred';

        if (error instanceof Error) {
            message = error.message;
        } else if (error && typeof error === 'object' && 'message' in error) {
            message = String(error.message);
        }

        console.error('[CategoryController Error]:', message);
        res.status(400).json({ status: 'error', message });
    }
};

// Controlador para deletar uma categoria (soft delete).
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Validação de Defesa do ID
        if (typeof id !== 'string' || id.trim() === '') {
            res.status(400).json({ status: 'error', message: 'Invalid category ID.' });
            return;
        }

        await categoryService.deleteCategory(id);
        res.status(200).json({ status: 'success', message: 'Category removed.' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error';
        res.status(400).json({ status: 'error', message });
    }
};
