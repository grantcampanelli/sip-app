/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        // port: '',
        // pathname: '/account123/**',
      },
    ],
  },
  eslint: { 
    ignoreDuringBuilds: true, 
  },
}

module.exports = nextConfig
