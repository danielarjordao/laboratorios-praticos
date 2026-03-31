export interface Account {
  id: string;
  profile_id: string;
  name: string;
  type?: string;
  balance?: number;
  created_at?: string;
}

export interface AccountListResponse {
  status: string;
  data: Account[];
}

export interface AccountResponse {
  status: string;
  data: Account;
}

export interface AccountDeleteResponse {
  status: string;
  message: string;
}
