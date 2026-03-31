import { supabase } from '../config/supabase.js';
import type { CreateProfileDTO, ProfileResponse } from '../models/profileModel.js';
import { getNowIso } from '../utils/dateHelpers.js';

// Cria a estrutura inicial de categorias e subcategorias para um novo perfil.
const createDefaultCategories = async (profileId: string) => {
    // Cria as Categorias Principais (Pai)
    const mainCategories = [
        { profile_id: profileId, name: 'Moradia', type: 'EXPENSE', icon: 'home', color: '#3B82F6' },
        { profile_id: profileId, name: 'Alimentação', type: 'EXPENSE', icon: 'restaurant', color: '#EF4444' },
        { profile_id: profileId, name: 'Transporte', type: 'EXPENSE', icon: 'directions_car', color: '#F59E0B' },
        { profile_id: profileId, name: 'Lazer', type: 'EXPENSE', icon: 'sports_esports', color: '#8B5CF6' },
        { profile_id: profileId, name: 'Rendimentos', type: 'INCOME', icon: 'payments', color: '#10B981' }
    ];

    const { data: createdMains, error: mainError } = await supabase
        .from('categories')
        .insert(mainCategories)
        .select();

    if (mainError) throw mainError;

    // Mapeia os IDs para criar as Subcategorias corretamente
    const catMap = (name: string) => createdMains.find(c => c.name === name)?.id;

    const subCategories = [
        // Subcategorias de Alimentação
        { profile_id: profileId, parent_id: catMap('Alimentação'), name: 'Supermercado', type: 'EXPENSE', icon: 'shopping_cart' },
        { profile_id: profileId, parent_id: catMap('Alimentação'), name: 'Restaurantes', type: 'EXPENSE', icon: 'local_dining' },

        // Subcategorias de Transporte
        { profile_id: profileId, parent_id: catMap('Transporte'), name: 'Transporte Público', type: 'EXPENSE', icon: 'directions_bus' },
        { profile_id: profileId, parent_id: catMap('Transporte'), name: 'Combustível/Privado', type: 'EXPENSE', icon: 'local_gas_station' },

        // Subcategorias de Rendimentos
        { profile_id: profileId, parent_id: catMap('Rendimentos'), name: 'Salário', type: 'INCOME', icon: 'work' },
        { profile_id: profileId, parent_id: catMap('Rendimentos'), name: 'Freelance', type: 'INCOME', icon: 'laptop_mac' }
    ];

    const { error: subError } = await supabase
        .from('categories')
        .insert(subCategories);

    if (subError) console.error('Failed to create default subcategories:', subError);
};

export const createProfile = async (data: CreateProfileDTO): Promise<ProfileResponse> => {
    const { data: profile, error } = await supabase
        .from('profiles')
        .insert([data])
        .select()
        .single();

    if (error) throw new Error(`Error creating profile: ${error.message}`);
    return profile as ProfileResponse;
};

export const readProfiles = async (user_id: string): Promise<ProfileResponse[]> => {
    // Busca os perfis existentes e ativos do utilizador.
    const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user_id)
        .is('deleted_at', null);

    if (fetchError) {
        throw new Error(`Error fetching profiles: ${fetchError.message}`);
    }

    // Se já existem perfis, devolve-os.
    if (profiles && profiles.length > 0) {
        return profiles;
    }

    // Se não existem perfis, cria um perfil padrão para o novo utilizador.
    console.log(`[ProfileService] No profiles found for user_id ${user_id}. Creating default profile and categories.`);

    const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{
            user_id: user_id,
            name: 'My Profile'
        }])
        .select()
        .single();

    if (createError) {
        throw new Error(`Error creating default profile: ${createError.message}`);
    }

    try {
        await createDefaultCategories(newProfile.id);
    } catch (catError) {
        console.error(`[ProfileService] Warning: Failed to create default categories for new profile (${newProfile.id}):`, catError);
        // Não lança o erro aqui para não impedir o login. O utilizador já tem perfil.
    }

    // Mantém o contrato de retorno em lista.
    return [newProfile];
};

export const updateProfile = async (id: string, updates: Partial<CreateProfileDTO>): Promise<ProfileResponse> => {
    const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: getNowIso() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(`Error updating profile: ${error.message}`);
    return data as ProfileResponse;
};

export const deleteProfile = async (id: string): Promise<{ success: boolean }> => {
    const { error } = await supabase
        .from('profiles')
        .update({ deleted_at: getNowIso() })
        .eq('id', id);

    if (error) throw new Error(`Error deleting profile: ${error.message}`);
    return { success: true };
};
