"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Sun,
  Moon,
  Globe,
  DollarSign,
  User,
  LogOut,
  Plane,
  Menu,
  X,
  Settings,
  Search,
  Info,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '@/components/providers/language-provider';
import { useCurrency } from '@/components/providers/currency-provider';
import { useAuth } from '@/components/providers/auth-provider';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { user, logout } = useAuth();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  ];

  const navigation = [
    { name: t('nav.flights'), href: '/flights/search' },
    { name: t('nav.hotels'), href: '/hotels/search' },
    { name: t('nav.visas'), href: '/visas/application' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.support'), href: '/support' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className={`flex h-16 items-center ${isRTL ? 'flex-row-reverse' : ''} justify-between`}>
          {/* Logo */}
          <Link href="/" className={`flex items-center space-x-2 ${isRTL ? 'space-x-reverse' : ''}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              SkyWings
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-8`}>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-sky-600 dark:hover:text-sky-400"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
            {/* Check Booking Button */}
            <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
              <Link href="/check-booking" className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-1`}>
                <Search className="h-4 w-4" />
                <span>{t('nav.check_booking')}</span>
              </Link>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden md:inline-flex"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                  <Globe className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {language.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                    {language === lang.code && <Badge variant="secondary">Active</Badge>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Currency Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                  <DollarSign className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {currency}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                {currencies.map((curr) => (
                  <DropdownMenuItem
                    key={curr.code}
                    onClick={() => setCurrency(curr.code as any)}
                    className="flex items-center justify-between"
                  >
                    <span>{curr.symbol} {curr.name}</span>
                    {currency === curr.code && <Badge variant="secondary">Active</Badge>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align={isRTL ? 'start' : 'end'} forceMount>
                  <div className={`flex items-center justify-start gap-2 p-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex flex-col space-y-1 leading-none ${isRTL ? 'text-right' : ''}`}>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <User className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('nav.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('nav.my_bookings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <LogOut className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className={`hidden md:flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">{t('nav.login')}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">{t('nav.signup')}</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium transition-colors hover:text-sky-600 dark:hover:text-sky-400"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <Link
                href="/check-booking"
                className="text-sm font-medium transition-colors hover:text-sky-600 dark:hover:text-sky-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.check_booking')}
              </Link>
              
              <div className={`flex items-center justify-between pt-4 border-t ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>

                {!user && (
                  <div className={`flex ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        {t('nav.login')}
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                        {t('nav.signup')}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}