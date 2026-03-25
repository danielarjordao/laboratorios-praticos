import { supabase } from '../config/supabase.js';
import * as tagService from './tagService.js';
import { updateAccountBalance } from './accountService.js';

// --- INTERFACES ---
export interface CreateTransactionDTO {
    account_id: string;
    category_id?: string | null;
    transfer_account_id?: string | null;
    type: string;
    amount: number;
    date: string;
    description?: string;
    status?: string;
    tags?: string[];
}

export interface TransactionResponse {
    id: string;
    account_id: string;
    transfer_account_id: string | null;
    category_id: string | null;
    type: string;
    amount: number;
    date: string;
    effective_date: string;
    description: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface TransactionWithDetails extends TransactionResponse {
    categories: {
        name: string;
        icon: string;
    } | null;
    origin_account: {
        name: string;
    } | null;
    destination_account: {
        name: string;
    } | null;
}

// --- FUNÇÕES AUXILIARES (SINGLE RESPONSIBILITY) ---

// Valida as regras de negócio antes de interagir com a base de dados.
const validateTransactionLogic = (data: CreateTransactionDTO, type: string): void => {
    if (type === 'TRANSFER') {
        if (!data.transfer_account_id || data.account_id === data.transfer_account_id) {
            throw new Error('Transfers require a destination account different from the origin.');
        }
        if (data.category_id) {
            throw new Error('Transfers should not have an associated category.');
        }
    } else if (type === 'EXPENSE' || type === 'INCOME') {
        if (data.transfer_account_id) {
            throw new Error('Income and Expenses cannot have a destination account.');
        }
        if (!data.category_id) {
            throw new Error('Income and Expenses require a category.');
        }
    } else {
         throw new Error('Invalid transaction type. Allowed types: INCOME, EXPENSE, TRANSFER.');
    }
};

// Auxiliar: Reverte o impacto de uma transação no saldo
const revertTransactionBalance = async (transaction: TransactionResponse): Promise<void> => {
    const amount = Number(transaction.amount);
    if (transaction.type === 'EXPENSE') {
        await updateAccountBalance(transaction.account_id, amount, 'CREDIT');
    } else if (transaction.type === 'INCOME') {
        await updateAccountBalance(transaction.account_id, amount, 'DEBIT');
    } else if (transaction.type === 'TRANSFER') {
        await updateAccountBalance(transaction.account_id, amount, 'CREDIT');
        if (transaction.transfer_account_id) {
            await updateAccountBalance(transaction.transfer_account_id, amount, 'DEBIT');
        }
    }
};

// Auxiliar: Aplica o impacto de uma transação no saldo
const applyTransactionBalance = async (transaction: TransactionResponse): Promise<void> => {
    const amount = Number(transaction.amount);
    if (transaction.type === 'EXPENSE') {
        await updateAccountBalance(transaction.account_id, amount, 'DEBIT');
    } else if (transaction.type === 'INCOME') {
        await updateAccountBalance(transaction.account_id, amount, 'CREDIT');
    } else if (transaction.type === 'TRANSFER') {
        await updateAccountBalance(transaction.account_id, amount, 'DEBIT');
        if (transaction.transfer_account_id) {
            await updateAccountBalance(transaction.transfer_account_id, amount, 'CREDIT');
        }
    }
};

// Post condição: A função createTransaction deve ser responsável por criar uma nova transação,
// validar as regras de negócio, atualizar os saldos das contas envolvidas e retornar os dados da transação criada.
export const createTransaction = async (data: CreateTransactionDTO): Promise<TransactionResponse> => {
    // Normaliza e valida os dados de entrada
    const type = data.type?.toUpperCase() || '';
    const amount = Math.abs(Number(data.amount));
    const date = data.date;
    const effective_date = data.date;

    // Valida as regras de negócio antes de interagir com a base de dados
    validateTransactionLogic(data, type);

    // Insere a transação na base de dados
    const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert([{
            account_id: data.account_id,
            transfer_account_id: data.transfer_account_id || null,
            category_id: data.category_id || null,
            type: type,
            amount: amount,
            date: date,
            effective_date: effective_date,
            description: data.description || null,
            status: data.status || 'COMPLETED'
        }])
        .select()
        .single();

    // Trata erros de banco de dados
    if (txError) {
        throw new Error(`Database error during transaction creation: ${txError.message}`);
    }

    // Linka as tags à transação, se existirem
    if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
        await tagService.linkTagsToTransaction(transaction.id, data.tags);
    }

    // Atualiza o saldo da conta de origem (e destino, se for transferência)
    const originOperation = type === 'INCOME' ? 'CREDIT' : 'DEBIT';
    await updateAccountBalance(data.account_id, amount, originOperation);

    // Aplica o impacto na conta de destino, se for transferência
    if (type === 'TRANSFER' && data.transfer_account_id) {
        // Para a conta de destino, a operação é sempre o inverso da origem
        await updateAccountBalance(data.transfer_account_id, amount, 'CREDIT');
    }

    return transaction as TransactionResponse;
};

// Get condição: A função readTransactions deve ser responsável por retornar as transações de um perfil específico,
// incluindo os nomes das categorias e contas associadas.
export const readTransactions = async (profile_id: string): Promise<TransactionWithDetails[]> => {
    // Busca as contas do perfil
    const { data: accounts, error: accError } = await supabase
        .from('accounts')
        .select('id')
        .eq('profile_id', profile_id);

    if (accError)
        throw new Error(`Error fetching profile accounts: ${accError.message}`);

    // Extrai os IDs das contas para usar na consulta das transações
    const accountIds = accounts.map(acc => acc.id);

    // Busca as transações
    const { data, error } = await supabase
        .from('transactions')
        .select(`
            *,
            categories (name, icon),
            origin_account:account_id (name),
            destination_account:transfer_account_id (name),
            tags:transaction_tags( tag_id )
        `)
        .in('account_id', accountIds)
        .is('deleted_at', null)
        .order('date', { ascending: false });

    if (error)
        throw new Error(`Error fetching transactions: ${error.message}`);

    // Faz o cast para a interface estendida
    return data as TransactionWithDetails[];
};

// Atualiza os detalhes de uma transação existente, garantindo que as regras de negócio sejam respeitadas e que os saldos das contas sejam ajustados corretamente.
export const updateTransaction = async (id: string, newData: Partial<CreateTransactionDTO>): Promise<TransactionResponse> => {
    // Busca o estado atual
    const { data: oldTx, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError || !oldTx)
        throw new Error('Transaction not found');

    // Valida as regras de negócio com os dados novos
    // Faz uma mescla dos dados antigos com os novos para validar o estado resultante
    await revertTransactionBalance(oldTx as TransactionResponse);

    // Grava o novo estado na base de dados
    const { data: updatedTx, error: updateError } = await supabase
        .from('transactions')
        .update(newData)
        .eq('id', id)
        .select()
        .single();

    if (updateError)
        throw new Error(`Update failed: ${updateError.message}`);

    // Consolida o novo estado
    await applyTransactionBalance(updatedTx as TransactionResponse);

    return updatedTx as TransactionResponse;
};

// Delete condição: A função deleteTransaction deve ser responsável por realizar um soft delete de uma transação,
// revertendo os saldos das contas envolvidas e marcando a transação como "CANCELLED".
export const deleteTransaction = async (id: string): Promise<void> => {
    // Busca a transação para saber o que reverter
    const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        // Garante que não tenta deletar algo que já foi deletado (soft delete)
        .is('deleted_at', null)
        .single();

    if (fetchError || !transaction)
        throw new Error('Transaction not found or already deleted');

    // Reverte o Saldo das Contas Envolvidas
    const amount = Number(transaction.amount);
    if (transaction.type === 'EXPENSE') {
        await updateAccountBalance(transaction.account_id, amount, 'CREDIT');
    } else if (transaction.type === 'INCOME') {
        await updateAccountBalance(transaction.account_id, amount, 'DEBIT');
    } else if (transaction.type === 'TRANSFER') {
        await updateAccountBalance(transaction.account_id, amount, 'CREDIT');
        if (transaction.transfer_account_id) {
            await updateAccountBalance(transaction.transfer_account_id, amount, 'DEBIT');
        }
    }

    // Soft Delete
    const { error: deleteError } = await supabase
        .from('transactions')
        .update({
            deleted_at: new Date().toISOString(),
            status: 'CANCELLED'
        })
        .eq('id', id);

    if (deleteError)
        throw new Error(`Failed to soft delete: ${deleteError.message}`);
};
