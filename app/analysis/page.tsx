'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
    TrendingUp, 
    RefreshCw, 
    FileSpreadsheet, 
    Download, 
    X, 
    Search, 
    BarChart3,
    LineChart,
    PieChart,
    Activity,
    Users,
    FolderOpen,
    DollarSign,
    ClipboardList,
    Building,
    Target,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { DatePicker } from '@/components/DatePicker';

/* =========================
   Types
========================= */
interface AnalysisData {
    id: string;
    category: string;
    title: string;
    current_value: number | string;
    previous_value: number | string;
    change_percentage: number;
    trend: 'up' | 'down' | 'stable';
    icon: any;
    color: string;
    description?: string;
}

interface PerformanceMetric {
    metric: string;
    value: number;
    target: number;
    percentage: number;
    status: 'excellent' | 'good' | 'average' | 'poor';
    color: string;
}

interface TrendData {
    period: string;
    projects: number;
    clients: number;
    revenue: number;
    tasks: number;
}

/* =========================
   Component
========================= */
export default function AnalysisPage() {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<'All' | 'Projects' | 'Clients' | 'Financial' | 'Performance' | 'Growth'>('All');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Mock analysis data
    const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);
    const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
    const [trendData, setTrendData] = useState<TrendData[]>([]);

    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            const mockAnalysis: AnalysisData[] = [
                {
                    id: '1',
                    category: 'Projects',
                    title: 'Project Completion Rate',
                    current_value: '87.5%',
                    previous_value: '82.3%',
                    change_percentage: 6.3,
                    trend: 'up',
                    icon: Target,
                    color: 'indigo',
                    description: 'Percentage of projects completed on time'
                },
                {
                    id: '2',
                    category: 'Projects',
                    title: 'Average Project Duration',
                    current_value: '45 days',
                    previous_value: '52 days',
                    change_percentage: -13.5,
                    trend: 'up',
                    icon: Activity,
                    color: 'emerald',
                    description: 'Average time to complete projects'
                },
                {
                    id: '3',
                    category: 'Clients',
                    title: 'Client Satisfaction Score',
                    current_value: '4.6/5',
                    previous_value: '4.4/5',
                    change_percentage: 4.5,
                    trend: 'up',
                    icon: Users,
                    color: 'purple',
                    description: 'Overall client satisfaction rating'
                },
                {
                    id: '4',
                    category: 'Clients',
                    title: 'Client Retention Rate',
                    current_value: '92%',
                    previous_value: '89%',
                    change_percentage: 3.4,
                    trend: 'up',
                    icon: Users,
                    color: 'blue',
                    description: 'Percentage of clients retained'
                },
                {
                    id: '5',
                    category: 'Financial',
                    title: 'Revenue Growth',
                    current_value: '15.8%',
                    previous_value: '12.3%',
                    change_percentage: 28.5,
                    trend: 'up',
                    icon: DollarSign,
                    color: 'emerald',
                    description: 'Year-over-year revenue growth'
                },
                {
                    id: '6',
                    category: 'Financial',
                    title: 'Profit Margin',
                    current_value: '23.5%',
                    previous_value: '21.8%',
                    change_percentage: 7.8,
                    trend: 'up',
                    icon: TrendingUp,
                    color: 'green',
                    description: 'Net profit margin percentage'
                },
                {
                    id: '7',
                    category: 'Performance',
                    title: 'Team Efficiency',
                    current_value: '91%',
                    previous_value: '88%',
                    change_percentage: 3.4,
                    trend: 'up',
                    icon: Zap,
                    color: 'yellow',
                    description: 'Overall team performance efficiency'
                },
                {
                    id: '8',
                    category: 'Performance',
                    title: 'Resource Utilization',
                    current_value: '78%',
                    previous_value: '75%',
                    change_percentage: 4.0,
                    trend: 'up',
                    icon: Activity,
                    color: 'orange',
                    description: 'Resource utilization percentage'
                },
                {
                    id: '9',
                    category: 'Growth',
                    title: 'New Clients Growth',
                    current_value: '+28%',
                    previous_value: '+22%',
                    change_percentage: 27.3,
                    trend: 'up',
                    icon: ArrowUpRight,
                    color: 'sky',
                    description: 'New clients acquisition growth'
                },
                {
                    id: '10',
                    category: 'Growth',
                    title: 'Project Portfolio Growth',
                    current_value: '+35%',
                    previous_value: '+30%',
                    change_percentage: 16.7,
                    trend: 'up',
                    icon: FolderOpen,
                    color: 'indigo',
                    description: 'Growth in project portfolio'
                }
            ];

            const mockPerformance: PerformanceMetric[] = [
                {
                    metric: 'Project Delivery',
                    value: 87.5,
                    target: 85,
                    percentage: 102.9,
                    status: 'excellent',
                    color: 'emerald'
                },
                {
                    metric: 'Client Satisfaction',
                    value: 4.6,
                    target: 4.5,
                    percentage: 102.2,
                    status: 'excellent',
                    color: 'purple'
                },
                {
                    metric: 'Budget Adherence',
                    value: 78.2,
                    target: 80,
                    percentage: 97.8,
                    status: 'good',
                    color: 'blue'
                },
                {
                    metric: 'Time Efficiency',
                    value: 82.4,
                    target: 85,
                    percentage: 96.9,
                    status: 'good',
                    color: 'orange'
                },
                {
                    metric: 'Resource Utilization',
                    value: 78.0,
                    target: 80,
                    percentage: 97.5,
                    status: 'good',
                    color: 'yellow'
                }
            ];

            const mockTrendData: TrendData[] = [
                { period: 'Jan', projects: 32, clients: 98, revenue: 450000, tasks: 189 },
                { period: 'Feb', projects: 35, clients: 105, revenue: 480000, tasks: 195 },
                { period: 'Mar', projects: 38, clients: 112, revenue: 510000, tasks: 202 },
                { period: 'Apr', projects: 40, clients: 118, revenue: 540000, tasks: 210 },
                { period: 'May', projects: 42, clients: 122, revenue: 570000, tasks: 218 },
                { period: 'Jun', projects: 45, clients: 128, revenue: 600000, tasks: 225 }
            ];

            setAnalysisData(mockAnalysis);
            setPerformanceMetrics(mockPerformance);
            setTrendData(mockTrendData);
            setLoading(false);
        }, 500);
    }, []);

    const refreshAnalysis = async () => {
        setIsRefreshing(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Analysis data refreshed successfully');
        } catch (err) {
            toast.error('Failed to refresh analysis data');
        } finally {
            setIsRefreshing(false);
        }
    };

    const exportAnalysis = async () => {
        setIsExporting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Analysis data exported successfully');
        } catch (err) {
            toast.error('Failed to export analysis data');
        } finally {
            setIsExporting(false);
        }
    };

    const getTrendIcon = (trend?: string) => {
        if (trend === 'up') {
            return <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />;
        } else if (trend === 'down') {
            return <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />;
        }
        return null;
    };

    const getCategoryColor = (color?: string) => {
        const colors: Record<string, string> = {
            indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
            purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
            emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
            green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
            blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
            orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
            sky: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
        };
        return colors[color || 'indigo'] || colors.indigo;
    };

    const getPerformanceColor = (status: string) => {
        const colors: Record<string, string> = {
            excellent: 'bg-emerald-500',
            good: 'bg-blue-500',
            average: 'bg-yellow-500',
            poor: 'bg-red-500'
        };
        return colors[status] || colors.good;
    };

    const filteredAnalysis = analysisData.filter(item => {
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
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
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Analysis</h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Comprehensive analysis and insights for projects, clients, financial performance, and business metrics
                        </p>
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <EnhancedCard 
                        title="Completion Rate" 
                        variant="default" 
                        size="sm"
                        stats={{
                            badge: 'Excellent',
                            badgeColor: 'success'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                                87.5%
                            </div>
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                {getTrendIcon('up')}
                                <span className="text-sm font-semibold">+6.3%</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            Projects completed on time
                        </p>
                    </EnhancedCard>

                    <EnhancedCard 
                        title="Revenue Growth" 
                        variant="default" 
                        size="sm"
                        stats={{
                            badge: 'Strong',
                            badgeColor: 'success'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                                15.8%
                            </div>
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                {getTrendIcon('up')}
                                <span className="text-sm font-semibold">+28.5%</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            Year-over-year growth
                        </p>
                    </EnhancedCard>

                    <EnhancedCard 
                        title="Client Satisfaction" 
                        variant="default" 
                        size="sm"
                        stats={{
                            badge: 'High',
                            badgeColor: 'success'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                                4.6/5
                            </div>
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                {getTrendIcon('up')}
                                <span className="text-sm font-semibold">+4.5%</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            Average satisfaction score
                        </p>
                    </EnhancedCard>

                    <EnhancedCard 
                        title="Team Efficiency" 
                        variant="default" 
                        size="sm"
                        stats={{
                            badge: 'Excellent',
                            badgeColor: 'success'
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                                91%
                            </div>
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                {getTrendIcon('up')}
                                <span className="text-sm font-semibold">+3.4%</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            Overall performance efficiency
                        </p>
                    </EnhancedCard>
                </div>

                {/* Filters Card */}
                <EnhancedCard
                    title="Filters & Options"
                    description="Filter analysis data by category and date range"
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
                                        <SelectItem value="Performance" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Performance</SelectItem>
                                        <SelectItem value="Growth" className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">Growth</SelectItem>
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
                                onClick={refreshAnalysis}
                                disabled={isRefreshing}
                                className="border-sky-200 dark:border-sky-800 hover:text-sky-700 hover:border-sky-300 dark:hover:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 whitespace-nowrap"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={exportAnalysis}
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

                {/* Performance Metrics */}
                <EnhancedCard
                    title="Performance Metrics"
                    description="Track key performance indicators against targets"
                    variant="default"
                    size="sm"
                    stats={{
                        total: performanceMetrics.length,
                        badge: 'KPIs',
                        badgeColor: 'info'
                    }}
                >
                    <div className="space-y-4">
                        {performanceMetrics.map((metric, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            {metric.metric}
                                        </span>
                                        <Badge 
                                            variant="outline" 
                                            className={`${
                                                metric.status === 'excellent' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                                                metric.status === 'good' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                                                metric.status === 'average' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' :
                                                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                                            }`}
                                        >
                                            {metric.status}
                                        </Badge>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                            {metric.value} / {metric.target}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {metric.percentage.toFixed(1)}% of target
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-500 ${getPerformanceColor(metric.status)}`}
                                        style={{ width: `${Math.min(metric.percentage, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </EnhancedCard>

                {/* Analysis Data Cards */}
                <EnhancedCard
                    title="Detailed Analysis"
                    description={`${filteredAnalysis.length} analysis metric${filteredAnalysis.length !== 1 ? 's' : ''} available`}
                    variant="default"
                    size="sm"
                    stats={{
                        total: filteredAnalysis.length,
                        badge: 'Metrics',
                        badgeColor: 'success'
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredAnalysis.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div 
                                    key={item.id}
                                    className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 transition-colors duration-200"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-2 rounded-lg ${getCategoryColor(item.color)}`}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <Badge variant="outline" className={`${getCategoryColor(item.color)}`}>
                                                {item.category}
                                            </Badge>
                                        </div>
                                        {item.trend && getTrendIcon(item.trend)}
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                                        {item.title}
                                    </h3>
                                    {item.description && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                            {item.description}
                                        </p>
                                    )}
                                    <div className="flex items-end justify-between">
                                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                            {item.current_value}
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-semibold ${
                                                item.trend === 'up' 
                                                    ? 'text-green-600 dark:text-green-400' 
                                                    : item.trend === 'down'
                                                    ? 'text-red-600 dark:text-red-400'
                                                    : 'text-slate-600 dark:text-slate-400'
                                            }`}>
                                                {item.trend === 'up' ? '+' : item.trend === 'down' ? '-' : ''}
                                                {item.change_percentage}%
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                vs previous
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </EnhancedCard>
            </div>
        </>
    );
}

