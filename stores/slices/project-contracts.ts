import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '@/utils/axios';
import type { RootState } from '@/stores/store';
import type {
    ProjectContract,
    ProjectContractsData,
    ProjectContractsResponseLegacy,
    ProjectContractResponseLegacy,
    CreateProjectContractRequest,
    UpdateProjectContractRequest,
} from '@/stores/types/project-contracts';
import {
    firstMessage,
    isProjectContractDetailSuccess,
    isProjectContractsListSuccess,
} from '@/stores/types/project-contracts';

interface ProjectContractsState {
    loading: boolean;
    error: string | null;
    contracts: ProjectContract[];
    selectedContract: ProjectContract | null;
    total: number;
    pages: number;
}

const initialState: ProjectContractsState = {
    loading: false,
    error: null,
    contracts: [],
    selectedContract: null,
    total: 0,
    pages: 0,
};

interface FetchParams {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    approval_status?: string;
    project_id?: string;
}

function contractsBlockFromResponse(data: unknown): ProjectContractsData | null {
    if (isProjectContractsListSuccess(data)) {
        return data.body!.contracts;
    }
    if (
        typeof data === 'object' &&
        data !== null &&
        'success' in data &&
        (data as { success?: boolean }).success === true &&
        'data' in data
    ) {
        const inner = (data as { data?: { contracts?: ProjectContractsData } }).data?.contracts;
        if (inner != null && typeof inner === 'object' && Array.isArray(inner.items)) {
            return inner;
        }
    }
    return null;
}

function contractFromResponse(data: unknown): ProjectContract | null {
    if (isProjectContractDetailSuccess(data)) {
        return data.body!.contract;
    }
    if (
        typeof data === 'object' &&
        data !== null &&
        'success' in data &&
        (data as { success?: boolean }).success === true &&
        'data' in data
    ) {
        const c = (data as { data?: { contract?: ProjectContract } }).data?.contract;
        if (c != null && typeof c === 'object') {
            return c;
        }
    }
    return null;
}

function legacyError(data: unknown): string {
    if (typeof data === 'object' && data !== null && 'header' in data) {
        return firstMessage(data as ProjectContractsResponseLegacy | ProjectContractResponseLegacy);
    }
    return 'Request failed';
}

function mutationOk(data: unknown): boolean {
    if (typeof data === 'object' && data !== null && 'header' in data) {
        return !!(data as { header?: { success?: boolean } }).header?.success;
    }
    return false;
}

export const fetchProjectContracts = createAsyncThunk<
    ProjectContractsData,
    FetchParams,
    { rejectValue: string }
>('projectContracts/fetch', async (params, { rejectWithValue }) => {
    try {
        const response = await api.get('/project-contracts/fetch', {
            params: {
                page: params.page || 1,
                limit: params.limit || 10,
                search: params.search || undefined,
                status: params.status || undefined,
                approval_status: params.approval_status || undefined,
                project_id: params.project_id || undefined,
            },
        });
        const block = contractsBlockFromResponse(response.data);
        if (block) {
            return block;
        }
        return rejectWithValue(legacyError(response.data));
    } catch (error: unknown) {
        const ax = error as { response?: { data?: unknown } };
        return rejectWithValue(legacyError(ax.response?.data) || 'Server connection failed');
    }
});

export const fetchProjectContract = createAsyncThunk<
    ProjectContract,
    string,
    { rejectValue: string }
>('projectContracts/fetchOne', async (contractId, { rejectWithValue }) => {
    try {
        const response = await api.get(`/project-contracts/fetch/contract/${contractId}`);
        const c = contractFromResponse(response.data);
        if (c) {
            return c;
        }
        return rejectWithValue(legacyError(response.data));
    } catch (error: unknown) {
        const ax = error as { response?: { data?: unknown } };
        return rejectWithValue(legacyError(ax.response?.data) || 'Server connection failed');
    }
});

export const createProjectContract = createAsyncThunk<
    unknown,
    CreateProjectContractRequest,
    { rejectValue: string }
>('projectContracts/create', async (data, { rejectWithValue }) => {
    try {
        const response = await api.post('/project-contracts/create', { params: data });
        if (mutationOk(response.data)) {
            return response.data;
        }
        return rejectWithValue(legacyError(response.data));
    } catch (error: unknown) {
        const ax = error as { response?: { data?: unknown } };
        return rejectWithValue(legacyError(ax.response?.data) || 'Server connection failed');
    }
});

export const updateProjectContract = createAsyncThunk<
    unknown,
    { id: string; data: UpdateProjectContractRequest },
    { rejectValue: string }
>('projectContracts/update', async ({ id, data }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/project-contracts/update/${id}`, data);
        if (mutationOk(response.data)) {
            return response.data;
        }
        return rejectWithValue(legacyError(response.data));
    } catch (error: unknown) {
        const ax = error as { response?: { data?: unknown } };
        return rejectWithValue(legacyError(ax.response?.data) || 'Server connection failed');
    }
});

export const deleteProjectContract = createAsyncThunk<unknown, string, { rejectValue: string }>(
    'projectContracts/delete',
    async (contractId, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/project-contracts/delete/${contractId}`);
            if (mutationOk(response.data)) {
                return response.data;
            }
            return rejectWithValue(legacyError(response.data));
        } catch (error: unknown) {
            const ax = error as { response?: { data?: unknown } };
            return rejectWithValue(legacyError(ax.response?.data) || 'Server connection failed');
        }
    }
);

const projectContractsSlice = createSlice({
    name: 'projectContracts',
    initialState,
    reducers: {
        clearSelectedProjectContract(state) {
            state.selectedContract = null;
        },
        clearProjectContracts(state) {
            state.contracts = [];
            state.total = 0;
            state.pages = 0;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjectContracts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProjectContracts.fulfilled, (state, action) => {
                state.loading = false;
                state.contracts = action.payload.items || [];
                state.total = action.payload.total || 0;
                state.pages = action.payload.pages || 0;
            })
            .addCase(fetchProjectContracts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error';
                state.contracts = [];
                state.total = 0;
                state.pages = 0;
            })
            .addCase(fetchProjectContract.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedContract = null;
            })
            .addCase(fetchProjectContract.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedContract = action.payload;
            })
            .addCase(fetchProjectContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error';
                state.selectedContract = null;
            })
            .addCase(createProjectContract.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createProjectContract.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createProjectContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error';
            })
            .addCase(updateProjectContract.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProjectContract.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateProjectContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error';
            })
            .addCase(deleteProjectContract.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProjectContract.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deleteProjectContract.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Error';
            });
    },
});

export const { clearSelectedProjectContract, clearProjectContracts } = projectContractsSlice.actions;
export default projectContractsSlice.reducer;

export const selectProjectContracts = (state: RootState) => state.projectContracts.contracts;
export const selectProjectContractsLoading = (state: RootState) => state.projectContracts.loading;
export const selectProjectContractsError = (state: RootState) => state.projectContracts.error;
export const selectProjectContractsTotal = (state: RootState) => state.projectContracts.total;
export const selectProjectContractsPages = (state: RootState) => state.projectContracts.pages;
export const selectSelectedProjectContract = (state: RootState) => state.projectContracts.selectedContract;
