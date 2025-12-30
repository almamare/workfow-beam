'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
    Home,
    Users,
    FileText,
    DollarSign,
    FolderOpen,
    Package,
    Shield,
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
    UserCircle,
    Plus,
    Eye,
    List,
    Edit,
    Trash2,
    FileArchive,
    Landmark,
    Receipt,
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface MenuItem {
    title: string;
    icon: React.ReactNode;
    href: string;
    color?: string;
    subItems?: { href: string; title: string; icon?: React.ReactNode; color?: string }[];
}

// General icon library - reusable icons that can be used anywhere
const iconLibrary: Record<string, any> = {
    Home, Users, FileText, DollarSign, FolderOpen, Package, Shield,
    Wallet, Contact, Settings, Megaphone, Building, TrendingUp,
    Activity, Calculator, ClipboardList, UserCheck, FileEdit,
    CreditCard, FileCheck, Banknote, BarChart3, History, UserCircle,
    Plus, Eye, List, Edit, Trash2, FileArchive, Landmark, Receipt,
    ChevronDown, ChevronRight
};

// Flexible route configuration - completely flexible system
// Each route can have ANY pages added to its sidebar menu
// No dependency on path or hierarchy - add any page to any page

// Route mapping - maps related pages to their parent route config
// Pages in this map will use the same sidebar menu as their parent route
const routeMapping: Record<string, string> = {
    // Projects related pages
    '/projects/create': '/projects',
    '/projects/update': '/projects',
    '/projects/details': '/projects',
    '/projects/tender/create': '/projects',
    '/projects/tender/update': '/projects',
    '/budgets': '/projects',
    '/requests/projects': '/projects',
    '/requests/projects/details': '/projects',
    '/requests/projects/timeline': '/projects',
    
    // Clients related pages
    '/clients/create': '/clients',
    '/clients/update': '/clients',
    '/clients/details': '/clients',
    '/requests/clients': '/clients',
    '/client-contracts': '/clients',
    '/client-contracts/create': '/clients',
    '/client-contracts/update': '/clients',
    '/client-contracts/details': '/clients',
    
    // Contractors related pages
    '/contractors/create': '/contractors',
    '/contractors/update': '/contractors',
    '/contractors/details': '/contractors',
    
    // Tasks related pages
    '/tasks/create': '/tasks',
    '/tasks/update': '/tasks',
    '/tasks/details': '/tasks',
    '/requests/tasks': '/tasks',
    '/requests/tasks/details': '/tasks',
    '/requests/tasks/timeline': '/tasks',
    
    // Users related pages
    '/users/create': '/users',
    '/users/update': '/users',
    '/employees': '/users',
    '/employees/create': '/users',
    '/employees/update': '/users',
    '/employees/details': '/users',
    '/roles': '/users',
    
    // Departments related pages
    '/departments': '/users',
    
    // Requests related pages
    '/requests/financial': '/requests',
    '/requests/employees': '/requests',
    '/approvals': '/requests',
    
    // Financial related pages 
    '/financial/contractor-payments': '/financial',
    '/financial/cash-ledger': '/financial',
    '/financial/budgets': '/financial',
    '/financial/loans': '/financial',
    
    // Inventory related pages
    '/inventory/items': '/inventory',
    '/inventory/transactions': '/inventory',
    
    // Settings related pages
    '/profile': '/settings',
    '/notifications': '/settings',
    '/history': '/settings',
    
    // Forms related pages
    '/forms/create': '/forms',
    '/forms/update': '/forms',
    '/forms/details': '/forms',
    
    // Documents related pages
    '/documents/create': '/documents',
    '/documents/update': '/documents',
    '/documents/details': '/documents',
    
    // Banks related pages
    '/banks/create': '/banks',
    '/banks/update': '/banks',
    '/banks/details': '/banks',
    
    // Invoices related pages
    '/invoices/create': '/invoices',
    '/invoices/update': '/invoices',
    '/invoices/details': '/invoices',
    
    // Bank Balances related pages
    '/bank-balances/create': '/bank-balances',
    '/bank-balances/update': '/bank-balances',
    '/bank-balances/details': '/bank-balances',
    '/bank-balances/bank': '/bank-balances',
    
};

const routeConfig: Record<string, { 
    title: string; 
    icon: string; 
    color: string; 
    menuItems: { 
        href: string; 
        title: string; 
        icon: string; 
        color: string;
        subItems?: { href: string; title: string; icon?: string; color?: string }[];
    }[] 
}> = {
    '/projects': {
        title: 'Projects',
        icon: 'FolderOpen',
        color: 'text-indigo-400',
        menuItems: [
            { href: '/projects', title: 'Projects', icon: 'FolderOpen', color: 'text-indigo-400' },
            { 
                href: '/requests/projects', 
                title: 'Project Requests', 
                icon: 'FileText', 
                color: 'text-yellow-400',
                subItems: [
                    { href: '/requests/projects?status=Pending', title: 'Pending', color: 'text-yellow-400' },
                    { href: '/requests/projects?status=Approved', title: 'Approved', color: 'text-green-400' },
                    { href: '/requests/projects?status=Rejected', title: 'Rejected', color: 'text-red-400' }
                ]
            },
            { href: '/projects/create', title: 'Create Project', icon: 'Plus', color: 'text-green-400' },
            { href: '/budgets', title: 'Budgets', icon: 'TrendingUp', color: 'text-teal-400' },
        ]
    },
    '/clients': {
        title: 'Clients',
        icon: 'Users',
        color: 'text-purple-400',
        menuItems: [
            { href: '/clients', title: 'All Clients', icon: 'Users', color: 'text-purple-400' },
            { 
                href: '/requests/clients', 
                title: 'Client Requests', 
                icon: 'FileText', 
                color: 'text-yellow-400',
                subItems: [
                    { href: '/requests/clients?status=Pending', title: 'Pending', color: 'text-yellow-400' },
                    { href: '/requests/clients?status=Approved', title: 'Approved', color: 'text-green-400' },
                    { href: '/requests/clients?status=Rejected', title: 'Rejected', color: 'text-red-400' }
                ]
            },
            { href: '/client-contracts', title: 'Client Contracts', icon: 'FileCheck', color: 'text-teal-400' },
            { href: '/client-contracts/create', title: 'Create Client Contract', icon: 'Plus', color: 'text-green-400' },
            { href: '/clients/create', title: 'Create Client', icon: 'Plus', color: 'text-green-400' }
        ]
    },
    '/contractors': {
        title: 'Contractors',
        icon: 'Building',
        color: 'text-orange-400',
        menuItems: [
            { href: '/contractors', title: 'Contractors', icon: 'Building', color: 'text-orange-400' },
            { href: '/contractors/create', title: 'Create Contractor', icon: 'Plus', color: 'text-green-400' }
        ]
    },
    '/tasks': {
        title: 'Task Orders',
        icon: 'ClipboardList',
        color: 'text-yellow-400',
        menuItems: [
            { href: '/tasks', title: 'Task Orders', icon: 'ClipboardList', color: 'text-yellow-400' },
            { 
                href: '/requests/tasks', 
                title: 'Task Requests', 
                icon: 'FileText', 
                color: 'text-yellow-400',
                subItems: [
                    { href: '/requests/tasks?status=Pending', title: 'Pending', color: 'text-yellow-400' },
                    { href: '/requests/tasks?status=Approved', title: 'Approved', color: 'text-green-400' },
                    { href: '/requests/tasks?status=Rejected', title: 'Rejected', color: 'text-red-400' }
                ]
            },
            { href: '/tasks/create', title: 'Create Task', icon: 'Plus', color: 'text-green-400' }
        ]
    },
    '/users': {
        title: 'Users',
        icon: 'Users',
        color: 'text-blue-400',
        menuItems: [
            { href: '/users', title: 'Users', icon: 'Users', color: 'text-blue-400' },
            { href: '/users/create', title: 'Create User', icon: 'Plus', color: 'text-green-400' },
            { href: '/employees', title: 'Employees', icon: 'UserCheck', color: 'text-emerald-400' },
            { href: '/employees/create', title: 'Create Employee', icon: 'Plus', color: 'text-green-400' },
        ]
    },
    '/requests': {
        title: 'Requests',
        icon: 'FileText',
        color: 'text-yellow-400',
        menuItems: [
            { href: '/requests/tasks', title: 'Task Requests', icon: 'FileEdit', color: 'text-yellow-400' },
            { href: '/requests/financial', title: 'Financial Requests', icon: 'CreditCard', color: 'text-emerald-400' },
            { href: '/requests/employees', title: 'Employee Requests', icon: 'Contact', color: 'text-purple-400' },
            { href: '/approvals', title: 'Approvals', icon: 'FileCheck', color: 'text-rose-400' }
        ]
    },
    '/financial': {
        title: 'Financial',
        icon: 'Wallet',
        color: 'text-green-400',
        menuItems: [
            { href: '/financial/contractor-payments', title: 'Contractor Payments', icon: 'Banknote', color: 'text-green-400' },
            { href: '/financial/cash-ledger', title: 'Cash Ledger', icon: 'BarChart3', color: 'text-emerald-400' },
            { href: '/financial/budgets', title: 'Project Budgets', icon: 'TrendingUp', color: 'text-teal-400' },
            { href: '/financial/loans', title: 'Loans', icon: 'DollarSign', color: 'text-cyan-400' }
        ]
    },
    '/inventory': {
        title: 'Inventory',
        icon: 'Package',
        color: 'text-orange-400',
        menuItems: [
            { href: '/inventory/items', title: 'Items', icon: 'Package', color: 'text-orange-400' },
            { href: '/inventory/transactions', title: 'Transactions', icon: 'FileText', color: 'text-amber-400' },
            { href: '/inventory/items', title: 'Add Item', icon: 'Plus', color: 'text-green-400' }
        ]
    },
    '/forms': {
        title: 'Forms',
        icon: 'FileText',
        color: 'text-cyan-400',
        menuItems: [
            { href: '/forms', title: 'Forms', icon: 'FileText', color: 'text-cyan-400' },
            { href: '/forms/create', title: 'Create Form', icon: 'Plus', color: 'text-green-400' }
        ]
    },
    '/documents': {
        title: 'Documents',
        icon: 'FileArchive',
        color: 'text-emerald-400',
        menuItems: [
            { href: '/documents', title: 'Documents', icon: 'FileArchive', color: 'text-emerald-400' },
            { href: '/documents/create', title: 'Add Document', icon: 'Plus', color: 'text-green-400' }
        ]
    },
    '/banks': {
        title: 'Banks',
        icon: 'Landmark',
        color: 'text-cyan-400',
        menuItems: [
            { href: '/banks', title: 'Banks', icon: 'Landmark', color: 'text-cyan-400' },
            { href: '/banks/create', title: 'Add Bank', icon: 'Plus', color: 'text-green-400' }
        ]
    },
    '/invoices': {
        title: 'Invoices',
        icon: 'Receipt',
        color: 'text-rose-400',
        menuItems: [
            { href: '/invoices', title: 'Invoices', icon: 'Receipt', color: 'text-rose-400' },
            { href: '/invoices/create', title: 'Add Invoice', icon: 'Plus', color: 'text-green-400' }
        ]
    },
    '/bank-balances': {
        title: 'Bank Balances',
        icon: 'Wallet',
        color: 'text-amber-400',
        menuItems: [
            { href: '/bank-balances', title: 'Bank Balances', icon: 'Wallet', color: 'text-amber-400' },
            { href: '/bank-balances/create', title: 'Add Balance', icon: 'Plus', color: 'text-green-400' }
        ]
    },
    '/client-contracts': {
        title: 'Client Contracts',
        icon: 'FileText',
        color: 'text-teal-400',
        menuItems: [
            { href: '/client-contracts', title: 'Client Contracts', icon: 'FileText', color: 'text-teal-400' },
            { href: '/client-contracts/create', title: 'Add Contract', icon: 'Plus', color: 'text-green-400' }
        ]
    },
    '/timeline': {
        title: 'Timeline',
        icon: 'History',
        color: 'text-slate-400',
        menuItems: [
            { href: '/timeline', title: 'Timeline', icon: 'History', color: 'text-slate-400' },
        ]
    },
    '/settings': {
        title: 'Settings',
        icon: 'Settings',
        color: 'text-gray-400',
        menuItems: [
            { href: '/settings', title: 'General Settings', icon: 'Settings', color: 'text-gray-400' },
            { href: '/profile', title: 'Profile', icon: 'UserCircle', color: 'text-pink-400' },
            { href: '/notifications', title: 'Notifications', icon: 'Megaphone', color: 'text-pink-400' },
            { href: '/history', title: 'History', icon: 'History', color: 'text-slate-400' }
        ]
    },
};

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen?: boolean;
    setMobileOpen?: (open: boolean) => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, setMobileOpen }: SidebarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>({});

    // Auto-open collapsible if current path matches a subItem
    useEffect(() => {
        const currentStatus = searchParams.get('status');
        if (currentStatus && pathname === '/requests/clients') {
            setOpenCollapsibles(prev => ({ ...prev, '/requests/clients': true }));
        }
        if (currentStatus && pathname === '/requests/projects') {
            setOpenCollapsibles(prev => ({ ...prev, '/requests/projects': true }));
        }
        if (currentStatus && pathname === '/requests/tasks') {
            setOpenCollapsibles(prev => ({ ...prev, '/requests/tasks': true }));
        }
    }, [pathname, searchParams]);

    // Hide sidebar entirely on dashboard
    if (pathname === '/dashboard') {
        return null;
    }

    // Find current route and its configuration - find parent route for sub-pages
    const currentRoute = useMemo(() => {
        // Check route mapping first (for pages that should use another route's config)
        if (routeMapping[pathname] && routeConfig[routeMapping[pathname]]) {
            return { path: routeMapping[pathname], config: routeConfig[routeMapping[pathname]] };
        }

        // Try exact match
        if (routeConfig[pathname]) {
            return { path: pathname, config: routeConfig[pathname] };
        }

        // Find parent route by checking path segments for sub-pages
        const pathSegments = pathname.split('/').filter(Boolean);
        for (let i = pathSegments.length; i > 0; i--) {
            const testPath = '/' + pathSegments.slice(0, i).join('/');
            // Check if this path is mapped to another route
            if (routeMapping[testPath] && routeConfig[routeMapping[testPath]]) {
                return { path: routeMapping[testPath], config: routeConfig[routeMapping[testPath]] };
            }
            // Check if this path has its own config
            if (routeConfig[testPath]) {
                return { path: testPath, config: routeConfig[testPath] };
            }
        }

        return { path: '', config: null };
    }, [pathname]);

    // Build menu items from configuration - only sub-pages (menuItems), no base route
    const menuItems = useMemo<MenuItem[]>(() => {
        const items: MenuItem[] = [];

        if (currentRoute.config) {
            // Only add menu items (sub-pages), no base route
            if (currentRoute.config.menuItems) {
                currentRoute.config.menuItems.forEach(menuItem => {
                    const MenuIconComponent = iconLibrary[menuItem.icon] || Activity;
                    const item: MenuItem = {
                        title: menuItem.title,
                        icon: <MenuIconComponent className="h-4 w-4" />,
                        href: menuItem.href,
                        color: menuItem.color
                    };
                    
                    // Add subItems if they exist
                    if (menuItem.subItems && menuItem.subItems.length > 0) {
                        item.subItems = menuItem.subItems.map(subItem => ({
                            href: subItem.href,
                            title: subItem.title,
                            icon: subItem.icon ? (iconLibrary[subItem.icon] ? React.createElement(iconLibrary[subItem.icon], { className: "h-3 w-3" }) : null) : null,
                            color: subItem.color
                        }));
                    }
                    
                    items.push(item);
                });
            }
        }

        return items;
    }, [currentRoute]);

    const hideText = collapsed && !mobileOpen;

    // Check if route is active - exact match only
    const isActive = (href: string) => {
        return href === pathname;
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
                            menuItems.map((item, index) => {
                                const hasSubItems = item.subItems && item.subItems.length > 0;
                                const isOpen = openCollapsibles[item.href] || false;
                                const isItemActive = isActive(item.href) || (hasSubItems && item.subItems?.some(sub => isActive(sub.href)));

                                if (hasSubItems) {
                                    return (
                                        <Collapsible
                                            key={`${item.href}-${index}`}
                                            open={isOpen}
                                            onOpenChange={(open) => setOpenCollapsibles(prev => ({ ...prev, [item.href]: open }))}
                                        >
                                            <CollapsibleTrigger asChild>
                                                <button
                                                    className={cn(
                                                        "group w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative",
                                                        isItemActive
                                                            ? "bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-500 dark:to-orange-600 text-white shadow-lg shadow-orange-500/25 dark:shadow-orange-500/25"
                                                            : "text-slate-300 dark:text-slate-300 hover:text-white dark:hover:text-white hover:bg-slate-700/50 dark:hover:bg-slate-700/50 hover:shadow-lg"
                                                    )}
                                                    title={collapsed && !mobileOpen ? item.title : undefined}
                                                >
                                                    <div className={cn(
                                                        "transition-colors duration-300",
                                                        isItemActive ? "text-white dark:text-white" : item.color || "text-slate-400 dark:text-slate-400"
                                                    )}>
                                                        {item.icon}
                                                    </div>
                                                    {(!collapsed || mobileOpen) && (
                                                        <>
                                                            <span className="flex-1 text-left">{item.title}</span>
                                                            {isOpen ? (
                                                                <ChevronDown className="h-4 w-4 transition-transform" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4 transition-transform" />
                                                            )}
                                                        </>
                                                    )}
                                                </button>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="mt-1 space-y-1">
                                                {item.subItems?.map((subItem, subIndex) => (
                                                    <Link
                                                        key={`${subItem.href}-${subIndex}`}
                                                        href={subItem.href}
                                                        className={cn(
                                                            "group flex items-center gap-4 px-4 py-2.5 ml-6 rounded-lg text-sm font-medium transition-all duration-300",
                                                            isActive(subItem.href)
                                                                ? "bg-slate-700/70 dark:bg-slate-700/70 text-white"
                                                                : "text-slate-300 dark:text-slate-300 hover:text-white dark:hover:text-white hover:bg-slate-700/50 dark:hover:bg-slate-700/50"
                                                        )}
                                                        onClick={handleItemClick}
                                                    >
                                                        {subItem.icon && (
                                                            <div className={cn(
                                                                "transition-colors duration-300",
                                                                isActive(subItem.href) ? "text-white dark:text-white" : subItem.color || "text-slate-400 dark:text-slate-400"
                                                            )}>
                                                                {subItem.icon}
                                                            </div>
                                                        )}
                                                        {(!collapsed || mobileOpen) && (
                                                            <span className="flex-1">{subItem.title}</span>
                                                        )}
                                                    </Link>
                                                ))}
                                            </CollapsibleContent>
                                        </Collapsible>
                                    );
                                }

                                return (
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
                                );
                            })
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
