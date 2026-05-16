'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import api from '@/utils/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    User,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    Mail,
    KeyRound,
    CheckCircle2,
    LogIn,
    BarChart3,
    Layers,
    Globe2,
} from 'lucide-react';

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

export default function ForgotPasswordPage() {
    const [step, setStep]           = useState<ResetStep>('identity');
    const [busy, setBusy]           = useState(false);

    const [identity, setIdentity]   = useState('');
    const [userId, setUserId]       = useState('');

    const [otp, setOtp]             = useState(['', '', '', '', '', '']);
    const otpRefs                   = useRef<(HTMLInputElement | null)[]>([]);

    const [newPass, setNewPass]         = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showNew, setShowNew]         = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [resetToken, setResetToken]   = useState('');

    const stepIndex: Record<ResetStep, number> = { identity: 0, otp: 1, newpass: 2, done: 3 };
    const currentIdx = stepIndex[step];

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identity.trim()) return;
        setBusy(true);
        try {
            const res = await api.post('/authentication/forgot-password', { params: { identity: identity.trim() } });
            const body = (res.data as any)?.body;
            setUserId(body?.user_id ?? '');
            setStep('otp');
            toast.success('Reset code sent! Check your email.');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to send reset code.');
        } finally {
            setBusy(false);
        }
    };

    const handleOtpChange = (idx: number, val: string) => {
        const digit = val.replace(/\D/, '').slice(-1);
        const next  = [...otp];
        next[idx]   = digit;
        setOtp(next);
        if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
    };

    const handleOtpKey = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
        if (e.key === 'ArrowLeft'  && idx > 0) otpRefs.current[idx - 1]?.focus();
        if (e.key === 'ArrowRight' && idx < 5) otpRefs.current[idx + 1]?.focus();
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!text) return;
        e.preventDefault();
        const next = text.split('').concat(['', '', '', '', '', '']).slice(0, 6);
        setOtp(next);
        otpRefs.current[Math.min(text.length, 5)]?.focus();
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) { toast.error('Enter the full 6-digit code.'); return; }
        setBusy(true);
        try {
            const res = await api.post('/authentication/verify-otp', { params: { user_id: userId, otp: code } });
            const body = (res.data as any)?.body;
            setResetToken(body?.reset_token ?? '');
            setStep('newpass');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Invalid or expired code.');
        } finally {
            setBusy(false);
        }
    };

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass.length < 8)      { toast.error('Password must be at least 8 characters.'); return; }
        if (newPass !== confirmPass) { toast.error('Passwords do not match.'); return; }
        setBusy(true);
        try {
            await api.post('/authentication/reset-password', {
                params: { user_id: userId, reset_token: resetToken, new_password: newPass },
            });
            setStep('done');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || 'Failed to reset password.');
        } finally {
            setBusy(false);
        }
    };

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
                            <span className="text-brand-sky-100 text-xs font-medium tracking-wide">Secure Account Recovery</span>
                        </div>
                        <h1 className="text-white font-extrabold leading-[1.1] mb-4" style={{ fontSize: 'clamp(2rem, 3vw, 2.75rem)' }}>
                            Reset Your<br />
                            <span style={{ color: 'hsl(216,95%,72%)' }}>Password Securely</span>
                        </h1>
                        <p className="text-brand-sky-200 text-base leading-relaxed max-w-sm">
                            We'll verify your identity and send a one-time code to your registered email address.
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

                {/* Mobile logo */}
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

                <div className="w-full max-w-[460px]">

                    {/* Back to login */}
                    <div className="mb-6">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-brand-sky-600 dark:hover:text-brand-sky-400 transition-colors"
                        >
                            <ArrowLeft size={15} />
                            Back to Sign In
                        </Link>
                    </div>

                    {/* Header card */}
                    <div className="relative overflow-hidden rounded-2xl mb-6"
                        style={{ background: 'linear-gradient(135deg, hsl(216,85%,20%) 0%, hsl(216,100%,32%) 60%, hsl(216,95%,42%) 100%)' }}>

                        <svg className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="95%" cy="20%" r="100" fill="none" stroke="white" strokeWidth="1" />
                            <circle cx="95%" cy="20%" r="60"  fill="none" stroke="white" strokeWidth="0.8" />
                            <circle cx="5%"  cy="90%" r="80"  fill="white" fillOpacity="0.05" />
                        </svg>

                        <div className="relative px-7 pt-7 pb-6">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                                    {step === 'done'    ? <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                                    : step === 'otp'    ? <KeyRound     className="w-6 h-6 text-white" />
                                    : step === 'newpass'? <Lock         className="w-6 h-6 text-white" />
                                    :                    <Mail          className="w-6 h-6 text-white" />}
                                </div>
                                <div>
                                    <p className="text-white text-xl font-bold leading-tight">{STEP_LABELS[step]}</p>
                                    <p className="text-brand-sky-200 text-sm leading-snug mt-0.5">{STEP_DESCRIPTIONS[step]}</p>
                                </div>
                            </div>

                            {/* Step progress */}
                            {step !== 'done' && (
                                <div className="flex items-center gap-0">
                                    {(['identity', 'otp', 'newpass'] as ResetStep[]).map((s, i) => {
                                        const done   = currentIdx > i;
                                        const active = currentIdx === i;
                                        return (
                                            <React.Fragment key={s}>
                                                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                                                        done   ? 'bg-emerald-400 border-emerald-400 text-white' :
                                                        active ? 'bg-white border-white text-brand-sky-700' :
                                                                 'bg-white/10 border-white/30 text-white/50'
                                                    }`}>
                                                        {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                                    </div>
                                                    <span className={`text-[10px] font-medium whitespace-nowrap ${
                                                        done || active ? 'text-brand-sky-100' : 'text-white/40'
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
                            )}
                        </div>
                    </div>

                    {/* Form body */}
                    <div className="space-y-5">

                        {/* ── Step 1: identity ── */}
                        {step === 'identity' && (
                            <form onSubmit={handleSendOtp} className="space-y-5">

                                <div className="flex gap-3 bg-brand-sky-50 dark:bg-brand-sky-900/20 border border-brand-sky-200 dark:border-brand-sky-800 rounded-xl px-4 py-3.5">
                                    <ShieldCheck className="w-5 h-5 text-brand-sky-500 flex-shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-semibold text-brand-sky-800 dark:text-brand-sky-300">Secure Recovery Process</p>
                                        <p className="text-xs text-brand-sky-600 dark:text-brand-sky-400 leading-relaxed">
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
                                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-sky-500 transition-colors" />
                                        <Input
                                            type="text"
                                            placeholder="Enter your username or email"
                                            className="pl-10 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-500/20 transition-all"
                                            value={identity}
                                            onChange={(e) => setIdentity(e.target.value)}
                                            autoFocus
                                            required
                                            disabled={busy}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        Must match the username or email registered in the system.
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={busy || !identity.trim()}
                                    className="w-full h-12 rounded-xl font-semibold text-[15px] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg, hsl(216,100%,36%) 0%, hsl(216,90%,48%) 100%)' }}
                                >
                                    {busy
                                        ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Sending Reset Code…</>
                                        : <><Mail className="mr-2 h-5 w-5" />Send Reset Code<ArrowRight className="ml-auto h-4 w-4 opacity-70" /></>
                                    }
                                </Button>
                            </form>
                        )}

                        {/* ── Step 2: OTP ── */}
                        {step === 'otp' && (
                            <form onSubmit={handleVerifyOtp} className="space-y-5">

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
                                                disabled={busy}
                                                className={`w-12 h-16 sm:w-14 sm:h-16 text-center text-2xl font-extrabold rounded-2xl border-2 outline-none transition-all disabled:opacity-50 ${
                                                    digit
                                                        ? 'border-brand-sky-500 bg-brand-sky-50 dark:bg-brand-sky-900/30 text-brand-sky-700 dark:text-brand-sky-300 shadow-sm shadow-[0_2px_8px_rgba(0,88,222,0.12)] dark:shadow-none'
                                                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-sky-400 focus:ring-2 focus:ring-brand-sky-400/20'
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
                                    disabled={busy || otp.join('').length !== 6}
                                    className="w-full h-12 rounded-xl font-semibold text-[15px] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg, hsl(216,100%,36%) 0%, hsl(216,90%,48%) 100%)' }}
                                >
                                    {busy
                                        ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Verifying Code…</>
                                        : <><KeyRound className="mr-2 h-5 w-5" />Verify Code<ArrowRight className="ml-auto h-4 w-4 opacity-70" /></>
                                    }
                                </Button>

                                <div className="flex items-center justify-center gap-1 pt-1">
                                    <span className="text-sm text-slate-400">Didn't receive the code?</span>
                                    <button
                                        type="button"
                                        className="text-sm font-semibold text-brand-sky-600 hover:text-brand-sky-700 dark:text-brand-sky-400 dark:hover:text-brand-sky-300 transition-colors underline-offset-2 hover:underline"
                                        onClick={() => { setStep('identity'); setOtp(['','','','','','']); }}
                                        disabled={busy}
                                    >
                                        Try again
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ── Step 3: new password ── */}
                        {step === 'newpass' && (() => {
                            const strength =
                                (newPass.length >= 8 ? 1 : 0) +
                                (/[A-Z]/.test(newPass) ? 1 : 0) +
                                (/[0-9]/.test(newPass) ? 1 : 0) +
                                (/[^A-Za-z0-9]/.test(newPass) ? 1 : 0);
                            const strengthLabel = ['Too Weak', 'Weak', 'Fair', 'Strong'][strength - 1] ?? '';
                            const strengthColor = ['bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-emerald-500'][strength - 1] ?? 'bg-slate-200';
                            const match = confirmPass !== '' && newPass === confirmPass;

                            const rules = [
                                { ok: newPass.length >= 8,           text: 'At least 8 characters' },
                                { ok: /[A-Z]/.test(newPass),         text: 'One uppercase letter (A-Z)' },
                                { ok: /[0-9]/.test(newPass),         text: 'One number (0-9)' },
                                { ok: /[^A-Za-z0-9]/.test(newPass), text: 'One special character (!@#…)' },
                            ];

                            return (
                                <form onSubmit={handleSetPassword} className="space-y-5">

                                    <div className="flex gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3.5">
                                        <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Choose a Strong Password</p>
                                            <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                                                Never reuse a password from another site. A strong password mixes uppercase letters, numbers, and symbols.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            New Password
                                        </Label>
                                        <div className="relative group">
                                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-sky-500 transition-colors" />
                                            <Input
                                                type={showNew ? 'text' : 'password'}
                                                placeholder="Create a strong password"
                                                className="pl-10 pr-11 h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-500/20 transition-all"
                                                value={newPass}
                                                onChange={(e) => setNewPass(e.target.value)}
                                                autoFocus
                                                required
                                                disabled={busy}
                                            />
                                            <button type="button" tabIndex={-1}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-sky-500 transition-colors focus:outline-none"
                                                onClick={() => setShowNew((v) => !v)}>
                                                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>

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

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Confirm New Password
                                        </Label>
                                        <div className="relative group">
                                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-sky-500 transition-colors" />
                                            <Input
                                                type={showConfirm ? 'text' : 'password'}
                                                placeholder="Re-enter the new password"
                                                className={`pl-10 pr-11 h-12 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all focus:ring-2 ${
                                                    confirmPass
                                                        ? match
                                                            ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20'
                                                            : 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                                                        : 'border-slate-200 dark:border-slate-700 focus:border-brand-sky-500 focus:ring-brand-sky-500/20'
                                                }`}
                                                value={confirmPass}
                                                onChange={(e) => setConfirmPass(e.target.value)}
                                                required
                                                disabled={busy}
                                            />
                                            <button type="button" tabIndex={-1}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-sky-500 transition-colors focus:outline-none"
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
                                        disabled={busy || !newPass || !confirmPass || !match || strength < 1}
                                        className="w-full h-12 rounded-xl font-semibold text-[15px] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
                                        style={{ background: 'linear-gradient(135deg, hsl(216,100%,36%) 0%, hsl(216,90%,48%) 100%)' }}
                                    >
                                        {busy
                                            ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Saving New Password…</>
                                            : <><CheckCircle2 className="mr-2 h-5 w-5" />Set New Password</>
                                        }
                                    </Button>
                                </form>
                            );
                        })()}

                        {/* ── Step 4: done ── */}
                        {step === 'done' && (
                            <div className="flex flex-col items-center text-center gap-5 py-4">
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

                                <div className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-left space-y-2">
                                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Security Tips</p>
                                    {[
                                        'Never share your password with anyone.',
                                        'Use a different password for each account.',
                                        'Consider using a password manager.',
                                    ].map((tip) => (
                                        <div key={tip} className="flex items-start gap-2">
                                            <ShieldCheck className="w-3.5 h-3.5 text-brand-sky-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{tip}</span>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href="/login"
                                    className="w-full h-12 rounded-xl font-semibold text-[15px] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, hsl(216,100%,36%) 0%, hsl(216,90%,48%) 100%)' }}
                                >
                                    <LogIn className="h-5 w-5" />
                                    Back to Sign In
                                </Link>
                            </div>
                        )}

                        {/* Footer security note */}
                        {step !== 'done' && (
                            <div className="flex items-center gap-2 pt-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-brand-sky-500 flex-shrink-0" />
                                <p className="text-[11px] text-slate-400 leading-tight">
                                    This process is protected with rate limiting and encrypted OTP delivery. Your account remains secure.
                                </p>
                            </div>
                        )}

                    </div>

                    <div className="lg:hidden text-center mt-8">
                        <p className="text-xs text-slate-400">
                            © {new Date().getFullYear()} Shuaa Al-Ranou. All rights reserved.
                        </p>
                    </div>
                </div>
            </main>

        </div>
    );
}
