'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Users,
    FileText,
    DollarSign,
    FolderOpen,
    Package,
    Shield,
    ChevronDown,
    ChevronRight,
    X,
    Wallet,
    Contact,
    Settings,
    Megaphone,
    Building,
    TrendingUp,
    Activity,
    ArrowLeft,
    Calculator,
    ClipboardList,
    UserCheck,
    FileEdit,
    CreditCard,
    FileCheck,
    Banknote,
    BarChart3,
    History,
    UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface MenuItem {
    title: string;
    icon: React.ReactNode;
    href: string;
    color?: string;
}

// Dynamic route configuration - maps routes to their children and icons
const routeConfig: Record<string, { title: string; icon: any; color: string; children?: { href: string; title: string; icon: any; color: string }[] }> = {
    '/clients': {
        title: 'Clients',
        icon: Building,
        color: 'text-purple-400',
        children: [
            { href: '/clients/create', title: 'Create Client', icon: Users, color: 'text-purple-400' },
        ]
    },
    '/projects': {
        title: 'Projects',
        icon: FolderOpen,
        color: 'text-indigo-400',
        children: [
            { href: '/projects/create', title: 'Create Project', icon: FolderOpen, color: 'text-indigo-400' },
            { href: '/projects/update', title: 'Update Project', icon: FileEdit, color: 'text-indigo-400' },
            { href: '/projects/details', title: 'Project Details', icon: Activity, color: 'text-indigo-400' },
            { href: '/projects/tender', title: 'Tenders', icon: FileText, color: 'text-indigo-400' }
        ]
    },
    '/tasks': {
        title: 'Tasks',
        icon: ClipboardList,
        color: 'text-orange-400',
        children: [
            { href: '/tasks/create', title: 'Create Task', icon: ClipboardList, color: 'text-orange-400' },
            { href: '/tasks/update', title: 'Update Task', icon: FileEdit, color: 'text-orange-400' },
            { href: '/tasks/details', title: 'Task Details', icon: Activity, color: 'text-orange-400' }
        ]
    },
    '/budgets': {
        title: 'Budgets',
        icon: Calculator,
        color: 'text-green-400',
        children: [
            { href: '/budgets', title: 'All Budgets', icon: Calculator, color: 'text-green-400' }
        ]
    },
    '/users': {
        title: 'Users',
        icon: Users,
        color: 'text-blue-400',
        children: [
            { href: '/users/create', title: 'Create User', icon: Users, color: 'text-blue-400' },
            { href: '/users/update', title: 'Update User', icon: FileEdit, color: 'text-blue-400' }
        ]
    },
    '/employees': {
        title: 'Employees',
        icon: UserCheck,
        color: 'text-emerald-400',
        children: [
            { href: '/employees', title: 'All Employees', icon: UserCheck, color: 'text-emerald-400' },
            { href: '/employees/create', title: 'Create Employee', icon: UserCheck, color: 'text-emerald-400' },
            { href: '/employees/update', title: 'Update Employee', icon: FileEdit, color: 'text-emerald-400' },
            { href: '/employees/details', title: 'Employee Details', icon: Activity, color: 'text-emerald-400' }
        ]
    },
    '/contractors': {
        title: 'Contractors',
        icon: Building,
        color: 'text-purple-400',
        children: [
            { href: '/contractors', title: 'All Contractors', icon: Building, color: 'text-purple-400' },
            { href: '/contractors/create', title: 'Create Contractor', icon: Building, color: 'text-purple-400' },
            { href: '/contractors/update', title: 'Update Contractor', icon: FileEdit, color: 'text-purple-400' },
            { href: '/contractors/details', title: 'Contractor Details', icon: Activity, color: 'text-purple-400' }
        ]
    },
    '/requests': {
        title: 'Requests',
        icon: FileText,
        color: 'text-yellow-400',
        children: [
            { href: '/requests/tasks', title: 'Task Requests', icon: FileEdit, color: 'text-yellow-400' },
            { href: '/requests/financial', title: 'Financial Requests', icon: CreditCard, color: 'text-emerald-400' },
            { href: '/requests/employees', title: 'Employee Requests', icon: Contact, color: 'text-purple-400' }
        ]
    },
    '/financial': {
        title: 'Financial',
        icon: Wallet,
        color: 'text-green-400',
        children: [
            { href: '/financial/contractor-payments', title: 'Contractor Payments', icon: Banknote, color: 'text-green-400' },
            { href: '/financial/cash-ledger', title: 'Cash Ledger', icon: BarChart3, color: 'text-emerald-400' },
            { href: '/financial/budgets', title: 'Project Budgets', icon: TrendingUp, color: 'text-teal-400' },
            { href: '/financial/loans', title: 'Loans', icon: DollarSign, color: 'text-cyan-400' }
        ]
    },
    '/inventory': {
        title: 'Inventory',
        icon: Package,
        color: 'text-orange-400',
        children: [
            { href: '/inventory/items', title: 'Items', icon: Package, color: 'text-orange-400' },
            { href: '/inventory/transactions', title: 'Transactions', icon: FileText, color: 'text-amber-400' }
        ]
    },
    '/permissions': {
        title: 'Permissions',
        icon: Shield,
        color: 'text-red-400'
    },
    '/approvals': {
        title: 'Approvals',
        icon: FileCheck,
        color: 'text-rose-400'
    },
    '/roles': {
        title: 'Roles',
        icon: Shield,
        color: 'text-blue-400'
    },
    '/departments': {
        title: 'Departments',
        icon: Building,
        color: 'text-indigo-400'
    },
    '/notifications': {
        title: 'Notifications',
        icon: Megaphone,
        color: 'text-pink-400'
    },
    '/settings': {
        title: 'Settings',
        icon: Settings,
        color: 'text-gray-400'
    },
    '/profile': {
        title: 'Profile',
        icon: UserCircle,
        color: 'text-pink-400'
    },
    '/history': {
        title: 'History',
        icon: History,
        color: 'text-slate-400'
    },
    '/forms': {
        title: 'Forms',
        icon: FileText,
        color: 'text-blue-400'
    }
};

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen?: boolean;
    setMobileOpen?: (open: boolean) => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, setMobileOpen }: SidebarProps) {
    const pathname = usePathname();

    // Hide sidebar entirely on dashboard
    if (pathname === '/dashboard') {
        return null;
    }

    // Find current route and its configuration
    const currentRoute = useMemo(() => {
        // Find the matching route (check exact match first, then parent routes)
        let matchedRoute = '';
        let routeConfigData = null;

        // Try exact match first
        if (routeConfig[pathname]) {
            matchedRoute = pathname;
            routeConfigData = routeConfig[pathname];
        } else {
            // Find parent route
            const pathSegments = pathname.split('/').filter(Boolean);
            for (let i = pathSegments.length; i > 0; i--) {
                const testPath = '/' + pathSegments.slice(0, i).join('/');
                if (routeConfig[testPath]) {
                    matchedRoute = testPath;
                    routeConfigData = routeConfig[testPath];
                    break;
                }
            }
        }

        return { path: matchedRoute, config: routeConfigData };
    }, [pathname]);

    // Build menu items: current page + its children
    const menuItems = useMemo<MenuItem[]>(() => {
        const items: MenuItem[] = [];

        if (currentRoute.config) {
            // Add current page itself
            const IconComponent = currentRoute.config.icon;
            items.push({
                title: currentRoute.config.title,
                icon: <IconComponent className="h-5 w-5" />,
                href: currentRoute.path,
                color: currentRoute.config.color
            });

            // Add children if they exist
            if (currentRoute.config.children) {
                currentRoute.config.children.forEach(child => {
                    const ChildIconComponent = child.icon;
                    items.push({
                        title: child.title,
                        icon: <ChildIconComponent className="h-4 w-4" />,
                        href: child.href,
                        color: child.color
                    });
                });
            }
        }

        return items;
    }, [currentRoute]);

    const hideText = collapsed && !mobileOpen;

    // Check if route is active
    const isActive = (href: string) => {
        if (href === pathname) return true;
        // For parent routes, check if current path starts with it
        if (pathname.startsWith(href + '/')) return true;
        return false;
    };

    // Close mobile sidebar when clicking a link
    const handleItemClick = () => {
        if (mobileOpen && setMobileOpen) {
            setMobileOpen(false);
        }
    };

    // Close mobile sidebar if click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && !sidebar.contains(e.target as Node)) {
                if (mobileOpen && setMobileOpen) {
                    setMobileOpen(false);
                }
            }
        };

        if (mobileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mobileOpen, setMobileOpen]);

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileOpen?.(false)}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "sidebar fixed left-0 top-0 z-50 h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 dark:border-slate-700 transition-all duration-300 lg:relative lg:translate-x-0 flex flex-col shadow-2xl",
                mobileOpen ? "translate-x-0 w-72 shadow-2xl" : "lg:block -translate-x-full lg:w-20 lg:translate-x-0",
                collapsed && !mobileOpen ? "lg:w-20" : "lg:w-72"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-[14px] border-b border-slate-700 dark:border-slate-700">
                    {(!collapsed || mobileOpen) && (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Image
                                    src="https://cdn.shuarano.com/img/logo.png"
                                    alt="Shuaa Al-Ranou logo"
                                    width={32}
                                    height={40}
                                    priority
                                    className="shrink-0"
                                    style={{ width: "32px", height: "40px" }}
                                />
                            </div>

                            <div
                                className={cn(
                                    'leading-tight overflow-hidden transition-all duration-300',
                                    hideText ? 'opacity-0 w-0' : 'opacity-100'
                                )}
                            >
                                <span className="block font-bold text-xl tracking-wide text-white dark:text-white">
                                    Shuaa Al-Ranou
                                </span>
                                <span className="block text-xs text-slate-400 dark:text-slate-400 font-medium">
                                    Trade & General Contracting
                                </span>
                            </div>
                        </div>
                    )}
                    
                    {(!collapsed || mobileOpen) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (mobileOpen && setMobileOpen) {
                                    setMobileOpen(false);
                                } else {
                                    onToggle();
                                }
                            }}
                            className="h-8 w-8 p-0 lg:hidden text-slate-400 hover:text-white hover:bg-slate-700 dark:hover:bg-slate-700"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Back to Dashboard */}
                {menuItems.length > 0 && (
                    <div className="px-4 pt-4 border-b border-slate-700 dark:border-slate-700 pb-3">
                        <Link href="/dashboard">
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start text-slate-300 dark:text-slate-300 hover:text-white dark:hover:text-white hover:bg-slate-700/50 dark:hover:bg-slate-700/50 transition-all duration-300",
                                    "group"
                                )}
                                onClick={handleItemClick}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {(!collapsed || mobileOpen) && (
                                    <span>Back to Dashboard</span>
                                )}
                            </Button>
                        </Link>
                    </div>
                )}

                {/* Navigation */}
                <nav className="p-4 flex-1 overflow-y-auto pb-6 scrollbar-thin">  
                    <div className="space-y-2">
                        {menuItems.length > 0 ? (
                            menuItems.map((item, index) => (
                                <Link
                                    key={`${item.href}-${index}`}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative",
                                        isActive(item.href)
                                            ? "bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-500 dark:to-orange-600 text-white shadow-lg shadow-orange-500/25 dark:shadow-orange-500/25"
                                            : "text-slate-300 dark:text-slate-300 hover:text-white dark:hover:text-white hover:bg-slate-700/50 dark:hover:bg-slate-700/50 hover:shadow-lg"
                                    )}
                                    title={collapsed && !mobileOpen ? item.title : undefined}
                                    onClick={handleItemClick}
                                >
                                    <div className={cn(
                                        "transition-colors duration-300",
                                        isActive(item.href) ? "text-white dark:text-white" : item.color || "text-slate-400 dark:text-slate-400"
                                    )}>
                                        {item.icon}
                                    </div>
                                    {(!collapsed || mobileOpen) && (
                                        <>
                                            <span className="flex-1">{item.title}</span>
                                        </>
                                    )}
                                    {isActive(item.href) && (
                                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white dark:bg-white rounded-l-full"></div>
                                    )}
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400 dark:text-slate-400 text-sm">
                                {(!collapsed || mobileOpen) ? 'No menu items available' : ''}
                            </div>
                        )}
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-slate-700 dark:border-slate-700">
                    {(!collapsed || mobileOpen) && (
                        <div className="bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-800 dark:to-slate-700 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-500 dark:to-orange-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">SA</span>
                                </div>
                                <div>
                                    <p className="text-white dark:text-white text-sm font-medium">System Admin</p>
                                    <p className="text-slate-400 dark:text-slate-400 text-xs">Online</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}