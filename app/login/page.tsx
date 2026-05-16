'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { authentication } from '@/stores/slices/login';
import { toast } from 'sonner';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch } from 'react-redux';
import Image from 'next/image';
import Link from 'next/link';
import { LEGAL_LINK_LABELS, LEGAL_ROUTES } from '@/lib/legal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    User,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    LogIn,
    ArrowRight,
    ShieldCheck,
    BarChart3,
    Layers,
    Globe2,
} from 'lucide-react';

const features = [
    {
        icon: BarChart3,
        title: 'Financial Control',
        description: 'Real-time tracking of budgets, disbursements and approvals',
    },
    {
        icon: Layers,
        title: 'Project Management',
        description: 'End-to-end oversight from tender to contract closure',
    },
    {
        icon: Globe2,
        title: 'Smart Reporting',
        description: 'AI-powered insights and automated document generation',
    },
];

export default function LoginPage() {
    const [username, setUsername] = useState(() =>
        typeof window !== 'undefined' ? (localStorage.getItem('beam_remember_username') ?? '') : ''
    );
    const [password, setPassword]         = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe]     = useState(() =>
        typeof window !== 'undefined' ? localStorage.getItem('beam_remember_me') === 'true' : false
    );
    const [isLoading, setIsLoading] = useState(false);

    const router   = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();
    const { loading } = useSelector((state: any) => state.login);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await dispatch(authentication({ username, password, rememberMe }));
            if (authentication.fulfilled.match(result)) {
                const payload = result.payload as { mustChangePassword?: boolean };
                if (payload?.mustChangePassword) {
                    toast.info('You must change your password before continuing.');
                    router.push('/change-password');
                } else {
                    toast.success('Welcome back!');
                    router.push('/dashboard');
                }
            } else {
                toast.error((result.payload as string) || 'Login failed');
            }
        } catch {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const busy = isLoading || loading;

    return (
        <div className="min-h-screen flex">

            {/* ── LEFT BRAND PANEL ─────────────────────────────────────────── */}
            <aside className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg, hsl(216,85%,16%) 0%, hsl(216,100%,28%) 55%, hsl(216,100%,42%) 100%)' }}>

                <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="15%" cy="12%"  r="180" fill="none" stroke="white" strokeWidth="1.5" />
                    <circle cx="15%" cy="12%"  r="110" fill="none" stroke="white" strokeWidth="1" />
                    <circle cx="88%" cy="80%"  r="220" fill="none" stroke="white" strokeWidth="1.5" />
                    <circle cx="88%" cy="80%"  r="140" fill="none" stroke="white" strokeWidth="1" />
                    <circle cx="50%" cy="50%"  r="300" fill="none" stroke="white" strokeWidth="0.8" />
                    <circle cx="72%" cy="10%"  r="60"  fill="white" fillOpacity="0.06" />
                    <circle cx="20%" cy="85%"  r="80"  fill="white" fillOpacity="0.04" />
                    {Array.from({ length: 8 }).map((_, row) =>
                        Array.from({ length: 5 }).map((_, col) => (
                            <circle
                                key={`${row}-${col}`}
                                cx={`${col * 22 + 8}%`}
                                cy={`${row * 14 + 5}%`}
                                r="1.5"
                                fill="white"
                                fillOpacity="0.18"
                            />
                        ))
                    )}
                </svg>

                <div className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: 'linear-gradient(90deg, hsl(216,100%,44%), hsl(216,85%,58%), hsl(216,100%,44%))' }} />

                <div className="absolute bottom-[-40px] right-[-40px] opacity-[0.06] pointer-events-none select-none">
                    <Image src="/logo.png" alt="" width={340} height={340} aria-hidden className="object-contain max-w-[340px] h-auto" />
                </div>

                <div className="relative flex flex-col h-full px-10 xl:px-14 py-10">

                    <div className="flex items-center gap-3">
                        <div className="flex items-center min-h-[52px]">
                            <Image src="/logo.png" alt="Shuaa Al-Ranou" width={160} height={48} priority className="h-12 w-auto max-w-[160px] object-contain object-left" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-xl leading-tight tracking-wide uppercase">Shuaa Al-Ranou</p>
                            <p className="text-brand-sky-200 text-xs font-medium uppercase">Trade & General Contracting</p>
                        </div>
                    </div>

                    <div className="mt-auto mb-auto pt-16">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-brand-sky-100 text-xs font-medium tracking-wide">Enterprise Management Platform</span>
                        </div>
                        <h1 className="text-white font-extrabold leading-[1.1] mb-4" style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }}>
                            Manage Every<br />
                            <span style={{ color: 'hsl(216,95%,72%)' }}>Project with Precision</span>
                        </h1>
                        <p className="text-brand-sky-200 text-base leading-relaxed max-w-sm">
                            A complete operations platform for contracting companies — from project creation to financial closure.
                        </p>
                    </div>

                    <div className="space-y-4 mb-10">
                        {features.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-brand-sky-200" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">{title}</p>
                                    <p className="text-brand-sky-300 text-xs leading-relaxed mt-0.5">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-white/10 pt-5">
                        <p className="text-brand-sky-400 text-xs">
                            © {new Date().getFullYear()} Shuaa Al-Ranou Trade & General Contracting. All rights reserved.
                        </p>
                    </div>
                </div>
            </aside>

            {/* ── RIGHT FORM PANEL ──────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-5 sm:px-8 py-12">

                <div className="lg:hidden flex items-center gap-3 mb-10">
                    <Image
                        src="/logo.png"
                        alt="Shuaa Al-Ranou"
                        width={140}
                        height={42}
                        priority
                        className="h-10 w-auto max-w-[140px] object-contain object-left"
                        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.12))' }}
                    />
                    <div>
                        <p className="font-bold text-slate-800 dark:text-white text-base leading-tight">Shuaa Al-Ranou</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">Trade & General Contracting</p>
                    </div>
                </div>

                <div className="w-full max-w-[420px]">

                    <div className="mb-8">
                        <h2 className="text-slate-900 dark:text-white font-extrabold text-3xl mb-1.5">Welcome back</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                        <div className="space-y-1.5">
                            <Label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Username
                            </Label>
                            <div className="relative group">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-sky-500 transition-colors duration-150" />
                                <Input
                                    id="username"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="Enter your username"
                                    className="pl-10 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-500/20 transition-all duration-150"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={busy}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Password
                            </Label>
                            <div className="relative group">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-sky-500 transition-colors duration-150" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    className="pl-10 pr-11 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-500/20 transition-all duration-150"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={busy}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-sky-500 transition-colors duration-150 focus:outline-none"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer select-none group">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={(v) => setRememberMe(v as boolean)}
                                    className="data-[state=checked]:bg-brand-sky-600 data-[state=checked]:border-brand-sky-600"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                                    Remember me
                                </span>
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-sm font-medium text-brand-sky-600 hover:text-brand-sky-700 dark:text-brand-sky-400 dark:hover:text-brand-sky-300 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            disabled={busy}
                            className="w-full h-12 rounded-xl font-semibold text-[15px] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-150 mt-2 disabled:opacity-70"
                            style={{ background: busy ? undefined : 'linear-gradient(135deg, hsl(216,100%,36%) 0%, hsl(216,90%,48%) 100%)' }}
                        >
                            {busy ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Signing in…</>
                            ) : (
                                <><LogIn className="mr-2 h-5 w-5" />Sign In<ArrowRight className="ml-auto h-4 w-4 opacity-70" /></>
                            )}
                        </Button>
                    </form>

                    <div className="relative my-7">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-slate-50 dark:bg-slate-900 px-3 text-xs font-medium text-slate-400 uppercase tracking-widest">
                                secure login
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-brand-sky-100 dark:border-brand-sky-900/50 bg-brand-sky-50 dark:bg-brand-sky-900/20 px-4 py-3">
                        <ShieldCheck className="h-5 w-5 text-brand-sky-500 flex-shrink-0" />
                        <p className="text-xs text-brand-sky-700 dark:text-brand-sky-300 leading-relaxed">
                            Your connection is encrypted with enterprise-grade security.
                        </p>
                    </div>

                    <nav
                        className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium"
                        aria-label="Legal"
                    >
                        <Link
                            href={LEGAL_ROUTES.privacyPolicy}
                            className="text-brand-sky-600 hover:text-brand-sky-800 dark:text-brand-sky-400 dark:hover:text-brand-sky-200 underline-offset-2 hover:underline"
                        >
                            {LEGAL_LINK_LABELS.privacyPolicy}
                        </Link>
                        <Link
                            href={LEGAL_ROUTES.termsOfUse}
                            className="text-brand-sky-600 hover:text-brand-sky-800 dark:text-brand-sky-400 dark:hover:text-brand-sky-200 underline-offset-2 hover:underline"
                        >
                            {LEGAL_LINK_LABELS.termsOfUse}
                        </Link>
                    </nav>

                    <div className="lg:hidden text-center mt-6">
                        <p className="text-xs text-slate-400">
                            © {new Date().getFullYear()} Shuaa Al-Ranou. All rights reserved.
                        </p>
                    </div>
                </div>
            </main>

        </div>
    );
}
