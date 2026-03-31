import { supabase } from '../config/supabase.js';
import * as tagService from './tagService.js';
import { updateAccountBalance } from './accountService.js';
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
    if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);
    if (filters?.search) query = query.ilike('description', `%${filters.search}%`);

    if (filters?.tagId) {
        query = query.eq('transaction_tags.tag_id', filters.tagId);
    }

    // ... código anterior (query base) ...

    if (filters?.type) query = query.eq('type', filters.type);
    if (filters?.categoryId) query = query.eq('category_id', filters.categoryId);

    // --- 1. CORREÇÃO DA PESQUISA (Descrição + Tags) ---
    if (filters?.search) {
        // Pré-pesquisa: Verifica se a palavra digitada corresponde a alguma Tag
        const { data: matchedTags } = await supabase
            .from('tags')
            .select('id')
            .ilike('name', `%${filters.search}%`);

        let txIdsToInclude: string[] = [];

        // Se encontrou Tags, vai buscar as transações que têm essas Tags
        if (matchedTags && matchedTags.length > 0) {
            const tagIds = matchedTags.map(t => t.id);
            const { data: matchedTxTags } = await supabase
                .from('transaction_tags')
                .select('transaction_id')
                .in('tag_id', tagIds);

            txIdsToInclude = matchedTxTags?.map(t => t.transaction_id) || [];
        }

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

    if (filters?.month && filters?.year) {
        // Garante que o mês tem sempre 2 dígitos (ex: "04" em vez de "4")
        const monthStr = String(filters.month).padStart(2, '0');

        // Descobre qual é o último dia do mês corrente
        const lastDay = new Date(filters.year, filters.month, 0).getDate();

        // Monta as strings blindadas contra fusos horários
        const startDate = `${filters.year}-${monthStr}-01`;
        const endDate = `${filters.year}-${monthStr}-${lastDay}`;

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

    // 5. UPDATE: Enviamos APENAS o 'transactionFields' (sem as tags)
    const { data: updatedTx, error: updateError } = await supabase
        .from('transactions')
        .update(transactionFields)
        .eq('id', id)
        .select()
        .single();

    if (updateError) throw new Error(`Failed to update transaction: ${updateError.message}`);

    // 6. Aplicar o novo impacto financeiro
    await applyTransactionBalance(updatedTx as TransactionResponse);

    // 7. Lógica de Tags (O teu TODO)
    if (tags && Array.isArray(tags)) {
        // Remove todas as associações antigas desta transação
        const { error: deleteTagsError } = await supabase
            .from('transaction_tags')
            .delete()
            .eq('transaction_id', id);

        if (deleteTagsError) console.error('Warning: Failed to clear old tags');

        // Se houver novas tags, insere as novas associações
        if (tags.length > 0) {
            const tagInserts = tags.map((tagId: string) => ({
                transaction_id: id,
                tag_id: tagId
            }));

            const { error: insertTagsError } = await supabase
                .from('transaction_tags')
                .insert(tagInserts);

            if (insertTagsError) throw new Error(`Failed to update tags: ${insertTagsError.message}`);
        }
    }

    return updatedTx as TransactionResponse;
};

export const deleteTransaction = async (id: string): Promise<void> => {

    const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

    if (fetchError || !transaction) throw new Error('Transaction not found or already deleted.');

    await revertTransactionBalance(transaction as TransactionResponse);

    const { error: deleteError } = await supabase
        .from('transactions')
        .update({
            deleted_at: new Date().toISOString(),
            status: 'CANCELLED'
        })
        .eq('id', id);

    if (deleteError) throw new Error(`Failed to delete transaction: ${deleteError.message}`);
};
