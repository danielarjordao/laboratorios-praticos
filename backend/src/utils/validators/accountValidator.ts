import type { CreateAccountDTO } from '../../models/accountModel.js';
import type { ValidationResult } from '../../models/validationModel.js';
import { isValidNonEmptyString } from '../controllerHelpers.js';

// Valida os campos obrigatórios para criação de conta.
export const validateCreateAccount = (body: unknown): ValidationResult => {
    const dto = body as CreateAccountDTO;

    if (!dto.profile_id || !dto.name) {
        return {
            isValid: false,
            message: 'Missing required fields: profile_id, name.'
        };
    }

    return { isValid: true };
};

// Valida o parâmetro de query profile_id para listagem de contas.
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
export const validateAccountId = (id: unknown): ValidationResult => {
    if (!isValidNonEmptyString(id)) {
        return {
            isValid: false,
            message: 'The account ID is required.'
        };
    }

    return { isValid: true };
};
