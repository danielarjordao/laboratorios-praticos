import type { Request, Response } from 'express';
import * as userSettingsService from '../services/userSettingsService.js';
import type { CreateUserSettingsDTO } from '../models/userSettingsModel.js';

export const createUserSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as CreateUserSettingsDTO;

        if (!body.user_id) {
            res.status(400).json({ status: 'error', message: 'Missing required field: user_id.' });
            return;
        }

        const settings = await userSettingsService.createUserSettings(body);
        res.status(201).json({ status: 'success', data: settings });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

export const readUserSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id } = req.query;

        if (!user_id || typeof user_id !== 'string') {
            res.status(400).json({ status: 'error', message: 'user_id is required in query parameters.' });
            return;
        }

        const settings = await userSettingsService.readUserSettings(user_id);
        res.status(200).json({ status: 'success', data: settings });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

export const updateUserSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id } = req.params as { user_id: string }; // Atualizamos usando o user_id na URL
        const body = req.body as Partial<CreateUserSettingsDTO>;

        const updated = await userSettingsService.updateUserSettings(user_id, body);
        res.status(200).json({ status: 'success', data: updated });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

// Nota: Sem deleteUserSettings, conforme a regra de negócio.
