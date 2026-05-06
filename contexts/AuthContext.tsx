'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    department: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored token on mount
        const token = localStorage.getItem('token');
        if (token) {
            // In a real app, validate token with server
            setUser({
                id: '1',
                email: 'admin@shuarano.com',
                firstName: 'John',
                lastName: 'Doe',
                role: 'Administrator',
                department: 'IT'
            });
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (email === 'admin@shuarano.com' && password === 'password') {
                const mockUser = {
                    id: '1',
                    email: 'admin@shuarano.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    role: 'Administrator',
                    department: 'IT'
                };

                localStorage.setItem('token', 'mock-jwt-token');
                setUser(mockUser);
            } else {
                throw new Error('Invalid credentials');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}