import type { Request, Response } from 'express';
import * as categoryService from '../services/categoryService.js';
import type { CreateCategoryDTO } from '../services/categoryService.js';

// Controlador de Categorias.
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as CreateCategoryDTO;

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

// Controlador para listar as categorias de um perfil específico.
export const readCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const { profile_id } = req.query;

        if (typeof profile_id !== 'string' || profile_id.trim() === '') {
            res.status(400).json({ status: 'error', message: 'Invalid profile ID.' });
            return;
        }

        const categories = await categoryService.readCategories(profile_id);
        res.status(200).json({ status: 'success', data: categories });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error';
        res.status(400).json({ status: 'error', message });
    }
};

// Controlador para atualizar os detalhes de uma categoria existente.
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const body = req.body as Partial<CreateCategoryDTO>;

        // Validação de Defesa do ID
        if (typeof id !== 'string' || id.trim() === '') {
            res.status(400).json({ status: 'error', message: 'Invalid category ID.' });
            return;
        }

        const updatedCategory = await categoryService.updateCategory(id, body);
        res.status(200).json({ status: 'success', data: updatedCategory });
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
