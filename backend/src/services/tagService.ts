import { supabase } from '../config/supabase.js';

export interface TagInput {
    name: string;
    profile_id: string;
}

export interface TagResponse extends TagInput {
    id: string;
    created_at: string;
    updated_at: string;
}

// Criar nova Tag
export const createTag = async (tagData: TagInput): Promise<TagResponse> => {
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
export const getTags = async (profile_id: string): Promise<TagResponse[]> => {
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
export const updateTag = async (id: string, data: Partial<TagInput>): Promise<TagResponse> => {
    const { data: updatedTag, error } = await supabase
        .from('tags')
        .update(data)
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
