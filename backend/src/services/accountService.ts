import { supabase } from '../config/supabase.js';

// Interface para os dados de entrada
export interface CreateAccountDTO {
    profile_id: string;
    name: string;
    type?: 'CHECKING' | 'SAVINGS' | 'CREDIT' | 'CASH';
    initial_balance?: number;
    balance?: number;
    is_main_featured?: boolean;
}

// Interface para a resposta da base de dados
export interface AccountResponse extends CreateAccountDTO {
    id: string;
    created_at: string;
    updated_at: string;
}

// Cria uma nova conta bancária no sistema.
export const createAccount = async (accountData: CreateAccountDTO): Promise<AccountResponse> => {
    const { data, error } = await supabase
        .from('accounts')
        .insert([{
            ...accountData,
            type: accountData.type || 'CHECKING',
            balance: accountData.balance ?? accountData.initial_balance ?? 0
        }])
        .select()
        .single();

    if (error)
        throw new Error(`Database error: ${error.message}`);

    return data as AccountResponse;
};

// Função para listar todas as contas de um perfil.
export const readAccounts = async (profile_id: string): Promise<AccountResponse[]> => {
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

// Função para atualizar os detalhes de uma conta existente.
export const updateAccount = async (id: string, data: Partial<CreateAccountDTO>): Promise<AccountResponse> => {
    const { data: account, error } = await supabase
        .from('accounts')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error)
        throw new Error(error.message);

    return account as AccountResponse;
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

// Atualiza o saldo de uma conta de forma matemática.
export const updateAccountBalance = async (accountId: string, amount: number, operation: 'CREDIT' | 'DEBIT'): Promise<void> => {
    // Busca o saldo atual
    const { data: account, error: accError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', accountId)
        .single();

    if (accError) throw new Error(`Failed to fetch account balance: ${accError.message}`);

    let newBalance = Number(account.balance);

    // Calcula o novo saldo (Soma se for CREDIT, subtrai se for DEBIT)
    if (operation === 'CREDIT') {
        newBalance += amount;
    } else {
        newBalance -= amount;
    }

    // Grava o novo valor na base de dados
    const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', accountId);

    if (updateError)
        throw new Error(`Failed to update account balance: ${updateError.message}`);
};
