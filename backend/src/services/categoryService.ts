import { supabase } from '../config/supabase.js';
import type { CategoryResponse, CreateCategoryDTO } from '../models/categoryModel.js';
import { getNowIso } from '../utils/dateHelpers.js';

// Normaliza os dados de criação de categoria com valores padrão.
const buildCreateCategoryPayload = (categoryData: CreateCategoryDTO) => ({
    name: categoryData.name,
    type: categoryData.type?.toUpperCase() || 'EXPENSE',
    icon: categoryData.icon || 'tag',
    color: categoryData.color || '#808080',
    profile_id: categoryData.profile_id
});

// Cria um novo registo de categoria.
export const createCategory = async (categoryData: CreateCategoryDTO): Promise<CategoryResponse> => {
    const { data, error } = await supabase
        .from('categories')
        .insert([buildCreateCategoryPayload(categoryData)])
        .select()
        .single();

    if (error) {
        throw new Error(`Error creating category: ${error.message}`);
    }

    return data as CategoryResponse;
};

// Lista as categorias de um perfil específico.
export const readCategories = async (profile_id: string): Promise<CategoryResponse[]> => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('profile_id', profile_id)
        .is('deleted_at', null);

    if (error) {
        throw new Error(`Error fetching categories: ${error.message}`);
    }

    return data as CategoryResponse[];
};

// Atualiza os dados de uma categoria existente.
export const updateCategory = async (id: string, data: Partial<CreateCategoryDTO>): Promise<CategoryResponse> => {
    const { data: category, error } = await supabase
        .from('categories')
        .update({ ...data, updated_at: getNowIso() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Error updating category: ${error.message}`);
    }

    return category as CategoryResponse;
};

// Remove uma categoria de forma lógica (soft delete).
export const deleteCategory = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('categories')
        .update({ deleted_at: getNowIso() })
        .eq('id', id);

    if (error) {
        throw new Error(`Error deleting category: ${error.message}`);
    }
};
