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

export interface TransactionFilters {
    month?: number;
    year?: number;
    type?: string;
    categoryId?: string;
    search?: string;
    tagId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface TransactionWithDetails extends TransactionResponse {
    categories: { name: string; icon: string; color?: string; } | null;
    origin_account: { name: string; } | null;
    destination_account: { name: string; } | null;
}

export interface UpdateTransactionDTO extends Partial<CreateTransactionDTO> {
    tags?: string[];
}
