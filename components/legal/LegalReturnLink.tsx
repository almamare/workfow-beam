'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { DASHBOARD_PATH, LEGAL_LINK_LABELS, SIGN_IN_PATH } from '@/lib/legal';

type Variant = 'header' | 'footer';

interface LegalReturnLinkProps {
    variant: Variant;
    className?: string;
}

/**
 * Resolves return destination after reading legal pages: dashboard when a session
 * cookie exists, otherwise sign-in. Avoids showing only "sign in" to logged-in users.
 */
export function LegalReturnLink({ variant, className }: LegalReturnLinkProps) {
    const [href, setHref] = useState(SIGN_IN_PATH);
    const [label, setLabel] = useState(
        variant === 'header' ? LEGAL_LINK_LABELS.signIn : LEGAL_LINK_LABELS.signInShort
    );

    useEffect(() => {
        const authed = !!Cookies.get('token');
        if (authed) {
            setHref(DASHBOARD_PATH);
            setLabel(
                variant === 'header'
                    ? LEGAL_LINK_LABELS.backToDashboard
                    : LEGAL_LINK_LABELS.dashboardShort
            );
        } else {
            setHref(SIGN_IN_PATH);
            setLabel(
                variant === 'header' ? LEGAL_LINK_LABELS.signIn : LEGAL_LINK_LABELS.signInShort
            );
        }
    }, [variant]);

    if (variant === 'header') {
        return (
            <Link href={href} className={className}>
                ← {label}
            </Link>
        );
    }

    return (
        <Link href={href} className={className}>
            {label}
        </Link>
    );
}
