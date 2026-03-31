export interface Profile {
  id: string;
  user_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileListResponse {
  status: string;
  data: Profile[];
}

export interface ProfileResponse {
  status: string;
  data: Profile;
}

export interface ProfileDeleteResponse {
  status: string;
  message: string;
}
