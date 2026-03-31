import { supabase } from '../config/supabase.js';
import type { MonthlySummaryResponse } from '../models/dashboardModel.js';

// Obtém o resumo mensal de receitas, despesas e saldo de um perfil.
export const readMonthlySummary = async (
    profileId: string,
    month: number,
    year: number
): Promise<MonthlySummaryResponse> => {

    // Calcula o primeiro e o último dia do mês para filtrar as transações.
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    // Consulta as transações do período e aplica o filtro de profile_id via relação com contas.
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

    // Calcula total de receitas, despesas e saldo mensal com base nas transações retornadas.
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
