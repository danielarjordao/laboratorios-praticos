import type { ValidationResult } from '../../models/validationModel.js';
import { isValidNonEmptyString } from '../controllerHelpers.js';

// Valida os campos para listagem de orçamentos por mês e perfil.
export const validateReadBudgetsParams = (profileId: unknown, monthDate: unknown): ValidationResult => {
    if (!isValidNonEmptyString(profileId) || !isValidNonEmptyString(monthDate)) {
        return {
            isValid: false,
            message: 'The parameters profile_id and month_date are required in the URL.'
        };
    }

    return { isValid: true };
};

// Valida o campo limit_amount para atualização de orçamento.
export const validateUpdateBudgetFields = (limitAmount: unknown): ValidationResult => {
    if (!limitAmount) {
        return {
            isValid: false,
            message: 'The limit_amount field is required for update.'
        };
    }

    return { isValid: true };
};

// Valida o parâmetro de rota id para operações unitárias (delete).
export const validateBudgetId = (id: unknown): ValidationResult => {
    if (!id || typeof id !== 'string') {
        return {
            isValid: false,
            message: 'The budget ID is required.'
        };
    }

    return { isValid: true };
};
