export interface Category {
  id: string;
  profile_id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  color?: string;
  created_at?: string;
}

export interface CategoryListResponse {
  status: string;
  data: Category[];
}

export interface CategoryResponse {
  status: string;
  data: Category;
}

export interface CategoryDeleteResponse {
  status: string;
  message: string;
}
