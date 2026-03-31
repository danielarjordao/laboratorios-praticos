export interface CreateRecurringDTO {
    profile_id: string;
    account_id: string;
    category_id?: string;
    type: string;
    amount: number;
    frequency: string;
    interval_value?: number;
    start_date: string;
    next_run_date: string;
    end_date?: string;
    description?: string;
}

export interface RecurringResponse extends CreateRecurringDTO {
    id: string;
    created_at: string;
    updated_at: string;
}
