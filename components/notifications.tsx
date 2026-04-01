'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from '@/utils/axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Bell, Loader2, Check, X, Trash2, ExternalLink, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { resolveNotificationActionLink, withAppBasePath } from '@/utils/notificationNavigation';

/* ========================= Types ========================= */
export type NotificationItem = {
    id: string;
    user_id?: string;
    title?: string;
    message: string;
    action_link?: string | null;
    notification_type?: string;
    role?: string;
    is_read: 0 | 1 | boolean;
    created_at: string;
};

export type NotificationCounts = { read: number; unread: number };

export type NotificationsMenuProps = {
    fetchUrl?: string;
    markReadUrl?: (id: string) => string;
    markUnreadUrl?: (id: string) => string;
    markAllReadUrl?: string;
    deleteUrl?: (id: string) => string;
    onOpenAll?: () => void;
    badgeCap?: number;
    onCountsChange?: (c: NotificationCounts) => void;
    initialTab?: 'all' | 'unread' | 'read';
};

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
    const router = useRouter();
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [counts, setCounts] = useState<NotificationCounts>({ read: 0, unread: 0 });
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [tab, setTab] = useState<'all' | 'unread' | 'read'>(initialTab);
    const [detailItem, setDetailItem] = useState<NotificationItem | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setFetchError(null);
            try {
                const res = await axios.get(fetchUrl);
                const header = res?.data?.header;
                if (header && header.success === false) {
                    const msg =
                        header?.messages?.[0]?.message ||
                        header?.message ||
                        'Failed to fetch notifications';
                    if (!cancelled) {
                        setFetchError(msg);
                        setItems([]);
                    }
                    return;
                }

                const unreadNode = res?.data?.body?.notifications?.unread;
                const readNode = res?.data?.body?.notifications?.read;

                const unreadItems: NotificationItem[] = Array.isArray(unreadNode?.items) ? unreadNode.items : [];
                const readItems: NotificationItem[] = Array.isArray(readNode?.items) ? readNode.items : [];

                const normalized = [...unreadItems, ...readItems].map((n) => ({
                    ...n,
                    title: n.title ?? 'Notification',
                    is_read: !!n.is_read,
                    action_link: n.action_link === undefined ? null : n.action_link,
                }));

                if (!cancelled) {
                    setItems(normalized);
                    const nextCounts = {
                        unread: Number(unreadNode?.total) || unreadItems.length,
                        read: Number(readNode?.total) || readItems.length,
                    };
                    setCounts(nextCounts);
                    onCountsChange?.(nextCounts);
                }
            } catch (err: any) {
                const msg =
                    err?.response?.data?.header?.messages?.[0]?.message ||
                    err?.response?.data?.header?.message ||
                    err?.message ||
                    'Failed to load notifications';
                if (!cancelled) {
                    setFetchError(msg);
                    setItems([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [fetchUrl, onCountsChange]);

    const filtered = useMemo(() => {
        if (loading) return [];
        if (tab === 'unread') return items.filter((i) => !i.is_read);
        if (tab === 'read') return items.filter((i) => i.is_read);
        return items;
    }, [items, tab, loading]);

    const unreadBadge = counts.unread;

    const markReadApi = async (id: string) => {
        const res = await axios.put(markReadUrl(id));
        const header = res?.data?.header;
        if (header && header.success === false) {
            const msg = header?.messages?.[0]?.message || header?.message || 'Failed to mark as read';
            throw new Error(msg);
        }
    };

    const markRead = async (id: string) => {
        try {
            await markReadApi(id);
            setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
            setCounts((prev) => {
                const next = { unread: Math.max(0, prev.unread - 1), read: prev.read + 1 };
                onCountsChange?.(next);
                return next;
            });
        } catch (e: any) {
            toast.error(e?.message || 'Failed to mark as read');
        }
    };

    const markUnread = async (id: string) => {
        try {
            const res = await axios.put(markUnreadUrl(id));
            const header = res?.data?.header;
            if (header && header.success === false) {
                toast.error(header?.messages?.[0]?.message || 'Failed to mark as unread');
                return;
            }
            setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: false } : n)));
            setCounts((prev) => {
                const next = { unread: prev.unread + 1, read: Math.max(0, prev.read - 1) };
                onCountsChange?.(next);
                return next;
            });
        } catch (e: any) {
            toast.error(e?.response?.data?.header?.messages?.[0]?.message || 'Failed to mark as unread');
        }
    };

    const deleteOne = async (id: string) => {
        try {
            const target = items.find((n) => n.id === id);
            const res = await axios.delete(deleteUrl(id));
            const header = res?.data?.header;
            if (header && header.success === false) {
                toast.error(header?.messages?.[0]?.message || 'Failed to delete');
                return;
            }
            setItems((prev) => prev.filter((n) => n.id !== id));
            if (target) {
                setCounts((prev) => {
                    const next = {
                        unread: !target.is_read ? Math.max(0, prev.unread - 1) : prev.unread,
                        read: target.is_read ? Math.max(0, prev.read - 1) : prev.read,
                    };
                    onCountsChange?.(next);
                    return next;
                });
            }
        } catch (e: any) {
            toast.error(e?.response?.data?.header?.messages?.[0]?.message || 'Failed to delete');
        }
    };

    const markAllRead = async () => {
        try {
            const res = await axios.put(markAllReadUrl);
            const header = res?.data?.header;
            if (header && header.success === false) {
                toast.error(header?.messages?.[0]?.message || 'Failed to mark all as read');
                return;
            }
            setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setCounts((prev) => {
                const next = { read: prev.read + prev.unread, unread: 0 };
                onCountsChange?.(next);
                return next;
            });
        } catch (e: any) {
            toast.error(e?.response?.data?.header?.messages?.[0]?.message || 'Failed to mark all as read');
        }
    };

    const openNotification = useCallback(
        async (n: NotificationItem) => {
            const link = n.action_link;
            const hasLink = typeof link === 'string' && link.trim().length > 0;

            if (!hasLink) {
                setDetailItem(n);
                if (!n.is_read) {
                    try {
                        await markReadApi(n.id);
                        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
                        setCounts((prev) => {
                            const next = { unread: Math.max(0, prev.unread - 1), read: prev.read + 1 };
                            onCountsChange?.(next);
                            return next;
                        });
                    } catch {
                        /* ignore mark-read errors in modal path */
                    }
                }
                return;
            }

            const resolved = resolveNotificationActionLink(link);
            if (!resolved) {
                setDetailItem(n);
                return;
            }

            if (resolved.kind === 'external') {
                if (!n.is_read) {
                    markRead(n.id).catch(() => {});
                }
                window.open(resolved.href, '_blank', 'noopener,noreferrer');
                return;
            }

            router.push(withAppBasePath(resolved.href));
            if (!n.is_read) {
                try {
                    await markReadApi(n.id);
                    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
                    setCounts((prev) => {
                        const next = { unread: Math.max(0, prev.unread - 1), read: prev.read + 1 };
                        onCountsChange?.(next);
                        return next;
                    });
                } catch (e: any) {
                    toast.error(e?.message || 'Failed to mark as read');
                }
            }
        },
        [onCountsChange, router]
    );

    return (
        <>
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

                <DropdownMenuContent align="end" className="w-[360px] p-0" onCloseAutoFocus={(e) => e.preventDefault()}>
                    <div className="flex items-center justify-between px-3 py-2 border-b">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">Notifications</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={markAllRead} className="h-7">
                            Mark all as read
                        </Button>
                    </div>

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

                    <div className="max-h-[360px] overflow-y-auto">
                        {fetchError && (
                            <div className="px-3 py-4 text-center text-sm text-red-600 dark:text-red-400">{fetchError}</div>
                        )}
                        {loading ? (
                            <div className="flex items-center justify-center py-10 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Loading…
                            </div>
                        ) : filtered.length === 0 && !fetchError ? (
                            null
                        ) : (
                            filtered.map((n) => (
                                <div
                                    key={n.id}
                                    role="button"
                                    tabIndex={0}
                                    className="px-3 py-2 border-t hover:bg-muted/40 transition-colors cursor-pointer text-left w-full"
                                    onClick={() => openNotification(n)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            openNotification(n);
                                        }
                                    }}
                                >
                                    <div className="flex items-start gap-2">
                                        <span
                                            className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                                                n.is_read ? 'bg-muted-foreground/30' : 'bg-primary'
                                            }`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`font-medium truncate ${n.is_read ? 'opacity-80' : ''}`}>
                                                    {n.title || 'Notification'}
                                                </p>
                                                <span className="text-[11px] text-muted-foreground shrink-0">
                                                    {timeAgo(n.created_at)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <TypeBadge type={n.notification_type} />
                                                {n.action_link && (
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1">
                                                        <ExternalLink className="h-3 w-3 mr-0.5" />
                                                        Open
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>

                                            <div
                                                className="flex items-center gap-2 mt-2"
                                                onClick={(e) => e.stopPropagation()}
                                            >
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

                    <div className="px-3 py-2 border-t">
                        <Button variant="outline" size="sm" className="w-full" onClick={() => onOpenAll?.()}>
                            View all notifications
                        </Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={!!detailItem} onOpenChange={(open) => !open && setDetailItem(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{detailItem?.title || 'Notification'}</DialogTitle>
                        <DialogDescription className="text-left whitespace-pre-wrap break-words">
                            {detailItem?.message}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailItem(null)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

function TypeBadge({ type }: { type?: string }) {
    const t = (type || 'Information').toLowerCase();
    const map: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
        information: {
            label: 'Information',
            className: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 border-blue-200',
            icon: <Info className="h-3 w-3" />,
        },
        warning: {
            label: 'Warning',
            className: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 border-amber-200',
            icon: <AlertTriangle className="h-3 w-3" />,
        },
        alert: {
            label: 'Alert',
            className: 'bg-red-50 dark:bg-red-900/30 text-red-700 border-red-200',
            icon: <XCircle className="h-3 w-3" />,
        },
        success: {
            label: 'Success',
            className: 'bg-green-50 dark:bg-green-900/30 text-green-700 border-green-200',
            icon: <CheckCircle2 className="h-3 w-3" />,
        },
    };
    const cfg = map[t] || map.information;
    return (
        <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${cfg.className}`}>
            {cfg.icon}
            <span className="ml-1">{type || cfg.label}</span>
        </Badge>
    );
}

export default React.memo(NotificationsMenu);

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
