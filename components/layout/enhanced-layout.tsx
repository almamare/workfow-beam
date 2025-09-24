'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import { cn } from '@/lib/utils';

interface EnhancedLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function EnhancedLayout({ children, className = '' }: EnhancedLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Sidebar */}
      <Sidebar collapsed={false} onToggle={() => {}} />
      
      {/* Main Content Area */}
      <div className="lg:pl-72">
        {/* Navbar */}
        <Navbar />
        
        {/* Page Content */}
        <main className="relative">
          <div className={cn(
            'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8',
            'animate-in fade-in duration-500',
            className
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
