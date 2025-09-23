'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
    TrendingUp,
    TrendingDown,
    Activity,
    Clock,
    CheckCircle,
    AlertTriangle,
    BarChart3,
    PieChart,
    Calendar,
    Bell,
    Star,
    ArrowRight,
    Plus,
    Eye,
    Edit,
    Trash2,
} from 'lucide-react';
import Link from 'next/link';

const menuItems = [
    {
        title: 'Dashboard',
        icon: Home,
        href: '/dashboard',
        color: 'from-blue-500 to-blue-600',
        description: 'Main overview'
    },
    {
        title: 'Projects & Tasks',
        icon: FolderOpen,
        children: [
            { title: 'Clients', icon: Users, href: '/clients', color: 'from-purple-500 to-purple-600' },
            { title: 'Projects', icon: FolderOpen, href: '/projects', color: 'from-indigo-500 to-indigo-600' },
            { title: 'Budgets', icon: Wallet, href: '/budgets', color: 'from-green-500 to-green-600' },
            { title: 'Task Orders', icon: FileText, href: '/tasks', color: 'from-orange-500 to-orange-600' },
        ],
        color: 'from-indigo-500 to-indigo-600',
        description: 'Project management'
    },
    {
        title: 'User Management',
        icon: Users,
        children: [
            { title: 'Users', icon: Users, href: '/users', color: 'from-blue-500 to-blue-600' },
            { title: 'Permissions', icon: Shield, href: '/permissions', color: 'from-red-500 to-red-600' },
            { title: 'Employees', icon: Contact, href: '/employees', color: 'from-green-500 to-green-600' },
        ],
        color: 'from-blue-500 to-blue-600',
        description: 'User administration'
    },
    {
        title: 'Requests & Approvals',
        icon: FileText,
        children: [
            { title: 'Tasks Requests', icon: FileText, href: '/requests/tasks', color: 'from-yellow-500 to-yellow-600' },
            { title: 'Financial Requests', icon: FileText, href: '/requests/financial', color: 'from-green-500 to-green-600' },
            { title: 'Employees Requests', icon: FileText, href: '/requests/employees', color: 'from-purple-500 to-purple-600' },
            { title: 'Approvals', icon: Shield, href: '/approvals', color: 'from-red-500 to-red-600' },
        ],
        color: 'from-yellow-500 to-yellow-600',
        description: 'Request management'
    },
    {
        title: 'Financial',
        icon: Wallet,
        children: [
            { title: 'Contractor Payments', icon: DollarSign, href: '/financial/contractor-payments', color: 'from-green-500 to-green-600' },
            { title: 'Cash Ledger', icon: DollarSign, href: '/financial/cash-ledger', color: 'from-emerald-500 to-emerald-600' },
            { title: 'Project Budgets', icon: DollarSign, href: '/financial/budgets', color: 'from-teal-500 to-teal-600' },
            { title: 'Loans', icon: DollarSign, href: '/financial/loans', color: 'from-cyan-500 to-cyan-600' },
        ],
        color: 'from-green-500 to-green-600',
        description: 'Financial operations'
    },
    {
        title: 'Inventory',
        icon: Package,
        children: [
            { title: 'Items', icon: Package, href: '/inventory/items', color: 'from-orange-500 to-orange-600' },
            { title: 'Transactions', icon: FileText, href: '/inventory/transactions', color: 'from-amber-500 to-amber-600' },
        ],
        color: 'from-orange-500 to-orange-600',
        description: 'Inventory management'
    },
    {
        title: 'Contractors',
        icon: Users,
        href: '/contractors',
        color: 'from-purple-500 to-purple-600',
        description: 'Contractor management'
    },
    {
        title: 'Notifications',
        icon: Megaphone,
        href: '/notifications',
        color: 'from-pink-500 to-pink-600',
        description: 'System notifications'
    },
    {
        title: 'Settings',
        icon: Settings,
        href: '/settings',
        color: 'from-gray-500 to-gray-600',
        description: 'System settings'
    },
];

// Mock data for dashboard statistics
const dashboardStats = [
    {
        title: 'Total Projects',
        value: '24',
        change: '+12%',
        trend: 'up',
        icon: FolderOpen,
        color: 'from-blue-500 to-blue-600',
        description: 'Active projects this month'
    },
    {
        title: 'Active Tasks',
        value: '156',
        change: '+8%',
        trend: 'up',
        icon: CheckCircle,
        color: 'from-green-500 to-green-600',
        description: 'Tasks in progress'
    },
    {
        title: 'Budget Used',
        value: '78%',
        change: '-3%',
        trend: 'down',
        icon: BarChart3,
        color: 'from-orange-500 to-orange-600',
        description: 'Of total budget'
    },
    {
        title: 'Team Members',
        value: '45',
        change: '+5%',
        trend: 'up',
        icon: Users,
        color: 'from-purple-500 to-purple-600',
        description: 'Active team members'
    }
];

const recentActivities = [
    {
        id: 1,
        type: 'project',
        title: 'New project created',
        description: 'Office Building Renovation project has been created',
        time: '2 hours ago',
        icon: FolderOpen,
        color: 'text-blue-600'
    },
    {
        id: 2,
        type: 'task',
        title: 'Task completed',
        description: 'Budget review task has been completed by Ahmed Ali',
        time: '4 hours ago',
        icon: CheckCircle,
        color: 'text-green-600'
    },
    {
        id: 3,
        type: 'payment',
        title: 'Payment processed',
        description: 'Contractor payment of SAR 50,000 has been processed',
        time: '6 hours ago',
        icon: DollarSign,
        color: 'text-green-600'
    },
    {
        id: 4,
        type: 'alert',
        title: 'Low stock alert',
        description: 'Office supplies inventory is running low',
        time: '8 hours ago',
        icon: AlertTriangle,
        color: 'text-yellow-600'
    },
    {
        id: 5,
        type: 'user',
        title: 'New user added',
        description: 'Sarah Ahmed has been added to the team',
        time: '12 hours ago',
        icon: Users,
        color: 'text-purple-600'
    }
];

const quickActions = [
    {
        title: 'Create Project',
        description: 'Start a new project',
        icon: Plus,
        href: '/projects',
        color: 'from-blue-500 to-blue-600'
    },
    {
        title: 'Add Task',
        description: 'Create a new task',
        icon: FileText,
        href: '/tasks',
        color: 'from-green-500 to-green-600'
    },
    {
        title: 'Process Payment',
        description: 'Handle contractor payments',
        icon: DollarSign,
        href: '/financial/contractor-payments',
        color: 'from-emerald-500 to-emerald-600'
    },
    {
        title: 'View Reports',
        description: 'Access system reports',
        icon: BarChart3,
        href: '/reports',
        color: 'from-purple-500 to-purple-600'
    }
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Welcome Back!
                        </h1>
                        <p className="text-slate-600 mt-2 text-lg">
                            Here's what's happening with your projects today
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="px-4 py-2 text-sm">
                            <Clock className="w-4 h-4 mr-2" />
                            Last updated: 2 min ago
                        </Badge>
                        <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg">
                            <Plus className="w-4 h-4 mr-2" />
                            Quick Add
                        </Button>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {dashboardStats.map((stat, index) => (
                    <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-600 text-sm font-medium mb-1">{stat.title}</p>
                                    <p className="text-3xl font-bold text-slate-800 mb-1">{stat.value}</p>
                                    <div className="flex items-center gap-2">
                                        {stat.trend === 'up' ? (
                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-500" />
                                        )}
                                        <span className={`text-sm font-medium ${
                                            stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {stat.change}
                                        </span>
                                        <span className="text-slate-500 text-sm">vs last month</span>
                                    </div>
                                </div>
                                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <p className="text-slate-500 text-xs mt-3">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Quick Actions */}
                <Card className="lg:col-span-2 shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-2">
                            <Star className="w-5 h-5" />
                            Quick Actions
                        </CardTitle>
                        <CardDescription className="text-slate-200">
                            Common tasks and shortcuts
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {quickActions.map((action, index) => (
                                <Link key={index} href={action.href}>
                                    <Button
                                        variant="outline"
                                        className="w-full h-auto p-6 flex flex-col items-center gap-3 hover:shadow-lg transition-all duration-300 border-2 hover:border-orange-200 group"
                                    >
                                        <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <action.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-semibold text-slate-800">{action.title}</p>
                                            <p className="text-sm text-slate-600">{action.description}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card className="shadow-lg border-0">
                    <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            Recent Activities
                        </CardTitle>
                        <CardDescription className="text-slate-200">
                            Latest system updates
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className={`p-2 rounded-lg bg-slate-100 ${activity.color}`}>
                                        <activity.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 text-sm">{activity.title}</p>
                                        <p className="text-slate-600 text-xs mt-1 line-clamp-2">{activity.description}</p>
                                        <p className="text-slate-400 text-xs mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-4 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                            View All Activities
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Navigation Menu */}
            <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        System Navigation
                    </CardTitle>
                    <CardDescription className="text-orange-100">
                        Access all system modules and features
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {menuItems.map((item, index) => (
                            <div key={index} className="group">
                                {item.children ? (
                                    <div className="space-y-2">
                                        <div className={`p-4 rounded-xl bg-gradient-to-r ${item.color} text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                                            <div className="flex items-center gap-3">
                                                <item.icon className="w-6 h-6" />
                                                <div>
                                                    <h3 className="font-semibold">{item.title}</h3>
                                                    <p className="text-sm opacity-90">{item.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 ml-4">
                                            {item.children.map((child, childIndex) => (
                                                <Link key={childIndex} href={child.href}>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-start h-auto p-3 hover:shadow-md transition-all duration-300 border-l-4 border-l-transparent hover:border-l-orange-400"
                                                    >
                                                        <child.icon className={`w-4 h-4 mr-3 text-${child.color.split('-')[1]}-500`} />
                                                        <span className="text-sm">{child.title}</span>
                                                    </Button>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <Link href={item.href}>
                                        <Button
                                            variant="outline"
                                            className="w-full h-auto p-4 flex flex-col items-center gap-3 hover:shadow-lg transition-all duration-300 group border-2 hover:border-orange-200"
                                        >
                                            <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                <item.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="text-center">
                                                <p className="font-semibold text-slate-800">{item.title}</p>
                                                <p className="text-sm text-slate-600">{item.description}</p>
                                            </div>
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}