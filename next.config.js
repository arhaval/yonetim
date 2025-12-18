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
  // Production'da console.log'ları kaldır (performans için)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Error ve warn'ları tut
    } : false,
  },
}

module.exports = nextConfig









