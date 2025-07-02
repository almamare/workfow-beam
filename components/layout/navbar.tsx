'use client';

import React, { useState } from 'react';
import { Bell, Search, Sun, Moon, User, Settings, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export function Navbar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [showSearch, setShowSearch] = useState(false);

    return (
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex flex-col">
                {/* Top row: menu, logo, search icon, and other icons */}
                <div className="flex h-16 items-center justify-between px-4">
                    {/* Left: menu button (mobile) and possibly logo */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 lg:hidden"
                            onClick={onToggleSidebar}
                        >
                            <Menu className="h-4 w-4" />
                        </Button>
                        <div className="font-semibold lg:hidden">WorkFlow</div>
                    </div>

                    {/* Center: search (desktop) and search icon (mobile) */}
                    <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md mx-auto">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-9 bg-muted/50"
                            />
                        </div>
                    </div>

                    {/* Right: icons */}
                    <div className="flex items-center gap-2">
                        {/* Search icon for mobile */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 lg:hidden"
                            onClick={() => setShowSearch(!showSearch)}
                        >
                            <Search className="h-4 w-4" />
                        </Button>

                        {/* Theme toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleTheme}
                            className="h-8 w-8 p-0"
                        >
                            {theme === 'light' ? (
                                <Moon className="h-4 w-4" />
                            ) : (
                                <Sun className="h-4 w-4" />
                            )}
                        </Button>

                        {/* Notifications */}
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
                            <Bell className="h-4 w-4" />
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                                3
                            </Badge>
                        </Button>

                        {/* User menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback>
                                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="flex items-center justify-start gap-2 p-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback>
                                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col space-y-1 leading-none">
                                        <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={logout}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Search bar for mobile, appears below when activated */}
                {showSearch && (
                    <div className="p-2 border-t lg:hidden">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search..."
                                className="pl-9 bg-muted/50 w-full"
                            />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}