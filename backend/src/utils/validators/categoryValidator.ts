import type { CreateCategoryDTO } from '../../models/categoryModel.js';
import type { ValidationResult } from '../../models/validationModel.js';
import { isValidNonEmptyString } from '../controllerHelpers.js';

// Valida os campos obrigatórios para criação de categoria.
export const validateCreateCategory = (body: unknown): ValidationResult => {
    const dto = body as CreateCategoryDTO;

    if (!dto.name || !dto.profile_id || !dto.type) {
        return {
            isValid: false,
            message: 'Missing required fields: name, profile_id, type.'
        };
    }

    return { isValid: true };
};

// Valida o parâmetro de query profile_id para listagem de categorias.
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
export const validateCategoryId = (id: unknown): ValidationResult => {
    if (!isValidNonEmptyString(id)) {
        return {
            isValid: false,
            message: 'The category ID is required.'
        };
    }

    return { isValid: true };
};
