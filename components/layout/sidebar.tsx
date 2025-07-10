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
    X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MenuItem {
    title: string;
    icon: React.ReactNode;
    href?: string;
    children?: MenuItem[];
}

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
            { title: 'Projects', icon: <FolderOpen className="h-4 w-4" />, href: '/projects' },
            { title: 'Task Orders', icon: <FileText className="h-4 w-4" />, href: '/tasks' },
            { title: 'Work Logs', icon: <FileText className="h-4 w-4" />, href: '/work-logs' }
        ]
    },
    {
        title: 'User Management',
        icon: <Users className="h-4 w-4" />,
        children: [
            { title: 'Users', icon: <Users className="h-4 w-4" />, href: '/users' },
            { title: 'Roles', icon: <Shield className="h-4 w-4" />, href: '/roles' },
            { title: 'Departments', icon: <FolderOpen className="h-4 w-4" />, href: '/departments' }
        ]
    },
    {
        title: 'Requests & Approvals',
        icon: <FileText className="h-4 w-4" />,
        children: [
            { title: 'Advance Requests', icon: <FileText className="h-4 w-4" />, href: '/requests/advance' },
            { title: 'Contract Requests', icon: <FileText className="h-4 w-4" />, href: '/requests/contract' },
            { title: 'Permission Requests', icon: <FileText className="h-4 w-4" />, href: '/requests/permission' },
            { title: 'Approvals', icon: <Shield className="h-4 w-4" />, href: '/approvals' }
        ]
    },
    {
        title: 'Financial',
        icon: <DollarSign className="h-4 w-4" />,
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
        title: 'Audit Logs',
        icon: <Shield className="h-4 w-4" />,
        href: '/audit-logs'
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

    const toggleExpanded = (title: string) => {
        setExpandedItems(prev =>
            prev.includes(title)
                ? prev.filter(item => item !== title)
                : [...prev, title]
        );
    };

    const isActive = (href: string) => pathname === href;
    const isParentActive = (children: MenuItem[]) =>
        children.some(child => child.href && isActive(child.href));

    // Close sidebar when clicking on a link on mobile
    const handleItemClick = () => {
        if (mobileOpen && setMobileOpen) {
            setMobileOpen(false);
        }
    };

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const sidebar = document.querySelector('.sidebar');
            // التصحيح هنا: إضافة القوس المفقود
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
                <div className="flex items-center justify-between p-4 border-b">
                    {(!collapsed || mobileOpen) && (
                        <h2 className="text-lg font-semibold">WorkFlow</h2>
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
                        className="h-8 w-8 p-0"
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

            {/* تنسيق شريط التمرير */}
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