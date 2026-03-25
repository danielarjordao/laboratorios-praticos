import { supabase } from '../config/supabase.js';

export interface MonthlySummaryResponse {
    total_income: number;
    total_expense: number;
    monthly_balance: number;
    period: {
        month: number;
        year: number;
    };
}

// Função para obter o resumo mensal de receitas, despesas e saldo para um perfil específico.
export const readMonthlySummary = async (
    profileId: string,
    month: number,
    year: number
): Promise<MonthlySummaryResponse> => {

    // Calcula o primeiro e o último dia do mês para filtrar as transações corretamente
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    // Consulta as transações do perfil dentro do período especificado, juntando com a tabela de contas para garantir que o filtro de profile_id seja aplicado corretamente
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
            amount,
            type,
            accounts:account_id!inner(profile_id)
        `)
        .eq('accounts.profile_id', profileId)
        .is('deleted_at', null)
        .gte('date', startDate)
        .lte('date', endDate);

    if (error) {
        throw new Error(`Error fetching monthly summary: ${error.message}`);
    }

    // Calcula o total de receitas, despesas e saldo mensal com base nas transações retornadas
    const initialSummary = { total_income: 0, total_expense: 0 };

    const summary = (transactions || []).reduce((acc, tx) => {
        const amount = Number(tx.amount) || 0;

        if (tx.type === 'INCOME') {
            acc.total_income += amount;
        } else if (tx.type === 'EXPENSE') {
            acc.total_expense += amount;
        }

        return acc;
    }, initialSummary);

    return {
        total_income: Number(summary.total_income.toFixed(2)),
        total_expense: Number(summary.total_expense.toFixed(2)),
        monthly_balance: Number((summary.total_income - summary.total_expense).toFixed(2)),
        period: { month, year }
    };
};
