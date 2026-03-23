import type { Request, Response } from 'express';
import * as accountService from '../services/accountService.js';
import type { AccountInput } from '../services/accountService.js';

// O Controller recebe o pedido da internet (Request) e envia a resposta (Response)
export const createAccount = async (req: Request, res: Response): Promise<void> => {
    try {
		// O body da requisição é do tipo "Partial<AccountInput>" porque a validação de defesa ainda não aconteceu.
        const body = req.body as Partial<AccountInput>;

		// Verificação de campos obrigatórios: profile_id e name são essenciais para criar uma conta válida.
        if (!body.profile_id || !body.name) {
            res.status(400).json({
                status: 'error',
                message: 'Faltam campos obrigatórios: profile_id, name.'
            });
            return;
        }

		// Executa a lógica de negócio no Service, que tem a garantia de receber um objeto completo e correto graças à validação feita aqui no Controller.
        const newAccount = await accountService.createAccountRecord(body as AccountInput);

		// Se tudo correr bem, retorna a conta recém-criada com status 201 (Created)
        res.status(201).json({
            status: 'success',
            data: newAccount
        });

    } catch (error: unknown) {
		// Extrair da mensagem de erro de forma segura, garantindo que o tipo é tratado corretamente
		const message = error instanceof Error ? error.message : 'Erro desconhecido';
		// Se o Service lançou um "throw new Error", o catch apanha-o aqui
        console.error('Erro na criação de conta:', message);
        res.status(400).json({
            status: 'error',
            message: message
        });
    }
};
