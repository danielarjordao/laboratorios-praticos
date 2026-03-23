import { supabase } from '../config/supabase.js';

// Interface para os dados que entram (Data Transfer Object)
export interface CategoryInput {
    name: string;
    icon?: string;
    profile_id: string;
    type: 'INCOME' | 'EXPENSE';
}

// Interface para o que a base de dados devolve
export interface CategoryResponse extends CategoryInput {
    id: string;
    created_at: string;
    updated_at: string;
}

// Cria um novo registo de categoria.
export const createCategory = async (categoryData: CategoryInput): Promise<CategoryResponse> => {
    const { name, icon, profile_id, type } = categoryData;

    const { data, error } = await supabase
        .from('categories')
        .insert([{
            name,
             // Garante consistência com o SQL
            type: type?.toUpperCase() || 'EXPENSE',
            icon: icon || 'tag',
            profile_id
        }])
        .select()
        // .single() garante que recebe um objeto e não um array [0]
        .single();

    if (error) {
        throw new Error(`Database error: ${error.message}`);
    }

    return data as CategoryResponse;
};

// Função para listar as categorias de um perfil específico.
export const getCategories = async (profile_id: string): Promise<CategoryResponse[]> => {
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
export const updateCategory = async (id: string, data: Partial<CategoryInput>): Promise<CategoryResponse> => {
    const { data: category, error } = await supabase
        .from('categories')
        .update(data)
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
