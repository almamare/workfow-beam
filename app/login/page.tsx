'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { authentication } from '@/stores/slices/login';
import { toast } from 'sonner';
import { AppDispatch } from '@/stores/store';
import { useDispatch as useReduxDispatch } from 'react-redux';
import Image from 'next/image';
import Link from 'next/link';
import { LEGAL_LINK_LABELS, LEGAL_ROUTES } from '@/lib/legal';
import api from '@/utils/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
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
    Mail,
    KeyRound,
    CheckCircle2,
} from 'lucide-react';

// ── Brand panel feature list ──────────────────────────────────────────────────
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

// ── Forgot-password dialog steps ──────────────────────────────────────────────
type ResetStep = 'identity' | 'otp' | 'newpass' | 'done';

const STEP_LABELS: Record<ResetStep, string> = {
    identity : 'Forgot Password',
    otp      : 'Enter Reset Code',
    newpass  : 'Set New Password',
    done     : 'Password Changed',
};

const STEP_DESCRIPTIONS: Record<ResetStep, string> = {
    identity : 'Enter your username or email address and we\'ll send you a reset code.',
    otp      : 'Check your email for the 6-digit code and enter it below.',
    newpass  : 'Choose a strong password (at least 8 characters).',
    done     : 'Your password has been reset successfully.',
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
    // Login form state — pre-fill from localStorage if remember-me was previously set
    const [username, setUsername]       = useState(() =>
        typeof window !== 'undefined' ? (localStorage.getItem('beam_remember_username') ?? '') : ''
    );
    const [password, setPassword]       = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe]   = useState(() =>
        typeof window !== 'undefined' ? localStorage.getItem('beam_remember_me') === 'true' : false
    );
    const [isLoading, setIsLoading]     = useState(false);

    const router   = useRouter();
    const dispatch = useReduxDispatch<AppDispatch>();
    const { loading } = useSelector((state: any) => state.login);

    // Forgot-password dialog state
    const [resetOpen, setResetOpen]     = useState(false);
    const [resetStep, setResetStep]     = useState<ResetStep>('identity');
    const [resetBusy, setResetBusy]     = useState(false);

    // Step 1 — identity
    const [identity, setIdentity]       = useState('');
    const [resetUserId, setResetUserId] = useState('');

    // Step 2 — OTP (6 boxes)
    const [otp, setOtp]                 = useState(['', '', '', '', '', '']);
    const otpRefs                       = useRef<(HTMLInputElement | null)[]>([]);

    // Step 3 — new password
    const [newPass, setNewPass]         = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showNew, setShowNew]         = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [resetToken, setResetToken]   = useState('');

    // ── Login submit ─────────────────────────────────────────────────────────
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

    // ── Reset dialog helpers ─────────────────────────────────────────────────
    const openReset = () => {
        setResetStep('identity');
        setIdentity('');
        setResetUserId('');
        setOtp(['', '', '', '', '', '']);
        setNewPass('');
        setConfirmPass('');
        setResetToken('');
        setShowNew(false);
        setShowConfirm(false);
        setResetOpen(true);
    };

    // Step 1: send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identity.trim()) return;
        setResetBusy(true);
        try {
            const res = await api.post('/authentication/forgot-password', { params: { identity: identity.trim() } });
            const body = (res.data as any)?.body;
            setResetUserId(body?.user_id ?? '');
            setResetStep('otp');
            toast.success('Reset code sent! Check your email.');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to send reset code.';
            toast.error(msg);
        } finally {
            setResetBusy(false);
        }
    };

    // OTP box input handling
    const handleOtpChange = (idx: number, val: string) => {
        const digit = val.replace(/\D/, '').slice(-1);
        const next  = [...otp];
        next[idx]   = digit;
        setOtp(next);
        if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
    };

    const handleOtpKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
            otpRefs.current[idx - 1]?.focus();
        }
        if (e.key === 'ArrowLeft'  && idx > 0) otpRefs.current[idx - 1]?.focus();
        if (e.key === 'ArrowRight' && idx < 5) otpRefs.current[idx + 1]?.focus();
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        const text   = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!text) return;
        e.preventDefault();
        const next = text.split('').concat(['', '', '', '', '', '']).slice(0, 6);
        setOtp(next);
        const lastFilled = Math.min(text.length, 5);
        otpRefs.current[lastFilled]?.focus();
    };

    // Step 2: verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) { toast.error('Enter the full 6-digit code.'); return; }
        setResetBusy(true);
        try {
            const res = await api.post('/authentication/verify-otp', { params: { user_id: resetUserId, otp: code } });
            const body = (res.data as any)?.body;
            setResetToken(body?.reset_token ?? '');
            setResetStep('newpass');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Invalid or expired code.';
            toast.error(msg);
        } finally {
            setResetBusy(false);
        }
    };

    // Step 3: set new password
    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass.length < 8)         { toast.error('Password must be at least 8 characters.'); return; }
        if (newPass !== confirmPass)    { toast.error('Passwords do not match.'); return; }
        setResetBusy(true);
        try {
            await api.post('/authentication/reset-password', {
                params: { user_id: resetUserId, reset_token: resetToken, new_password: newPass },
            });
            setResetStep('done');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to reset password.';
            toast.error(msg);
        } finally {
            setResetBusy(false);
        }
    };

    const stepIndex: Record<ResetStep, number> = { identity: 0, otp: 1, newpass: 2, done: 3 };
    const currentIdx = stepIndex[resetStep];

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen flex">

            {/* ── LEFT BRAND PANEL ─────────────────────────────────────────── */}
            <aside className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg, hsl(201,96%,20%) 0%, hsl(199,89%,32%) 55%, hsl(198,93%,42%) 100%)' }}>

                {/* Decorative background rings */}
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

                {/* Top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: 'linear-gradient(90deg, hsl(45,100%,50%), hsl(199,89%,70%), hsl(45,100%,50%))' }} />

                {/* Large watermark icon */}
                <div className="absolute bottom-[-40px] right-[-40px] opacity-[0.06] pointer-events-none select-none">
                    <Image src="/icon-512.png" alt="" width={340} height={340} aria-hidden className="object-contain" />
                </div>

                {/* Content */}
                <div className="relative flex flex-col h-full px-10 xl:px-14 py-10">

                    {/* Logo + name */}
                    <div className="flex items-center">
                        <div className="w-14 h-14 flex items-center overflow-hidden">
                            <Image src="/icon-512.png" alt="Shuaa Al-Ranou" width={50} height={50} priority className="object-contain" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-xl leading-tight tracking-wide uppercase">Shuaa Al-Ranou</p>
                            <p className="text-sky-200 text-xs font-medium uppercase">Trade & General Contracting</p>
                        </div>
                    </div>

                    {/* Hero text */}
                    <div className="mt-auto mb-auto pt-16">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-sky-100 text-xs font-medium tracking-wide">Enterprise Management Platform</span>
                        </div>
                        <h1 className="text-white font-extrabold leading-[1.1] mb-4" style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }}>
                            Manage Every<br />
                            <span style={{ color: 'hsl(45,100%,60%)' }}>Project with Precision</span>
                        </h1>
                        <p className="text-sky-200 text-base leading-relaxed max-w-sm">
                            A complete operations platform for contracting companies — from project creation to financial closure.
                        </p>
                    </div>

                    {/* Feature list */}
                    <div className="space-y-4 mb-10">
                        {features.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-sky-200" />
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">{title}</p>
                                    <p className="text-sky-300 text-xs leading-relaxed mt-0.5">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom copyright */}
                    <div className="border-t border-white/10 pt-5">
                        <p className="text-sky-400 text-xs">
                            © {new Date().getFullYear()} Shuaa Al-Ranou Trade & General Contracting. All rights reserved.
                        </p>
                    </div>
                </div>
            </aside>

            {/* ── RIGHT FORM PANEL ──────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-5 sm:px-8 py-12">

                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-3 mb-10">
                    <Image
                        src="/icon-192.png"
                        alt="Shuaa Al-Ranou"
                        width={44}
                        height={44}
                        priority
                        className="object-contain"
                        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.12))' }}
                    />
                    <div>
                        <p className="font-bold text-slate-800 dark:text-white text-base leading-tight">Shuaa Al-Ranou</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">Trade & General Contracting</p>
                    </div>
                </div>

                {/* Form box */}
                <div className="w-full max-w-[420px]">

                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-slate-900 dark:text-white font-extrabold text-3xl mb-1.5">Welcome back</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Sign in to your account to continue</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                        {/* Username */}
                        <div className="space-y-1.5">
                            <Label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Username
                            </Label>
                            <div className="relative group">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-150" />
                                <Input
                                    id="username"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="Enter your username"
                                    className="pl-10 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-150"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={busy}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Password
                            </Label>
                            <div className="relative group">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors duration-150" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    className="pl-10 pr-11 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-150"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={busy}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors duration-150 focus:outline-none"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember me + forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer select-none group">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={(v) => setRememberMe(v as boolean)}
                                    className="data-[state=checked]:bg-sky-600 data-[state=checked]:border-sky-600"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
                                    Remember me
                                </span>
                            </label>
                            <button
                                type="button"
                                className="text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors focus:outline-none"
                                onClick={openReset}
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={busy}
                            className="w-full h-12 rounded-xl font-semibold text-[15px] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-150 mt-2 disabled:opacity-70"
                            style={{ background: busy ? undefined : 'linear-gradient(135deg, hsl(199,89%,40%) 0%, hsl(199,89%,52%) 100%)' }}
                        >
                            {busy ? (
                                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Signing in…</>
                            ) : (
                                <><LogIn className="mr-2 h-5 w-5" />Sign In<ArrowRight className="ml-auto h-4 w-4 opacity-70" /></>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
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

                    {/* Security badge */}
                    <div className="flex items-center gap-3 rounded-xl border border-sky-100 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-900/20 px-4 py-3">
                        <ShieldCheck className="h-5 w-5 text-sky-500 flex-shrink-0" />
                        <p className="text-xs text-sky-700 dark:text-sky-300 leading-relaxed">
                            Your connection is encrypted with enterprise-grade security.
                        </p>
                    </div>

                    {/* Legal links (all viewports on form panel; duplicate of aside links on large screens) */}
                    <nav
                        className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-medium"
                        aria-label="Legal"
                    >
                        <Link
                            href={LEGAL_ROUTES.privacyPolicy}
                            className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 underline-offset-2 hover:underline"
                        >
                            {LEGAL_LINK_LABELS.privacyPolicy}
                        </Link>
                        <Link
                            href={LEGAL_ROUTES.termsOfUse}
                            className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200 underline-offset-2 hover:underline"
                        >
                            {LEGAL_LINK_LABELS.termsOfUse}
                        </Link>
                    </nav>

                    {/* Mobile copyright */}
                    <div className="lg:hidden text-center mt-6 space-y-2">
                        <p className="text-xs text-slate-400">
                            © {new Date().getFullYear()} Shuaa Al-Ranou. All rights reserved.
                        </p>
                    </div>
                </div>
            </main>

            {/* ── FORGOT PASSWORD DIALOG ────────────────────────────────────── */}
            <Dialog open={resetOpen} onOpenChange={(v) => { if (!resetBusy) setResetOpen(v); }}>
                <DialogContent className="w-[95vw] max-w-[620px] rounded-2xl gap-0 p-0 overflow-hidden max-h-[95vh] flex flex-col">

                    {/* ── Gradient header ── */}
                    <div className="flex-shrink-0 relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, hsl(201,96%,22%) 0%, hsl(199,89%,36%) 60%, hsl(198,93%,46%) 100%)' }}>

                        {/* subtle ring decorations */}
                        <svg className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="95%" cy="20%" r="100" fill="none" stroke="white" strokeWidth="1" />
                            <circle cx="95%" cy="20%" r="60"  fill="none" stroke="white" strokeWidth="0.8" />
                            <circle cx="5%"  cy="90%" r="80"  fill="white" fillOpacity="0.05" />
                        </svg>

                        <div className="relative px-6 sm:px-8 pt-7 pb-6">
                            <DialogHeader>
                                {/* icon + title */}
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                        {resetStep === 'done'    ? <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                                        : resetStep === 'otp'    ? <KeyRound     className="w-6 h-6 text-white" />
                                        : resetStep === 'newpass'? <Lock         className="w-6 h-6 text-white" />
                                        :                          <Mail         className="w-6 h-6 text-white" />}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-white text-xl font-bold leading-tight">
                                            {STEP_LABELS[resetStep]}
                                        </DialogTitle>
                                        <DialogDescription className="text-sky-200 text-sm leading-snug mt-0.5">
                                            {STEP_DESCRIPTIONS[resetStep]}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            {/* Step progress bar */}
                            {resetStep !== 'done' && (
                                <div className="mt-5">
                                    <div className="flex items-center gap-0">
                                        {(['identity', 'otp', 'newpass'] as ResetStep[]).map((s, i) => {
                                            const done   = currentIdx > i;
                                            const active = currentIdx === i;
                                            return (
                                                <React.Fragment key={s}>
                                                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                                            done   ? 'bg-emerald-400 border-emerald-400 text-white' :
                                                            active ? 'bg-white border-white text-sky-700' :
                                                                     'bg-white/10 border-white/30 text-white/50'
                                                        }`}>
                                                            {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                                        </div>
                                                        <span className={`text-[10px] font-medium whitespace-nowrap ${
                                                            done || active ? 'text-sky-100' : 'text-white/40'
                                                        }`}>
                                                            {['Identity', 'Verify', 'Password'][i]}
                                                        </span>
                                                    </div>
                                                    {i < 2 && (
                                                        <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all ${done ? 'bg-emerald-400' : 'bg-white/20'}`} />
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Scrollable body ── */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="px-6 sm:px-8 py-7 space-y-6">

                            {/* ── Step 1: identity ── */}
                            {resetStep === 'identity' && (
                                <form onSubmit={handleSendOtp} className="space-y-5">

                                    {/* Info alert */}
                                    <div className="flex gap-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl px-4 py-3.5">
                                        <ShieldCheck className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-semibold text-sky-800 dark:text-sky-300">Secure Recovery Process</p>
                                            <p className="text-xs text-sky-600 dark:text-sky-400 leading-relaxed">
                                                Enter your registered username or email. We will verify it exists in the system,
                                                then send a one-time code to the linked email address.
                                                The code expires in <strong>15 minutes</strong> and can only be used once.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Username or Email Address
                                        </Label>
                                        <div className="relative group">
                                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                                            <Input
                                                type="text"
                                                placeholder="Enter your username or email"
                                                className="pl-10 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                                                value={identity}
                                                onChange={(e) => setIdentity(e.target.value)}
                                                autoFocus
                                                required
                                                disabled={resetBusy}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400">
                                            Must match the username or email registered in the system.
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={resetBusy || !identity.trim()}
                                        className="w-full h-12 rounded-xl font-semibold text-[15px] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
                                        style={{ background: 'linear-gradient(135deg, hsl(199,89%,40%) 0%, hsl(199,89%,54%) 100%)' }}
                                    >
                                        {resetBusy
                                            ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Sending Reset Code…</>
                                            : <><Mail className="mr-2 h-5 w-5" />Send Reset Code<ArrowRight className="ml-auto h-4 w-4 opacity-70" /></>
                                        }
                                    </Button>
                                </form>
                            )}

                            {/* ── Step 2: OTP ── */}
                            {resetStep === 'otp' && (
                                <form onSubmit={handleVerifyOtp} className="space-y-5">

                                    {/* Info alert */}
                                    <div className="flex gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3.5">
                                        <KeyRound className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Check Your Inbox</p>
                                            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                                                A 6-digit code was sent to your email. Enter it below within
                                                <strong> 15 minutes</strong>. Check your spam folder if you don't see it.
                                            </p>
                                        </div>
                                    </div>

                                    {/* OTP boxes */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            One-Time Code
                                        </Label>
                                        <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handleOtpPaste}>
                                            {otp.map((digit, idx) => (
                                                <input
                                                    key={idx}
                                                    ref={(el) => { otpRefs.current[idx] = el; }}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                                    onKeyDown={(e) => handleOtpKey(idx, e)}
                                                    disabled={resetBusy}
                                                    className={`w-12 h-16 sm:w-14 sm:h-16 text-center text-2xl font-extrabold rounded-2xl border-2 outline-none transition-all disabled:opacity-50 ${
                                                        digit
                                                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 shadow-sm shadow-sky-200 dark:shadow-sky-900/40'
                                                            : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-400 text-center">
                                            You can also paste the code directly into any box.
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={resetBusy || otp.join('').length !== 6}
                                        className="w-full h-12 rounded-xl font-semibold text-[15px] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
                                        style={{ background: 'linear-gradient(135deg, hsl(199,89%,40%) 0%, hsl(199,89%,54%) 100%)' }}
                                    >
                                        {resetBusy
                                            ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Verifying Code…</>
                                            : <><KeyRound className="mr-2 h-5 w-5" />Verify Code<ArrowRight className="ml-auto h-4 w-4 opacity-70" /></>
                                        }
                                    </Button>

                                    <div className="flex items-center justify-center gap-1 pt-1">
                                        <span className="text-sm text-slate-400">Didn't receive the code?</span>
                                        <button
                                            type="button"
                                            className="text-sm font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors underline-offset-2 hover:underline"
                                            onClick={() => { setResetStep('identity'); setOtp(['','','','','','']); }}
                                            disabled={resetBusy}
                                        >
                                            Try again
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* ── Step 3: new password ── */}
                            {resetStep === 'newpass' && (() => {
                                const strength =
                                    (newPass.length >= 8 ? 1 : 0) +
                                    (/[A-Z]/.test(newPass) ? 1 : 0) +
                                    (/[0-9]/.test(newPass) ? 1 : 0) +
                                    (/[^A-Za-z0-9]/.test(newPass) ? 1 : 0);
                                const strengthLabel = ['Too Weak', 'Weak', 'Fair', 'Strong'][strength - 1] ?? '';
                                const strengthColor = ['bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-emerald-500'][strength - 1] ?? 'bg-slate-200';
                                const match = confirmPass !== '' && newPass === confirmPass;

                                const rules = [
                                    { ok: newPass.length >= 8,             text: 'At least 8 characters' },
                                    { ok: /[A-Z]/.test(newPass),           text: 'One uppercase letter (A-Z)' },
                                    { ok: /[0-9]/.test(newPass),           text: 'One number (0-9)' },
                                    { ok: /[^A-Za-z0-9]/.test(newPass),   text: 'One special character (!@#…)' },
                                ];

                                return (
                                    <form onSubmit={handleSetPassword} className="space-y-5">

                                        {/* Security tip */}
                                        <div className="flex gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3.5">
                                            <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Choose a Strong Password</p>
                                                <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                                                    Never reuse a password from another site. A strong password mixes uppercase letters, numbers, and symbols.
                                                </p>
                                            </div>
                                        </div>

                                        {/* New password field */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                New Password
                                            </Label>
                                            <div className="relative group">
                                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                                                <Input
                                                    type={showNew ? 'text' : 'password'}
                                                    placeholder="Create a strong password"
                                                    className="pl-10 pr-11 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                                                    value={newPass}
                                                    onChange={(e) => setNewPass(e.target.value)}
                                                    autoFocus
                                                    required
                                                    disabled={resetBusy}
                                                />
                                                <button type="button" tabIndex={-1}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors focus:outline-none"
                                                    onClick={() => setShowNew((v) => !v)}>
                                                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>

                                            {/* Strength bar */}
                                            {newPass && (
                                                <div className="space-y-1.5">
                                                    <div className="flex gap-1">
                                                        {[1,2,3,4].map((i) => (
                                                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-slate-200 dark:bg-slate-700'}`} />
                                                        ))}
                                                    </div>
                                                    <p className={`text-xs font-medium ${
                                                        strength >= 4 ? 'text-emerald-600 dark:text-emerald-400' :
                                                        strength === 3 ? 'text-yellow-600 dark:text-yellow-400' :
                                                        strength === 2 ? 'text-amber-600 dark:text-amber-400' :
                                                                         'text-red-500'
                                                    }`}>{strengthLabel}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Password rules checklist */}
                                        <div className="grid grid-cols-2 gap-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                                            {rules.map((r) => (
                                                <div key={r.text} className={`flex items-center gap-1.5 text-xs transition-colors ${r.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${r.ok ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                                                        {r.ok && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                                                    </div>
                                                    {r.text}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Confirm password field */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Confirm New Password
                                            </Label>
                                            <div className="relative group">
                                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                                                <Input
                                                    type={showConfirm ? 'text' : 'password'}
                                                    placeholder="Re-enter the new password"
                                                    className={`pl-10 pr-11 h-12 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all focus:ring-2 ${
                                                        confirmPass
                                                            ? match
                                                                ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20'
                                                                : 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                                                            : 'border-slate-200 dark:border-slate-700 focus:border-sky-500 focus:ring-sky-500/20'
                                                    }`}
                                                    value={confirmPass}
                                                    onChange={(e) => setConfirmPass(e.target.value)}
                                                    required
                                                    disabled={resetBusy}
                                                />
                                                <button type="button" tabIndex={-1}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors focus:outline-none"
                                                    onClick={() => setShowConfirm((v) => !v)}>
                                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            {confirmPass && !match && (
                                                <p className="text-xs text-red-500 flex items-center gap-1">
                                                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block flex-shrink-0" />
                                                    Passwords do not match
                                                </p>
                                            )}
                                            {confirmPass && match && (
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                                                    Passwords match
                                                </p>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={resetBusy || !newPass || !confirmPass || !match || strength < 1}
                                            className="w-full h-12 rounded-xl font-semibold text-[15px] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
                                            style={{ background: 'linear-gradient(135deg, hsl(199,89%,40%) 0%, hsl(199,89%,54%) 100%)' }}
                                        >
                                            {resetBusy
                                                ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Saving New Password…</>
                                                : <><CheckCircle2 className="mr-2 h-5 w-5" />Set New Password</>
                                            }
                                        </Button>
                                    </form>
                                );
                            })()}

                            {/* ── Step 4: done ── */}
                            {resetStep === 'done' && (
                                <div className="flex flex-col items-center text-center gap-5 py-4">
                                    {/* Animated success ring */}
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-800/30 flex items-center justify-center">
                                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 rounded-full border-2 border-emerald-300 dark:border-emerald-700 animate-ping opacity-20" />
                                    </div>

                                    <div className="space-y-2">
                                        <p className="font-extrabold text-slate-900 dark:text-white text-2xl">Password Updated!</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-[320px]">
                                            Your password has been reset successfully. You can now sign in with your new credentials.
                                        </p>
                                    </div>

                                    {/* Security tips */}
                                    <div className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-left space-y-2">
                                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Security Tips</p>
                                        {[
                                            'Never share your password with anyone.',
                                            'Use a different password for each account.',
                                            'Consider using a password manager.',
                                        ].map((tip) => (
                                            <div key={tip} className="flex items-start gap-2">
                                                <ShieldCheck className="w-3.5 h-3.5 text-sky-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-xs text-slate-500 dark:text-slate-400">{tip}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        className="w-full h-12 rounded-xl font-semibold text-[15px] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
                                        style={{ background: 'linear-gradient(135deg, hsl(199,89%,40%) 0%, hsl(199,89%,54%) 100%)' }}
                                        onClick={() => setResetOpen(false)}
                                    >
                                        <LogIn className="mr-2 h-5 w-5" />Back to Sign In
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Footer ── */}
                    {resetStep !== 'done' && (
                        <div className="flex-shrink-0 border-t border-slate-100 dark:border-slate-800 px-6 sm:px-8 py-3 flex items-center gap-2 bg-slate-50/80 dark:bg-slate-900/50 backdrop-blur-sm">
                            <ShieldCheck className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                            <p className="text-[11px] text-slate-400 leading-tight">
                                This process is protected with rate limiting and encrypted OTP delivery. Your account remains secure.
                            </p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
