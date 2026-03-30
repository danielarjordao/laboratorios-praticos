import type { Request, Response } from 'express';
import * as transactionService from '../services/transactionService.js';
import type { CreateTransactionDTO, TransactionFilters } from '../services/transactionService.js';

// Cria uma nova transação.
export const createTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as CreateTransactionDTO;

        // Validação de Defesa (Fail-Fast)
        if (!body.account_id || !body.type || !body.amount || !body.date) {
            res.status(400).json({
                status: 'error',
                message: 'Campos obrigatórios em falta: account_id, type, amount, date.'
            });
            return;
        }

        // Chama o serviço para criar a transação
        const newTransaction = await transactionService.createTransaction(body);

        // Resposta de Sucesso
        res.status(201).json({ status: 'success', data: newTransaction });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido ao criar transação.';
        res.status(400).json({ status: 'error', message });
    }
};

// Obtém as transações de um perfil com suporte a filtros e paginação.
export const readTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
        const profile_id = req.query.profile_id as string;

        // Validação de Defesa
        if (!profile_id) {
            res.status(400).json({ status: 'error', message: 'O parâmetro profile_id é obrigatório na URL.' });
            return;
        }

        // Construção do Objeto de Filtros a partir da Query String
        const filters: TransactionFilters = {};

        if (req.query.month) filters.month = Number(req.query.month);
        if (req.query.year) filters.year = Number(req.query.year);
        if (req.query.type) filters.type = String(req.query.type);
        if (req.query.categoryId) filters.categoryId = String(req.query.categoryId);
        if (req.query.search) filters.search = String(req.query.search);
        if (req.query.tagId) filters.tagId = String(req.query.tagId);

        // Paginação e Ordenação
        if (req.query.page) filters.page = Number(req.query.page);
        if (req.query.limit) filters.limit = Number(req.query.limit);
        if (req.query.sortBy) filters.sortBy = String(req.query.sortBy);
        if (req.query.sortOrder) filters.sortOrder = String(req.query.sortOrder) as 'asc' | 'desc';

        // Delegação ao Service
        const transactions = await transactionService.readTransactions(profile_id, filters);

        // Resposta Estruturada
        res.status(200).json({
            status: 'success',
            results: transactions.data.length,
            totalRecords: transactions.totalCount,
            data: transactions.data
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao buscar transações.';
        res.status(400).json({ status: 'error', message });
    }
};

// Atualiza os detalhes de uma transação existente.
export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const body = req.body as Partial<CreateTransactionDTO>;

        // 1. Validação do ID
        if (!id || id.trim() === '') {
            res.status(400).json({ status: 'error', message: 'ID da transação inválido.' });
            return;
        }

        // 2. Delegação
        const updatedTransaction = await transactionService.updateTransaction(id, body);

        // 3. Resposta
        res.status(200).json({ status: 'success', data: updatedTransaction });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao atualizar transação.';
        res.status(400).json({ status: 'error', message });
    }
};

/**
 * Controller: Remove uma transação (Soft Delete).
 */
export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        // 1. Validação do ID
        if (!id || id.trim() === '') {
            res.status(400).json({ status: 'error', message: 'ID da transação inválido.' });
            return;
        }

        // 2. Delegação
        await transactionService.deleteTransaction(id);

        // 3. Resposta
        res.status(200).json({
            status: 'success',
            message: 'Transação removida com sucesso (soft delete).'
        });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao eliminar transação.';
        res.status(400).json({ status: 'error', message });
    }
};
