import type { Request, Response } from 'express';
import * as transactionService from '../services/transactionService.js';
import type { CreateTransactionDTO } from '../services/transactionService.js';

// Controller para criar uma transação. Ele é responsável por receber a requisição, validar os dados de entrada, chamar o Service e retornar a resposta adequada.
export const createTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as CreateTransactionDTO;

        //  Validação de Defesa (Fail-Fast)
        // Verifica apenas a presença dos campos. A lógica de negócio fica no Service.
        if (!body.account_id || !body.type || body.amount === undefined || !body.date) {
            res.status(400).json({
                status: 'error',
                message: 'Missing required fields: account_id, type, amount, date.'
            });
            return;
        }

        // Chama o Service
        const transaction = await transactionService.createTransaction(body);

        // Resposta de Sucesso
        res.status(201).json({
            status: 'success',
            data: transaction
        });

    } catch (error: unknown) {
        // Tratamento de Erros
        // Captura tanto erros do Service quanto erros diretos do Supabase/PostgreSQL
        let errorMessage = 'An unknown error occurred';

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            // Caso o erro venha do Supabase como um objeto literal
            errorMessage = (error as { message: string }).message;
        }

        console.error('[TransactionController Error]:', errorMessage);

        res.status(400).json({
            status: 'error',
            message: errorMessage
        });
    }
};

// Controller para obter as transações de um perfil específico.
// Ele é responsável por receber a requisição, validar os dados de entrada, chamar o Service e retornar a resposta adequada.
export const getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { profileId } = req.query;

        if (!profileId) {
            res.status(400).json({ status: 'error', message: 'Missing profileId in query parameters.' });
            return;
        }

        const transactions = await transactionService.getTransactions(profileId as string);

        res.status(200).json({
            status: 'success',
            results: transactions.length,
            data: transactions
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ status: 'error', message });
    }
};

