'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/stores/store';
import { useRouter } from 'next/navigation';
import axios from '@/utils/axios';

import { useTheme } from '@/contexts/ThemeContext';
import { logout } from '@/stores/slices/login';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import NotificationsMenu from '@/components/notifications';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
    Bell,
    Search,
    Sun,
    Moon,
    User,
    Settings,
    LogOut,
    Menu,
    Check,
    X,
    Loader2,
} from 'lucide-react';

/* =========================================================
   Types
========================================================= */
type NotificationItem = {
    id: string;
    titel?: string;         // backend typo "titel"
    title?: string;         // normalized
    message: string;
    notification_type?: string;
    is_read: 0 | 1 | boolean;
    created_at: string;
};

type Counts = { read: number; unread: number };

/* =========================================================
   Navbar
========================================================= */
export function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
    const { theme, toggleTheme } = useTheme();
    const [showSearch, setShowSearch] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();
    const user = useSelector((state: RootState) => state.login.user);

    useEffect(() => setIsClient(true), []);

    const handleLogout = () => {
        dispatch(logout());
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex flex-col">
                {/* Top row */}
                <div className="flex h-16 items-center justify-between px-4">
                    {/* Sidebar toggle (mobile) + logo */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 lg:hidden"
                            onClick={onToggleSidebar}
                        >
                            <Menu className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-2 lg:hidden">
                            <Image
                                src="https://cdn.shuarano.com/img/logo.png"
                                alt="Shuaa Al-Ranou logo"
                                width={22}
                                height={30}
                                priority
                                className="shrink-0"
                            />
                            <div className="leading-tight">
                                <span className="block font-semibold text-[16px] tracking-wide">
                                    Shuaa Al-Ranou
                                </span>
                                <span className="block text-[9px] text-muted-foreground">
                                    Trade and General Contracting
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Center search (desktop) */}
                    <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md mx-auto">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Search..." className="pl-9 bg-muted/50" />
                        </div>
                    </div>

                    {/* Right icons */}
                    <div className="flex items-center gap-2">
                        {/* Mobile search toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 lg:hidden"
                            onClick={() => setShowSearch(!showSearch)}
                        >
                            <Search className="h-4 w-4" />
                        </Button>

                        {/* Theme toggle */}
                        <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-8 w-8 p-0">
                            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        </Button>

                        {/* Notifications menu (PRO) */}
                        <NotificationsMenu onOpenAll={() => router.push('/notifications')}  />

                        {/* User menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-10 w-10 p-0">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback>
                                            {isClient && `${user?.name?.[0] ?? ''}${user?.surname?.[0] ?? ''}`}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="flex items-center gap-2 p-2">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback>
                                            {isClient && `${user?.name?.[0] ?? ''}${user?.surname?.[0] ?? ''}`}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col space-y-1 leading-none">
                                        <p className="font-medium">
                                            {user?.name} {user?.surname}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {user?.role} - {user?.number}
                                        </p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push('/profile')}>
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push('/settings')}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Mobile search bar */}
                {showSearch && (
                    <div className="p-2 border-t lg:hidden">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Search..." className="pl-9 bg-muted/50 w-full" />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}


