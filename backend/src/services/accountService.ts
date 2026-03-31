import { supabase } from '../config/supabase.js';
import type { AccountResponse, CreateAccountDTO } from '../models/accountModel.js';
import { getNowIso } from '../utils/dateHelpers.js';

// Normaliza os dados de criação de conta com valores padrão.
const buildCreateAccountPayload = (accountData: CreateAccountDTO) => ({
    ...accountData,
    type: accountData.type || 'CHECKING',
    balance: accountData.balance ?? accountData.initial_balance ?? 0
});

// Calcula o próximo saldo com base na operação financeira.
const calculateNextBalance = (currentBalance: number, amount: number, operation: 'CREDIT' | 'DEBIT'): number => {
    return operation === 'CREDIT' ? currentBalance + amount : currentBalance - amount;
};

// Cria uma nova conta bancária no sistema.
export const createAccount = async (accountData: CreateAccountDTO): Promise<AccountResponse> => {
    const { data, error } = await supabase
        .from('accounts')
        .insert([buildCreateAccountPayload(accountData)])
        .select()
        .single();

    if (error) {
        throw new Error(`Error creating account: ${error.message}`);
    }

    return data as AccountResponse;
};

// Lista todas as contas de um perfil.
export const readAccounts = async (profile_id: string): Promise<AccountResponse[]> => {
    const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('profile_id', profile_id)
        .is('deleted_at', null);

    if (error) {
        throw new Error(`Error fetching accounts: ${error.message}`);
    }

    return data as AccountResponse[];
};

// Atualiza os dados de uma conta existente.
export const updateAccount = async (id: string, data: Partial<CreateAccountDTO>): Promise<AccountResponse> => {
    const { data: account, error } = await supabase
        .from('accounts')
        .update({ ...data, updated_at: getNowIso() })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Error updating account: ${error.message}`);
    }

    return account as AccountResponse;
};

// Remove uma conta de forma lógica (soft delete).
export const deleteAccount = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('accounts')
        .update({ deleted_at: getNowIso() })
        .eq('id', id);

    if (error) {
        throw new Error(`Error deleting account: ${error.message}`);
    }
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

    const newBalance = calculateNextBalance(Number(account.balance), amount, operation);

    // Grava o novo valor na base de dados
    const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', accountId);

    if (updateError) {
        throw new Error(`Failed to update account balance: ${updateError.message}`);
    }
};
