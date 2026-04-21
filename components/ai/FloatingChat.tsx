'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import { aiChat } from '@/stores/slices/ai';
import type { ChatMessage } from '@/stores/types/ai';
import { AiLoadingState } from './AiLoadingState';
import { AiResponsePanel } from './AiResponsePanel';
import { Button } from '@/components/ui/button';
import { Bot, X, Send, Trash2, RefreshCw, AlertCircle } from 'lucide-react';

interface Turn {
    role: 'user' | 'model';
    text: string;
    isError?: boolean;
}

const HIDDEN_CHAT_PREFIXES = ['/legal/'];

function isChatHiddenPath(pathname: string): boolean {
    if (pathname === '/login' || pathname === '/change-password') return true;
    return HIDDEN_CHAT_PREFIXES.some((p) => pathname.startsWith(p));
}

export function FloatingChat() {
    const pathname = usePathname();
    const dispatch = useDispatch<AppDispatch>();

    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<Turn[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastUserMessage, setLastUserMessage] = useState('');
    const debounceRef = useRef(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, loading]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 100);
    }, [open]);

    const handleClose = () => {
        setOpen(false);
        try { sessionStorage.setItem('beam_ai_chat_history', JSON.stringify(history)); } catch {}
    };

    const handleOpen = () => {
        setOpen(true);
        try {
            const saved = sessionStorage.getItem('beam_ai_chat_history');
            if (saved) setHistory(JSON.parse(saved));
        } catch {}
    };

    const handleClear = () => {
        setHistory([]);
        setLastUserMessage('');
        try { sessionStorage.removeItem('beam_ai_chat_history'); } catch {}
    };

    const sendMessage = useCallback(async (message: string, currentHistory: Turn[]) => {
        if (!message || loading) return;
        if (debounceRef.current) return;
        debounceRef.current = true;
        setTimeout(() => { debounceRef.current = false; }, 1000);

        setLastUserMessage(message);
        setLoading(true);

        const historyForApi: ChatMessage[] = currentHistory
            .filter((t) => !t.isError)
            .map((t) => ({ role: t.role, text: t.text }));

        try {
            const result = await dispatch(aiChat({ message, history: historyForApi })).unwrap();
            setHistory((h) => [...h, { role: 'model', text: result }]);
        } catch (err: any) {
            const errMsg = typeof err === 'string' ? err : 'خدمة الذكاء الاصطناعي غير متاحة حالياً، حاول مرة أخرى';
            setHistory((h) => [...h, { role: 'model', text: errMsg, isError: true }]);
        } finally {
            setLoading(false);
        }
    }, [dispatch, loading]);

    const handleSend = useCallback(() => {
        const message = input.trim();
        if (!message || loading) return;
        const userTurn: Turn = { role: 'user', text: message };
        const nextHistory = [...history, userTurn];
        setHistory(nextHistory);
        setInput('');
        sendMessage(message, history);
    }, [input, loading, history, sendMessage]);

    const handleRetry = useCallback(() => {
        if (!lastUserMessage || loading) return;
        // Remove the last error turn
        setHistory((h) => h.filter((t) => !t.isError));
        sendMessage(lastUserMessage, history.filter((t) => !t.isError));
    }, [lastUserMessage, loading, history, sendMessage]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const lastTurnIsError = history.length > 0 && history[history.length - 1].isError;

    if (isChatHiddenPath(pathname)) {
        return null;
    }

    return (
        <>
            {/* Floating trigger button */}
            {!open && (
                <button
                    onClick={handleOpen}
                    className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all"
                    aria-label="مساعد BEAM الذكي"
                >
                    <Bot className="h-6 w-6" />
                </button>
            )}

            {/* Chat panel */}
            {open && (
                <div
                    dir="rtl"
                    className="fixed bottom-6 left-6 z-50 flex w-[360px] max-w-[calc(100vw-24px)] flex-col rounded-2xl border bg-background shadow-2xl"
                    style={{ height: '520px' }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between rounded-t-2xl bg-primary px-4 py-3">
                        <div className="flex items-center gap-2 text-primary-foreground">
                            <Bot className="h-5 w-5" />
                            <span className="font-semibold text-sm">مساعد BEAM الذكي</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleClear}
                                className="rounded p-1 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary/80 transition-colors"
                                title="مسح المحادثة"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={handleClose}
                                className="rounded p-1 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary/80 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {history.length === 0 && !loading && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-muted px-3 py-2 text-sm">
                                    مرحباً، كيف أساعدك اليوم؟
                                </div>
                            </div>
                        )}

                        {history.map((turn, i) => (
                            <div key={i} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {turn.isError ? (
                                    /* ── Error bubble ── */
                                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 space-y-2">
                                        <div className="flex items-start gap-2 text-red-700 dark:text-red-400">
                                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                            <p className="text-xs leading-relaxed">{turn.text}</p>
                                        </div>
                                        {lastUserMessage && i === history.length - 1 && (
                                            <button
                                                onClick={handleRetry}
                                                disabled={loading}
                                                className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 hover:underline disabled:opacity-50"
                                            >
                                                <RefreshCw className="h-3 w-3" />
                                                إعادة المحاولة
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    /* ── Normal bubble ── */
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                                            turn.role === 'user'
                                                ? 'rounded-tl-sm bg-primary text-primary-foreground'
                                                : 'rounded-tr-sm bg-muted'
                                        }`}
                                    >
                                        {turn.role === 'model' ? (
                                            <div className="ai-response text-xs">
                                                <AiResponsePanel
                                                    response={turn.text}
                                                    showActions={false}
                                                    className="!p-0 !bg-transparent !border-0"
                                                />
                                            </div>
                                        ) : (
                                            turn.text
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-muted px-3 py-2">
                                    <AiLoadingState label="جاري التحليل..." />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="border-t p-3">
                        <div className="flex items-end gap-2">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                placeholder="اكتب سؤالك..."
                                rows={2}
                                className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                            />
                            <Button
                                size="icon"
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="shrink-0"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
