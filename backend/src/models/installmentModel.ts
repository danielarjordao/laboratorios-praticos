export interface CreateInstallmentDTO {
    profile_id: string;
    account_id: string;
    category_id: string;
    total_amount: number;
    installments: number;
    start_date: string;
    description: string;
}

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
