import type { Request, Response } from 'express';
import * as goalService from '../services/goalService.js';

export const createGoal = async (req: Request, res: Response): Promise<void> => {
    try {
        const goal = await goalService.createGoal(req.body);
        res.status(201).json({ status: 'success', data: goal });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

export const readGoals = async (req: Request, res: Response): Promise<void> => {
    try {
        const { profile_id } = req.query;

        if (!profile_id) {
            throw new Error('profile_id is required');
        }

        const goals = await goalService.readGoalsByProfile(profile_id as string);
        res.status(200).json({ status: 'success', data: goals });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

export const updateGoal = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const updated = await goalService.updateGoal(id, req.body);
        res.status(200).json({ status: 'success', data: updated });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

export const deleteGoal = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        await goalService.deleteGoal(id);
        res.status(200).json({ status: 'success', message: 'Goal deleted successfully' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};
