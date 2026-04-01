import type { Request, Response } from 'express';
import * as transactionService from '../services/transactionService.js';
import type { CreateTransactionDTO, TransactionFilters } from '../models/transactionModel.js';
import { getErrorMessage, sendBadRequest } from '../utils/controllerHelpers.js';
import { validateCreateTransaction, validateProfileIdQuery, validateTransactionId } from '../utils/validators/transactionValidator.js';

// Cria uma nova transação.
export const createTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const body = req.body as CreateTransactionDTO;

        // Validação de campos obrigatórios (Fail-Fast).
        const validation = validateCreateTransaction(body);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
            return;
        }

        // Chama o serviço para criar a transação
        const newTransaction = await transactionService.createTransaction(body);

        // Resposta de Sucesso
        res.status(201).json({ status: 'success', data: newTransaction });

    } catch (error: unknown) {
        const message = getErrorMessage(error, 'Erro desconhecido ao criar transação.');
        sendBadRequest(res, message);
    }
};

// Obtém as transações de um perfil com suporte a filtros e paginação.
export const readTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
        const profile_id = req.query.profile_id;

        // Validação do parâmetro obrigatório profile_id.
        const validation = validateProfileIdQuery(profile_id);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
            return;
        }

        // Construção do Objeto de Filtros a partir da Query String
        const filters: TransactionFilters = {};

        if (req.query.month) filters.month = Number(req.query.month);
        if (req.query.year) filters.year = Number(req.query.year);
        if (req.query.type) filters.type = String(req.query.type);
        if (req.query.accountId) filters.accountId = String(req.query.accountId);
        if (req.query.categoryId) filters.categoryId = String(req.query.categoryId);
        if (req.query.search) filters.search = String(req.query.search);
        if (req.query.tagId) filters.tagId = String(req.query.tagId);

        // Paginação e Ordenação
        if (req.query.page) filters.page = Number(req.query.page);
        if (req.query.limit) filters.limit = Number(req.query.limit);
        if (req.query.sortBy) filters.sortBy = String(req.query.sortBy);
        if (req.query.sortOrder) filters.sortOrder = String(req.query.sortOrder) as 'asc' | 'desc';

        // Delegação ao Service
        const transactions = await transactionService.readTransactions(profile_id as string, filters);

        // Resposta Estruturada
        res.status(200).json({
            status: 'success',
            results: transactions.data.length,
            totalRecords: transactions.totalCount,
            data: transactions.data
        });

    } catch (error: unknown) {
        const message = getErrorMessage(error, 'Erro ao buscar transações.');
        sendBadRequest(res, message);
    }
};

// Controlador para obter uma transação específica pelo ID
export const readTransactionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        // Validação do parâmetro obrigatório id.
        const validation = validateTransactionId(id);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
            return;
        }

        const transaction = await transactionService.readTransactionById(id);

        // Resposta Estruturada
        res.status(200).json({
            status: 'success',
            data: transaction
        });

    } catch (error: unknown) {
        const message = getErrorMessage(error, 'Error fetching transaction details.');
        res.status(404).json({ status: 'error', message });
    }
};

// Atualiza os detalhes de uma transação existente.
export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const body = req.body as Partial<CreateTransactionDTO>;

        // Validação do parâmetro obrigatório id.
        const validation = validateTransactionId(id);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
            return;
        }

        // 2. Delegação
        const updatedTransaction = await transactionService.updateTransaction(id, body);

        // 3. Resposta
        res.status(200).json({ status: 'success', data: updatedTransaction });

    } catch (error: unknown) {
        const message = getErrorMessage(error, 'Erro ao atualizar transação.');
        sendBadRequest(res, message);
    }
};

/**
 * Controller: Remove uma transação (Soft Delete).
 */
export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        // Validação do parâmetro obrigatório id.
        const validation = validateTransactionId(id);
        if (!validation.isValid) {
            sendBadRequest(res, validation.message!);
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
        const message = getErrorMessage(error, 'Erro ao eliminar transação.');
        sendBadRequest(res, message);
    }
};
