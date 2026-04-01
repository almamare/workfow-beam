// AI endpoint types for Gemini integration

export interface AiEnvelope {
    success: boolean;
    message: string;
    data: { response: string } | null;
    errors: unknown | null;
}

// Chat
export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export interface ChatRequest {
    message: string;
    history?: ChatMessage[];
    context_data?: Record<string, unknown>;
}

// Financial Analysis
export interface FinancialAnalysisRequest {
    data: {
        period?: string;
        total_disbursements?: number;
        total_invoices?: number;
        petty_cash_spent?: number;
        bank_balances?: { bank_name: string; currency: string; balance: number }[];
        sarraf_balances?: { sarraf_name: string; currency: string; balance: number }[];
        disbursements_by_category?: Record<string, number>;
        monthly_trend?: { month: string; amount: number }[];
    };
}

// Project Analysis
export interface ProjectAnalysisRequest {
    data: Record<string, unknown>;
}

// Employee Performance
export interface EmployeeAnalysisRequest {
    data: {
        employees: {
            name: string;
            department: string;
            tasks_assigned: number;
            tasks_completed: number;
            pending_approvals: number;
            last_active: string;
        }[];
        period?: string;
    };
}

// Smart Report
export type ReportType = 'financial' | 'project' | 'employee' | 'monthly' | 'executive' | 'general';
export interface SmartReportRequest {
    report_type: ReportType;
    data: Record<string, unknown>;
}

// Anomaly Detection
export interface AnomalyDetectionRequest {
    data: {
        invoice_no: string;
        vendor: string;
        amount: number;
        date: string;
        status: string;
    }[];
}

// Natural Language Query
export interface NlQueryRequest {
    question: string;
    context?: Record<string, unknown>;
}

// Approval Recommendation
export interface ApprovalRecommendationRequest {
    data: {
        request: {
            request_no: string;
            type: string;
            amount: number;
            purpose: string;
            requested_by: string;
            date: string;
        };
        history?: { request_no: string; amount: number; status: string }[];
        budget_remaining?: number;
    };
}

// Tender Evaluation
export interface TenderEvaluationRequest {
    tenders: {
        offer_no: string;
        contractor: string;
        price: number;
        duration_days: number;
        previous_projects: number;
        notes?: string;
    }[];
}

// Forecast
export type ForecastType = 'financial' | 'project' | 'cashflow';
export interface ForecastRequest {
    forecast_type: ForecastType;
    data: Record<string, unknown>[];
}

// Summarize
export type SummarizeType = 'contract' | 'project' | 'financial' | 'request' | 'general';
export interface SummarizeRequest {
    type: SummarizeType;
    data: Record<string, unknown>;
}

// Dashboard Insights
export interface DashboardInsightsRequest {
    data: {
        active_projects?: number;
        pending_approvals?: number;
        overdue_invoices?: number;
        total_disbursements_this_month?: number;
        budget_utilization_pct?: number;
        bank_balance_iqd?: number;
        petty_cash_remaining?: number;
        employees_count?: number;
        last_updated?: string;
    };
}

// Redux State
export interface AiState {
    // individual loading flags per feature
    chatLoading: boolean;
    financialLoading: boolean;
    projectLoading: boolean;
    employeeLoading: boolean;
    reportLoading: boolean;
    anomalyLoading: boolean;
    queryLoading: boolean;
    approvalLoading: boolean;
    tenderLoading: boolean;
    forecastLoading: boolean;
    summarizeLoading: boolean;
    dashboardLoading: boolean;

    // responses
    chatResponse: string | null;
    financialResponse: string | null;
    projectResponse: string | null;
    employeeResponse: string | null;
    reportResponse: string | null;
    anomalyResponse: string | null;
    queryResponse: string | null;
    approvalResponse: string | null;
    tenderResponse: string | null;
    forecastResponse: string | null;
    summarizeResponse: string | null;
    dashboardResponse: string | null;

    error: string | null;
}
