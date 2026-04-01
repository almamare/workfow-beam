import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/utils/axios';
import type {
    AiEnvelope,
    AiState,
    ChatRequest,
    FinancialAnalysisRequest,
    ProjectAnalysisRequest,
    EmployeeAnalysisRequest,
    SmartReportRequest,
    AnomalyDetectionRequest,
    NlQueryRequest,
    ApprovalRecommendationRequest,
    TenderEvaluationRequest,
    ForecastRequest,
    SummarizeRequest,
    DashboardInsightsRequest,
} from '@/stores/types/ai';
import type { RootState } from '@/stores/store';

const BASE = '/ai';

/** Maps HTTP status codes / network errors to Arabic user-facing messages. */
const resolveErrorMessage = (e: any): string => {
    const status: number | undefined = e?.response?.status;
    if (status === 401) return 'انتهت جلستك، يرجى إعادة تسجيل الدخول';
    if (status === 422) return 'خطأ في البيانات المرسلة، تحقق من الحقول المطلوبة';
    if (status === 500) return 'خدمة الذكاء الاصطناعي غير متاحة حالياً، حاول مرة أخرى لاحقاً';
    if (!e?.response) return 'تعذّر الاتصال بالخادم، تحقق من اتصالك بالإنترنت';
    // Use the backend message if present, otherwise a generic fallback
    const backendMsg: string = e?.response?.data?.message || e?.message || '';
    if (backendMsg) return backendMsg;
    return 'حدث خطأ غير متوقع في خدمة الذكاء الاصطناعي';
};

const extractResponse = (data: AiEnvelope): string => {
    if (!data.success) {
        const msg = data.message || '';
        // Backend may return English technical messages — wrap them in Arabic
        throw new Error(msg || 'حدث خطأ في معالجة الطلب');
    }
    return data.data?.response ?? '';
};

// 1. Chat
export const aiChat = createAsyncThunk<string, ChatRequest, { rejectValue: string }>(
    'ai/chat',
    async (body, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post<AiEnvelope>(`${BASE}/chat`, body);
            return extractResponse(res.data);
        } catch (e: any) {
            return rejectWithValue(resolveErrorMessage(e));
        }
    }
);

// 2. Financial Analysis
export const aiAnalyzeFinancial = createAsyncThunk<string, FinancialAnalysisRequest, { rejectValue: string }>(
    'ai/analyzeFinancial',
    async (body, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post<AiEnvelope>(`${BASE}/analyze/financial`, body);
            return extractResponse(res.data);
        } catch (e: any) {
            return rejectWithValue(resolveErrorMessage(e));
        }
    }
);

// 3. Project Analysis
export const aiAnalyzeProject = createAsyncThunk<string, ProjectAnalysisRequest, { rejectValue: string }>(
    'ai/analyzeProject',
    async (body, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post<AiEnvelope>(`${BASE}/analyze/project`, body);
            return extractResponse(res.data);
        } catch (e: any) {
            return rejectWithValue(resolveErrorMessage(e));
        }
    }
);

// 4. Employee Performance
export const aiAnalyzeEmployees = createAsyncThunk<string, EmployeeAnalysisRequest, { rejectValue: string }>(
    'ai/analyzeEmployees',
    async (body, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post<AiEnvelope>(`${BASE}/analyze/employees`, body);
            return extractResponse(res.data);
        } catch (e: any) {
            return rejectWithValue(resolveErrorMessage(e));
        }
    }
);

// 5. Smart Report
export const aiGenerateReport = createAsyncThunk<string, SmartReportRequest, { rejectValue: string }>(
    'ai/report',
    async (body, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post<AiEnvelope>(`${BASE}/report`, body);
            return extractResponse(res.data);
        } catch (e: any) {
            return rejectWithValue(resolveErrorMessage(e));
        }
    }
);

// 6. Anomaly Detection
export const aiDetectAnomalies = createAsyncThunk<string, AnomalyDetectionRequest, { rejectValue: string }>(
    'ai/anomalies',
    async (body, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post<AiEnvelope>(`${BASE}/anomalies`, body);
            return extractResponse(res.data);
        } catch (e: any) {
            return rejectWithValue(resolveErrorMessage(e));
        }
    }
);

// 7. Natural Language Query
export const aiNlQuery = createAsyncThunk<string, NlQueryRequest, { rejectValue: string }>(
    'ai/query',
    async (body, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post<AiEnvelope>(`${BASE}/query`, body);
            return extractResponse(res.data);
        } catch (e: any) {
            return rejectWithValue(resolveErrorMessage(e));
        }
    }
);

// 8. Approval Recommendation
export const aiApprovalRecommend = createAsyncThunk<string, ApprovalRecommendationRequest, { rejectValue: string }>(
    'ai/approvalRecommend',
    async (body, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post<AiEnvelope>(`${BASE}/approval/recommend`, body);
            return extractResponse(res.data);
        } catch (e: any) {
            return rejectWithValue(resolveErrorMessage(e));
        }
    }
);

// 9. Tender Evaluation
export const aiEvaluateTenders = createAsyncThunk<string, TenderEvaluationRequest, { rejectValue: string }>(
    'ai/tenders',
    async (body, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post<AiEnvelope>(`${BASE}/tenders/evaluate`, body);
            return extractResponse(res.data);
        } catch (e: any) {
            return rejectWithValue(resolveErrorMessage(e));
        }
    }
);

// 10. Forecast
export const aiForecast = createAsyncThunk<string, ForecastRequest, { rejectValue: string }>(
    'ai/forecast',
    async (body, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post<AiEnvelope>(`${BASE}/forecast`, body);
            return extractResponse(res.data);
        } catch (e: any) {
            return rejectWithValue(resolveErrorMessage(e));
        }
    }
);

// 11. Summarize
export const aiSummarize = createAsyncThunk<string, SummarizeRequest, { rejectValue: string }>(
    'ai/summarize',
    async (body, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post<AiEnvelope>(`${BASE}/summarize`, body);
            return extractResponse(res.data);
        } catch (e: any) {
            return rejectWithValue(resolveErrorMessage(e));
        }
    }
);

// 12. Dashboard Insights (POST)
export const aiDashboardInsights = createAsyncThunk<string, DashboardInsightsRequest, { rejectValue: string }>(
    'ai/dashboard',
    async (body, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.post<AiEnvelope>(`${BASE}/dashboard`, body);
            return extractResponse(res.data);
        } catch (e: any) {
            return rejectWithValue(resolveErrorMessage(e));
        }
    }
);

// ─── Slice ─────────────────────────────────────────────────────────────────

const initialState: AiState = {
    chatLoading: false,
    financialLoading: false,
    projectLoading: false,
    employeeLoading: false,
    reportLoading: false,
    anomalyLoading: false,
    queryLoading: false,
    approvalLoading: false,
    tenderLoading: false,
    forecastLoading: false,
    summarizeLoading: false,
    dashboardLoading: false,

    chatResponse: null,
    financialResponse: null,
    projectResponse: null,
    employeeResponse: null,
    reportResponse: null,
    anomalyResponse: null,
    queryResponse: null,
    approvalResponse: null,
    tenderResponse: null,
    forecastResponse: null,
    summarizeResponse: null,
    dashboardResponse: null,

    error: null,
};

const aiSlice = createSlice({
    name: 'ai',
    initialState,
    reducers: {
        clearAiResponse(state, action: PayloadAction<keyof AiState | 'all'>) {
            if (action.payload === 'all') {
                Object.assign(state, {
                    chatResponse: null, financialResponse: null, projectResponse: null,
                    employeeResponse: null, reportResponse: null, anomalyResponse: null,
                    queryResponse: null, approvalResponse: null, tenderResponse: null,
                    forecastResponse: null, summarizeResponse: null, dashboardResponse: null,
                    error: null,
                });
            } else {
                (state as Record<string, unknown>)[action.payload as string] = null;
                state.error = null;
            }
        },
        clearAiError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Chat
        builder
            .addCase(aiChat.pending, (s) => { s.chatLoading = true; s.error = null; })
            .addCase(aiChat.fulfilled, (s, a: PayloadAction<string>) => { s.chatLoading = false; s.chatResponse = a.payload; })
            .addCase(aiChat.rejected, (s, a) => { s.chatLoading = false; s.error = a.payload ?? null; });

        // Financial Analysis
        builder
            .addCase(aiAnalyzeFinancial.pending, (s) => { s.financialLoading = true; s.error = null; })
            .addCase(aiAnalyzeFinancial.fulfilled, (s, a: PayloadAction<string>) => { s.financialLoading = false; s.financialResponse = a.payload; })
            .addCase(aiAnalyzeFinancial.rejected, (s, a) => { s.financialLoading = false; s.error = a.payload ?? null; });

        // Project Analysis
        builder
            .addCase(aiAnalyzeProject.pending, (s) => { s.projectLoading = true; s.error = null; })
            .addCase(aiAnalyzeProject.fulfilled, (s, a: PayloadAction<string>) => { s.projectLoading = false; s.projectResponse = a.payload; })
            .addCase(aiAnalyzeProject.rejected, (s, a) => { s.projectLoading = false; s.error = a.payload ?? null; });

        // Employee Analysis
        builder
            .addCase(aiAnalyzeEmployees.pending, (s) => { s.employeeLoading = true; s.error = null; })
            .addCase(aiAnalyzeEmployees.fulfilled, (s, a: PayloadAction<string>) => { s.employeeLoading = false; s.employeeResponse = a.payload; })
            .addCase(aiAnalyzeEmployees.rejected, (s, a) => { s.employeeLoading = false; s.error = a.payload ?? null; });

        // Report
        builder
            .addCase(aiGenerateReport.pending, (s) => { s.reportLoading = true; s.error = null; })
            .addCase(aiGenerateReport.fulfilled, (s, a: PayloadAction<string>) => { s.reportLoading = false; s.reportResponse = a.payload; })
            .addCase(aiGenerateReport.rejected, (s, a) => { s.reportLoading = false; s.error = a.payload ?? null; });

        // Anomaly
        builder
            .addCase(aiDetectAnomalies.pending, (s) => { s.anomalyLoading = true; s.error = null; })
            .addCase(aiDetectAnomalies.fulfilled, (s, a: PayloadAction<string>) => { s.anomalyLoading = false; s.anomalyResponse = a.payload; })
            .addCase(aiDetectAnomalies.rejected, (s, a) => { s.anomalyLoading = false; s.error = a.payload ?? null; });

        // Query
        builder
            .addCase(aiNlQuery.pending, (s) => { s.queryLoading = true; s.error = null; })
            .addCase(aiNlQuery.fulfilled, (s, a: PayloadAction<string>) => { s.queryLoading = false; s.queryResponse = a.payload; })
            .addCase(aiNlQuery.rejected, (s, a) => { s.queryLoading = false; s.error = a.payload ?? null; });

        // Approval
        builder
            .addCase(aiApprovalRecommend.pending, (s) => { s.approvalLoading = true; s.error = null; })
            .addCase(aiApprovalRecommend.fulfilled, (s, a: PayloadAction<string>) => { s.approvalLoading = false; s.approvalResponse = a.payload; })
            .addCase(aiApprovalRecommend.rejected, (s, a) => { s.approvalLoading = false; s.error = a.payload ?? null; });

        // Tender
        builder
            .addCase(aiEvaluateTenders.pending, (s) => { s.tenderLoading = true; s.error = null; })
            .addCase(aiEvaluateTenders.fulfilled, (s, a: PayloadAction<string>) => { s.tenderLoading = false; s.tenderResponse = a.payload; })
            .addCase(aiEvaluateTenders.rejected, (s, a) => { s.tenderLoading = false; s.error = a.payload ?? null; });

        // Forecast
        builder
            .addCase(aiForecast.pending, (s) => { s.forecastLoading = true; s.error = null; })
            .addCase(aiForecast.fulfilled, (s, a: PayloadAction<string>) => { s.forecastLoading = false; s.forecastResponse = a.payload; })
            .addCase(aiForecast.rejected, (s, a) => { s.forecastLoading = false; s.error = a.payload ?? null; });

        // Summarize
        builder
            .addCase(aiSummarize.pending, (s) => { s.summarizeLoading = true; s.error = null; })
            .addCase(aiSummarize.fulfilled, (s, a: PayloadAction<string>) => { s.summarizeLoading = false; s.summarizeResponse = a.payload; })
            .addCase(aiSummarize.rejected, (s, a) => { s.summarizeLoading = false; s.error = a.payload ?? null; });

        // Dashboard
        builder
            .addCase(aiDashboardInsights.pending, (s) => { s.dashboardLoading = true; s.error = null; })
            .addCase(aiDashboardInsights.fulfilled, (s, a: PayloadAction<string>) => { s.dashboardLoading = false; s.dashboardResponse = a.payload; })
            .addCase(aiDashboardInsights.rejected, (s, a) => { s.dashboardLoading = false; s.error = a.payload ?? null; });
    },
});

export const { clearAiResponse, clearAiError } = aiSlice.actions;
export default aiSlice.reducer;

// Selectors
export const selectAiChatLoading = (s: RootState) => s.ai.chatLoading;
export const selectAiChatResponse = (s: RootState) => s.ai.chatResponse;
export const selectAiFinancialLoading = (s: RootState) => s.ai.financialLoading;
export const selectAiFinancialResponse = (s: RootState) => s.ai.financialResponse;
export const selectAiProjectLoading = (s: RootState) => s.ai.projectLoading;
export const selectAiProjectResponse = (s: RootState) => s.ai.projectResponse;
export const selectAiEmployeeLoading = (s: RootState) => s.ai.employeeLoading;
export const selectAiEmployeeResponse = (s: RootState) => s.ai.employeeResponse;
export const selectAiReportLoading = (s: RootState) => s.ai.reportLoading;
export const selectAiReportResponse = (s: RootState) => s.ai.reportResponse;
export const selectAiAnomalyLoading = (s: RootState) => s.ai.anomalyLoading;
export const selectAiAnomalyResponse = (s: RootState) => s.ai.anomalyResponse;
export const selectAiQueryLoading = (s: RootState) => s.ai.queryLoading;
export const selectAiQueryResponse = (s: RootState) => s.ai.queryResponse;
export const selectAiApprovalLoading = (s: RootState) => s.ai.approvalLoading;
export const selectAiApprovalResponse = (s: RootState) => s.ai.approvalResponse;
export const selectAiTenderLoading = (s: RootState) => s.ai.tenderLoading;
export const selectAiTenderResponse = (s: RootState) => s.ai.tenderResponse;
export const selectAiForecastLoading = (s: RootState) => s.ai.forecastLoading;
export const selectAiForecastResponse = (s: RootState) => s.ai.forecastResponse;
export const selectAiSummarizeLoading = (s: RootState) => s.ai.summarizeLoading;
export const selectAiSummarizeResponse = (s: RootState) => s.ai.summarizeResponse;
export const selectAiDashboardLoading = (s: RootState) => s.ai.dashboardLoading;
export const selectAiDashboardResponse = (s: RootState) => s.ai.dashboardResponse;
export const selectAiError = (s: RootState) => s.ai.error;
