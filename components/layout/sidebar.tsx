'use client';

import React, { useState, useEffect } from 'react';
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
    Megaphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface MenuItem {
    title: string;
    icon: React.ReactNode;
    href?: string;
    children?: MenuItem[];
}

// Define sidebar menu items
const menuItems: MenuItem[] = [
    {
        title: 'Dashboard',
        icon: <Home className="h-4 w-4" />,
        href: '/dashboard'
    },
    {
        title: 'Projects & Tasks',
        icon: <FolderOpen className="h-4 w-4" />,
        children: [
            { title: 'Clients', icon: <Users className="h-4 w-4" />, href: '/clients' },
            { title: 'Projects', icon: <FolderOpen className="h-4 w-4" />, href: '/projects' },
            { title: 'Budgets', icon: <Wallet className="h-4 w-4" />, href: '/budgets' },
            { title: 'Task Orders', icon: <FileText className="h-4 w-4" />, href: '/tasks' }
        ]
    },
    {
        title: 'User Management',
        icon: <Users className="h-4 w-4" />,
        children: [
            { title: 'Users', icon: <Users className="h-4 w-4" />, href: '/users' },
            { title: 'Permissions', icon: <Shield className="h-4 w-4" />, href: '/permissions' },
            { title: 'Employees', icon: <Contact className="h-4 w-4" />, href: '/employees' }
        ]
    },
    {
        title: 'Requests & Approvals',
        icon: <FileText className="h-4 w-4" />,
        children: [
            { title: 'Tasks Requests', icon: <FileText className="h-4 w-4" />, href: '/requests/tasks' },
            { title: 'Financial Requests', icon: <FileText className="h-4 w-4" />, href: '/requests/financial' },
            { title: 'Employees Requests', icon: <FileText className="h-4 w-4" />, href: '/requests/employees' },
            { title: 'Approvals', icon: <Shield className="h-4 w-4" />, href: '/approvals' }
        ]
    },
    {
        title: 'Financial',
        icon: <Wallet className="h-4 w-4" />,
        children: [
            { title: 'Contractor Payments', icon: <DollarSign className="h-4 w-4" />, href: '/financial/contractor-payments' },
            { title: 'Cash Ledger', icon: <DollarSign className="h-4 w-4" />, href: '/financial/cash-ledger' },
            { title: 'Project Budgets', icon: <DollarSign className="h-4 w-4" />, href: '/financial/budgets' },
            { title: 'Loans', icon: <DollarSign className="h-4 w-4" />, href: '/financial/loans' }
        ]
    },
    {
        title: 'Inventory',
        icon: <Package className="h-4 w-4" />,
        children: [
            { title: 'Items', icon: <Package className="h-4 w-4" />, href: '/inventory/items' },
            { title: 'Transactions', icon: <FileText className="h-4 w-4" />, href: '/inventory/transactions' }
        ]
    },
    {
        title: 'Contractors',
        icon: <Users className="h-4 w-4" />,
        href: '/contractors'
    },
    {
        title: 'Notifications',
        icon: <Megaphone className="h-4 w-4" />,
        href: '/notifications'
    },
    {
        title: 'Settings',
        icon: <Settings className="h-4 w-4" />,
        href: '/settings'
    }
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen?: boolean;
    setMobileOpen?: (open: boolean) => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, setMobileOpen }: SidebarProps) {
    const pathname = usePathname();
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    // Automatically expand parent menu if current pathname matches child route
    useEffect(() => {
        const newExpanded: string[] = [];

        menuItems.forEach(item => {
            if (item.children?.some(child => child.href && pathname.startsWith(child.href))) {
                newExpanded.push(item.title);
            }
        });

        setExpandedItems(newExpanded);
    }, [pathname]);

    // Toggle expansion of a parent menu
    const toggleExpanded = (title: string) => {
        setExpandedItems(prev =>
            prev.includes(title)
                ? prev.filter(item => item !== title)
                : [...prev, title]
        );
    };

    const hideText = collapsed && !mobileOpen;

    // ✅ Fixed isActive to also handle sub URLs
    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(href + '/');

    const isParentActive = (children: MenuItem[]) =>
        children.some(child => child.href && isActive(child.href));

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
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen?.(false)}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "sidebar fixed left-0 top-0 z-50 h-screen bg-card border-r border-border transition-all duration-300 lg:relative lg:translate-x-0 flex flex-col",
                mobileOpen ? "translate-x-0 w-64 shadow-xl" : "lg:block -translate-x-full lg:w-16 lg:translate-x-0",
                collapsed && !mobileOpen ? "lg:w-16" : "lg:w-64"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    {(!collapsed || mobileOpen) && (
                        <div className="flex items-center gap-2">
                            <Image
                                src="https://cdn.shuarano.com/img/logo.png"
                                alt="Shuaa Al-Ranou logo"
                                width={25}
                                height={32}
                                priority
                                className="shrink-0"
                            />

                            <div
                                className={cn(
                                    'leading-tight overflow-hidden transition-opacity duration-200',
                                    hideText ? 'opacity-0 w-0' : 'opacity-100'
                                )}
                            >
                                <span className="block font-semibold text-[18px] tracking-wide">
                                    Shuaa Al-Ranou
                                </span>
                                <span className="block text-[10px] text-muted-foreground">
                                    Trade and General Contracting
                                </span>
                            </div>
                        </div>
                    )}
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
                        className="h-8 w-8 p-0 lg:hidden"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="p-2 flex-1 overflow-y-auto pb-4">
                    <div className="space-y-1">
                        {menuItems.map((item) => (
                            <div key={item.title}>
                                {item.href ? (
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                            isActive(item.href)
                                                ? "bg-primary text-primary-foreground"
                                                : "hover:bg-accent hover:text-accent-foreground"
                                        )}
                                        title={collapsed && !mobileOpen ? item.title : undefined}
                                        onClick={handleItemClick}
                                    >
                                        {item.icon}
                                        {(!collapsed || mobileOpen) && <span>{item.title}</span>}
                                    </Link>
                                ) : (
                                    <div>
                                        {/* Parent menu button */}
                                        <button
                                            onClick={() => (!collapsed || mobileOpen) && toggleExpanded(item.title)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full",
                                                isParentActive(item.children || [])
                                                    ? "bg-accent text-accent-foreground"
                                                    : "hover:bg-accent hover:text-accent-foreground"
                                            )}
                                            title={collapsed && !mobileOpen ? item.title : undefined}
                                        >
                                            {item.icon}
                                            {(!collapsed || mobileOpen) && (
                                                <>
                                                    <span className="flex-1 text-left">{item.title}</span>
                                                    {expandedItems.includes(item.title) ? (
                                                        <ChevronDown className="h-4 w-4" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4" />
                                                    )}
                                                </>
                                            )}
                                        </button>

                                        {/* Render child items if expanded */}
                                        {(!collapsed || mobileOpen) && expandedItems.includes(item.title) && item.children && (
                                            <div className="ml-4 mt-1 space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={child.title}
                                                        href={child.href!}
                                                        className={cn(
                                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                                            isActive(child.href!)
                                                                ? "bg-primary text-primary-foreground"
                                                                : "hover:bg-accent hover:text-accent-foreground"
                                                        )}
                                                        onClick={handleItemClick}
                                                    >
                                                        {child.icon}
                                                        <span>{child.title}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </nav>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #888;
                    border-radius: 10px;
                }
                
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}</style>
        </>
    );
}
