export interface CreateUserSettingsDTO {
    user_id: string;
    theme?: string;
    currency?: string;
    language?: string;
    receive_notifications?: boolean;
}

export interface UserSettingsResponse {
    id: string;
    user_id: string;
    theme: string;
    currency: string;
    language: string;
    receive_notifications: boolean;
    created_at: string;
    updated_at: string;
}
