import { supabase } from '../config/supabase.js';
import type { CreateUserSettingsDTO, UserSettingsResponse } from '../models/userSettingsModel.js';

// Normalmente, cria-se as configurações ao mesmo tempo que o Profile/User
export const createUserSettings = async (data: CreateUserSettingsDTO): Promise<UserSettingsResponse> => {
    const { data: settings, error } = await supabase
        .from('user_settings')
        .insert([{
            user_id: data.user_id,
            theme: data.theme || 'light',
            currency: data.currency || 'EUR',
            language: data.language || 'pt-PT',
            receive_notifications: data.receive_notifications ?? true
        }])
        .select()
        .single();

    if (error) throw new Error(`Error creating user settings: ${error.message}`);
    return settings as UserSettingsResponse;
};

// Ler as configurações de um utilizador específico (só deve existir uma por user)
export const readUserSettings = async (userId: string): Promise<UserSettingsResponse> => {
    const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) throw new Error(`Error fetching user settings: ${error.message}`);
    return data as UserSettingsResponse;
};

export const updateUserSettings = async (userId: string, updates: Partial<CreateUserSettingsDTO>): Promise<UserSettingsResponse> => {
    const { data, error } = await supabase
        .from('user_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw new Error(`Error updating user settings: ${error.message}`);
    return data as UserSettingsResponse;
};

// Não há função delete porque as settings pertencem sempre ao utilizador enquanto ele existir
