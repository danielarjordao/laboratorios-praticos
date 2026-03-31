import type { Request, Response } from 'express';
import * as recurringService from '../services/recurringService.js';
import type { CreateRecurringDTO } from '../models/recurringModel.js';
import { getErrorMessage, sendBadRequest } from '../utils/controllerHelpers.js';
import { validateCreateRecurring, validateProfileIdQuery, validateRecurringId } from '../utils/validators/recurringValidator.js';

// Cria uma nova transação recorrente.
export const createRecurring = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as CreateRecurringDTO;

        // Validação dos campos obrigatórios.
        const validation = validateCreateRecurring(body);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
            return;
        }

        const recurring = await recurringService.createRecurring(body);
        res.status(201).json({ status: 'success', data: recurring });
    } catch (error: unknown) {
        const message = getErrorMessage(error, 'Unknown error');
        sendBadRequest(res, message);
    }
};

// Lista todas as recorrências de um perfil.
export const readRecurring = async (req: Request, res: Response): Promise<void> => {
    try {
        const { profile_id } = req.query;

        // Validação do parâmetro obrigatório profile_id.
        const validation = validateProfileIdQuery(profile_id);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
            return;
        }

        const recurringList = await recurringService.getRecurringByProfile(profile_id as string);
        res.status(200).json({ status: 'success', data: recurringList });
    } catch (error: unknown) {
        const message = getErrorMessage(error, 'Unknown error');
        sendBadRequest(res, message);
    }
};

// Atualiza parcialmente uma recorrência existente.
export const updateRecurring = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const body = req.body as Partial<CreateRecurringDTO>;

        // Validação do parâmetro obrigatório id.
        const validation = validateRecurringId(id);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
            return;
        }

        const updated = await recurringService.updateRecurring(id, body);
        res.status(200).json({ status: 'success', data: updated });
    } catch (error: unknown) {
        const message = getErrorMessage(error, 'Unknown error');
        sendBadRequest(res, message);
    }
};

// Remove uma recorrência de forma lógica (soft delete).
export const deleteRecurring = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };

        // Validação do parâmetro obrigatório id.
        const validation = validateRecurringId(id);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
            return;
        }

        await recurringService.deleteRecurring(id);
        res.status(200).json({ status: 'success', message: 'Recurring transaction deleted successfully' });
    } catch (error: unknown) {
        const message = getErrorMessage(error, 'Unknown error');
        sendBadRequest(res, message);
    }
};
