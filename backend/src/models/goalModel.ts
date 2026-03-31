export interface CreateGoalDTO {
    profile_id: string;
    title: string;
    target_amount: number;
    deadline?: string;
}

export interface GoalResponse {
    id: string;
    profile_id: string;
    title: string;
    target_amount: number;
    deadline: string | null;
    created_at: string;
    updated_at: string;
}
