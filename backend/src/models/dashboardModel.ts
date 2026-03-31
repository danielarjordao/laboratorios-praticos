export interface MonthlySummaryResponse {
    total_income: number;
    total_expense: number;
    monthly_balance: number;
    period: {
        month: number;
        year: number;
    };
}
