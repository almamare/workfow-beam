'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Home,
    Users,
    FileText,
    FolderOpen,
    Package,
    DollarSign,
    Shield,
    Contact,
    Wallet,
    Megaphone,
    Settings,
} from 'lucide-react';
import Link from 'next/link';

const menuItems = [
    {
        title: 'Dashboard',
        icon: Home,
        href: '/dashboard',
    },
    {
        title: 'Projects & Tasks',
        icon: FolderOpen,
        children: [
            { title: 'Clients', icon: Users, href: '/clients' },
            { title: 'Projects', icon: FolderOpen, href: '/projects' },
            { title: 'Budgets', icon: Wallet, href: '/budgets' },
            { title: 'Task Orders', icon: FileText, href: '/tasks' },
        ],
    },
    {
        title: 'User Management',
        icon: Users,
        children: [
            { title: 'Users', icon: Users, href: '/users' },
            { title: 'Permissions', icon: Shield, href: '/permissions' },
            { title: 'Employees', icon: Contact, href: '/employees' },
        ],
    },
    {
        title: 'Requests & Approvals',
        icon: FileText,
        children: [
            { title: 'Tasks Requests', icon: FileText, href: '/requests/tasks' },
            { title: 'Financial Requests', icon: FileText, href: '/requests/financial' },
            { title: 'Employees Requests', icon: FileText, href: '/requests/employees' },
            { title: 'Approvals', icon: Shield, href: '/approvals' },
        ],
    },
    {
        title: 'Financial',
        icon: Wallet,
        children: [
            { title: 'Contractor Payments', icon: DollarSign, href: '/financial/contractor-payments' },
            { title: 'Cash Ledger', icon: DollarSign, href: '/financial/cash-ledger' },
            { title: 'Project Budgets', icon: DollarSign, href: '/financial/budgets' },
            { title: 'Loans', icon: DollarSign, href: '/financial/loans' },
        ],
    },
    {
        title: 'Inventory',
        icon: Package,
        children: [
            { title: 'Items', icon: Package, href: '/inventory/items' },
            { title: 'Transactions', icon: FileText, href: '/inventory/transactions' },
        ],
    },
    {
        title: 'Contractors',
        icon: Users,
        href: '/contractors',
    },
    {
        title: 'Notifications',
        icon: Megaphone,
        href: '/notifications',
    },
    {
        title: 'Settings',
        icon: Settings,
        href: '/settings',
    },
];

const flattenMenu = (items: any[]) => {
    let flat: any[] = [];
    items.forEach((item) => {
        if (item.href) {
            flat.push(item);
        }
        if (item.children) {
            flat = flat.concat(flattenMenu(item.children));
        }
    });
    return flat;
};

export default function DashboardPage() {
    const flatMenu = flattenMenu(menuItems);

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <p className="text-muted-foreground mt-1">
                    Overview Of Your Enterprise Shuaa Al-Ranou System
                </p>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
                    <CardDescription>
                        All shortcuts with progress
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {flatMenu.map((item, index) => (
                            <Link key={index} href={item.href}>
                                <Button
                                    variant="outline"
                                    className="h-auto p-4 flex-col gap-2 w-full"
                                >
                                    {/* أيقونة متجاوبة */}
                                    <item.icon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 lg:h-10 lg:w-10" />
                                    {/* نص متجاوب مع رقم */}
                                    <span className="text-xs sm:text-sm md:text-base font-medium text-center">
                                        {String(index + 1).padStart(2, '0')} - {item.title}
                                    </span>
                                </Button>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
