import { supabase } from '../config/supabase.js';

export interface CategoryInput {
    name: string;
    icon?: string;
	// Cada utilizador tem as suas próprias categorias,
	// por isso é necessário associar a categoria a um "profile_id" específico.
    profile_id: string;
}

export const createCategoryRecord = async (categoryData: CategoryInput): Promise<CategoryInput> => {
    // Desestruturação dos dados para facilitar a manipulação
	const { name, icon, profile_id } = categoryData;

    const { data, error } = await supabase
        .from('categories')
        .insert([{
            name,
			// Ícone padrão se não for enviado
            icon: icon || 'tag',
            profile_id
        }])
        .select();

    if (error)
		throw error;

    return data[0];
};
