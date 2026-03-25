import type { Request, Response } from 'express';
import * as recurringService from '../services/recurringService.js';
import type { CreateRecurringDTO } from '../services/recurringService.js';

export const createRecurring = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as CreateRecurringDTO;

        // Validação básica (Fail-Fast)
        if (!body.profile_id || !body.account_id || !body.amount || !body.frequency || !body.start_date || !body.next_run_date || !body.type) {
             res.status(400).json({
                status: 'error',
                message: 'Missing required fields for recurring transaction.'
            });
            return;
        }

        const recurring = await recurringService.createRecurring(body);
        res.status(201).json({ status: 'success', data: recurring });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

export const readRecurring = async (req: Request, res: Response): Promise<void> => {
    try {
        const { profile_id } = req.query;

        if (!profile_id || typeof profile_id !== 'string') {
            res.status(400).json({ status: 'error', message: 'profile_id is required' });
            return;
        }

        const recurringList = await recurringService.getRecurringByProfile(profile_id);
        res.status(200).json({ status: 'success', data: recurringList });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

export const updateRecurring = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const body = req.body as Partial<CreateRecurringDTO>;

        const updated = await recurringService.updateRecurring(id, body);
        res.status(200).json({ status: 'success', data: updated });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

export const deleteRecurring = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        await recurringService.deleteRecurring(id);
        res.status(200).json({ status: 'success', message: 'Recurring transaction deleted successfully' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};
