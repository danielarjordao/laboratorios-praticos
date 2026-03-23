import { supabase } from '../config/supabase.js';

// A interface "TransactionInput" define a estrutura dos dados que a função "createTransactionRecord" espera receber.
// Ela é usada para garantir que os dados enviados pelo Controller estão completos e corretos antes de tentar gravá-los no banco de dados.
export interface TransactionInput {
    account_id: string;
    transfer_account_id?: string | null;
    category_id?: string | null;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    amount: number;
    date: string;
    effective_date?: string;
    description?: string;
    status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
}

// Recebe os dados já com a garantia de que respeitam a Interface "TransactionInput"
export const createTransactionRecord = async (transactionData: TransactionInput) => {
    // Desestruturação dos dados para facilitar a manipulação
    let {
        account_id, transfer_account_id, category_id, type,
        amount, date, effective_date, description, status
    } = transactionData;

    // Força o valor a ser sempre positivo (absoluto)
    const safeAmount = Math.abs(Number(amount));

    // Confirma que o tipo é válido e aplica regras de negócio específicas
    // Transfer: exige transfer_account_id e não pode ter category_id
    // Income/Expense: exige category_id e não pode ter transfer_account_id
    if (type === 'TRANSFER') {
        if (!transfer_account_id)
            throw new Error('Transferências exigem uma conta de destino.');
        if (account_id === transfer_account_id)
            throw new Error('A conta de origem e destino não podem ser a mesma.');
        // Transferências não afetam os gráficos de categorias
        category_id = null;
    } else if (type === 'INCOME' || type === 'EXPENSE') {
        if (!category_id) throw new Error('Receitas e Despesas exigem uma categoria.');
        // Transações que não são transferências não têm conta de destino
        transfer_account_id = null;
    } else {
        throw new Error('Tipo de transação inválido.');
    }

    // Comunicação com o Supabase
    const { data, error } = await supabase
        .from('transactions')
        .insert([{
            account_id,
            transfer_account_id,
            category_id,
            type,
            amount: safeAmount,
            date,
            // Se effective_date não for fornecida, utiliza a data da transação como fallback inteligente
            effective_date: effective_date || date,
            description,
            // Se o status não for fornecido, assume "COMPLETED" como padrão, pois a maioria das transações será concluída imediatamente
            status: status || 'COMPLETED'
        }])
        .select();

    if (error)
        throw error;

    // Retorna a transação recém-criada
    return data[0];
};
