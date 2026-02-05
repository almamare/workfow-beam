import { useState, useEffect, useCallback } from 'react';
import axios from '@/utils/axios';
import { toast } from 'sonner';

export interface PendingApproval {
    id: string;
    approval_id: string;
    request_id: string;
    request_type: 'Tasks' | 'Financial' | 'Employment' | 'Clients' | 'Projects';
    step_level: number;
    step_name: string;
    required_role: 'Contracts' | 'Financial' | 'General';
    status: 'Pending' | 'Approved' | 'Rejected' | 'Skipped';
    request_code: string;
    request_notes?: string;
    creator_name?: string;
    created_at: string;
}

interface UsePendingApprovalsReturn {
    approvals: PendingApproval[];
    loading: boolean;
    error: string | null;
    total: number;
    pages: number;
    fetchApprovals: (page?: number, limit?: number, filters?: { request_type?: string; search?: string }) => Promise<void>;
    refresh: () => Promise<void>;
}

export const usePendingApprovals = (): UsePendingApprovalsReturn => {
    const [approvals, setApprovals] = useState<PendingApproval[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(0);

    const fetchApprovals = useCallback(async (page = 1, limit = 10, filters?: { request_type?: string; search?: string }) => {
        setLoading(true);
        setError(null);
        try {
            const params: any = { page, limit };
            if (filters?.request_type) params.request_type = filters.request_type;
            if (filters?.search) params.search = filters.search;

            const response = await axios.get('/approvals/pending', { params });
            
            // Handle both new and legacy response formats
            if (response.data.success || response.data.header?.success) {
                const data = response.data.data || response.data.body;
                const approvalsData = data?.approvals || data;
                
                setApprovals(approvalsData.items || []);
                setTotal(approvalsData.total || 0);
                setPages(approvalsData.pages || 0);
            } else {
                const errorMsg = response.data.message || response.data.header?.messages?.[0]?.message || 'فشل في جلب الموافقات';
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 
                          err.response?.data?.header?.messages?.[0]?.message || 
                          'حدث خطأ أثناء جلب الموافقات';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    const refresh = useCallback(() => {
        return fetchApprovals();
    }, [fetchApprovals]);

    useEffect(() => {
        fetchApprovals();
    }, [fetchApprovals]);

    return { approvals, loading, error, total, pages, fetchApprovals, refresh };
};

