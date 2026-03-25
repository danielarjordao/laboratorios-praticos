import { supabase } from '../config/supabase.js';

export interface CreateGoalDTO {
    profile_id: string;
    title: string;
    target_amount: number;
    deadline?: string;
}

// POST: Cria um novo objetivo para um perfil específico
export const createGoal = async (data: CreateGoalDTO): Promise<{
	id: string;
	profile_id: string;
	title: string;
	target_amount: number;
	deadline: string | null;
	created_at: string;
	updated_at: string;
}> => {
	const { data: goal, error } = await supabase
        .from('goals')
        .insert([data])
        .select()
        .single();

    if (error) throw new Error(`Error creating goal: ${error.message}`);
    return goal;
};

// GET: Recupera todos os objetivos de um perfil específico, ordenados por deadline
export const getGoalsByProfile = async (profileId: string): Promise<Array<{
	id: string;
	profile_id: string;
	title: string;
	target_amount: number;
	deadline: string | null;
	created_at: string;
	updated_at: string;
}>> => {
    const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('profile_id', profileId)
        .is('deleted_at', null)
        .order('deadline', { ascending: true });

    if (error) throw new Error(`Error fetching goals: ${error.message}`);
    return data;
};

// PATCH: Atualiza um objetivo existente, permitindo alterações parciais
export const updateGoal = async (id: string, updates: Partial<CreateGoalDTO>): Promise<{
	id: string;
	profile_id: string;
	title: string;
	target_amount: number;
	deadline: string | null;
	created_at: string;
	updated_at: string;
}> => {
    const { data, error } = await supabase
        .from('goals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(`Error updating goal: ${error.message}`);
    return data;
};

// DELETE: Marca um objetivo como deletado, definindo a coluna deleted_at com a data atual
export const deleteGoal = async (id: string): Promise<{ success: boolean }> => {
    const { error } = await supabase
        .from('goals')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error(`Error deleting goal: ${error.message}`);
    return { success: true };
};
