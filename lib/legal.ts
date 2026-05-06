/**
 * Canonical legal URLs and link labels — use on login, dashboard, and legal pages
 * so routes and wording stay aligned.
 */
export const LEGAL_ROUTES = {
    privacyPolicy: '/legal/privacy-policy',
    termsOfUse: '/legal/terms-of-use',
} as const;

export const LEGAL_LINK_LABELS = {
    privacyPolicy: 'Privacy Policy',
    termsOfUse: 'Terms of Use',
    signIn: 'Back to sign in',
    /** Short label for footer links next to legal cross-links */
    signInShort: 'Sign in',
    /** When a session cookie is present (e.g. opened from dashboard) */
    backToDashboard: 'Back to dashboard',
    dashboardShort: 'Dashboard',
} as const;

/** Return URL for users who are already signed in (footer / secondary links) */
export const DASHBOARD_PATH = '/dashboard' as const;

export const SIGN_IN_PATH = '/login' as const;
