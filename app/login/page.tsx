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
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { 
    User, 
    Lock, 
    Eye, 
    EyeOff, 
    Loader2, 
    LogIn, 
    Building2, 
    Shield, 
    ArrowRight,
    CheckCircle,
    AlertCircle,
    Smartphone,
    Monitor,
    Tablet
} from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();
    const { loading } = useSelector((state: any) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await dispatch(authentication({ username, password }));
            if (authentication.fulfilled.match(result)) {
                toast.success('Welcome back!');
                router.push('/dashboard');
            } else {
                toast.error((result.payload as string) || 'Login failed');
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const features = [
        {
            icon: <Building2 className="h-6 w-6" />,
            title: "Project Management",
            description: "Comprehensive project tracking and management"
        },
        {
            icon: <Shield className="h-6 w-6" />,
            title: "Secure Access",
            description: "Enterprise-grade security and data protection"
        },
        {
            icon: <Monitor className="h-6 w-6" />,
            title: "Multi-Device",
            description: "Access from desktop, tablet, or mobile"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-orange-900">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-40">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                }}></div>
            </div>
            
            {/* Main Container */}
            <div className="relative min-h-screen flex">
                {/* Left Side - Features & Branding */}
                <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col justify-center px-8 xl:px-12 2xl:px-16">
                    <div className="max-w-md mx-auto space-y-8">
                        {/* Logo & Brand */}
                        <div className="text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start space-x-4 mb-6">
                                <div className="relative">
                                    <Image
                                        src="https://cdn.shuarano.com/img/logo.png"
                                        alt="Shuaa Al-Ranou logo"
                                        width={64}
                                        height={64}
                                        priority
                                        className="shrink-0"
                                        style={{ width: "64px", height: "84px" }}
                                    />
                                </div>
                                <div>
                                    <h1 className="text-2xl xl:text-3xl font-bold text-slate-800 dark:text-white">
                                        Shuaa Al-Ranou
                                    </h1>
                                    <p className="text-md text-slate-600 dark:text-slate-300">
                                        Trade & General Contracting
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-6">
                            <h2 className="text-xl xl:text-2xl font-semibold text-slate-800 dark:text-white">
                                Welcome to our platform
                            </h2>
                            <div className="space-y-4">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-start space-x-4 group">
                                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-brand-orange to-brand-gold rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-800 dark:text-white">
                                                {feature.title}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-brand-orange">500+</div>
                                <div className="text-xs text-slate-600 dark:text-slate-300">Projects</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-brand-orange">50+</div>
                                <div className="text-xs text-slate-600 dark:text-slate-300">Clients</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-brand-orange">99%</div>
                                <div className="text-xs text-slate-600 dark:text-slate-300">Satisfaction</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 xl:w-3/5 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                    <div className="w-full max-w-md space-y-8">
                        {/* Mobile Logo */}
                        <div className="lg:hidden text-center">
                            <div className="flex items-center justify-center space-x-3 mb-4">
                                <Image
                                    src="https://cdn.shuarano.com/img/logo.png"
                                    alt="Shuaa Al-Ranou logo"
                                    width={48}
                                    height={48}
                                    priority
                                    className="shrink-0"
                                    style={{ width: "48px", height: "58px" }}
                                />
                                <div>
                                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                                        Shuaa Al-Ranou
                                    </h1>
                                    <p className="text-xs text-slate-600 dark:text-slate-300">
                                        Trade & General Contracting
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Login Card */}
                        <Card className="shadow-xl border border-orange-100 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                            <CardHeader className="space-y-2 text-center pb-8">
                                <CardTitle className="text-2xl xl:text-3xl font-bold bg-gradient-to-r from-brand-orange to-brand-gold bg-clip-text text-transparent">
                                    Welcome Back
                                </CardTitle>
                                <CardDescription className="text-slate-600 dark:text-slate-300">
                                    Sign in to your account to continue
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Username Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Username
                                        </Label>
                                        <div className="relative group">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-orange transition-colors" size={18} />
                                            <Input
                                                id="username"
                                                type="text"
                                                placeholder="Enter your username"
                                                className="pl-11 h-12 border-slate-200 dark:border-slate-600 focus:border-brand-orange focus:ring-brand-orange/20 transition-all duration-200"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Password
                                        </Label>
                                        <div className="relative group">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-orange transition-colors" size={18} />
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter your password"
                                                className="pl-11 pr-11 h-12 border-slate-200 dark:border-slate-600 focus:border-brand-orange focus:ring-brand-orange/20 transition-all duration-200"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-brand-orange transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Remember Me & Forgot Password */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="remember"
                                                checked={rememberMe}
                                                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                            />
                                            <Label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-300">
                                                Remember me
                                            </Label>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="link"
                                            size="sm"
                                            className="text-sm text-brand-orange hover:text-brand-orange-dark p-0 h-auto"
                                            onClick={() => toast.info('Password recovery feature coming soon!')}
                                        >
                                            Forgot password?
                                        </Button>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-gradient-to-r from-brand-orange to-brand-gold hover:from-brand-orange-dark hover:to-brand-gold text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                                        disabled={isLoading || loading}
                                    >
                                        {isLoading || loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="mr-2 h-5 w-5" />
                                                Sign In
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                {/* Divider */}
                                <div className="relative">
                                    <Separator className="my-6" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="bg-white dark:bg-slate-800 px-4 text-sm text-slate-500">
                                            Secure Login
                                        </span>
                                    </div>
                                </div>

                                {/* Security Notice */}
                                <div className="flex items-start space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm">
                                        <p className="font-medium text-green-800 dark:text-green-200">
                                            Secure Connection
                                        </p>
                                        <p className="text-green-600 dark:text-green-300">
                                            Your data is protected with enterprise-grade encryption
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Footer */}
                        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                            <p>© 2024 Shuaa Al-Ranou. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
