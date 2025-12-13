/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Build sırasında static generation yapma - tüm sayfalar dynamic
  output: 'standalone',
  // Experimental: Dynamic rendering için
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig









