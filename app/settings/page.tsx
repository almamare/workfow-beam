'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User, Bell, Shield, Database, Palette, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

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
    { value: 'MM/DD/YYYY', label: '12/31/2024' },
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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                    <p className="text-muted-foreground">Manage system and user settings</p>
                </div>
            </div>

            <Tabs defaultValue="user" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="user" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        User
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="system" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        System
                    </TabsTrigger>
                </TabsList>

                {/* User Settings */}
                <TabsContent value="user">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                User Settings
                            </CardTitle>
                            <CardDescription>
                                Manage personal user information
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={userSettings.name}
                                        onChange={(e) => setUserSettings(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={userSettings.email}
                                        onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={userSettings.phone}
                                        onChange={(e) => setUserSettings(prev => ({ ...prev, phone: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="department">Department</Label>
                                    <Input
                                        id="department"
                                        value={userSettings.department}
                                        onChange={(e) => setUserSettings(prev => ({ ...prev, department: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="position">Position</Label>
                                    <Input
                                        id="position"
                                        value={userSettings.position}
                                        onChange={(e) => setUserSettings(prev => ({ ...prev, position: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="language">Language</Label>
                                    <Select value={userSettings.language} onValueChange={(value) => setUserSettings(prev => ({ ...prev, language: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {languages.map(lang => (
                                                <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="timezone">Timezone</Label>
                                <Select value={userSettings.timezone} onValueChange={(value) => setUserSettings(prev => ({ ...prev, timezone: value }))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timezones.map(tz => (
                                            <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handleSaveUserSettings} disabled={isLoading}>
                                    {isLoading ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                Notification Settings
                            </CardTitle>
                            <CardDescription>
                                Manage notification preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Notification Channels</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="emailNotifications">Email Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                                        </div>
                                        <Switch
                                            id="emailNotifications"
                                            checked={notificationSettings.emailNotifications}
                                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="pushNotifications">Push Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Receive instant notifications in browser</p>
                                        </div>
                                        <Switch
                                            id="pushNotifications"
                                            checked={notificationSettings.pushNotifications}
                                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="smsNotifications">SMS Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                                        </div>
                                        <Switch
                                            id="smsNotifications"
                                            checked={notificationSettings.smsNotifications}
                                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Notification Types</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="lowStockAlerts">Low Stock Alerts</Label>
                                            <p className="text-sm text-muted-foreground">Receive alerts when stock is low</p>
                                        </div>
                                        <Switch
                                            id="lowStockAlerts"
                                            checked={notificationSettings.lowStockAlerts}
                                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, lowStockAlerts: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="budgetAlerts">Budget Alerts</Label>
                                            <p className="text-sm text-muted-foreground">Receive alerts about budgets</p>
                                        </div>
                                        <Switch
                                            id="budgetAlerts"
                                            checked={notificationSettings.budgetAlerts}
                                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, budgetAlerts: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="paymentAlerts">Payment Alerts</Label>
                                            <p className="text-sm text-muted-foreground">Receive alerts about payments</p>
                                        </div>
                                        <Switch
                                            id="paymentAlerts"
                                            checked={notificationSettings.paymentAlerts}
                                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, paymentAlerts: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="meetingReminders">Meeting Reminders</Label>
                                            <p className="text-sm text-muted-foreground">Receive meeting reminders</p>
                                        </div>
                                        <Switch
                                            id="meetingReminders"
                                            checked={notificationSettings.meetingReminders}
                                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, meetingReminders: checked }))}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="systemUpdates">System Updates</Label>
                                            <p className="text-sm text-muted-foreground">Receive system update notifications</p>
                                        </div>
                                        <Switch
                                            id="systemUpdates"
                                            checked={notificationSettings.systemUpdates}
                                            onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemUpdates: checked }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSaveNotificationSettings} disabled={isLoading}>
                                    {isLoading ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Security Settings
                            </CardTitle>
                            <CardDescription>
                                Manage security and protection settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                                        <p className="text-sm text-muted-foreground">Enable two-factor authentication for your account</p>
                                    </div>
                                    <Switch
                                        id="twoFactorAuth"
                                        checked={securitySettings.twoFactorAuth}
                                        onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Session Settings</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                                        <Input
                                            id="sessionTimeout"
                                            type="number"
                                            value={securitySettings.sessionTimeout}
                                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                                        <Input
                                            id="passwordExpiry"
                                            type="number"
                                            value={securitySettings.passwordExpiry}
                                            onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordExpiry: parseInt(e.target.value) }))}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="loginAttempts">Allowed Login Attempts</Label>
                                    <Input
                                        id="loginAttempts"
                                        type="number"
                                        value={securitySettings.loginAttempts}
                                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginAttempts: parseInt(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">IP Whitelist</h4>
                                <div>
                                    <Label htmlFor="ipWhitelist">Allowed IP Addresses (comma-separated)</Label>
                                    <Textarea
                                        id="ipWhitelist"
                                        value={securitySettings.ipWhitelist.join(', ')}
                                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value.split(',').map(ip => ip.trim()) }))}
                                        placeholder="192.168.1.0/24, 10.0.0.0/8"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSaveSecuritySettings} disabled={isLoading}>
                                    {isLoading ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* System Settings */}
                <TabsContent value="system">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                System Settings
                            </CardTitle>
                            <CardDescription>
                                Manage general system settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Company Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="companyName">Company Name</Label>
                                        <Input
                                            id="companyName"
                                            value={systemSettings.companyName}
                                            onChange={(e) => setSystemSettings(prev => ({ ...prev, companyName: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="companyLogo">Company Logo URL</Label>
                                        <Input
                                            id="companyLogo"
                                            value={systemSettings.companyLogo}
                                            onChange={(e) => setSystemSettings(prev => ({ ...prev, companyLogo: e.target.value }))}
                                        />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">Display Settings</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="defaultCurrency">Default Currency</Label>
                                        <Select value={systemSettings.defaultCurrency} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, defaultCurrency: value }))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {currencies.map(currency => (
                                                    <SelectItem key={currency.value} value={currency.value}>{currency.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="theme">Theme</Label>
                                        <Select value={systemSettings.theme} onValueChange={(value: 'light' | 'dark' | 'auto') => setSystemSettings(prev => ({ ...prev, theme: value }))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {themes.map(theme => (
                                                    <SelectItem key={theme.value} value={theme.value}>{theme.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="dateFormat">Date Format</Label>
                                        <Select value={systemSettings.dateFormat} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, dateFormat: value }))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {dateFormats.map(format => (
                                                    <SelectItem key={format.value} value={format.value}>{format.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="timeFormat">Time Format</Label>
                                        <Select value={systemSettings.timeFormat} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timeFormat: value }))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timeFormats.map(format => (
                                                    <SelectItem key={format.value} value={format.value}>{format.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold">System Settings</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                                            <p className="text-sm text-muted-foreground">Enable maintenance mode for the system</p>
                                        </div>
                                        <Switch
                                            id="maintenanceMode"
                                            checked={systemSettings.maintenanceMode}
                                            onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="backupFrequency">Backup Frequency</Label>
                                        <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, backupFrequency: value }))}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {backupFrequencies.map(freq => (
                                                    <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleSaveSystemSettings} disabled={isLoading}>
                                    {isLoading ? (
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Save Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
