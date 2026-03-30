export interface Category {
  id: string;
  profile_id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  color?: string;
  created_at?: string;
}
