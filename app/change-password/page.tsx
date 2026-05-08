'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/stores/store';
import { clearMustChangePassword } from '@/stores/slices/login';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Loader2, Eye, EyeOff, KeyRound, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import api from '@/utils/axios';

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword]   = useState('');
    const [newPassword, setNewPassword]           = useState('');
    const [confirmPassword, setConfirmPassword]   = useState('');
    const [showCurrent, setShowCurrent]           = useState(false);
    const [showNew, setShowNew]                   = useState(false);
    const [showConfirm, setShowConfirm]           = useState(false);
    const [loading, setLoading]                   = useState(false);

    const router   = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const strength = (() => {
        if (newPassword.length === 0) return 0;
        let s = 0;
        if (newPassword.length >= 6)  s++;
        if (newPassword.length >= 10) s++;
        if (/[A-Z]/.test(newPassword)) s++;
        if (/[0-9]/.test(newPassword)) s++;
        if (/[^A-Za-z0-9]/.test(newPassword)) s++;
        return s;
    })();

    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength] ?? '';
    const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500', 'bg-brand-sky-500'][strength] ?? '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error('New password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('New password and confirmation do not match.');
            return;
        }
        setLoading(true);
        try {
            await api.post('/authentication/change-password', {
                current_password: currentPassword,
                new_password: newPassword,
            });
            dispatch(clearMustChangePassword());
            toast.success('Password changed. Please sign in with your new password.');
            router.push('/login');
        } catch (err: any) {
            const msg =
                err.response?.data?.header?.messages?.[0]?.message ||
                err.response?.data?.message ||
                'Failed to change password. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12">

            {/* Subtle brand glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-sky-500/10 dark:bg-brand-sky-500/5 blur-3xl rounded-full pointer-events-none" />

            <div className="relative w-full max-w-[420px]">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8 gap-3">
                    <div className="rounded-2xl overflow-hidden shadow-lg ring-2 ring-brand-sky-200 dark:ring-brand-sky-800 px-3 py-2 bg-white dark:bg-slate-900">
                        <Image
                            src="/logo.png"
                            alt="Shuaa Al-Ranou"
                            width={160}
                            height={48}
                            priority
                            className="h-10 w-auto max-w-[160px] object-contain"
                        />
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-slate-800 dark:text-white text-base leading-tight">Shuaa Al-Ranou</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">Trade & General Contracting</p>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">

                    {/* Card top accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-brand-sky-500 via-brand-sky-400 to-brand-sky-600" />

                    <div className="px-6 pt-6 pb-8 space-y-6">

                        {/* Header */}
                        <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-brand-sky-100 dark:bg-brand-sky-900/40 flex items-center justify-center flex-shrink-0">
                                <KeyRound className="h-5 w-5 text-brand-sky-600 dark:text-brand-sky-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-extrabold text-slate-800 dark:text-white leading-tight">
                                    Change Password
                                </h1>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    Set a new secure password for your account
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                            {/* Current password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="current" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Current Password
                                </Label>
                                <div className="relative group">
                                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-sky-500 transition-colors" />
                                    <Input
                                        id="current"
                                        type={showCurrent ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder="Enter current password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="pl-10 pr-10 h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-500/20 transition-all"
                                    />
                                    <button type="button" tabIndex={-1}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-sky-500 transition-colors"
                                        onClick={() => setShowCurrent(v => !v)}>
                                        {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>

                            {/* New password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="new" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    New Password
                                </Label>
                                <div className="relative group">
                                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-sky-500 transition-colors" />
                                    <Input
                                        id="new"
                                        type={showNew ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="At least 6 characters"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        disabled={loading}
                                        className="pl-10 pr-10 h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-brand-sky-500 focus:ring-2 focus:ring-brand-sky-500/20 transition-all"
                                    />
                                    <button type="button" tabIndex={-1}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-sky-500 transition-colors"
                                        onClick={() => setShowNew(v => !v)}>
                                        {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {/* Strength meter */}
                                {newPassword.length > 0 && (
                                    <div className="space-y-1 pt-1">
                                        <div className="flex gap-1 h-1">
                                            {[1,2,3,4,5].map(i => (
                                                <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${i <= strength ? strengthColor : 'bg-slate-200 dark:bg-slate-700'}`} />
                                            ))}
                                        </div>
                                        <p className={`text-xs font-medium ${strength <= 1 ? 'text-red-500' : strength <= 2 ? 'text-amber-500' : strength <= 3 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                                            {strengthLabel}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm password */}
                            <div className="space-y-1.5">
                                <Label htmlFor="confirm" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Confirm New Password
                                </Label>
                                <div className="relative group">
                                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-sky-500 transition-colors" />
                                    <Input
                                        id="confirm"
                                        type={showConfirm ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="Repeat new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        className={`pl-10 pr-10 h-11 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 transition-all ${
                                            confirmPassword && confirmPassword !== newPassword
                                                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                                                : confirmPassword && confirmPassword === newPassword
                                                ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20'
                                                : 'border-slate-200 dark:border-slate-700 focus:border-brand-sky-500 focus:ring-brand-sky-500/20'
                                        }`}
                                    />
                                    <button type="button" tabIndex={-1}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-sky-500 transition-colors"
                                        onClick={() => setShowConfirm(v => !v)}>
                                        {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {confirmPassword && confirmPassword !== newPassword && (
                                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                                )}
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 rounded-xl font-semibold text-[15px] text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-150 mt-2"
                                style={{ background: loading ? undefined : 'linear-gradient(135deg, hsl(216,100%,36%) 0%, hsl(216,90%,48%) 100%)' }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Updating…
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="mr-2 h-5 w-5" />
                                        Update Password
                                        <ArrowRight className="ml-auto h-4 w-4 opacity-70" />
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Footer note */}
                        <p className="text-xs text-slate-400 dark:text-slate-500 text-center leading-relaxed">
                            After updating, you will be redirected to sign in with your new password.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
