'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { authentication } from '@/stores/slices/login';  // Async thunk for login
import { toast } from 'sonner';                         // Toast notifications
import { AppDispatch } from '@/stores/store';            // Type for dispatch
import { useDispatch as useReduxDispatch } from 'react-redux';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { User, Lock, Eye, EyeOff, Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
    // Local state for input fields and password visibility toggle
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Next.js router for navigation
    const router = useRouter();

    // Typed dispatch to work properly with Redux Toolkit thunks
    const dispatch = useReduxDispatch<AppDispatch>();

    // Get loading state from Redux store
    const { loading } = useSelector((state: any) => state.login);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Dispatch the authentication thunk with username and password
            const result = await dispatch(authentication({ username, password }));

            // If login successful, redirect to dashboard
            if (authentication.fulfilled.match(result)) {
                router.push('/dashboard');
            } else {
                // Show error toast if login failed
                toast.error(result.payload as string || 'Login failed');
            }
        } catch {
            // Show toast on unexpected errors
            toast.error('An unexpected error occurred');
        }
    };

    return (
        // Main container with gradient background and center alignment
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="w-full max-w-md shadow-xl rounded-2xl">
                {/* Card header with title and description */}
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold text-center text-indigo-600 dark:text-white">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-center text-gray-500 dark:text-gray-400">
                        Sign in to your SHUAA RANO account
                    </CardDescription>
                </CardHeader>

                {/* Card content containing the login form */}
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username input field with icon */}
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    className="pl-10"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password input field with icon and show/hide toggle */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    className="pl-10 pr-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        {/* Submit button with loading spinner */}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Sign In
                                </>
                            )}
                        </Button>

                        {/* Forgot password link */}
                        <div className="text-center">
                            <Button variant="link" size="sm" onClick={() => toast.info('Password recovery feature coming soon!')}>
                                Forgot your password?
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
