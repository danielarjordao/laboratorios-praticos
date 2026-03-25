import type { Request, Response } from 'express';
import * as budgetService from '../services/budgetService.js';

export const createBudget = async (req: Request, res: Response): Promise<void> => {
    try {
        const budget = await budgetService.createBudget(req.body);
        res.status(201).json({ status: 'success', data: budget });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

export const readBudgets = async (req: Request, res: Response): Promise<void> => {
    try {
        const { profile_id, month_date } = req.query;

        if (!profile_id || !month_date) {
            throw new Error('profile_id and month_date are required');
        }

        const budgets = await budgetService.readBudgetsByMonth(
            profile_id as string,
            month_date as string
        );
        res.status(200).json({ status: 'success', data: budgets });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

export const updateBudget = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const { limit_amount } = req.body;

        if (!limit_amount) throw new Error('limit_amount is required for update');

        const updated = await budgetService.updateBudget(id, limit_amount);
        res.status(200).json({ status: 'success', data: updated });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

export const deleteBudget = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        await budgetService.deleteBudget(id);
        res.status(200).json({ status: 'success', message: 'Budget deleted successfully' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};
