'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const toggleMobileSidebar = () => {
        setMobileSidebarOpen(!mobileSidebarOpen);
    };

    return (
        <div className="flex h-screen">
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
                mobileOpen={mobileSidebarOpen}
                setMobileOpen={setMobileSidebarOpen}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar onToggleSidebar={toggleMobileSidebar} />
                <main className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900">
                    {children}
                </main>
            </div>
        </div>
    );
}