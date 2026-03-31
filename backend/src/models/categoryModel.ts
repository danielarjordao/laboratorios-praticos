export interface CreateCategoryDTO {
    name: string;
    icon?: string;
    color?: string;
    profile_id: string;
    type: 'INCOME' | 'EXPENSE';
    parent_id?: string;
}

export interface CategoryResponse extends CreateCategoryDTO {
    id: string;
    created_at: string;
    updated_at: string;
}
