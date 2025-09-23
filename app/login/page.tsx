'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { authentication } from '@/stores/slices/login';
import { toast } from 'sonner';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch } from 'react-redux';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { User, Lock, Eye, EyeOff, Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();
    const { loading } = useSelector((state: any) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await dispatch(authentication({ username, password }));
            if (authentication.fulfilled.match(result)) {
                router.push('/dashboard');
            } else {
                toast.error((result.payload as string) || 'Login failed');
            }
        } catch {
            toast.error('An unexpected error occurred');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-4">
            <Card className="w-full max-w-md shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
                {/* ===== Header (Logo + Company + Form Title) ===== */}
                <CardHeader className="flex flex-col items-center space-y-6">
                    {/* Logo + Company name & tagline */}
                    <div className="flex flex-col items-center space-y-2">
                        <Image
                            src="https://cdn.shuarano.com/img/logo.png"
                            alt="Shuaa Al-Ranou logo"
                            width={48}
                            height={48}
                            priority
                            className="shrink-0"
                            style={{ width: "48px", height: "48px" }}
                        />

                        <div className="text-center leading-tight">
                            <span className="block font-semibold text-[18px] tracking-wide">
                                Shuaa Al-Ranou
                            </span>
                            <span className="block text-[11px] text-muted-foreground">
                                Trade & General Contracting
                            </span>
                        </div>
                    </div>

                    {/* Form title */}
                    <CardTitle className="text-3xl font-semibold text-[#EF6C00] dark:text-white">
                        Sign In
                    </CardTitle>
                </CardHeader>

                {/* ===== Login form ===== */}
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username */}
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

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
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

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="w-full bg-[#EF6C00] hover:bg-[#d85f00] text-white font-semibold"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Sign In
                                </>
                            )}
                        </Button>

                        {/* Forgot password */}
                        <div className="text-center">
                            <Button
                                variant="link"
                                size="sm"
                                className="text-sm text-[#455A64]"
                                onClick={() => toast.info('Password recovery feature coming soon!')}
                            >
                                Forgot your password?
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
