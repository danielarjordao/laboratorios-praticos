import type { Request, Response } from 'express';
import * as dashboardService from '../services/dashboardService.js';

export const readMonthlySummary = async (req: Request, res: Response): Promise<void> => {
    try {
        const { profile_id, month, year } = req.query;

        if (!profile_id || !month || !year) {
            throw new Error('Missing parameters: profile_id, month, and year are required.');
        }

        const summary = await dashboardService.readMonthlySummary(
            profile_id as string,
            Number(month),
            Number(year)
        );

        res.status(200).json({ status: 'success', data: summary });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};
