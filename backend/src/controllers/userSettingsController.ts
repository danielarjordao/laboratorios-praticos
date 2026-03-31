import type { Request, Response } from 'express';
import * as userSettingsService from '../services/userSettingsService.js';
import type { CreateUserSettingsDTO } from '../models/userSettingsModel.js';
import { getErrorMessage, sendBadRequest } from '../utils/controllerHelpers.js';
import { validateCreateUserSettings, validateUserIdQuery, validateUserIdParam } from '../utils/validators/userSettingsValidator.js';

// Cria as configurações iniciais do utilizador.
export const createUserSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as CreateUserSettingsDTO;

        // Validação do campo obrigatório user_id.
        const validation = validateCreateUserSettings(body);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
            return;
        }

        const settings = await userSettingsService.createUserSettings(body);
        res.status(201).json({ status: 'success', data: settings });
    } catch (error: unknown) {
        const message = getErrorMessage(error, 'Unknown error');
        sendBadRequest(res, message);
    }
};

// Lê as configurações de um utilizador específico.
export const readUserSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id } = req.query;

        // Validação do parâmetro obrigatório user_id.
        const validation = validateUserIdQuery(user_id);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
            return;
        }

        const settings = await userSettingsService.readUserSettings(user_id as string);
        res.status(200).json({ status: 'success', data: settings });
    } catch (error: unknown) {
        const message = getErrorMessage(error, 'Unknown error');
        sendBadRequest(res, message);
    }
};

// Atualiza as configurações de um utilizador pelo user_id na rota.
export const updateUserSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const { user_id } = req.params as { user_id: string };
        const body = req.body as Partial<CreateUserSettingsDTO>;

        // Validação do parâmetro obrigatório user_id.
        const validation = validateUserIdParam(user_id);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
            return;
        }

        const updated = await userSettingsService.updateUserSettings(user_id, body);
        res.status(200).json({ status: 'success', data: updated });
    } catch (error: unknown) {
        const message = getErrorMessage(error, 'Unknown error');
        sendBadRequest(res, message);
    }
};

// Nota: Sem deleteUserSettings, conforme a regra de negócio.
