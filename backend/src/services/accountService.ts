import { supabase } from '../config/supabase.js';

// Interface para os dados de entrada
export interface AccountInput {
    profile_id: string;
    name: string;
    type?: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'CASH';
    initial_balance?: number;
    balance?: number;
}

// Interface para a resposta da base de dados
export interface AccountResponse extends AccountInput {
    id: string;
    created_at: string;
    updated_at: string;
}

// Cria uma nova conta bancária no sistema.
export const createAccount = async (accountData: AccountInput): Promise<AccountResponse> => {
    const { profile_id, name, type, initial_balance, balance } = accountData;

    const { data, error } = await supabase
        .from('accounts')
        .insert([{
            profile_id,
            name,
            type: type || 'CHECKING',
            initial_balance: initial_balance || 0,
            // O balance atual começa igual ao initial_balance se não for enviado
            balance: balance !== undefined ? balance : (initial_balance || 0)
        }])
        .select()
        // Retorna o objeto diretamente em vez de um array
        .single();

    if (error) {
        throw new Error(`Database error: ${error.message}`);
    }

    return data as AccountResponse;
};

// Função para listar todas as contas de um perfil.
export const getAccounts = async (profile_id: string): Promise<AccountResponse[]> => {
    const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('profile_id', profile_id)
        .is('deleted_at', null);

    if (error) {
        throw new Error(`Database error: ${error.message}`);
    }

    return data as AccountResponse[];
};

// Função para deletar uma conta (soft delete).
export const deleteAccount = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('accounts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

    if (error)
        throw new Error(`Error deleting account: ${error.message}`);
};
