'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    PieChart, 
    RefreshCw, 
    FileSpreadsheet, 
    Download, 
    X, 
    Search, 
    TrendingUp,
    TrendingDown,
    BarChart3,
    Users,
    FolderOpen,
    DollarSign,
    ClipboardList,
    Building,
    Wallet,
    FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';

/* =========================
   Types
========================= */
interface Statistic {
    id: string;
    category: string;
    title: string;
    value: number | string;
    previous_value?: number | string;
    change_percentage?: number;
    trend?: 'up' | 'down' | 'stable';
    color?: string;
}

interface CategoryStat {
    category: string;
    total: number;
    active: number;
    percentage: number;
    icon: any;
    color: string;
}

/* =========================
   Component
========================= */
export default function StatisticsPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<'All' | 'Projects' | 'Clients' | 'Financial' | 'Tasks' | 'Users'>('All');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Mock statistics data
    const [statistics, setStatistics] = useState<Statistic[]>([]);
    const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);

    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            const mockStats: Statistic[] = [
                {
                    id: '1',
                    category: 'Projects',
                    title: 'Total Projects',
                    value: 45,
                    previous_value: 42,
                    change_percentage: 7.1,
                    trend: 'up',
                    color: 'indigo'
                },
                {
                    id: '2',
                    category: 'Projects',
                    title: 'Active Projects',
                    value: 32,
                    previous_value: 30,
                    change_percentage: 6.7,
                    trend: 'up',
                    color: 'green'
                },
                {
                    id: '3',
                    category: 'Clients',
                    title: 'Total Clients',
                    value: 128,
                    previous_value: 120,
                    change_percentage: 6.7,
                    trend: 'up',
                    color: 'purple'
                },
                {
                    id: '4',
                    category: 'Clients',
                    title: 'Active Clients',
                    value: 98,
                    previous_value: 95,
                    change_percentage: 3.2,
                    trend: 'up',
                    color: 'emerald'
                },
                {
                    id: '5',
                    category: 'Financial',
                    title: 'Total Budget',
                    value: '5,250,000 IQD',
                    previous_value: '4,800,000 IQD',
                    change_percentage: 9.4,
                    trend: 'up',
                    color: 'emerald'
                },
                {
                    id: '6',
                    category: 'Financial',
                    title: 'Total Expenses',
                    value: '3,125,000 IQD',
                    previous_value: '2,900,000 IQD',
                    change_percentage: 7.8,
                    trend: 'up',
                    color: 'red'
                },
                {
                    id: '7',
                    category: 'Tasks',
                    title: 'Total Tasks',
                    value: 234,
                    previous_value: 220,
                    change_percentage: 6.4,
                    trend: 'up',
                    color: 'yellow'
                },
                {
                    id: '8',
                    category: 'Tasks',
                    title: 'Completed Tasks',
                    value: 189,
                    previous_value: 175,
                    change_percentage: 8.0,
                    trend: 'up',
                    color: 'green'
                },
                {
                    id: '9',
                    category: 'Users',
                    title: 'Total Users',
                    value: 56,
                    previous_value: 54,
                    change_percentage: 3.7,
                    trend: 'up',
                    color: 'blue'
                },
                {
                    id: '10',
                    category: 'Users',
                    title: 'Active Users',
                    value: 48,
                    previous_value: 46,
                    change_percentage: 4.3,
                    trend: 'up',
                    color: 'teal'
                }
            ];

            const mockCategoryStats: CategoryStat[] = [
                {
                    category: 'Projects',
                    total: 45,
                    active: 32,
                    percentage: 71.1,
                    icon: FolderOpen,
                    color: 'indigo'
                },
                {
                    category: 'Clients',
                    total: 128,
                    active: 98,
                    percentage: 76.6,
                    icon: Users,
                    color: 'purple'
                },
                {
                    category: 'Financial',
                    total: 5250000,
                    active: 3125000,
                    percentage: 59.5,
                    icon: DollarSign,
                    color: 'emerald'
                },
                {
                    category: 'Tasks',
                    total: 234,
                    active: 189,
                    percentage: 80.8,
                    icon: ClipboardList,
                    color: 'yellow'
                },
                {
                    category: 'Users',
                    total: 56,
                    active: 48,
                    percentage: 85.7,
                    icon: Users,
                    color: 'blue'
                }
            ];

            setStatistics(mockStats);
            setCategoryStats(mockCategoryStats);
            setLoading(false);
        }, 500);
    }, []);

    const refreshStatistics = async () => {
        setIsRefreshing(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Statistics refreshed successfully');
        } catch (err) {
            toast.error('Failed to refresh statistics');
        } finally {
            setIsRefreshing(false);
        }
    };

    const exportStatistics = async () => {
        setIsExporting(true);
        try {
            // Simulate export
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Statistics exported successfully');
        } catch (err) {
            toast.error('Failed to export statistics');
        } finally {
            setIsExporting(false);
        }
    };

    const getTrendIcon = (trend?: string) => {
        if (trend === 'up') {
            return <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />;
        } else if (trend === 'down') {
            return <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />;
        }
        return null;
    };

    const getCategoryColor = (color?: string) => {
        const colors: Record<string, string> = {
            indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
            purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
            emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
            green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
            red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
            yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
            blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
        };
        return colors[color || 'indigo'] || colors.indigo;
    };

    const filteredStatistics = statistics.filter(stat => {
        const matchesCategory = categoryFilter === 'All' || stat.category === categoryFilter;
        return matchesCategory;
    });

    const filteredCategoryStats = categoryStats.filter(stat => {
        const matchesCategory = categoryFilter === 'All' || stat.category === categoryFilter;
        return matchesCategory;
    });

    const activeFilters = [];
    if (categoryFilter !== 'All') activeFilters.push(`Category: ${categoryFilter}`);
    if (dateFrom) activeFilters.push(`From: ${new Date(dateFrom).toLocaleDateString('en-US')}`);
    if (dateTo) activeFilters.push(`To: ${new Date(dateTo).toLocaleDateString('en-US')}`);

    return (
        <>
            <div className="space-y-4">
                {/* Breadcrumb */}
                <Breadcrumb />
                
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Statistics</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            View comprehensive statistics and analytics for projects, clients, financial data, and more
                        </p>
                    </div>
                </div>

                {/* Main Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <EnhancedCard 
                        title="Total Projects" 
                        variant="default" 
                        size="sm"
                        stats={{
                            badge: 'Active: 32',
                            badgeColor: 'success'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                                45
                            </div>
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                {getTrendIcon('up')}
                                <span className="text-sm font-semibold">+7.1%</span>
                            </div>
                        </div>
                    </EnhancedCard>

                    <EnhancedCard 
                        title="Total Clients" 
                        variant="default" 
                        size="sm"
                        stats={{
                            badge: 'Active: 98',
                            badgeColor: 'success'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                                128
                            </div>
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                {getTrendIcon('up')}
                                <span className="text-sm font-semibold">+6.7%</span>
                            </div>
                        </div>
                    </EnhancedCard>

                    <EnhancedCard 
                        title="Total Budget" 
                        variant="default" 
                        size="sm"
                        stats={{
                            badge: 'IQD',
                            badgeColor: 'info'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                                5.25M
                            </div>
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                {getTrendIcon('up')}
                                <span className="text-sm font-semibold">+9.4%</span>
                            </div>
                        </div>
                    </EnhancedCard>

                    <EnhancedCard 
                        title="Total Tasks" 
                        variant="default" 
                        size="sm"
                        stats={{
                            badge: 'Completed: 189',
                            badgeColor: 'success'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                                234
                            </div>
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                {getTrendIcon('up')}
                                <span className="text-sm font-semibold">+6.4%</span>
                            </div>
                        </div>
                    </EnhancedCard>
                </div>

                {/* Filters Card */}
                <EnhancedCard
                    title="Filters & Options"
                    description="Filter statistics by category and date range"
                    variant="default"
                    size="sm"
                >
                    <div className="space-y-4">
                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Category Filter */}
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-slate-700 dark:text-slate-300 font-medium">
                                    Category
                                </Label>
                                <Select
                                    value={categoryFilter}
                                    onValueChange={(value) => {
                                        setCategoryFilter(value as typeof categoryFilter);
                                    }}
                                >
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        <SelectItem value="All" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">All Categories</SelectItem>
                                        <SelectItem value="Projects" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Projects</SelectItem>
                                        <SelectItem value="Clients" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Clients</SelectItem>
                                        <SelectItem value="Financial" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Financial</SelectItem>
                                        <SelectItem value="Tasks" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Tasks</SelectItem>
                                        <SelectItem value="Users" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Users</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* From Date */}
                            <div className="space-y-2">
                                <Label htmlFor="date_from" className="text-slate-700 dark:text-slate-300 font-medium">
                                    From Date
                                </Label>
                                <DatePicker
                                    value={dateFrom}
                                    onChange={(value) => {
                                        setDateFrom(value);
                                    }}
                                />
                            </div>

                            {/* To Date */}
                            <div className="space-y-2">
                                <Label htmlFor="date_to" className="text-slate-700 dark:text-slate-300 font-medium">
                                    To Date
                                </Label>
                                <DatePicker
                                    value={dateTo}
                                    onChange={(value) => {
                                        setDateTo(value);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={refreshStatistics}
                                disabled={isRefreshing}
                                className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 whitespace-nowrap"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportStatistics}
                                disabled={isExporting}
                                className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 whitespace-nowrap"
                            >
                                <FileSpreadsheet className={`h-4 w-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                                {isExporting ? 'Exporting...' : 'Export Excel'}
                            </Button>
                        </div>

                        {/* Active Filters */}
                        {activeFilters.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Active filters:</span>
                                    {activeFilters.map((filter, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900/50 border-sky-200 dark:border-sky-800"
                                        >
                                            {filter}
                                        </Badge>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setCategoryFilter('All');
                                        setDateFrom('');
                                        setDateTo('');
                                    }}
                                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 whitespace-nowrap"
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Clear All
                                </Button>
                            </div>
                        )}
                    </div>
                </EnhancedCard>

                {/* Category Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategoryStats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <EnhancedCard
                                key={stat.category}
                                title={stat.category}
                                variant="default"
                                size="sm"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-lg ${getCategoryColor(stat.color)}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                                    {typeof stat.total === 'number' && stat.total > 1000000 
                                                        ? `${(stat.total / 1000000).toFixed(2)}M`
                                                        : stat.total.toLocaleString('en-US')}
                                                </div>
                                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                                    Total
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600 dark:text-slate-400">Active</span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                {typeof stat.active === 'number' && stat.active > 1000000
                                                    ? `${(stat.active / 1000000).toFixed(2)}M`
                                                    : stat.active.toLocaleString('en-US')}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full transition-all duration-500 ${
                                                    stat.color === 'indigo' ? 'bg-indigo-500' :
                                                    stat.color === 'purple' ? 'bg-purple-500' :
                                                    stat.color === 'emerald' ? 'bg-emerald-500' :
                                                    stat.color === 'yellow' ? 'bg-yellow-500' :
                                                    stat.color === 'blue' ? 'bg-blue-500' :
                                                    'bg-slate-500'
                                                }`}
                                                style={{ width: `${stat.percentage}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 text-right">
                                            {stat.percentage.toFixed(1)}% Active
                                        </div>
                                    </div>
                                </div>
                            </EnhancedCard>
                        );
                    })}
                </div>

                {/* Detailed Statistics */}
                <EnhancedCard
                    title="Detailed Statistics"
                    description={`${filteredStatistics.length} statistic${filteredStatistics.length !== 1 ? 's' : ''} available`}
                    variant="default"
                    size="sm"
                    stats={{
                        total: filteredStatistics.length,
                        badge: 'Total Statistics',
                        badgeColor: 'success'
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredStatistics.map((stat) => (
                            <div 
                                key={stat.id}
                                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 transition-colors duration-200"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <Badge variant="outline" className={`${getCategoryColor(stat.color)} mb-2`}>
                                            {stat.category}
                                        </Badge>
                                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                            {stat.title}
                                        </h3>
                                    </div>
                                    {stat.trend && getTrendIcon(stat.trend)}
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                        {typeof stat.value === 'number' 
                                            ? stat.value.toLocaleString('en-US')
                                            : stat.value}
                                    </div>
                                    {stat.change_percentage !== undefined && (
                                        <div className={`text-sm font-semibold ${
                                            stat.trend === 'up' 
                                                ? 'text-green-600 dark:text-green-400' 
                                                : stat.trend === 'down'
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-slate-600 dark:text-slate-400'
                                        }`}>
                                            {stat.trend === 'up' ? '+' : stat.trend === 'down' ? '-' : ''}
                                            {stat.change_percentage}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </EnhancedCard>
            </div>
        </>
    );
}

