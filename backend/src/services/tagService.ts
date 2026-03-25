import { supabase } from '../config/supabase.js';

export interface CreateTagDTO {
    name: string;
    profile_id: string;
}

export interface TagResponse extends CreateTagDTO {
    id: string;
    created_at: string;
    updated_at: string;
}

// Criar nova Tag
export const createTag = async (tagData: CreateTagDTO): Promise<TagResponse> => {
    const { data, error } = await supabase
        .from('tags')
        .insert([{
            ...tagData,
        }])
        .select()
        .single();

    if (error)
		throw new Error(`Database error: ${error.message}`);
    return data as TagResponse;
};

// Listar Tags de um perfil
export const readTags = async (profile_id: string): Promise<TagResponse[]> => {
    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('profile_id', profile_id)
        .is('deleted_at', null);

    if (error)
		throw new Error(`Database error: ${error.message}`);
    return data as TagResponse[];
};

// Atualizar Tag
export const updateTag = async (id: string, data: Partial<CreateTagDTO>): Promise<TagResponse> => {
    const { data: updatedTag, error } = await supabase
        .from('tags')
        .update({
            ...data,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (error)
        throw new Error(`Error updating tag: ${error.message}`);

    return updatedTag as TagResponse;
};

// Soft Delete de Tag
export const deleteTag = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('tags')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error)
		throw new Error(`Error deleting tag: ${error.message}`);
};

// Função para linkar tags a uma transação, inserindo os registros na tabela de junção transaction_tags
export const linkTagsToTransaction = async (transactionId: string, tagIds: string[]): Promise<void> => {
    // Valida se há tags para linkar
    if (!tagIds || tagIds.length === 0) return;

    // Prepara os dados para inserção em massa na tabela de junção
    const tagAssociations = tagIds.map(tagId => ({
        transaction_id: transactionId,
        tag_id: tagId
    }));

    // Insere as associações na tabela de junção
    const { error } = await supabase
        .from('transaction_tags')
        .insert(tagAssociations);

    if (error) {
        throw new Error(`Error linking tags to transaction: ${error.message}`);
    }
};
