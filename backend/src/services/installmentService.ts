import { supabase } from '../config/supabase.js';

export interface CreateInstallmentDTO {
    profile_id: string;
    account_id: string;
    category_id: string;
    total_amount: number;
    installments: number;
    start_date: string;
    description: string;
}

// Interface para o que a base de dados devolve
export interface TransactionResponse {
    id: string;
    account_id: string;
    transfer_account_id: string | null;
    category_id: string;
    installment_plan_id: string | null;
    installment_number: number | null;
    type: string;
    amount: number;
    date: string;
    effective_date: string | null;
    description: string;
    status: string;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface InstallmentPlanResponse {
    id: string;
    profile_id: string;
    description: string;
    total_parts: number;
    created_at: string;
    updated_at: string;
    transactions?: TransactionResponse[];
}

// Função pura para gerar os payloads das transações com base nos dados de entrada e no ID do plano de parcelamento criado
const generateInstallmentPayloads = (data: CreateInstallmentDTO, planId: string) => {
    const installmentAmount = Number((data.total_amount / data.installments).toFixed(2));
    const transactionsToInsert = [];
    const baseDate = new Date(data.start_date);

    for (let i = 0; i < data.installments; i++) {
        const paymentDate = new Date(baseDate);
        paymentDate.setMonth(baseDate.getMonth() + i);

        // Ajusta o valor da última parcela para corrigir possíveis arredondamentos
        let finalAmount = installmentAmount;
        if (i === data.installments - 1) {
            const sumPrevious = installmentAmount * (data.installments - 1);
            finalAmount = Number((data.total_amount - sumPrevious).toFixed(2));
        }

        transactionsToInsert.push({
            account_id: data.account_id,
            category_id: data.category_id,
            installment_plan_id: planId,
            installment_number: i + 1,
            type: 'EXPENSE',
            amount: finalAmount,
            date: paymentDate.toISOString().split('T')[0],
            effective_date: paymentDate.toISOString().split('T')[0],
            description: `${data.description} (${i + 1}/${data.installments})`,
            status: i === 0 ? 'COMPLETED' : 'PENDING'
        });
    }

    return transactionsToInsert;
};

// Service principal para criar um plano de parcelamento e suas transações associadas
export const createInstallmentPlan = async (data: CreateInstallmentDTO): Promise<InstallmentPlanResponse> => {
    // Cria o plano de parcelamento
    const { data: plan, error: planError } = await supabase
        .from('installment_plans')
        .insert([{
            profile_id: data.profile_id,
            description: data.description,
            total_parts: data.installments
        }])
        .select()
        .single();

    if (planError) {
        throw new Error(`Error creating master plan: ${planError.message}`);
    }

    // Gera os payloads das transações com base no plano criado
    const transactionsToInsert = generateInstallmentPayloads(data, plan.id);

    // Insere as transações no banco de dados
    const { error: txError } = await supabase
        .from('transactions')
        .insert(transactionsToInsert);

    if (txError) {
        // Se ocorrer um erro ao inserir as transações, é importante limpar o plano de parcelamento criado para evitar dados órfãos
        await supabase.from('installment_plans').delete().eq('id', plan.id);
        throw new Error(`Error generating installment transactions: ${txError.message}`);
    }

    return plan;
};

// GET: Listar todos os planos de um perfil, incluindo as suas transações
export const readInstallmentPlans = async (profileId: string): Promise<InstallmentPlanResponse[]> => {
    const { data, error } = await supabase
        .from('installment_plans')
        // O Supabase faz o JOIN automático com a tabela transactions
        .select('*, transactions(*)')
        .eq('profile_id', profileId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Error fetching plans: ${error.message}`);
    return data;
};

// UPDATE: Atualizar apenas a descrição do plano mestre
export const updateInstallmentPlan = async (id: string, description: string): Promise<InstallmentPlanResponse> => {
    const { data, error } = await supabase
        .from('installment_plans')
        .update({
            description,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .is('deleted_at', null)
        .select()
        .single();

    if (error) throw new Error(`Error updating plan: ${error.message}`);
    return data;
};

// DELETE: Soft Delete do plano e das transações PENDENTES associadas
export const deleteInstallmentPlan = async (id: string): Promise<{ success: boolean }> => {
    const now = new Date().toISOString();

    // Cancela o plano
    const { error: planError } = await supabase
        .from('installment_plans')
        .update({ deleted_at: now })
        .eq('id', id);

    if (planError) throw new Error(`Error deleting plan: ${planError.message}`);

    // Cancela apenas as transações futuras (PENDING). As COMPLETED ficam intactas.
    const { error: txError } = await supabase
        .from('transactions')
        .update({ deleted_at: now })
        .eq('installment_plan_id', id)
        .eq('status', 'PENDING')
        .is('deleted_at', null);

    if (txError)
		throw new Error(`Error deleting pending transactions: ${txError.message}`);

    return { success: true };
};
