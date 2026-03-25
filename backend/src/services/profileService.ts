import { supabase } from '../config/supabase.js';

export interface CreateProfileDTO {
    user_id: string;
    name: string;
}

export interface ProfileResponse {
    id: string;
    user_id: string;
    name: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export const createProfile = async (data: CreateProfileDTO): Promise<ProfileResponse> => {
    const { data: profile, error } = await supabase
        .from('profiles')
        .insert([data])
        .select()
        .single();

    if (error) throw new Error(`Error creating profile: ${error.message}`);
    return profile as ProfileResponse;
};

export const readProfiles = async (userId: string): Promise<ProfileResponse[]> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .is('deleted_at', null);

    if (error) throw new Error(`Error fetching profiles: ${error.message}`);
    return data as ProfileResponse[];
};

export const updateProfile = async (id: string, updates: Partial<CreateProfileDTO>): Promise<ProfileResponse> => {
    const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(`Error updating profile: ${error.message}`);
    return data as ProfileResponse;
};

export const deleteProfile = async (id: string): Promise<{ success: boolean }> => {
    const { error } = await supabase
        .from('profiles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error(`Error deleting profile: ${error.message}`);
    return { success: true };
};
