export interface Transaction {
  id: string;
  profile_id?: string;
  account_id: string;
  category_id?: string;
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
  tags?: { name: string }[];
}

export interface BackendResponseTransactions {
  status: string;
  results: number;
  totalRecords: number;
  data: Transaction[];
}
