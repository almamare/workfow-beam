/** @type {import('next').NextConfig} */

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

    productionBrowserSourceMaps: false,

    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
