export interface Transaction {
  id: string;
  profile_id?: string;
  account_id: string;
  category_id?: string;
  transfer_account_id?: string | null;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  date: string;
  description?: string;
  status?: 'PENDING' | 'COMPLETED';
  created_at?: string;
  updated_at?: string;
  categories?: { name: string; icon: string };
  origin_account?: { name: string };
  destination_account?: { name: string } | null;
  tags?: string[];
}

export interface BackendResponseTransactions {
  status: string;
  results: number;
  totalRecords: number;
  data: Transaction[];
}

export interface TransactionFilters {
  month?: number;
  year?: number;
  type?: string;
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  tagId?: string;
}

export interface TransactionWithDetails {
  id: string;
  profile_id?: string;
  account_id: string;
  category_id?: string;
  transfer_account_id?: string | null;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  date: string;
  description?: string;
  status?: 'PENDING' | 'COMPLETED';
  created_at?: string;
  updated_at?: string;

  // Relacionamentos vindos do Supabase
  categories?: {
    name: string;
    icon: string;
    color?: string; // <- Adicionado para pintar o card
  };
  origin_account?: { name: string };
  destination_account?: { name: string } | null;

  // Como o Supabase devolve o join da tabela transaction_tags
  transaction_tags?: {
    tags: {
      id: string;
      name: string;
    }
  }[];
}
