import { Open_Sans } from 'next/font/google';

/** Open Sans (variable wght + wdth) — English UI; loaded via next/font (no extra <link> tags). */
export const openSans = Open_Sans({
    subsets: ['latin', 'latin-ext'],
    display: 'swap',
    variable: '--font-open-sans',
    weight: 'variable',
    style: ['normal', 'italic'],
    axes: ['wdth'],
});
