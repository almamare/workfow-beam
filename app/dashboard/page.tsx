'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import {
    Users,
    FileText,
    FolderOpen,
    Wallet,
    Settings,
    ClipboardList,
    Activity,
    Building,
    UserCircle,
    Bell,
    FileSignature,
    BarChart2,
    FileArchive,
    PieChart,
    Shield,
    Receipt,
    Landmark,
    TrendingUp,
    CreditCard,
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { EnhancedCard } from '@/components/ui/enhanced-card';

// Essential menu items only
const allMenuItems = [
    {
        number: 1,
        title: 'Clients',
        icon: UserCircle,
        href: '/clients',
        color: 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700'
    },
    {
        number: 2,
        title: 'Projects',
        icon: FolderOpen,
        href: '/projects',
        color: 'from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700'
    },
    {
        number: 3,
        title: 'Contractors',
        icon: Building,
        href: '/contractors',
        color: 'from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700'
    },
    {
        number: 4,
        title: 'Task Orders',
        icon: ClipboardList,
        href: '/tasks',
        color: 'from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700'
    },
    {
        number: 5,
        title: 'Users',
        icon: Users,
        href: '/users',
        color: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700'
    },
    {
        number: 6,
        title: 'Financial',
        icon: Wallet,
        href: '/financial/contractor-payments',
        color: 'from-green-500 to-green-600 dark:from-green-600 dark:to-green-700'
    },
    {
        number: 7,
        title: 'Requests',
        icon: FileText,
        href: '/requests/tasks',
        color: 'from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700'
    },
    {
        number: 8,
        title: 'Settings',
        icon: Settings,
        href: '/settings',
        color: 'from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700'
    },
    {
        number: 9,
        title: 'Notifications',
        icon: Bell,
        href: '/notifications',
        color: 'from-red-500 to-red-600 dark:from-red-600 dark:to-red-700'
    },
    {
        number: 10,
        title: 'Forms',
        icon: FileSignature,
        href: '/forms',
        color: 'from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700'
    },
    {
        number: 11,
        title: 'Reports',
        icon: BarChart2,
        href: '/reports',
        color: 'from-sky-500 to-sky-600 dark:from-sky-600 dark:to-sky-700'
    },
    {
        number: 12,
        title: 'Documents',
        icon: FileArchive,
        href: '/documents',
        color: 'from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700'
    },
    {
        number: 13,
        title: 'Statistics',
        icon: PieChart,
        href: '/statistics',
        color: 'from-fuchsia-500 to-fuchsia-600 dark:from-fuchsia-600 dark:to-fuchsia-700'
    },
    {
        number: 14,
        title: 'Permissions',
        icon: Shield,
        href: '/permissions',
        color: 'from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-700'
    },
    {
        number: 15,
        title: 'Invoices',
        icon: Receipt,
        href: '/invoices',
        color: 'from-rose-500 to-rose-600 dark:from-rose-600 dark:to-rose-700'
    },
    {
        number: 16,
        title: 'Banks',
        icon: Landmark,
        href: '/banks',
        color: 'from-cyan-500 to-cyan-600 dark:from-cyan-600 dark:to-cyan-700'
    },
    {
        number: 17,
        title: 'Analysis',
        icon: TrendingUp,
        href: '/analysis',
        color: 'from-lime-500 to-lime-600 dark:from-lime-600 dark:to-lime-700'
    },
    {
        number: 18,
        title: 'Bank Balances',
        icon: CreditCard,
        href: '/bank-balances',
        color: 'from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700'
    },
    {
        number: 19,
        title: 'Approvals',
        icon: CheckCircle,
        href: '/approvals',
        color: 'from-pink-500 to-pink-600 dark:from-pink-600 dark:to-pink-700'
    },
];

export default function DashboardPage() {
    // Explicitly type state as RootState to avoid 'unknown' type error
    const user = useSelector((state: RootState) => (state as RootState).login.user);
    const [userName, setUserName] = useState('User');

    useEffect(() => {
        if (user && typeof user.name === 'string') {
            setUserName(user.name + ' ' + user.surname);
        }
    }, [user]);

    return (
        <div className="bg-slate-100 dark:bg-slate-900 transition-colors duration-300 p-3 sm:p-4 md:p-6">
            {/* Header Section */}
            <div className="mb-4 md:mb-6">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400 dark:from-orange-400 dark:via-orange-300 dark:to-orange-500 bg-clip-text text-transparent mb-2 leading-tight">
                    Welcome to Shuaa Al-Ranou Trade & General Contracting
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 font-medium">
                    Welcome, <span className="text-orange-600 dark:text-orange-400 font-semibold">{userName}</span>
                </p>
            </div>

            {/* Navigation Grid */} 
            <EnhancedCard 
                title={'Choose the section you want to access'} 
                description={'Navigate to the section you want to access'} 
                variant="default" 
                size="sm"
            >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4">
                    {allMenuItems.map((item) => (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className="block group"
                        >
                            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-lg dark:hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer h-full active:scale-95">
                                {/* Background gradient on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white/50 dark:from-slate-700/30 dark:to-slate-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                
                                {/* Content */}
                                <div className="relative p-3 sm:p-4 flex flex-col items-center justify-center text-center h-full min-h-[100px] sm:min-h-[120px] md:min-h-[140px]">
                                    {/* Icon Container */}
                                    <div className="mb-2 sm:mb-3">
                                        <div className={`p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r ${item.color} group-hover:scale-110 dark:group-hover:shadow-lg transition-all duration-300 inline-block shadow-md dark:shadow-lg`}>
                                            {item.icon ? (
                                                <item.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                                            ) : (
                                                <Activity className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Number and Title */}
                                    <div className="w-full">
                                        <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-tight line-clamp-2 px-1">
                                            <span className="text-[11px] sm:text-[12px] md:text-[13px] font-bold text-slate-500 dark:text-slate-400 mr-1">
                                                {String(item.number).padStart(2, '0')}.
                                            </span>
                                            {item.title}
                                        </h3>
                                    </div>
                                </div>
                                
                                {/* Hover effect overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl sm:rounded-2xl" />
                            </div>
                        </Link>
                    ))}
                </div>
            </EnhancedCard>
        </div>
    );
}