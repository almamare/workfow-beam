// REFACTOR-PHASE-1: Redux-based authentication hook
// Replaces AuthContext to eliminate dual authentication state
// Single source of truth: Redux login slice

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/stores/store';
import { logout as logoutAction, authentication } from '@/stores/slices/login';
import { useCallback } from 'react';
import type { User } from '@/stores/types/login';

export interface AuthHookReturn {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    error: string | null;
}

/**
 * Custom hook for authentication using Redux as single source of truth
 * Replaces the previous AuthContext implementation
 */
export function useAuth(): AuthHookReturn {
    const dispatch = useDispatch<AppDispatch>();
    const user = useSelector((state: RootState) => state.login.user);
    const loading = useSelector((state: RootState) => state.login.loading);
    const error = useSelector((state: RootState) => state.login.error);

    const login = useCallback(
        async (username: string, password: string) => {
            const result = await dispatch(authentication({ username, password }));
            if (authentication.rejected.match(result)) {
                throw new Error(result.payload as string);
            }
        },
        [dispatch]
    );

    const logout = useCallback(() => {
        dispatch(logoutAction());
    }, [dispatch]);

    return {
        user,
        isLoading: loading,
        isAuthenticated: !!user,
        login,
        logout,
        error,
    };
}

