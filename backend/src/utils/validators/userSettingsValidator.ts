import type { CreateUserSettingsDTO } from '../../models/userSettingsModel.js';
import type { ValidationResult } from '../../models/validationModel.js';
import { isValidNonEmptyString } from '../controllerHelpers.js';

// Valida os campos obrigatórios para criação de configurações de utilizador.
export const validateCreateUserSettings = (body: unknown): ValidationResult => {
    const dto = body as CreateUserSettingsDTO;

    if (!dto.user_id) {
        return {
            isValid: false,
            message: 'The user_id field is required.'
        };
    }

    return { isValid: true };
};

// Valida o parâmetro de query user_id para leitura de configurações.
export const validateUserIdQuery = (userId: unknown): ValidationResult => {
    if (!isValidNonEmptyString(userId)) {
        return {
            isValid: false,
            message: 'The user_id parameter is required in the URL.'
        };
    }

    return { isValid: true };
};

// Valida o parâmetro de rota user_id para operações unitárias (update).
export const validateUserIdParam = (userId: unknown): ValidationResult => {
    if (!isValidNonEmptyString(userId)) {
        return {
            isValid: false,
            message: 'The user ID is required.'
        };
    }

    return { isValid: true };
};
