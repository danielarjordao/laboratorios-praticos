import type { Request, Response } from 'express';
import * as categoryService from '../services/categoryService.js';
import type { CreateCategoryDTO } from '../models/categoryModel.js';
import { getErrorMessage, sendBadRequest } from '../utils/controllerHelpers.js';
import { validateCreateCategory, validateProfileIdQuery, validateCategoryId } from '../utils/validators/categoryValidator.js';

// Cria uma categoria após validar os campos obrigatórios do payload.
export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as CreateCategoryDTO;

        // Validação dos campos obrigatórios: name, profile_id, type.
        const validation = validateCreateCategory(body);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
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
        const message = getErrorMessage(error, 'An unknown error occurred');

        console.error('[CategoryController Error]:', message);
        sendBadRequest(res, message);
    }
};

// Lista as categorias pertencentes a um perfil específico.
export const readCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const { profile_id } = req.query;

        // Validação do parâmetro obrigatório profile_id.
        const validation = validateProfileIdQuery(profile_id);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
            return;
        }

        const categories = await categoryService.readCategories(profile_id as string);
        res.status(200).json({ status: 'success', data: categories });
    } catch (error: unknown) {
        const message = getErrorMessage(error, 'Error');
        sendBadRequest(res, message);
    }
};

// Atualiza os dados de uma categoria já existente.
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const body = req.body as Partial<CreateCategoryDTO>;

        // Validação do parâmetro obrigatório id.
        const validation = validateCategoryId(id);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
            return;
        }

        const updatedCategory = await categoryService.updateCategory(id as string, body);
        res.status(200).json({ status: 'success', data: updatedCategory });
    } catch (error: unknown) {
        const message = getErrorMessage(error, 'An unknown error occurred');

        console.error('[CategoryController Error]:', message);
        sendBadRequest(res, message);
    }
};

// Remove uma categoria de forma lógica (soft delete).
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Validação do parâmetro obrigatório id.
        const validation = validateCategoryId(id);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
            return;
        }

        await categoryService.deleteCategory(id as string);
        res.status(200).json({ status: 'success', message: 'Category removed.' });
    } catch (error: unknown) {
        const message = getErrorMessage(error, 'Error');
        sendBadRequest(res, message);
    }
};
