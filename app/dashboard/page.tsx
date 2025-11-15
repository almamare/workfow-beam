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
    Activity
} from 'lucide-react';
import Link from 'next/link';
import { EnhancedCard } from '@/components/ui/enhanced-card';

// Essential menu items only
const allMenuItems = [
    {
        number: 1,
        title: 'Projects',
        icon: FolderOpen,
        href: '/projects',
        color: 'from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700'
    },
    {
        number: 2,
        title: 'Tasks',
        icon: ClipboardList,
        href: '/tasks',
        color: 'from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700'
    },
    {
        number: 3,
        title: 'Users',
        icon: Users,
        href: '/users',
        color: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700'
    },
    {
        number: 4,
        title: 'Financial',
        icon: Wallet,
        href: '/financial',
        color: 'from-green-500 to-green-600 dark:from-green-600 dark:to-green-700'
    },
    {
        number: 5,
        title: 'Requests',
        icon: FileText,
        href: '/requests',
        color: 'from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700'
    },
    {
        number: 6,
        title: 'Settings',
        icon: Settings,
        href: '/settings',
        color: 'from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700'
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