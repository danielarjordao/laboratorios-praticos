import { supabase } from '../config/supabase.js';
import * as tagService from './tagService.js';
import { updateAccountBalance } from './accountService.js';
import { getNowIso } from '../utils/dateHelpers.js';
import type {
    CreateTransactionDTO,
    TransactionFilters,
    TransactionResponse,
    TransactionWithDetails,
    UpdateTransactionDTO
} from '../models/transactionModel.js';

// FUNÇÕES AUXILIARES

const validateTransactionLogic = (data: Partial<CreateTransactionDTO>, type: string): void => {
    if (type === 'TRANSFER') {
        if (!data.transfer_account_id || data.account_id === data.transfer_account_id) {
            throw new Error('Transfers require a valid destination account different from the origin account.');
        }
        if (data.category_id) {
            throw new Error('Transfers should not have a category.');
        }
    } else if (type === 'EXPENSE' || type === 'INCOME') {
        if (data.transfer_account_id) {
            throw new Error('Incomes and Expenses should not have a transfer account.');
        }
        if (!data.category_id) {
            throw new Error('Incomes and Expenses require a category.');
        }
    } else {
        throw new Error('Invalid transaction type. Must be INCOME, EXPENSE, or TRANSFER.');
    }
};

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

// Busca IDs de transações que tenham tags com nome correspondente ao termo pesquisado.
const searchTransactionIdsByTagName = async (search: string): Promise<string[]> => {
    const { data: matchedTags } = await supabase
        .from('tags')
        .select('id')
        .ilike('name', `%${search}%`);

    if (!matchedTags || matchedTags.length === 0) {
        return [];
    }

    const tagIds = matchedTags.map((tag) => tag.id);
    const { data: matchedTxTags } = await supabase
        .from('transaction_tags')
        .select('transaction_id')
        .in('tag_id', tagIds);

    return matchedTxTags?.map((item) => item.transaction_id) || [];
};

// Atualiza as associações de tags de uma transação.
const syncTransactionTags = async (transactionId: string, tags: string[]): Promise<void> => {
    const { error: deleteTagsError } = await supabase
        .from('transaction_tags')
        .delete()
        .eq('transaction_id', transactionId);

    if (deleteTagsError) {
        console.error('Warning: Failed to clear old tags');
    }

    if (tags.length === 0) {
        return;
    }

    const tagInserts = tags.map((tagId: string) => ({
        transaction_id: transactionId,
        tag_id: tagId
    }));

    const { error: insertTagsError } = await supabase
        .from('transaction_tags')
        .insert(tagInserts);

    if (insertTagsError) {
        throw new Error(`Failed to update tags: ${insertTagsError.message}`);
    }
};

// SERVIÇOS PRINCIPAIS (CRUD)

export const createTransaction = async (data: CreateTransactionDTO): Promise<TransactionResponse> => {
    const type = data.type?.toUpperCase() || '';
    const amount = Math.abs(Number(data.amount));

    validateTransactionLogic(data, type);

    const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .insert([{
            account_id: data.account_id,
            transfer_account_id: data.transfer_account_id || null,
            category_id: data.category_id || null,
            type: type,
            amount: amount,
            date: data.date,
            effective_date: data.date,
            description: data.description || null,
            status: data.status || 'COMPLETED'
        }])
        .select()
        .single();

    if (txError) throw new Error(`Failed to create transaction: ${txError.message}`);

    if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
        await tagService.linkTagsToTransaction(transaction.id, data.tags);
    }

    await applyTransactionBalance(transaction as TransactionResponse);

    return transaction as TransactionResponse;
};

export const readTransactions = async (profile_id: string, filters?: TransactionFilters): Promise<{ data: TransactionWithDetails[]; totalCount: number }> => {

    const { data: accounts, error: accError } = await supabase
        .from('accounts')
        .select('id')
        .eq('profile_id', profile_id);

    if (accError) throw new Error(`Failed to fetch accounts for profile: ${accError.message}`);

    const accountIds = accounts?.map(acc => acc.id) || [];

    if (accountIds.length === 0) return { data: [], totalCount: 0 };

    const tagQuery = filters?.tagId
        ? 'transaction_tags!inner( tags(id, name) )'
        : 'transaction_tags( tags(id, name) )';

    let query = supabase
        .from('transactions')
        .select(`
            *,
            categories (name, icon, color),
            origin_account:account_id (name),
            destination_account:transfer_account_id (name),
            ${tagQuery}
        `, { count: 'exact' })
        .in('account_id', accountIds)
        .is('deleted_at', null);

    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.accountId) query = query.eq('account_id', filters.accountId);
    if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);

    // --- 1. CORREÇÃO DA PESQUISA (Descrição + Tags) ---
    if (filters?.search) {
        const txIdsToInclude = await searchTransactionIdsByTagName(filters.search);

        // Aplica o filtro OR: (Descrição corresponde OU a transação tem a Tag)
        if (txIdsToInclude.length > 0) {
            query = query.or(`description.ilike.%${filters.search}%,id.in.(${txIdsToInclude.join(',')})`);
        } else {
            // Se a palavra não é uma Tag, pesquisa apenas na descrição
            query = query.ilike('description', `%${filters.search}%`);
        }
    }

    if (filters?.tagId) {
        query = query.eq('transaction_tags.tag_id', filters.tagId);
    }

    if ((filters?.month && !filters?.year) || (!filters?.month && filters?.year)) {
        throw new Error('Both month and year filters must be provided together.');
    }

    if (filters?.month && filters?.year) {
        const month = Number(filters.month);
        const year = Number(filters.year);

        if (!Number.isInteger(month) || month < 1 || month > 12) {
            throw new Error('Invalid month filter. Expected a value between 1 and 12.');
        }

        if (!Number.isInteger(year) || year < 1970 || year > 9999) {
            throw new Error('Invalid year filter.');
        }

        // Garante que o mês tem sempre 2 dígitos (ex: "04" em vez de "4")
        const monthStr = String(month).padStart(2, '0');

        // Descobre qual é o último dia do mês corrente
        const lastDay = new Date(year, month, 0).getDate();

        // Monta as strings blindadas contra fusos horários
        const startDate = `${year}-${monthStr}-01`;
        const endDate = `${year}-${monthStr}-${lastDay}`;

        // Supabase compara as datas perfeitamente
        query = query.gte('date', startDate).lte('date', endDate);
    }

    const sortBy = filters?.sortBy || 'date';
    const sortOrder = filters?.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error: txError, count } = await query;
    if (txError) throw new Error(`Failed to fetch transactions: ${txError.message}`);

    return {
        data: data as TransactionWithDetails[],
        totalCount: count || 0
    };
};

// Obtém uma transação específica pelo ID com todos os detalhes
export const readTransactionById = async (id: string): Promise<TransactionWithDetails> => {
    const { data, error } = await supabase
        .from('transactions')
        .select(`
            *,
            categories (name, icon, color),
            origin_account:account_id (name),
            destination_account:transfer_account_id (name),
            transaction_tags( tags(id, name) )
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single(); // .single() garante que devolve um objeto e não um array

    if (error || !data) {
        throw new Error(`Transaction not found: ${error?.message || ''}`);
    }

    return data as TransactionWithDetails;
};

export const updateTransaction = async (id: string, newData: UpdateTransactionDTO): Promise<TransactionResponse> => {

    // 1. Separar as tags dos dados da tabela 'transactions'
    const { tags, ...transactionFields } = newData;

    // 2. Buscar a transação antiga para reverter o saldo
    const { data: oldTx, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError || !oldTx) throw new Error('Transaction not found.');

    // 3. Validar a lógica com os dados mesclados (usando apenas campos da tabela)
    const mergedData = { ...oldTx, ...transactionFields };
    validateTransactionLogic(mergedData, mergedData.type);

    // 4. Reverter o impacto financeiro antigo
    await revertTransactionBalance(oldTx as TransactionResponse);
    let hasAppliedUpdatedBalance = false;

    try {
        // 5. UPDATE: Enviamos APENAS o 'transactionFields' (sem as tags)
        const { data: updatedTx, error: updateError } = await supabase
            .from('transactions')
            .update({ ...transactionFields, updated_at: getNowIso() })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw new Error(`Failed to update transaction: ${updateError.message}`);

        // 6. Aplicar o novo impacto financeiro
        await applyTransactionBalance(updatedTx as TransactionResponse);
        hasAppliedUpdatedBalance = true;

        // 7. Lógica de Tags
        if (tags && Array.isArray(tags)) {
            await syncTransactionTags(id, tags);
        }

        return updatedTx as TransactionResponse;
    } catch (error: unknown) {
        // Se o saldo novo não chegou a ser aplicado, restaura o saldo antigo.
        if (!hasAppliedUpdatedBalance) {
            await applyTransactionBalance(oldTx as TransactionResponse);
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error('Failed to update transaction.', { cause: error });
    }
};

export const deleteTransaction = async (id: string): Promise<void> => {

    const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

    if (fetchError || !transaction) throw new Error('Transaction not found or already deleted.');

    const deletedAt = getNowIso();
    const { error: deleteError } = await supabase
        .from('transactions')
        .update({
            deleted_at: deletedAt,
            status: 'CANCELLED'
        })
        .eq('id', id);

    if (deleteError) throw new Error(`Failed to delete transaction: ${deleteError.message}`);

    try {
        await revertTransactionBalance(transaction as TransactionResponse);
    } catch (error: unknown) {
        const { error: rollbackError } = await supabase
            .from('transactions')
            .update({
                deleted_at: null,
                status: transaction.status,
                updated_at: getNowIso()
            })
            .eq('id', id);

        if (rollbackError) {
            throw new Error(`Failed to revert balance and rollback soft delete: ${rollbackError.message}`, { cause: error });
        }

        throw new Error('Failed to revert transaction balance after soft delete. Soft delete rollback applied.', { cause: error });
    }
};
