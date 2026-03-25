import type { Request, Response } from 'express';
import * as accountService from '../services/accountService.js';
import type { CreateAccountDTO } from '../services/accountService.js';

// Valida a entrada e orquestra a resposta para o utilizador.
export const createAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as CreateAccountDTO;

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

// Controlador para listar todas as contas de um perfil.
export const readAccounts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { profile_id } = req.query;

        // Validação de Defesa do profile_id
        if (typeof profile_id !== 'string' || profile_id.trim() === '') {
            res.status(400).json({ status: 'error', message: 'Invalid profile ID.' });
            return;
        }

        const accounts = await accountService.readAccounts(profile_id);
        res.status(200).json({ status: 'success', data: accounts });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error';
        res.status(400).json({ status: 'error', message });
    }
};

// Controlador para atualizar os detalhes de uma conta existente.
export const updateAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const body = req.body as Partial<CreateAccountDTO>;

        // Validação de Defesa do ID
        if (typeof id !== 'string' || id.trim() === '') {
            res.status(400).json({ status: 'error', message: 'Invalid account ID.' });
            return;
        }

        const updatedAccount = await accountService.updateAccount(id, body);
        res.status(200).json({ status: 'success', data: updatedAccount });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error';
        res.status(400).json({ status: 'error', message });
    }
};

// Controlador para deletar uma conta (soft delete).
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Validação de Defesa do ID
        if (typeof id !== 'string' || id.trim() === '') {
            res.status(400).json({ status: 'error', message: 'Invalid account ID.' });
            return;
        }

        await accountService.deleteAccount(id);
        res.status(200).json({ status: 'success', message: 'Account removed.' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error';
        res.status(400).json({ status: 'error', message });
    }
};
