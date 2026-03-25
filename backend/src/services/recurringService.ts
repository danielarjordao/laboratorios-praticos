import { supabase } from '../config/supabase.js';

export interface CreateRecurringDTO {
    profile_id: string;
    account_id: string;
    category_id?: string;
    type: string;
    amount: number;
    frequency: string;
    interval_value?: number;
    start_date: string;
    next_run_date: string;
    end_date?: string;
    description?: string;
}

export interface RecurringResponse extends CreateRecurringDTO {
    id: string;
    created_at: string;
    updated_at: string;
}

export const createRecurring = async (data: CreateRecurringDTO): Promise<RecurringResponse> => {
    const { data: recurring, error } = await supabase
        .from('recurring_transactions')
        .insert([data])
        .select()
        .single();

    if (error) throw new Error(`Error creating recurring transaction: ${error.message}`);
    return recurring as RecurringResponse;
};

export const getRecurringByProfile = async (profileId: string): Promise<RecurringResponse[]> => {
    const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('profile_id', profileId)
        .is('deleted_at', null)
        .order('next_run_date', { ascending: true });

    if (error) throw new Error(`Error fetching recurring transactions: ${error.message}`);
    return data as RecurringResponse[];
};

export const updateRecurring = async (id: string, updates: Partial<CreateRecurringDTO>): Promise<RecurringResponse> => {
    const { data, error } = await supabase
        .from('recurring_transactions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(`Error updating recurring transaction: ${error.message}`);
    return data as RecurringResponse;
};

export const deleteRecurring = async (id: string): Promise<{ success: boolean }> => {
    const { error } = await supabase
        .from('recurring_transactions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error) throw new Error(`Error deleting recurring transaction: ${error.message}`);
    return { success: true };
};
