import type { Request, Response } from 'express';
import * as accountService from '../services/accountService.js';
import type { AccountInput } from '../services/accountService.js';

// Valida a entrada e orquestra a resposta para o utilizador.
export const createAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as AccountInput;

        // Validação de Defesa
        if (!body.profile_id || !body.name) {
            res.status(400).json({
                status: 'error',
                message: 'Missing required fields: profile_id, name.'
            });
            return;
        }

        // Chamada ao serviço com nome limpo
        const newAccount = await accountService.createAccount(body);

        // Resposta de Sucesso
        res.status(201).json({
            status: 'success',
            data: newAccount
        });

    } catch (error: unknown) {
        let message = 'An unknown error occurred';

        if (error instanceof Error) {
            message = error.message;
        } else if (error && typeof error === 'object' && 'message' in error) {
            message = String(error.message);
        }

        console.error('[AccountController Error]:', message);
        res.status(400).json({ status: 'error', message });
    }
};
