import { supabase } from '../config/supabase.js';
import type { CategoryResponse, CreateCategoryDTO } from '../models/categoryModel.js';

// Cria um novo registo de categoria.
export const createCategory = async (categoryData: CreateCategoryDTO): Promise<CategoryResponse> => {
    const { name, icon, color, profile_id, type } = categoryData;

    const { data, error } = await supabase
        .from('categories')
        .insert([{
            name,
            type: type?.toUpperCase() || 'EXPENSE',
            icon: icon || 'tag',
            color: color || '#808080',
            profile_id
        }])
        .select()
        .single();

    if (error) {
        throw new Error(`Database error: ${error.message}`);
    }

    return data as CategoryResponse;
};

// Função para listar as categorias de um perfil específico.
export const readCategories = async (profile_id: string): Promise<CategoryResponse[]> => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('profile_id', profile_id)
        .is('deleted_at', null);

    if (error) {
        throw new Error(`Database error: ${error.message}`);
    }

    return data as CategoryResponse[];
};

// Função para atualizar uma categoria existente.
export const updateCategory = async (id: string, data: Partial<CreateCategoryDTO>): Promise<CategoryResponse> => {
    const { data: category, error } = await supabase
        .from('categories')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error)
        throw new Error(error.message);

    return category as CategoryResponse;
};

// Função para deletar uma categoria (soft delete).
export const deleteCategory = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('categories')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error)
        throw new Error(`Error deleting category: ${error.message}`);
};
