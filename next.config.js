/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Build sırasında static generation yapma - tüm sayfalar dynamic
  output: 'standalone',
  // Image optimization ayarları - performans için optimize edildi
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60, // 60 saniye cache
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Experimental: Dynamic rendering için
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // optimizeCss kaldırıldı - critters modülü eksik
  },
  // Bundle size optimizasyonu
  swcMinify: true,
  // Compression
  compress: true,
  // Performance optimizations
  poweredByHeader: false,
  // Link prefetching - sayfa geçişlerini hızlandır
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },
  // Production'da console.log'ları kaldır (performans için)
  // NOT: Debug modu için ?debug=1 parametresi ile console'lar görünebilir
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG !== 'true' ? {
      exclude: ['error', 'warn'], // Error ve warn'ları tut
    } : false,
  },
  // Güvenlik header'ları
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig









