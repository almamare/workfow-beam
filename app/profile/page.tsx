'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
    User, 
    Save, 
    RefreshCw, 
    Camera, 
    Mail, 
    Phone, 
    Briefcase, 
    MapPin,
    Calendar,
    Lock,
    Eye,
    EyeOff,
    Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfileData {
    name: string;
    surname: string;
    email: string;
    phone: string;
    department: string;
    position: string;
    employee_id?: string;
    hire_date?: string;
    address?: string;
    city?: string;
    country?: string;
    bio?: string;
    avatar?: string;
    language: string;
    timezone: string;
}

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

export default function ProfilePage() {
    const user = useSelector((state: RootState) => (state as RootState).login.user);
    
    const [profileData, setProfileData] = useState<ProfileData>({
        name: '',
        surname: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        employee_id: '',
        hire_date: '',
        address: '',
        city: '',
        country: '',
        bio: '',
        avatar: '',
        language: 'en',
        timezone: 'Asia/Riyadh'
    });

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Load user data from Redux
    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                surname: user.surname || '',
                email: user.email || '',
                phone: user.phone || '',
                department: user.department || '',
                position: user.position || '',
                employee_id: user.employee_id || '',
                hire_date: user.hire_date || '',
                address: user.address || '',
                city: user.city || '',
                country: user.country || '',
                bio: user.bio || '',
                avatar: user.avatar || '',
                language: user.language || 'en',
                timezone: user.timezone || 'Asia/Riyadh'
            });
        }
    }, [user]);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error('Error updating profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Password changed successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            toast.error('Error changing password');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        // Simulate upload
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const imageUrl = URL.createObjectURL(file);
            setProfileData(prev => ({ ...prev, avatar: imageUrl }));
            toast.success('Avatar uploaded successfully');
        } catch (error) {
            toast.error('Error uploading avatar');
        } finally {
            setIsLoading(false);
        }
    };

    const getInitials = () => {
        const name = profileData.name || '';
        const surname = profileData.surname || '';
        return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase() || 'U';
    };

    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <Breadcrumb />
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">Profile</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Manage your personal profile information, preferences, and account settings
                    </p>
                </div>
            </div>

            {/* Profile Header Card */}
            <EnhancedCard
                title="Profile Information"
                description="Your personal profile details"
                variant="default"
                size="sm"
            >
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-slate-200 dark:border-slate-700">
                                <AvatarImage src={profileData.avatar} alt={profileData.name} />
                                <AvatarFallback className="bg-gradient-to-br from-sky-500 to-sky-600 text-white text-2xl md:text-3xl font-bold">
                                    {getInitials()}
                                </AvatarFallback>
                            </Avatar>
                            <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <Camera className="h-4 w-4" />
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                    disabled={isLoading}
                                />
                            </label>
                        </div>
                        {isLoading && (
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <RefreshCw className="h-4 w-4 animate-spin" />
                                Uploading...
                            </div>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">
                                {profileData.name} {profileData.surname}
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mt-1">
                                {profileData.position || 'User'}
                            </p>
                            {profileData.department && (
                                <Badge variant="outline" className="mt-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                                    {profileData.department}
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {profileData.email && (
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                    <Mail className="h-4 w-4" />
                                    <span>{profileData.email}</span>
                                </div>
                            )}
                            {profileData.phone && (
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                    <Phone className="h-4 w-4" />
                                    <span>{profileData.phone}</span>
                                </div>
                            )}
                            {profileData.employee_id && (
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                    <User className="h-4 w-4" />
                                    <span className="font-mono">{profileData.employee_id}</span>
                                </div>
                            )}
                            {profileData.hire_date && (
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(profileData.hire_date).toLocaleDateString('en-US')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </EnhancedCard>

            {/* Personal Information */}
            <EnhancedCard
                title="Personal Information"
                description="Update your personal details and contact information"
                variant="default"
                size="sm"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-700 dark:text-slate-200">First Name</Label>
                            <Input
                                id="name"
                                value={profileData.name}
                                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="surname" className="text-slate-700 dark:text-slate-200">Last Name</Label>
                            <Input
                                id="surname"
                                value={profileData.surname}
                                onChange={(e) => setProfileData(prev => ({ ...prev, surname: e.target.value }))}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-slate-700 dark:text-slate-200">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="employee_id" className="text-slate-700 dark:text-slate-200">Employee ID</Label>
                            <Input
                                id="employee_id"
                                value={profileData.employee_id || ''}
                                onChange={(e) => setProfileData(prev => ({ ...prev, employee_id: e.target.value }))}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 font-mono"
                                placeholder="EMP-001"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hire_date" className="text-slate-700 dark:text-slate-200">Hire Date</Label>
                            <Input
                                id="hire_date"
                                type="date"
                                value={profileData.hire_date || ''}
                                onChange={(e) => setProfileData(prev => ({ ...prev, hire_date: e.target.value }))}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <Separator className="bg-slate-200 dark:bg-slate-700" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="position" className="text-slate-700 dark:text-slate-200">Position</Label>
                            <Input
                                id="position"
                                value={profileData.position}
                                onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="department" className="text-slate-700 dark:text-slate-200">Department</Label>
                            <Input
                                id="department"
                                value={profileData.department}
                                onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address" className="text-slate-700 dark:text-slate-200">Address</Label>
                        <Input
                            id="address"
                            value={profileData.address || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                            placeholder="Street address"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city" className="text-slate-700 dark:text-slate-200">City</Label>
                            <Input
                                id="city"
                                value={profileData.city || ''}
                                onChange={(e) => setProfileData(prev => ({ ...prev, city: e.target.value }))}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country" className="text-slate-700 dark:text-slate-200">Country</Label>
                            <Input
                                id="country"
                                value={profileData.country || ''}
                                onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio" className="text-slate-700 dark:text-slate-200">Bio (Optional)</Label>
                        <Textarea
                            id="bio"
                            value={profileData.bio || ''}
                            onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                            className="min-h-[100px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder="Tell us about yourself..."
                            rows={4}
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button 
                            onClick={handleSaveProfile} 
                            disabled={isSaving}
                            className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 dark:from-sky-600 dark:to-sky-700 dark:hover:from-sky-700 dark:hover:to-sky-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {isSaving ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </EnhancedCard>

            {/* Preferences */}
            <EnhancedCard
                title="Preferences"
                description="Configure your language, timezone, and display preferences"
                variant="default"
                size="sm"
            >
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="language" className="text-slate-700 dark:text-slate-200">Language</Label>
                            <Select
                                value={profileData.language}
                                onValueChange={(value) => setProfileData(prev => ({ ...prev, language: value }))}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    {languages.map(lang => (
                                        <SelectItem key={lang.value} value={lang.value} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{lang.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="timezone" className="text-slate-700 dark:text-slate-200">Timezone</Label>
                            <Select
                                value={profileData.timezone}
                                onValueChange={(value) => setProfileData(prev => ({ ...prev, timezone: value }))}
                            >
                                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-600 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    {timezones.map(tz => (
                                        <SelectItem key={tz.value} value={tz.value} className="text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700">{tz.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button 
                            onClick={handleSaveProfile} 
                            disabled={isSaving}
                            className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 dark:from-sky-600 dark:to-sky-700 dark:hover:from-sky-700 dark:hover:to-sky-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {isSaving ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Preferences
                        </Button>
                    </div>
                </div>
            </EnhancedCard>

            {/* Change Password */}
            <EnhancedCard
                title="Change Password"
                description="Update your account password to keep it secure"
                variant="default"
                size="sm"
            >
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="current_password" className="text-slate-700 dark:text-slate-200">Current Password</Label>
                        <div className="relative">
                            <Input
                                id="current_password"
                                type={showPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100 pr-10"
                                placeholder="Enter current password"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-slate-400" />
                                ) : (
                                    <Eye className="h-4 w-4 text-slate-400" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="new_password" className="text-slate-700 dark:text-slate-200">New Password</Label>
                        <Input
                            id="new_password"
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                            placeholder="Enter new password"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400">Password must be at least 6 characters long</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm_password" className="text-slate-700 dark:text-slate-200">Confirm New Password</Label>
                        <Input
                            id="confirm_password"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-sky-300 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/50 text-slate-900 dark:text-slate-100"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Button 
                            onClick={handleChangePassword} 
                            disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                            className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 dark:from-sky-600 dark:to-sky-700 dark:hover:from-sky-700 dark:hover:to-sky-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            {isSaving ? (
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Lock className="h-4 w-4 mr-2" />
                            )}
                            Change Password
                        </Button>
                    </div>
                </div>
            </EnhancedCard>
        </div>
    );
}

