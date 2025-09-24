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
import ClientOnly from '@/components/ui/client-only';

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
    Activity,
    Clock,
    Globe,
    HelpCircle,
    Shield,
    TrendingUp,
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
    const dispatch = useDispatch();
    const router = useRouter();
    const user = useSelector((state: RootState) => state.login.user);

    const handleLogout = () => {
        dispatch(logout());
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 border-b border-slate-300 shadow-sm">
            <div className="flex flex-col">
                {/* Top row */}
                <div className="flex h-18 items-center justify-between px-4">
                    {/* Sidebar toggle (mobile) + logo */}
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 lg:hidden hover:bg-slate-100 rounded-lg"
                            onClick={onToggleSidebar}
                        >
                            <Menu className="h-5 w-5 text-slate-600" />
                        </Button>

                        <div className="flex items-center gap-2 lg:hidden">
                            <div className="relative">
                                <Image
                                    src="https://cdn.shuarano.com/img/logo.png"
                                    alt="Shuaa Al-Ranou logo"
                                    width={28}
                                    height={36}
                                    priority
                                    className="shrink-0"
                                    style={{ width: "28px", height: "36px" }}
                                />
                            </div>
                            <div className="leading-tight">
                                <span className="block text-sm font-semibold tracking-wide text-slate-800">
                                    Shuaa Al-Ranou
                                </span>
                                <span className="block text-xs text-slate-500 font-medium">
                                    Trade & General Contracting
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Center search (desktop) */}
                    <div className="hidden lg:flex items-center gap-4 flex-1 max-w-2xl mx-auto">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <Input 
                                placeholder="Search projects, tasks, users..." 
                                className="pl-12 pr-4 py-3 bg-slate-50/50 border-slate-200 rounded-xl focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all duration-300" 
                            />
                        </div>
                        <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </Button>
                    </div>

                    {/* Right icons */}
                    <div className="flex items-center gap-2">
                        {/* Mobile search toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 lg:hidden hover:bg-slate-100 rounded-lg"
                            onClick={() => setShowSearch(!showSearch)}
                        >
                            <Search className="h-5 w-5 text-slate-600" />
                        </Button>

                        {/* System Status */}
                        <div className="hidden md:flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-green-700">Online</span>
                        </div>

                        {/* Theme toggle */}
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={toggleTheme} 
                            className="h-10 w-10 p-0 hover:bg-slate-100 rounded-lg transition-all duration-300"
                        >
                            {theme === 'light' ? (
                                <Moon className="h-5 w-5 text-slate-600" />
                            ) : (
                                <Sun className="h-5 w-5 text-yellow-500" />
                            )}
                        </Button>

                        {/* Notifications menu (PRO) */}
                        <NotificationsMenu onOpenAll={() => router.push('/notifications')}  />

                        {/* User menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-10 w-auto p-2 hover:bg-slate-100 rounded-lg transition-all duration-300">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 ring-2 ring-orange-200">
                                            <AvatarImage src={user?.avatar} />
                                            <AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold">
                                                <ClientOnly fallback="U">
                                                    {`${user?.name?.[0] ?? ''}${user?.surname?.[0] ?? ''}`}
                                                </ClientOnly>
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-semibold text-slate-800">
                                                <ClientOnly fallback="User">
                                                    {`${user?.name ?? ''} ${user?.surname ?? ''}`}
                                                </ClientOnly>
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                <ClientOnly fallback="Loading...">
                                                    {user?.role ?? 'Role'}
                                                </ClientOnly>
                                            </p>
                                        </div>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-72 p-4">
                                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg mb-3">
                                    <Avatar className="h-12 w-12 ring-2 ring-orange-200">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold">
                                            <ClientOnly fallback="U">
                                                {`${user?.name?.[0] ?? ''}${user?.surname?.[0] ?? ''}`}
                                            </ClientOnly>
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col space-y-1">
                                        <p className="font-semibold text-slate-800">
                                            <ClientOnly fallback="User">
                                                {`${user?.name ?? ''} ${user?.surname ?? ''}`}
                                            </ClientOnly>
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            <ClientOnly fallback="Loading...">
                                                {`${user?.role ?? 'Role'} - ${user?.number ?? 'N/A'}`}
                                            </ClientOnly>
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-xs text-green-600 font-medium">Online</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <Button 
                                        variant="ghost" 
                                        className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-orange-50"
                                        onClick={() => router.push('/profile')}
                                    >
                                        <User className="h-5 w-5 text-orange-600" />
                                        <span className="text-sm font-medium">Profile</span>
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-orange-50"
                                        onClick={() => router.push('/settings')}
                                    >
                                        <Settings className="h-5 w-5 text-orange-600" />
                                        <span className="text-sm font-medium">Settings</span>
                                    </Button>
                                </div>
                                
                                <DropdownMenuSeparator className="my-3" />
                                
                                <div className="space-y-1">
                                    <DropdownMenuItem 
                                        onClick={() => router.push('/profile')}
                                        className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer"
                                    >
                                        <User className="mr-3 h-4 w-4 text-slate-500" />
                                        <div>
                                            <p className="font-medium">My Profile</p>
                                            <p className="text-xs text-slate-500">View and edit profile</p>
                                        </div>
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem 
                                        onClick={() => router.push('/settings')}
                                        className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer"
                                    >
                                        <Settings className="mr-3 h-4 w-4 text-slate-500" />
                                        <div>
                                            <p className="font-medium">Settings</p>
                                            <p className="text-xs text-slate-500">Account preferences</p>
                                        </div>
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem 
                                        onClick={() => router.push('/help')}
                                        className="p-3 rounded-lg hover:bg-slate-50 cursor-pointer"
                                    >
                                        <HelpCircle className="mr-3 h-4 w-4 text-slate-500" />
                                        <div>
                                            <p className="font-medium">Help & Support</p>
                                            <p className="text-xs text-slate-500">Get help and support</p>
                                        </div>
                                    </DropdownMenuItem>
                                </div>
                                
                                <DropdownMenuSeparator className="my-3" />
                                
                                <DropdownMenuItem 
                                    onClick={handleLogout}
                                    className="p-3 rounded-lg hover:bg-red-50 cursor-pointer text-red-600"
                                >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    <div>
                                        <p className="font-medium">Sign Out</p>
                                        <p className="text-xs text-red-500">Logout from your account</p>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Mobile search bar */}
                {showSearch && (
                    <div className="p-4 border-t border-slate-200 bg-slate-50/50 lg:hidden">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <Input 
                                placeholder="Search projects, tasks, users..." 
                                className="pl-12 pr-4 py-3 bg-white border-slate-200 rounded-xl focus:border-orange-300 focus:ring-2 focus:ring-orange-100 w-full" 
                            />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}