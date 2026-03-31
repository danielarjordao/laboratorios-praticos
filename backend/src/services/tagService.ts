import { supabase } from '../config/supabase.js';
import type { CreateTagDTO, TagResponse } from '../models/tagModel.js';

// Cria uma nova tag.
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

// Lista as tags de um perfil.
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

// Atualiza os dados de uma tag.
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

// Remove uma tag de forma lógica (soft delete).
export const deleteTag = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('tags')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error)
        throw new Error(`Error deleting tag: ${error.message}`);
};

// Associa tags a uma transação.
export const linkTagsToTransaction = async (transactionId: string, tagIds: string[]): Promise<void> => {
    if (!tagIds || tagIds.length === 0) return;

    const tagAssociations = tagIds.map(tagId => ({
        transaction_id: transactionId,
        tag_id: tagId
    }));

    const { error } = await supabase
        .from('transaction_tags')
        .insert(tagAssociations);

    if (error) {
        throw new Error(`Error linking tags to transaction: ${error.message}`);
    }
};
