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
        // Extrai a mensagem do erro, tentando cobrir tanto erros padrão do JavaScript quanto erros personalizados do Supabase.
        let message = 'Erro desconhecido';

        if (error instanceof Error) {
            message = error.message;
        } else if (error && typeof error === 'object') {
            // Captura a mensagem principal do Supabase
            if ('message' in error) {
                message = String(error.message);
            }
            // Adiciona os detalhes do PostgREST
            if ('details' in error && error.details) {
                message += ` | Detalhes: ${error.details}`;
            }
            // Adiciona dicas se o Supabase as fornecer
            if ('hint' in error && error.hint) {
                message += ` | Dica: ${error.hint}`;
            }
        }

        // Devolve o erro detalhado para o Postman
        res.status(400).json({
            status: 'error',
            message: message
        });
    }
};
