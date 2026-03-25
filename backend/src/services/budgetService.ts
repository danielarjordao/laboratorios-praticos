import { supabase } from '../config/supabase.js';

export interface CreateBudgetDTO {
    profile_id: string;
    category_id: string;
    limit_amount: number;
    month_date: string;
}

export interface BudgetResponse {
    id: string;
    profile_id: string;
    category_id: string;
    limit_amount: number;
    month_date: string;
    created_at: string;
    updated_at: string;
}

export const createBudget = async (data: CreateBudgetDTO): Promise<BudgetResponse> => {
    const { data: existingBudget, error: checkError } = await supabase
        .from('budgets')
        .select('id')
        .eq('profile_id', data.profile_id)
        .eq('category_id', data.category_id)
        .eq('month_date', data.month_date)
        .is('deleted_at', null)
        .maybeSingle();

    if (checkError) throw new Error(`Check error: ${checkError.message}`);

    if (existingBudget) {
        throw new Error('A budget already exists for this category in the selected month.');
    }

    const { data: budget, error } = await supabase
        .from('budgets')
        .insert([data])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return budget as BudgetResponse;
};

export const readBudgetsByMonth = async (profileId: string, monthDate: string): Promise<Array<BudgetResponse & { categories: { name: string } }>> => {
    // monthDate deve ser o primeiro dia do mês no formato 'YYYY-MM-DD'
    const { data: budgets, error } = await supabase
        .from('budgets')
        .select('*, categories(name)')
        .eq('profile_id', profileId)
        .eq('month_date', monthDate)
        .is('deleted_at', null);

    if (error) throw new Error(`Error fetching budgets: ${error.message}`);
    return budgets;
};

// PATCH: Atualizar o valor do limite
export const updateBudget = async (id: string, limitAmount: number): Promise<BudgetResponse> => {
    const { data, error } = await supabase
        .from('budgets')
        .update({
            limit_amount: limitAmount,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(`Error updating budget: ${error.message}`);
    return data;
};

// DELETE: Soft delete do orçamento
export const deleteBudget = async (id: string): Promise<{ success: boolean }> => {
    const { error } = await supabase
        .from('budgets')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error(`Error deleting budget: ${error.message}`);
    return { success: true };
};
