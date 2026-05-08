'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import { aiChat } from '@/stores/slices/ai';
import type { ChatMessage } from '@/stores/types/ai';
import { AiLoadingState } from '@/components/ai/AiLoadingState';
import { AiResponsePanel } from '@/components/ai/AiResponsePanel';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Trash2 } from 'lucide-react';

interface Turn {
    role: 'user' | 'model';
    text: string;
}

export default function AiChatPage() {
    const dispatch = useDispatch<AppDispatch>();
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<Turn[]>([]);
    const [loading, setLoading] = useState(false);
    const [debouncing, setDebouncing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    const handleSend = useCallback(async () => {
        const message = input.trim();
        if (!message || loading || debouncing) return;

        setDebouncing(true);
        setTimeout(() => setDebouncing(false), 1000);

        const userTurn: Turn = { role: 'user', text: message };
        const nextHistory = [...history, userTurn];
        setHistory(nextHistory);
        setInput('');
        setLoading(true);
        scrollToBottom();

        const historyForApi: ChatMessage[] = nextHistory.slice(0, -1).map((t) => ({
            role: t.role,
            text: t.text,
        }));

        try {
            const result = await dispatch(aiChat({ message, history: historyForApi })).unwrap();
            setHistory((h) => [...h, { role: 'model', text: result }]);
        } catch (err: any) {
            setHistory((h) => [
                ...h,
                { role: 'model', text: `❌ ${err || 'خدمة الذكاء الاصطناعي غير متاحة حالياً، حاول لاحقاً'}` },
            ]);
        } finally {
            setLoading(false);
            scrollToBottom();
        }
    }, [dispatch, input, loading, debouncing, history]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] gap-4">
            <Breadcrumb />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-sky-500 to-brand-sky-600 shadow">
                        <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">AI Chat</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Ask anything — responds in Arabic by default
                        </p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHistory([])}
                    disabled={history.length === 0}
                    className="gap-1"
                >
                    <Trash2 className="h-4 w-4" />
                    Clear Chat
                </Button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto rounded-xl border bg-slate-50 dark:bg-slate-900/50 p-4 space-y-4">
                {history.length === 0 && !loading && (
                    <div className="flex justify-start">
                        <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-white dark:bg-slate-800 border px-4 py-3 text-sm shadow-sm" dir="rtl">
                            مرحباً! أنا مساعد BEAM الذكي. يمكنني مساعدتك في تحليل البيانات والإجابة على أسئلتك حول النظام. كيف أساعدك اليوم؟
                        </div>
                    </div>
                )}

                {history.map((turn, i) => (
                    <div key={i} className={`flex ${turn.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                turn.role === 'user'
                                    ? 'rounded-tr-sm bg-violet-600 text-white'
                                    : 'rounded-tl-sm bg-white dark:bg-slate-800 border'
                            }`}
                            dir={turn.role === 'model' ? 'rtl' : 'ltr'}
                        >
                            {turn.role === 'model' ? (
                                <AiResponsePanel response={turn.text} showActions={false} />
                            ) : (
                                turn.text
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-white dark:bg-slate-800 border px-4 py-3 shadow-sm">
                            <AiLoadingState label="جاري التحليل..." />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="rounded-xl border bg-white dark:bg-slate-800 p-3 shadow-sm">
                <div className="flex gap-3 items-end">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        placeholder="Ask anything in Arabic or English... (Enter to send, Shift+Enter for new line)"
                        rows={2}
                        className="flex-1 resize-none border-0 bg-transparent focus-visible:ring-0 text-sm placeholder:text-slate-400"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="bg-violet-600 hover:bg-violet-700 text-white shrink-0"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 px-1">
                    Powered by Google Gemini 2.0 Flash · Responses in Arabic
                </p>
            </div>
        </div>
    );
}
