'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/stores/store';
import { useRouter, usePathname } from 'next/navigation';
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
    Search,
    Sun,
    Moon,
    User,
    Settings,
    LogOut,
    Menu,
    HelpCircle,
} from 'lucide-react';

/* =========================================================
   Navbar
========================================================= */
export function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
    const { theme, toggleTheme } = useTheme();
    const [showSearch, setShowSearch] = useState(false);
    const dispatch = useDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const user = useSelector((state: RootState) => state.login.user);
    
    // Check if we're on dashboard page
    const isDashboard = pathname === '/dashboard';

    const handleLogout = () => {
        dispatch(logout());
        router.push('/login');
    };

    return (
        <header className="sticky top-0 z-30 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60 border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-colors duration-300">
            <div className="flex flex-col">
                {/* Top row */}
                <div className="flex h-16 md:h-18 items-center justify-between px-3 md:px-6">
                    {/* Sidebar toggle (mobile) + logo */}
                    <div className="flex items-center gap-3">
                        {!isDashboard && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200"
                                onClick={onToggleSidebar}
                            >
                                <Menu className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                            </Button>
                        )}

                        {/* Logo and company name - visible on dashboard, hidden when sidebar is visible */}
                        {isDashboard && (
                            <div className="flex items-center gap-3">
                                <div className="relative flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-sky-600/20 dark:from-sky-500/30 dark:to-sky-700/30 rounded-xl blur-sm"></div>
                                    <div className="relative">
                                        <Image
                                            src="https://cdn.shuarano.com/img/logo.png"
                                            alt="Shuaa Al-Ranou logo"
                                            width={40}
                                            height={52}
                                            priority
                                            className="shrink-0 drop-shadow-sm"
                                            style={{ width: "40px", height: "52px" }}
                                        />
                                    </div>
                                </div>
                                <div className="leading-tight">
                                    <span className="block text-base md:text-lg font-bold tracking-wide bg-gradient-to-r from-sky-600 to-sky-500 dark:from-sky-400 dark:to-sky-300 bg-clip-text text-transparent">
                                        Shuaa Al-Ranou
                                    </span>
                                    <span className="block text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">
                                        Trade & General Contracting
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Mobile logo (only shown when NOT on dashboard and on mobile) */}
                        {!isDashboard && (
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
                                    <span className="block text-sm font-semibold tracking-wide text-slate-800 dark:text-slate-200">
                                        Shuaa Al-Ranou
                                    </span>
                                    <span className="block text-xs text-slate-500 dark:text-slate-500 font-medium">
                                        Trade & General Contracting
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Center search (desktop) */}
                    <div className="hidden lg:flex items-center gap-4 flex-1 max-w-2xl mx-auto">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors" />
                            <Input 
                                placeholder="Search projects, tasks, users..." 
                                className="pl-12 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-200/50 dark:focus:ring-sky-500/30 transition-all duration-300" 
                            />
                        </div>
                        <Button className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white px-5 py-2.5 rounded-xl transition-all duration-300 font-medium">
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
                            className="h-9 w-9 p-0 lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200"
                            onClick={() => setShowSearch(!showSearch)}
                        >
                            <Search className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                        </Button>

                        {/* System Status */}
                        <div className="hidden md:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 rounded-lg px-3 py-1.5 transition-colors duration-200">
                            <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Online</span>
                        </div>

                        {/* Theme toggle */}
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={toggleTheme} 
                            className="h-9 w-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 group relative"
                            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                        >
                            {theme === 'light' ? (
                                <Moon className="h-5 w-5 text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors" />
                            ) : (
                                <Sun className="h-5 w-5 text-yellow-500 group-hover:text-sky-400 transition-colors" />
                            )}
                        </Button>

                        {/* Notifications menu */}
                        <NotificationsMenu onOpenAll={() => router.push('/notifications')}  />

                        {/* User menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    className="h-auto p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Avatar className="h-8 w-8 ring-2 ring-sky-200 dark:ring-sky-800/50 group-hover:ring-sky-400 dark:group-hover:ring-sky-600 transition-all duration-200">
                                            <AvatarImage src={user?.avatar} />
                                            <AvatarFallback className="bg-gradient-to-br from-sky-500 to-sky-600 dark:from-sky-600 dark:to-sky-700 text-white font-semibold">
                                                <ClientOnly fallback="U">
                                                    {`${user?.name?.[0] ?? ''}${user?.surname?.[0] ?? ''}`}
                                                </ClientOnly>
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="hidden md:block text-left">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 transition-colors">
                                                <ClientOnly fallback="User">
                                                    {`${user?.name ?? ''} ${user?.surname ?? ''}`}
                                                </ClientOnly>
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">
                                                <ClientOnly fallback="Loading...">
                                                    {user?.role ?? 'Role'}
                                                </ClientOnly>
                                            </p>
                                        </div>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                                align="end" 
                                className="w-72 p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-xl"
                            >
                                {/* User Info Header */}
                                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-sky-900/30 dark:to-sky-800/20 border border-sky-200/50 dark:border-sky-800/50 rounded-lg mb-3">
                                    <Avatar className="h-12 w-12 ring-2 ring-sky-300 dark:ring-sky-700/50">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="bg-gradient-to-br from-sky-500 to-sky-600 dark:from-sky-600 dark:to-sky-700 text-white font-semibold">
                                            <ClientOnly fallback="U">
                                                {`${user?.name?.[0] ?? ''}${user?.surname?.[0] ?? ''}`}
                                            </ClientOnly>
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col space-y-1 flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                            <ClientOnly fallback="User">
                                                {`${user?.name ?? ''} ${user?.surname ?? ''}`}
                                            </ClientOnly>
                                        </p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                            <ClientOnly fallback="Loading...">
                                                {`${user?.role ?? 'Role'} - ${user?.number ?? 'N/A'}`}
                                            </ClientOnly>
                                        </p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 bg-emerald-500 dark:bg-emerald-400 rounded-full animate-pulse"></div>
                                            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Online</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Quick Actions */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <Button 
                                        variant="ghost" 
                                        className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-sky-50 dark:hover:bg-sky-900/20 border border-transparent hover:border-sky-200 dark:hover:border-sky-800/50 transition-all duration-200"
                                        onClick={() => router.push('/profile')}
                                    >
                                        <User className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile</span>
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-sky-50 dark:hover:bg-sky-900/20 border border-transparent hover:border-sky-200 dark:hover:border-sky-800/50 transition-all duration-200"
                                        onClick={() => router.push('/settings')}
                                    >
                                        <Settings className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Settings</span>
                                    </Button>
                                </div>
                                
                                <DropdownMenuSeparator className="my-3 bg-slate-200 dark:bg-slate-700" />
                                
                                {/* Menu Items */}
                                <div className="space-y-1">
                                    <DropdownMenuItem 
                                        onClick={() => router.push('/profile')}
                                        className="p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors duration-200"
                                    >
                                        <User className="mr-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-slate-200">My Profile</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">View and edit profile</p>
                                        </div>
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem 
                                        onClick={() => router.push('/settings')}
                                        className="p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors duration-200"
                                    >
                                        <Settings className="mr-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-slate-200">Settings</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Account preferences</p>
                                        </div>
                                    </DropdownMenuItem>
                                    
                                    <DropdownMenuItem 
                                        onClick={() => router.push('/help')}
                                        className="p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors duration-200"
                                    >
                                        <HelpCircle className="mr-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-slate-200">Help & Support</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Get help and support</p>
                                        </div>
                                    </DropdownMenuItem>
                                </div>
                                
                                <DropdownMenuSeparator className="my-3 bg-slate-200 dark:bg-slate-700" />
                                
                                {/* Logout */}
                                <DropdownMenuItem 
                                    onClick={handleLogout}
                                    className="p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer text-red-600 dark:text-red-400 transition-colors duration-200"
                                >
                                    <LogOut className="mr-3 h-4 w-4" />
                                    <div>
                                        <p className="font-medium">Sign Out</p>
                                        <p className="text-xs text-red-500 dark:text-red-500/80">Logout from your account</p>
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Mobile search bar */}
                {showSearch && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm lg:hidden transition-all duration-300">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                            <Input 
                                placeholder="Search projects, tasks, users..." 
                                className="pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-200/50 dark:focus:ring-sky-500/30 transition-all duration-300 w-full" 
                            />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}