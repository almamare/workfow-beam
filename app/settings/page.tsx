'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User, Bell, Shield, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';

interface UserSettings {
    name: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    language: string;
    timezone: string;
    avatar?: string;
}

interface NotificationSettings {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    lowStockAlerts: boolean;
    budgetAlerts: boolean;
    paymentAlerts: boolean;
    meetingReminders: boolean;
    systemUpdates: boolean;
}

interface SecuritySettings {
    twoFactorAuth: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    loginAttempts: number;
    ipWhitelist: string[];
}

interface SystemSettings {
    companyName: string;
    companyLogo?: string;
    defaultCurrency: string;
    dateFormat: string;
    timeFormat: string;
    theme: 'light' | 'dark' | 'auto';
    maintenanceMode: boolean;
    backupFrequency: string;
}

const mockUserSettings: UserSettings = {
    name: 'Ahmed Mohamed',
    email: 'ahmed.mohamed@company.com',
    phone: '+966501234567',
    department: 'Project Management',
    position: 'Project Manager',
    language: 'en',
    timezone: 'Asia/Riyadh',
    avatar: 'https://cdn.shuarano.com/img/logo.png'
};

const mockNotificationSettings: NotificationSettings = {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    lowStockAlerts: true,
    budgetAlerts: true,
    paymentAlerts: true,
    meetingReminders: true,
    systemUpdates: false
};

const mockSecuritySettings: SecuritySettings = {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5,
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8']
};

const mockSystemSettings: SystemSettings = {
    companyName: 'Shuaa Al-Ranou Trade & General Contracting',
    companyLogo: 'https://cdn.shuarano.com/img/logo.png',
    defaultCurrency: 'USD',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    theme: 'light',
    maintenanceMode: false,
    backupFrequency: 'daily'
};

const languages = [
    { value: 'ar', label: 'العربية' },
    { value: 'en', label: 'English' }
];

const timezones = [
    { value: 'Asia/Riyadh', label: 'Riyadh (GMT+3)' },
    { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
    { value: 'Europe/London', label: 'London (GMT+0)' },
    { value: 'America/New_York', label: 'New York (GMT-5)' }
];

const currencies = [
    { value: 'USD', label: 'US Dollar' },
    { value: 'EUR', label: 'Euro' },
    { value: 'AED', label: 'UAE Dirham' },
    { value: 'GBP', label: 'British Pound' }
];

const dateFormats = [
    { value: 'DD/MM/YYYY', label: '31/12/2024' },
    { value: 'YYYY-MM-DD', label: '2024-12-31' }
];

const timeFormats = [
    { value: '12h', label: '12 Hour (AM/PM)' },
    { value: '24h', label: '24 Hour' }
];

const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto' }
];

const backupFrequencies = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
];

export default function SettingsPage() {
    const [userSettings, setUserSettings] = useState<UserSettings>(mockUserSettings);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(mockNotificationSettings);
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(mockSecuritySettings);
    const [systemSettings, setSystemSettings] = useState<SystemSettings>(mockSystemSettings);
    const [isLoading, setIsLoading] = useState(false);

    const handleSaveUserSettings = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('User settings saved successfully');
        } catch (error) {
            toast.error('Error saving settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveNotificationSettings = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Notification settings saved successfully');
        } catch (error) {
            toast.error('Error saving settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSecuritySettings = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Security settings saved successfully');
        } catch (error) {
            toast.error('Error saving settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSystemSettings = async () => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('System settings saved successfully');
        } catch (error) {
            toast.error('Error saving settings');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Settings</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Manage system and user settings with comprehensive configuration tools
                    </p>
                </div>
            </div>

            <Tabs defaultValue="user" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                    <TabsTrigger 
                        value="user" 
                        className="flex items-center gap-2 data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-600 dark:text-slate-400"
                    >
                        <User className="h-4 w-4" />
                        User
                    </TabsTrigger>
                    <TabsTrigger 
                        value="notifications" 
                        className="flex items-center gap-2 data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-600 dark:text-slate-400"
                    >
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger 
                        value="security" 
                        className="flex items-center gap-2 data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-600 dark:text-slate-400"
                    >
                        <Shield className="h-4 w-4" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger 
                        value="system" 
                        className="flex items-center gap-2 data-[state=active]:bg-sky-500 data-[state=active]:text-white text-slate-600 dark:text-slate-400"
                    >
                        <Settings className="h-4 w-4" />
                        System
                    </TabsTrigger>
                </TabsList>

                {/* User Settings */}
                <TabsContent value="user">
                    <EnhancedCard 
                        title="User Settings"
                        description="Manage personal user information and preferences"
                        variant="default"
                        size="sm"
                    >
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={userSettings.name}
                                        onChange={(e) => setUserSettings(prev => ({ ...prev, name: e.target.value }))}
                                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={userSettings.email}
                                        onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
                                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-slate-700 dark:text-slate-200">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={userSettings.phone}
                                        onChange={(e) => setUserSettings(prev => ({ ...prev, phone: e.target.value }))}
                                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department" className="text-slate-700 dark:text-slate-200">Department</Label>
                                    <Input
                                        id="department"
                                        value={userSettings.department}
                                        onChange={(e) => setUserSettings(prev => ({ ...prev, department: e.target.value }))}
                                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="position" className="text-slate-700 dark:text-slate-200">Position</Label>
                                    <Input
                                        id="position"
                                        value={userSettings.position}
                                        onChange={(e) => setUserSettings(prev => ({ ...prev, position: e.target.value }))}
                                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="language" className="text-slate-700 dark:text-slate-200">Language</Label>
                                    <Select value={userSettings.language} onValueChange={(value) => setUserSettings(prev => ({ ...prev, language: value }))}>
                                        <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                            {languages.map(lang => (
                                                <SelectItem key={lang.value} value={lang.value} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{lang.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="timezone" className="text-slate-700 dark:text-slate-200">Timezone</Label>
                                <Select value={userSettings.timezone} onValueChange={(value) => setUserSettings(prev => ({ ...prev, timezone: value }))}>
                                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        {timezones.map(tz => (
                                            <SelectItem key={tz.value} value={tz.value} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{tz.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                                <Button 
                                    onClick={handleSaveUserSettings} 
                                    disabled={isLoading}
                                    className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 dark:from-sky-600 dark:to-sky-700 dark:hover:from-sky-700 dark:hover:to-sky-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    {isLoading ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Settings
                                </Button>
                            </div>
                        </div>
                    </EnhancedCard>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications">
                    <EnhancedCard 
                        title="Notification Settings"
                        description="Manage notification preferences and alert settings"
                        variant="default"
                        size="sm"
                    >
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Notification Channels</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div>
                                            <Label htmlFor="emailNotifications" className="text-slate-700 dark:text-slate-200">Email Notifications</Label>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Receive notifications via email</p>
                                        </div>
                                        <Switch
                                            id="emailNotifications"
                                            checked={notificationSettings.emailNotifications}
                                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div>
                                            <Label htmlFor="pushNotifications" className="text-slate-700 dark:text-slate-200">Push Notifications</Label>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Receive instant notifications in browser</p>
                                        </div>
                                        <Switch
                                            id="pushNotifications"
                                            checked={notificationSettings.pushNotifications}
                                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div>
                                            <Label htmlFor="smsNotifications" className="text-slate-700 dark:text-slate-200">SMS Notifications</Label>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Receive notifications via SMS</p>
                                        </div>
                                        <Switch
                                            id="smsNotifications"
                                            checked={notificationSettings.smsNotifications}
                                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-slate-200 dark:bg-slate-700" />

                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Notification Types</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div>
                                            <Label htmlFor="lowStockAlerts" className="text-slate-700 dark:text-slate-200">Low Stock Alerts</Label>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Receive alerts when stock is low</p>
                                        </div>
                                        <Switch
                                            id="lowStockAlerts"
                                            checked={notificationSettings.lowStockAlerts}
                                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, lowStockAlerts: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div>
                                            <Label htmlFor="budgetAlerts" className="text-slate-700 dark:text-slate-200">Budget Alerts</Label>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Receive alerts about budgets</p>
                                        </div>
                                        <Switch
                                            id="budgetAlerts"
                                            checked={notificationSettings.budgetAlerts}
                                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, budgetAlerts: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div>
                                            <Label htmlFor="paymentAlerts" className="text-slate-700 dark:text-slate-200">Payment Alerts</Label>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Receive alerts about payments</p>
                                        </div>
                                        <Switch
                                            id="paymentAlerts"
                                            checked={notificationSettings.paymentAlerts}
                                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, paymentAlerts: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div>
                                            <Label htmlFor="meetingReminders" className="text-slate-700 dark:text-slate-200">Meeting Reminders</Label>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Receive meeting reminders</p>
                                        </div>
                                        <Switch
                                            id="meetingReminders"
                                            checked={notificationSettings.meetingReminders}
                                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, meetingReminders: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div>
                                            <Label htmlFor="systemUpdates" className="text-slate-700 dark:text-slate-200">System Updates</Label>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Receive system update notifications</p>
                                        </div>
                                        <Switch
                                            id="systemUpdates"
                                            checked={notificationSettings.systemUpdates}
                                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemUpdates: checked }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                                <Button 
                                    onClick={handleSaveNotificationSettings} 
                                    disabled={isLoading}
                                    className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 dark:from-sky-600 dark:to-sky-700 dark:hover:from-sky-700 dark:hover:to-sky-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    {isLoading ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Settings
                                </Button>
                            </div>
                        </div>
                    </EnhancedCard>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security">
                    <EnhancedCard 
                        title="Security Settings"
                        description="Manage security and protection settings for your account"
                        variant="default"
                        size="sm"
                    >
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div>
                                        <Label htmlFor="twoFactorAuth" className="text-slate-700 dark:text-slate-200">Two-Factor Authentication</Label>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">Enable two-factor authentication for your account</p>
                                    </div>
                                    <Switch
                                        id="twoFactorAuth"
                                        checked={securitySettings.twoFactorAuth}
                                        onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                                    />
                                </div>
                            </div>

                            <Separator className="bg-slate-200 dark:bg-slate-700" />

                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Session Settings</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sessionTimeout" className="text-slate-700 dark:text-slate-200">Session Timeout (minutes)</Label>
                                        <Input
                                            id="sessionTimeout"
                                            type="number"
                                            value={securitySettings.sessionTimeout}
                                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="passwordExpiry" className="text-slate-700 dark:text-slate-200">Password Expiry (days)</Label>
                                        <Input
                                            id="passwordExpiry"
                                            type="number"
                                            value={securitySettings.passwordExpiry}
                                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))}
                                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="loginAttempts" className="text-slate-700 dark:text-slate-200">Allowed Login Attempts</Label>
                                    <Input
                                        id="loginAttempts"
                                        type="number"
                                        value={securitySettings.loginAttempts}
                                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginAttempts: parseInt(e.target.value) }))}
                                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                            </div>

                            <Separator className="bg-slate-200 dark:bg-slate-700" />

                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">IP Whitelist</h4>
                                <div className="space-y-2">
                                    <Label htmlFor="ipWhitelist" className="text-slate-700 dark:text-slate-200">Allowed IP Addresses (comma-separated)</Label>
                                    <Textarea
                                        id="ipWhitelist"
                                        value={securitySettings.ipWhitelist.join(', ')}
                                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value.split(',').map(ip => ip.trim()) }))}
                                        placeholder="192.168.1.0/24, 10.0.0.0/8"
                                        rows={3}
                                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                                <Button 
                                    onClick={handleSaveSecuritySettings} 
                                    disabled={isLoading}
                                    className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 dark:from-sky-600 dark:to-sky-700 dark:hover:from-sky-700 dark:hover:to-sky-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    {isLoading ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Settings
                                </Button>
                            </div>
                        </div>
                    </EnhancedCard>
                </TabsContent>

                {/* System Settings */}
                <TabsContent value="system">
                    <EnhancedCard 
                        title="System Settings"
                        description="Manage general system settings and configurations"
                        variant="default"
                        size="sm"
                    >
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Company Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName" className="text-slate-700 dark:text-slate-200">Company Name</Label>
                                        <Input
                                            id="companyName"
                                            value={systemSettings.companyName}
                                            onChange={(e) => setSystemSettings(prev => ({ ...prev, companyName: e.target.value }))}
                                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="companyLogo" className="text-slate-700 dark:text-slate-200">Company Logo URL</Label>
                                        <Input
                                            id="companyLogo"
                                            value={systemSettings.companyLogo || ''}
                                            onChange={(e) => setSystemSettings(prev => ({ ...prev, companyLogo: e.target.value }))}
                                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-slate-200 dark:bg-slate-700" />

                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Display Settings</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="defaultCurrency" className="text-slate-700 dark:text-slate-200">Default Currency</Label>
                                        <Select value={systemSettings.defaultCurrency} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, defaultCurrency: value }))}>
                                            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                {currencies.map(currency => (
                                                    <SelectItem key={currency.value} value={currency.value} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{currency.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="theme" className="text-slate-700 dark:text-slate-200">Theme</Label>
                                        <Select value={systemSettings.theme} onValueChange={(value: 'light' | 'dark' | 'auto') => setSystemSettings(prev => ({ ...prev, theme: value }))}>
                                            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                {themes.map(theme => (
                                                    <SelectItem key={theme.value} value={theme.value} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{theme.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="dateFormat" className="text-slate-700 dark:text-slate-200">Date Format</Label>
                                        <Select value={systemSettings.dateFormat} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, dateFormat: value }))}>
                                            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                {dateFormats.map(format => (
                                                    <SelectItem key={format.value} value={format.value} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{format.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="timeFormat" className="text-slate-700 dark:text-slate-200">Time Format</Label>
                                        <Select value={systemSettings.timeFormat} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timeFormat: value }))}>
                                            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                {timeFormats.map(format => (
                                                    <SelectItem key={format.value} value={format.value} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{format.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-slate-200 dark:bg-slate-700" />

                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">System Settings</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <div>
                                            <Label htmlFor="maintenanceMode" className="text-slate-700 dark:text-slate-200">Maintenance Mode</Label>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Enable maintenance mode for the system</p>
                                        </div>
                                        <Switch
                                            id="maintenanceMode"
                                            checked={systemSettings.maintenanceMode}
                                            onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="backupFrequency" className="text-slate-700 dark:text-slate-200">Backup Frequency</Label>
                                        <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, backupFrequency: value }))}>
                                            <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                {backupFrequencies.map(freq => (
                                                    <SelectItem key={freq.value} value={freq.value} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{freq.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                                <Button 
                                    onClick={handleSaveSystemSettings} 
                                    disabled={isLoading}
                                    className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 dark:from-sky-600 dark:to-sky-700 dark:hover:from-sky-700 dark:hover:to-sky-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    {isLoading ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Settings
                                </Button>
                            </div>
                        </div>
                    </EnhancedCard>
                </TabsContent>
            </Tabs>
        </div>
    );
}
