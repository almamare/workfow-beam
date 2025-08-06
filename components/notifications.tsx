'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from '@/utils/axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Loader2, Check, X, Trash2 } from 'lucide-react';

/* ========================= Types ========================= */
export type NotificationItem = {
    id: string;
    titel?: string; // backend typo
    title?: string;
    message: string;
    notification_type?: string;
    is_read: 0 | 1 | boolean;
    created_at: string;
};

export type NotificationCounts = { read: number; unread: number };

export type NotificationsMenuProps = {
    /** GET endpoint that returns body.notifications.{unread,read} */
    fetchUrl?: string; // default: /notifications/fetch
    /** PUT endpoint to mark single read: /notifications/mark-read/:id */
    markReadUrl?: (id: string) => string;
    /** PUT endpoint to mark single unread: /notifications/mark-unread/:id */
    markUnreadUrl?: (id: string) => string;
    /** PUT endpoint to mark all as read */
    markAllReadUrl?: string; // default: /notifications/mark-all-read
    /** DELETE endpoint to delete single: /notifications/delete/:id */
    deleteUrl?: (id: string) => string;
    /** Navigate to all notifications page */
    onOpenAll?: () => void;
    /** Max number to show inside the badge (e.g., 99+) */
    badgeCap?: number;
    /** Fired whenever counts change */
    onCountsChange?: (c: NotificationCounts) => void;
    /** Start tab: 'all' | 'unread' | 'read' */
    initialTab?: 'all' | 'unread' | 'read';
};

/* ========================= Component ========================= */
const NotificationsMenu: React.FC<NotificationsMenuProps> = ({
    fetchUrl = '/notifications/fetch',
    markReadUrl = (id) => `/notifications/mark-read/${id}`,
    markUnreadUrl = (id) => `/notifications/mark-unread/${id}`,
    markAllReadUrl = '/notifications/mark-all-read',
    deleteUrl = (id) => `/notifications/delete/${id}`,
    onOpenAll,
    badgeCap = 99,
    onCountsChange,
    initialTab = 'all',
}) => {
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [counts, setCounts] = useState<NotificationCounts>({ read: 0, unread: 0 });
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<'all' | 'unread' | 'read'>(initialTab);

    /* ------------- Fetch ------------- */
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const res = await axios.get(fetchUrl);

                // Expected shape:
                // data.body.notifications.unread = { total, items[] }
                // data.body.notifications.read   = { total, items[] }
                const unreadNode = res?.data?.body?.notifications?.unread;
                const readNode = res?.data?.body?.notifications?.read;

                const unreadItems: NotificationItem[] = Array.isArray(unreadNode?.items) ? unreadNode.items : [];
                const readItems: NotificationItem[] = Array.isArray(readNode?.items) ? readNode.items : [];

                // Normalize fields
                const normalized = [...unreadItems, ...readItems].map((n) => ({
                    ...n,
                    title: n.title ?? n.titel ?? 'Notification',
                    is_read: !!n.is_read,
                }));

                setItems(normalized);
                const nextCounts = {
                    unread: Number(unreadNode?.total) || unreadItems.length,
                    read: Number(readNode?.total) || readItems.length,
                };
                setCounts(nextCounts);
                onCountsChange?.(nextCounts);
            } catch {
                // Optional: toast error
            } finally {
                setLoading(false);
            }
        })();
    }, [fetchUrl, onCountsChange]);

    /* ------------- Filters ------------- */
    const filtered = useMemo(() => {
        if (loading) return [];
        if (tab === 'unread') return items.filter((i) => !i.is_read);
        if (tab === 'read') return items.filter((i) => i.is_read);
        return items;
    }, [items, tab, loading]);

    const unreadBadge = counts.unread;

    /* ------------- Actions ------------- */
    const markRead = async (id: string) => {
        try {
            await axios.put(markReadUrl(id));
            setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
            const next = { unread: Math.max(0, counts.unread - 1), read: counts.read + 1 };
            setCounts(next); onCountsChange?.(next);
        } catch { }
    };

    const markUnread = async (id: string) => {
        try {
            await axios.put(markUnreadUrl(id));
            setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)));
            const next = { unread: counts.unread + 1, read: Math.max(0, counts.read - 1) };
            setCounts(next); onCountsChange?.(next);
        } catch { }
    };

    const deleteOne = async (id: string) => {
        try {
            // capture read state before removal
            const target = items.find((n) => n.id === id);
            await axios.delete(deleteUrl(id));
            setItems((prev) => prev.filter((n) => n.id !== id));
            if (target) {
                const next = {
                    unread: !target.is_read ? Math.max(0, counts.unread - 1) : counts.unread,
                    read: target.is_read ? Math.max(0, counts.read - 1) : counts.read,
                };
                setCounts(next); onCountsChange?.(next);
            }
        } catch { }
    };

    const markAllRead = async () => {
        try {
            await axios.put(markAllReadUrl);
            setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
            const next = { read: counts.read + counts.unread, unread: 0 };
            setCounts(next); onCountsChange?.(next);
        } catch { }
    };

    /* ========================= Render ========================= */
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                    <Bell className="h-4 w-4" />
                    {unreadBadge > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-[10px] justify-center rounded-full">
                            {unreadBadge > badgeCap ? `${badgeCap}+` : unreadBadge}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[360px] p-0">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">Notifications</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={markAllRead} className="h-7">
                        Mark all as read
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-2">
                    {(['all', 'unread', 'read'] as const).map((t) => (
                        <Button
                            key={t}
                            variant={tab === t ? 'default' : 'outline'}
                            size="sm"
                            className="h-7 capitalize"
                            onClick={() => setTab(t)}
                        >
                            {t}
                        </Button>
                    ))}
                </div>

                {/* List */}
                <div className="max-h-[360px] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-10 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading…
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-10 text-center text-muted-foreground text-sm">
                            No notifications to show
                        </div>
                    ) : (
                        filtered.map((n) => (
                            <div key={n.id} className="px-3 py-2 border-t hover:bg-muted/40 transition-colors">
                                <div className="flex items-start gap-2">
                                    {/* Unread dot */}
                                    <span
                                        className={`mt-1 h-2 w-2 rounded-full ${n.is_read ? 'bg-muted-foreground/30' : 'bg-primary'
                                            }`}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={`font-medium truncate ${n.is_read ? 'opacity-80' : ''}`}>
                                                {n.title || n.titel || 'Notification'}
                                            </p>
                                            <span className="text-[11px] text-muted-foreground shrink-0">
                                                {timeAgo(n.created_at)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                            {n.message}
                                        </p>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-2">
                                            {n.is_read ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7"
                                                    onClick={() => markUnread(n.id)}
                                                >
                                                    <X className="h-3.5 w-3.5 mr-1" />
                                                    Mark unread
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7"
                                                    onClick={() => markRead(n.id)}
                                                >
                                                    <Check className="h-3.5 w-3.5 mr-1" />
                                                    Mark read
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-red-600"
                                                onClick={() => deleteOne(n.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="px-3 py-2 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => onOpenAll?.()}
                    >
                        View all notifications
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default React.memo(NotificationsMenu);

/* ========================= Utils ========================= */
function timeAgo(dateString: string) {
    const d = new Date(dateString);
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const days = Math.floor(h / 24);
    if (days < 30) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
}
