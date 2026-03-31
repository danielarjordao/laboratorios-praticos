export interface CreateTagDTO {
    name: string;
    profile_id: string;
}

export interface TagResponse extends CreateTagDTO {
    id: string;
    created_at: string;
    updated_at: string;
}
