'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  FolderOpen, 
  Package, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const stats = [
  {
    title: 'Total Users',
    value: '1,234',
    change: '+12%',
    changeType: 'positive' as const,
    icon: Users,
    description: 'Active employees'
  },
  {
    title: 'Pending Approvals',
    value: '23',
    change: '+5',
    changeType: 'neutral' as const,
    icon: Clock,
    description: 'Require attention'
  },
  {
    title: 'Active Projects',
    value: '45',
    change: '+8%',
    changeType: 'positive' as const,
    icon: FolderOpen,
    description: 'In progress'
  },
  {
    title: 'Monthly Budget',
    value: '$125,000',
    change: '-3%',
    changeType: 'negative' as const,
    icon: DollarSign,
    description: 'Current month'
  }
];

const recentActivities = [
  {
    id: 1,
    type: 'approval',
    message: 'Contract request approved for Project Alpha',
    time: '2 hours ago',
    status: 'approved'
  },
  {
    id: 2,
    type: 'request',
    message: 'New advance request submitted by John Doe',
    time: '4 hours ago',
    status: 'pending'
  },
  {
    id: 3,
    type: 'project',
    message: 'Project Beta milestone completed',
    time: '6 hours ago',
    status: 'completed'
  },
  {
    id: 4,
    type: 'inventory',
    message: 'Low stock alert for Item #12345',
    time: '8 hours ago',
    status: 'warning'
  }
];

const alerts = [
  {
    id: 1,
    type: 'warning',
    message: '5 items below minimum stock level',
    action: 'View Inventory'
  },
  {
    id: 2,
    type: 'info',
    message: '3 contracts expiring this month',
    action: 'Review Contracts'
  },
  {
    id: 3,
    type: 'urgent',
    message: '2 overdue project deliverables',
    action: 'View Projects'
  }
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your enterprise workflow system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {stat.changeType === 'positive' && (
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                )}
                {stat.changeType === 'negative' && (
                  <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={
                  stat.changeType === 'positive' ? 'text-green-500' :
                  stat.changeType === 'negative' ? 'text-red-500' :
                  'text-muted-foreground'
                }>
                  {stat.change}
                </span>
                <span className="ml-1">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>
              Latest updates from across your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0">
                    {activity.status === 'approved' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {activity.status === 'pending' && (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    {activity.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                    {activity.status === 'warning' && (
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                  <Badge variant={
                    activity.status === 'approved' ? 'approved' :
                    activity.status === 'pending' ? 'pending' :
                    activity.status === 'completed' ? 'completed' :
                    'default'
                  }>
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
            <CardDescription>
              Items requiring your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg border">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                      alert.type === 'urgent' ? 'text-red-500' :
                      alert.type === 'warning' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {alert.message}
                      </p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                        {alert.action}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">New Request</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Add User</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <FolderOpen className="h-6 w-6" />
              <span className="text-sm">New Project</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Package className="h-6 w-6" />
              <span className="text-sm">Inventory</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}