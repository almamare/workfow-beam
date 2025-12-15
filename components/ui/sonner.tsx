'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = 'system' } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps['theme']}
            position="top-right"
            richColors
            closeButton
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg',
                    description: 'group-[.toast]:text-muted-foreground',
                    success:
                        'group-[.toaster]:bg-green-50 dark:group-[.toaster]:bg-green-900/20 group-[.toaster]:text-green-800 dark:group-[.toaster]:text-green-200 group-[.toaster]:border-green-200 dark:group-[.toaster]:border-green-800 group-[.toaster]:shadow-green-100 dark:group-[.toaster]:shadow-green-900/50',
                    error:
                        'group-[.toaster]:bg-red-50 dark:group-[.toaster]:bg-red-900/20 group-[.toaster]:text-red-800 dark:group-[.toaster]:text-red-200 group-[.toaster]:border-red-200 dark:group-[.toaster]:border-red-800 group-[.toaster]:shadow-red-100 dark:group-[.toaster]:shadow-red-900/50',
                    warning:
                        'group-[.toaster]:bg-yellow-50 dark:group-[.toaster]:bg-yellow-900/20 group-[.toaster]:text-yellow-800 dark:group-[.toaster]:text-yellow-200 group-[.toaster]:border-yellow-200 dark:group-[.toaster]:border-yellow-800 group-[.toaster]:shadow-yellow-100 dark:group-[.toaster]:shadow-yellow-900/50',
                    info:
                        'group-[.toaster]:bg-blue-50 dark:group-[.toaster]:bg-blue-900/20 group-[.toaster]:text-blue-800 dark:group-[.toaster]:text-blue-200 group-[.toaster]:border-blue-200 dark:group-[.toaster]:border-blue-800 group-[.toaster]:shadow-blue-100 dark:group-[.toaster]:shadow-blue-900/50',
                    actionButton:
                        'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                    cancelButton:
                        'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
                },
            }}
            {...props}
        />
    );
};

export { Toaster };
