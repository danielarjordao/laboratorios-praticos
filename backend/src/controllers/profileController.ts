import type { Request, Response } from 'express';
import * as profileService from '../services/profileService.js';
import type { CreateProfileDTO } from '../services/profileService.js';

export const createProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as CreateProfileDTO;

        if (!body.user_id || !body.name) {
            res.status(400).json({ status: 'error', message: 'Missing required fields: user_id, name.' });
            return;
        }

        const profile = await profileService.createProfile(body);
        res.status(201).json({ status: 'success', data: profile });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

export const readProfiles = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id } = req.query;

        if (!user_id || typeof user_id !== 'string') {
            res.status(400).json({ status: 'error', message: 'user_id is required in query parameters.' });
            return;
        }

        const profiles = await profileService.readProfiles(user_id);
        res.status(200).json({ status: 'success', data: profiles });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        const body = req.body as Partial<CreateProfileDTO>;

        const updated = await profileService.updateProfile(id, body);
        res.status(200).json({ status: 'success', data: updated });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

export const deleteProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id: string };
        await profileService.deleteProfile(id);
        res.status(200).json({ status: 'success', message: 'Profile deleted successfully (soft delete)' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};
