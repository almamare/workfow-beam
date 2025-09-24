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
    Megaphone,
    Building,
    TrendingUp,
    Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface MenuItem {
    title: string;
    icon: React.ReactNode;
    href?: string;
    children?: MenuItem[];
    badge?: string;
    color?: string;
}

// Define sidebar menu items with enhanced styling
const menuItems: MenuItem[] = [
    {
        title: 'Dashboard',
        icon: <Home className="h-5 w-5" />,
        href: '/dashboard',
        color: 'text-blue-600'
    },
    {
        title: 'Projects & Tasks',
        icon: <FolderOpen className="h-5 w-5" />,
        color: 'text-indigo-600',
        children: [
            { title: 'Clients', icon: <Users className="h-4 w-4" />, href: '/clients', color: 'text-purple-600' },
            { title: 'Projects', icon: <FolderOpen className="h-4 w-4" />, href: '/projects', color: 'text-indigo-600' },
            { title: 'Budgets', icon: <Wallet className="h-4 w-4" />, href: '/budgets', color: 'text-green-600' },
            { title: 'Task Orders', icon: <FileText className="h-4 w-4" />, href: '/tasks', color: 'text-orange-600' }
        ]
    },
    {
        title: 'User Management',
        icon: <Users className="h-5 w-5" />,
        color: 'text-blue-600',
        children: [
            { title: 'Users', icon: <Users className="h-4 w-4" />, href: '/users', color: 'text-blue-600' },
            { title: 'Permissions', icon: <Shield className="h-4 w-4" />, href: '/permissions', color: 'text-red-600' },
            { title: 'Employees', icon: <Contact className="h-4 w-4" />, href: '/employees', color: 'text-green-600' }
        ]
    },
    {
        title: 'Requests & Approvals',
        icon: <FileText className="h-5 w-5" />,
        color: 'text-yellow-600',
        children: [
            { title: 'Tasks Requests', icon: <FileText className="h-4 w-4" />, href: '/requests/tasks', color: 'text-yellow-600' },
            { title: 'Financial Requests', icon: <FileText className="h-4 w-4" />, href: '/requests/financial', color: 'text-green-600' },
            { title: 'Employees Requests', icon: <FileText className="h-4 w-4" />, href: '/requests/employees', color: 'text-purple-600' },
            { title: 'Approvals', icon: <Shield className="h-4 w-4" />, href: '/approvals', color: 'text-red-600' }
        ]
    },
    {
        title: 'Financial',
        icon: <Wallet className="h-5 w-5" />,
        color: 'text-green-600',
        children: [
            { title: 'Contractor Payments', icon: <DollarSign className="h-4 w-4" />, href: '/financial/contractor-payments', color: 'text-green-600' },
            { title: 'Cash Ledger', icon: <DollarSign className="h-4 w-4" />, href: '/financial/cash-ledger', color: 'text-emerald-600' },
            { title: 'Project Budgets', icon: <DollarSign className="h-4 w-4" />, href: '/financial/budgets', color: 'text-teal-600' },
            { title: 'Loans', icon: <DollarSign className="h-4 w-4" />, href: '/financial/loans', color: 'text-cyan-600' }
        ]
    },
    {
        title: 'Inventory',
        icon: <Package className="h-5 w-5" />,
        color: 'text-orange-600',
        children: [
            { title: 'Items', icon: <Package className="h-4 w-4" />, href: '/inventory/items', color: 'text-orange-600' },
            { title: 'Transactions', icon: <FileText className="h-4 w-4" />, href: '/inventory/transactions', color: 'text-amber-600' }
        ]
    },
    {
        title: 'Contractors',
        icon: <Building className="h-5 w-5" />,
        href: '/contractors',
        color: 'text-purple-600'
    },
    {
        title: 'Notifications',
        icon: <Megaphone className="h-5 w-5" />,
        href: '/notifications',
        color: 'text-pink-600',
    },
    {
        title: 'Settings',
        icon: <Settings className="h-5 w-5" />,
        href: '/settings',
        color: 'text-gray-600'
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
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileOpen?.(false)}
                />
            )}

            {/* Sidebar */}
            <div className={cn(
                "sidebar fixed left-0 top-0 z-50 h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-all duration-300 lg:relative lg:translate-x-0 flex flex-col shadow-2xl",
                mobileOpen ? "translate-x-0 w-72 shadow-2xl" : "lg:block -translate-x-full lg:w-20 lg:translate-x-0",
                collapsed && !mobileOpen ? "lg:w-20" : "lg:w-72"
            )}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-[14px] border-b border-slate-700">
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
                                <span className="block font-bold text-xl tracking-wide text-white">
                                    Shuaa Al-Ranou
                                </span>
                                <span className="block text-xs text-slate-400 font-medium">
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
                            className="h-8 w-8 p-0 lg:hidden text-slate-400 hover:text-white hover:bg-slate-700"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Stats Bar */}
                {(!collapsed || mobileOpen) && (
                    <div className="px-3 py-3 border-b border-slate-700">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg p-2 border border-green-500/20">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-3 w-3 text-green-400" />
                                    <span className="text-[10px] text-green-300 font-medium">Active</span>
                                </div>
                                <p className="text-md font-bold text-white mt-1">24</p>
                                <p className="text-[10px] text-slate-400">Projects</p>
                            </div>
                            <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-lg p-2 border border-yellow-500/20">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-3 w-3 text-yellow-400" />
                                    <span className="text-[10px] text-yellow-300 font-medium">Available</span>
                                </div>
                                <p className="text-md font-bold text-white mt-1">12</p>
                                <p className="text-[10px] text-slate-400">Notifications</p>
                            </div>
                            <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg p-2 border border-blue-500/20">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-3 w-3 text-blue-400" />
                                    <span className="text-[10px] text-blue-300 font-medium">Pending</span>
                                </div>
                                <p className="text-md font-bold text-white mt-1">8</p>
                                <p className="text-[10px] text-slate-400">Tasks</p>
                            </div>
                        </div>
                    </div>
                )} 

                {/* Navigation */}
                <nav className="p-4 flex-1 overflow-y-auto pb-6 scrollbar-thin">
                    <div className="space-y-2">
                        {menuItems.map((item, index) => (
                            <div key={item.title}>
                                {item.href ? (
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative",
                                            isActive(item.href)
                                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
                                                : "text-slate-300 hover:text-white hover:bg-slate-700/50 hover:shadow-lg"
                                        )}
                                        title={collapsed && !mobileOpen ? item.title : undefined}
                                        onClick={handleItemClick}
                                    >
                                        <div className={cn(
                                            "transition-colors duration-300",
                                            isActive(item.href) ? "text-white" : item.color
                                        )}>
                                            {item.icon}
                                        </div>
                                        {(!collapsed || mobileOpen) && (
                                            <>
                                                <span className="flex-1">{item.title}</span>
                                                {item.badge && (
                                                    <Badge 
                                                        variant="outline" 
                                                        className="bg-red-500 text-white text-xs px-2 py-1 rounded-full border-red-500"
                                                    >
                                                        {item.badge}
                                                    </Badge>
                                                )}
                                            </>
                                        )}
                                        {isActive(item.href) && (
                                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
                                        )}
                                    </Link>
                                ) : (
                                    <div>
                                        {/* Parent menu button */}
                                        <button
                                            onClick={() => (!collapsed || mobileOpen) && toggleExpanded(item.title)}
                                            className={cn(
                                                "group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 w-full",
                                                isParentActive(item.children || [])
                                                    ? "bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border border-orange-500/20"
                                                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                                            )}
                                            title={collapsed && !mobileOpen ? item.title : undefined}
                                        >
                                            <div className={cn(
                                                "transition-all duration-300",
                                                isParentActive(item.children || []) ? "text-orange-400" : item.color
                                            )}>
                                                {item.icon}
                                            </div>
                                            {(!collapsed || mobileOpen) && (
                                                <>
                                                    <span className="flex-1 text-left">{item.title}</span>
                                                    {item.badge && (
                                                        <Badge 
                                                            variant="outline" 
                                                            className="bg-red-500 text-white text-xs px-2 py-1 rounded-full border-red-500"
                                                        >
                                                            {item.badge}
                                                        </Badge>
                                                    )}
                                                    <div className="transition-transform duration-300">
                                                        {expandedItems.includes(item.title) ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </button>

                                        {/* Render child items if expanded */}
                                        {(!collapsed || mobileOpen) && expandedItems.includes(item.title) && item.children && (
                                            <div className="ml-6 mt-2 space-y-1 animate-fade-in">
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={child.title}
                                                        href={child.href!}
                                                        className={cn(
                                                            "group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-300 relative",
                                                            isActive(child.href!)
                                                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
                                                                : "text-slate-400 hover:text-white hover:bg-slate-700/30"
                                                        )}
                                                        onClick={handleItemClick}
                                                    >
                                                        <div className={cn(
                                                            "transition-colors duration-300",
                                                            isActive(child.href!) ? "text-white" : child.color
                                                        )}>
                                                            {child.icon}
                                                        </div>
                                                        <span className="flex-1">{child.title}</span>
                                                        {isActive(child.href!) && (
                                                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"></div>
                                                        )}
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

                {/* Footer */}
                <div className="p-4 border-t border-slate-700">
                    {(!collapsed || mobileOpen) && (
                        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">SA</span>
                                </div>
                                <div>
                                    <p className="text-white text-sm font-medium">System Admin</p>
                                    <p className="text-slate-400 text-xs">Online</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}