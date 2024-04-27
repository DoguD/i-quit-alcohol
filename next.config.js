/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `https://api.ouraring.com/v2/:path*`,
            },
        ]
    },
}

module.exports = nextConfig
