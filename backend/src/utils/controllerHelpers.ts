import type { Response } from 'express';

// Extrai mensagens de erro de forma segura, com fallback para cenarios inesperados.
export const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error) {
        return error.message;
    }

    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }

    return fallback;
};

// Verifica se um valor recebido na request e uma string valida e nao vazia.
export const isValidNonEmptyString = (value: unknown): value is string => {
    return typeof value === 'string' && value.trim() !== '';
};

// Padroniza respostas de erro 400 para os controllers.
export const sendBadRequest = (res: Response, message: string): void => {
    res.status(400).json({ status: 'error', message });
};
