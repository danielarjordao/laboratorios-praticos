export interface CreateBudgetDTO {
    profile_id: string;
    category_id: string;
    limit_amount: number;
    month_date: string;
}

export interface BudgetResponse {
    id: string;
    profile_id: string;
    category_id: string;
    limit_amount: number;
    month_date: string;
    created_at: string;
    updated_at: string;
}
