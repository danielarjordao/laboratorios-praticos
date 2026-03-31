import type { Request, Response } from 'express';
import * as budgetService from '../services/budgetService.js';
import type { CreateBudgetDTO } from '../models/budgetModel.js';
import { getErrorMessage, sendBadRequest } from '../utils/controllerHelpers.js';
import { validateReadBudgetsParams, validateUpdateBudgetFields, validateBudgetId } from '../utils/validators/budgetValidator.js';

// Cria um novo orçamento com os dados recebidos no body.
export const createBudget = async (req: Request, res: Response): Promise<void> => {
    try {
        const budget = await budgetService.createBudget(req.body as CreateBudgetDTO);
        res.status(201).json({ status: 'success', data: budget });
    } catch (error: unknown) {
        const message = getErrorMessage(error, 'Unknown error');
        sendBadRequest(res, message);
    }
};

// Lista orçamentos por perfil e mês, exigindo ambos os filtros na query string.
export const readBudgets = async (req: Request, res: Response): Promise<void> => {
    try {
        const { profile_id, month_date } = req.query;

        // Validação de parâmetros obrigatórios.
        const validation = validateReadBudgetsParams(profile_id, month_date);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
            return;
        }

        const budgets = await budgetService.readBudgetsByMonth(
            profile_id as string,
            month_date as string
        );
        res.status(200).json({ status: 'success', data: budgets });
    } catch (error: unknown) {
        const message = getErrorMessage(error, 'Unknown error');
        sendBadRequest(res, message);
    }
};

// Atualiza o limite de um orçamento específico a partir do id da rota.
export const updateBudget = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const { limit_amount } = req.body;

        // Validação do campo obrigatório limit_amount.
        const validation = validateUpdateBudgetFields(limit_amount);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
            return;
        }

        const updated = await budgetService.updateBudget(id, limit_amount);
        res.status(200).json({ status: 'success', data: updated });
    } catch (error: unknown) {
        const message = getErrorMessage(error, 'Unknown error');
        sendBadRequest(res, message);
    }
};

// Remove logicamente um orçamento (soft delete) pelo id informado na rota.
export const deleteBudget = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        await budgetService.deleteBudget(id);
        res.status(200).json({ status: 'success', message: 'Budget deleted successfully' });
    } catch (error: unknown) {
        const message = getErrorMessage(error, 'Unknown error');
        sendBadRequest(res, message);
    }
};
