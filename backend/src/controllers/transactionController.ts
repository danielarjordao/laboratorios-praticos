import type { Request, Response } from 'express';
import * as transactionService from '../services/transactionService.js';
import type { CreateTransactionDTO } from '../services/transactionService.js';
import * as tagService from '../services/tagService.js';
import * as accountService from '../services/accountService.js';
import type { TransactionFilters } from '../services/transactionService.js';

// Controller para criar uma transação. Ele é responsável por receber a requisição, validar os dados de entrada, chamar o Service e retornar a resposta adequada.
export const createTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tags, ...transactionData } = req.body;

        // Cria a transação (Responsabilidade do TransactionService)
        const newTransaction = await transactionService.createTransaction(transactionData);

        // Associa as tags, se existirem (Responsabilidade do TagService)
        if (tags && Array.isArray(tags) && tags.length > 0) {
            await tagService.linkTagsToTransaction(newTransaction.id, tags);
        }

        // Atualiza o saldo
        await accountService.updateAccountBalance(
            transactionData.account_id,
            transactionData.amount,
            transactionData.type
        );

        res.status(201).json({ status: 'success', data: newTransaction });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(400).json({ status: 'error', message });
    }
};

// Controller para obter as transações de um perfil específico.
// Ele é responsável por receber a requisição, validar os dados de entrada, chamar o Service e retornar a resposta adequada.
export const readTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { profile_id, month, year, type, categoryId } = req.query;

        if (!profile_id) {
            res.status(400).json({ status: 'error', message: 'Missing profile_id in query parameters.' });
            return;
        }

        const filters: TransactionFilters = {};
        if (month) filters.month = Number(month);
        if (year) filters.year = Number(year);
        if (type) filters.type = String(type);
        if (categoryId) filters.categoryId = String(categoryId);
        if (req.query.search) filters.search = String(req.query.search);
        if (req.query.page) filters.page = Number(req.query.page);
        if (req.query.limit) filters.limit = Number(req.query.limit);
        if (req.query.sortBy) filters.sortBy = String(req.query.sortBy);
        if (req.query.sortOrder) filters.sortOrder = String(req.query.sortOrder) as 'asc' | 'desc';

        const transactions = await transactionService.readTransactions(profile_id as string, filters);

        res.status(200).json({
            status: 'success',
            results: transactions.data.length,
            totalRecords: transactions.totalCount,
            data: transactions.data
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        res.status(400).json({ status: 'error', message });
    }
};

// Controller para atualizar os detalhes de uma transação existente.
// Ele é responsável por receber a requisição, validar os dados de entrada, chamar o Service e retornar a resposta adequada.
export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const body = req.body as Partial<CreateTransactionDTO>;

        // Validação de Defesa do ID
        if (typeof id !== 'string' || id.trim() === '') {
            res.status(400).json({ status: 'error', message: 'Invalid transaction ID.' });
            return;
        }

        const updatedTransaction = await transactionService.updateTransaction(id, body);
        res.status(200).json({ status: 'success', data: updatedTransaction });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('[TransactionController Error]:', message);
        res.status(400).json({ status: 'error', message });
    }
};

// Controller para deletar uma transação (soft delete).
// Ele é responsável por receber a requisição, validar os dados de entrada, chamar o Service e retornar a resposta adequada.
export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        // O ID vem da URL: /transactions/:id
        const { id } = req.params;

        // Validação de Defesa
        if (typeof id !== 'string' || id.trim() === '') {
            res.status(400).json({ status: 'error', message: 'Invalid transaction ID.' });
            return;
        }

        await transactionService.deleteTransaction(id);

        res.status(200).json({
            status: 'success',
            message: 'Transaction successfully removed (soft delete).'
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error deleting transaction';
        res.status(400).json({ status: 'error', message });
    }
};
