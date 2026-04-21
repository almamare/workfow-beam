/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development';
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const normalizedApiBaseUrl = apiBaseUrl.replace(/\/+$/, '');
let apiOrigin = '';

try {
    apiOrigin = apiBaseUrl ? new URL(apiBaseUrl).origin : '';
} catch {
    apiOrigin = '';
}

const connectSrc = ["'self'", 'http://localhost:*', 'http://127.0.0.1:*', 'https://api.mofeia.com'];
if (apiOrigin) {
    connectSrc.push(apiOrigin);
}

const securityHeaders = [
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-XSS-Protection', value: '1; mode=block' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
    {
        key: 'Content-Security-Policy',
        value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: http://localhost:* https://cdn.shuarano.com",
            "font-src 'self' data:",
            `connect-src ${connectSrc.join(' ')}`,
            "frame-ancestors 'self'",
            "object-src 'none'",
        ].join('; '),
    },
];

const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        unoptimized: true,
        remotePatterns: [
            { protocol: 'https', hostname: 'cdn.shuarano.com' },
        ],
    },

    // Disable source maps in production to avoid exposing original source
    productionBrowserSourceMaps: false,

    // Attach security headers to all routes
    async headers() {
        return [
            {
                source: '/:path*',
                headers: securityHeaders,
            },
        ];
    },
    async rewrites() {
        if (!normalizedApiBaseUrl) {
            return [];
        }
        return [
            {
                source: '/api-proxy/:path*',
                destination: `${normalizedApiBaseUrl}/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
