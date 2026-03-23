import type { Request, Response } from 'express';
import * as transactionService from '../services/transactionService.js';
import type { TransactionInput } from '../services/transactionService.js';

// O Controller recebe o pedido da internet (Request) e envia a resposta (Response)
export const createTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
        // O body da requisição é do tipo "Partial<TransactionInput>" porque a validação de defesa ainda não aconteceu.
        // Isso significa que, neste ponto, os campos obrigatórios podem estar ausentes ou incorretos, e é responsabilidade do Controller verificar isso antes de enviar os dados para o Service.
        const body = req.body as Partial<TransactionInput>;

        // Verificação de campos obrigatórios: account_id, type, amount e date são essenciais para criar uma transação válida.
        if (!body.account_id || !body.type || body.amount === undefined || !body.date) {
            res.status(400).json({
                status: 'error',
                message: 'Faltam campos obrigatórios: account_id, type, amount, date.'
            });
            // Interrompe a execução do Controller aqui, pois os dados são insuficientes para prosseguir.
            return;
        }

        // Executa a lógica de negócio no Service, que tem a garantia de receber um objeto completo e correto graças à validação feita aqui no Controller.
        const newTransaction = await transactionService.createTransactionRecord(body as TransactionInput);

        // Se tudo correr bem, retorna a transação recém-criada com status 201 (Created)
        res.status(201).json({
            status: 'success',
            data: newTransaction
        });

    } catch (error: unknown) {
        // Extrair da mensagem de erro de forma segura, garantindo que o tipo é tratado corretamente
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        // Se o Service lançou um "throw new Error", o catch apanha-o aqui
        console.error('Erro de Validação:', message);
        res.status(400).json({
            status: 'error',
            message: message
        });
    }
};
