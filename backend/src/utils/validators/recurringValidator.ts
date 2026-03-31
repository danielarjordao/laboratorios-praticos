import type { CreateRecurringDTO } from '../../models/recurringModel.js';
import type { ValidationResult } from '../../models/validationModel.js';
import { isValidNonEmptyString } from '../controllerHelpers.js';

// Valida os campos obrigatórios para criação de transação recorrente.
export const validateCreateRecurring = (body: unknown): ValidationResult => {
    const dto = body as CreateRecurringDTO;

    if (!dto.profile_id || !dto.account_id || !dto.amount || !dto.frequency || !dto.start_date || !dto.next_run_date || !dto.type) {
        return {
            isValid: false,
            message: 'Missing required fields for recurring transaction: profile_id, account_id, amount, frequency, start_date, next_run_date, type.'
        };
    }

    return { isValid: true };
};

// Valida o parâmetro de query profile_id para listagem de transações recorrentes.
export const validateProfileIdQuery = (profileId: unknown): ValidationResult => {
    if (!isValidNonEmptyString(profileId)) {
        return {
            isValid: false,
            message: 'The profile_id parameter is required in the URL.'
        };
    }

    return { isValid: true };
};

// Valida o parâmetro de rota id para operações unitárias (update, delete).
export const validateRecurringId = (id: unknown): ValidationResult => {
    if (!isValidNonEmptyString(id)) {
        return {
            isValid: false,
            message: 'The recurring transaction ID is required.'
        };
    }

    return { isValid: true };
};
